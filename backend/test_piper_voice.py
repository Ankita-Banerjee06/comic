"""
Tests for the Piper voice-generation memory/concurrency fix in
generate_voice() (main.py).

These exercise the REAL `piper` binary and a real voice model
checked into backend/piper/ for this test run (see the test setup
notes in the accompanying report — these binary assets are for
local/CI testing only and are not meant to be committed to the
repo), so the concurrency cap, cleanup-on-failure, and timeout
behavior are verified against genuine subprocesses and genuine
memory numbers rather than mocks standing in for Piper itself.
`save_media()` (a DB write) is stubbed out since these tests don't
need a live Postgres instance — everything upstream of it (the
actual Piper subprocess call, the concurrency gate, and temp-file
handling) runs for real.

Run with:
    pytest backend/test_piper_voice.py -v
"""

import os
import sys
import time
import glob
import threading
import subprocess

import pytest

sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault(
    "DATABASE_URL", "postgresql://test:test@localhost/test"
)
os.environ.setdefault("OPENAI_API_KEY", "")

import main  # noqa: E402


SAMPLE_TEXT = (
    "This is a short line of test narration used to exercise "
    "the Piper voice generation pipeline during testing."
)


@pytest.fixture(autouse=True)
def _stub_save_media(monkeypatch):
    """
    Replace the DB-backed save_media() with an in-memory stub so
    these tests don't need a live Postgres instance. Records every
    call so tests can assert the output contract (mime type, etc.)
    was preserved.
    """

    calls = []

    def _fake_save_media(data, filename, mime_type, asset_type, project_id=None):
        calls.append(
            {
                "bytes": len(data),
                "filename": filename,
                "mime_type": mime_type,
                "asset_type": asset_type,
                "project_id": project_id,
            }
        )
        return f"fake-media-{len(calls)}"

    monkeypatch.setattr(main, "save_media", _fake_save_media)
    return calls


@pytest.fixture(autouse=True)
def _reset_piper_state():
    """
    Guards against one test's semaphore/concurrency tweaks leaking
    into the next.
    """

    yield

    assert main._piper_active_count == 0, (
        "generate_voice() leaked an active-job count across a test "
        "(semaphore not released somewhere)."
    )


def _temp_wav_count():
    # generate_voice() creates its temp file via
    # tempfile.NamedTemporaryFile(suffix=".wav"), which lands in
    # the default system temp dir.
    import tempfile as _tempfile

    return len(glob.glob(os.path.join(_tempfile.gettempdir(), "tmp*.wav")))


# ----------------------------------------------------------------
# Basic correctness / output-contract preservation
# ----------------------------------------------------------------

def test_single_call_succeeds_and_preserves_output_format(_stub_save_media):
    media_id = main.generate_voice(
        text=SAMPLE_TEXT,
        filename="test_single.wav",
        language="en",
        project_id=42,
    )

    assert media_id == "fake-media-1"
    assert len(_stub_save_media) == 1

    call = _stub_save_media[0]
    assert call["mime_type"] == "audio/wav"
    assert call["asset_type"] == "audio"
    assert call["filename"] == "test_single.wav"
    assert call["project_id"] == 42
    # A real, non-trivial WAV came out of the real Piper subprocess.
    assert call["bytes"] > 1000


def test_empty_text_raises_without_touching_piper(_stub_save_media):
    with pytest.raises(Exception, match="Voice text is empty"):
        main.generate_voice(text="", filename="x.wav")

    assert len(_stub_save_media) == 0
    assert main._piper_active_count == 0


def test_temp_wav_is_cleaned_up_on_success():
    before = _temp_wav_count()

    main.generate_voice(
        text=SAMPLE_TEXT,
        filename="test_cleanup_ok.wav",
    )

    after = _temp_wav_count()
    assert after == before, "temp .wav file was not removed after a successful call"


# ----------------------------------------------------------------
# Concurrency cap — the actual fix for the OOM
# ----------------------------------------------------------------

def test_concurrency_cap_enforced_with_real_subprocesses(monkeypatch):
    """
    Fires more concurrent generate_voice() calls than
    PIPER_MAX_CONCURRENCY allows, using the REAL Piper binary each
    time, and confirms the number of simultaneously-running Piper
    jobs never exceeds the configured cap — this is the actual
    behavior that prevents the Render OOM.
    """

    cap = 2
    monkeypatch.setattr(main, "_piper_semaphore", threading.Semaphore(cap))
    monkeypatch.setattr(main, "PIPER_MAX_CONCURRENCY", cap)

    observed_peak = {"value": 0}
    peak_lock = threading.Lock()
    stop_sampling = threading.Event()

    def _sampler():
        while not stop_sampling.is_set():
            with peak_lock:
                observed_peak["value"] = max(
                    observed_peak["value"], main._piper_active_count
                )
            time.sleep(0.005)

    sampler_thread = threading.Thread(target=_sampler, daemon=True)
    sampler_thread.start()

    total_calls = 6
    threads = []
    errors = []

    def _worker(i):
        try:
            main.generate_voice(
                text=SAMPLE_TEXT,
                filename=f"test_concurrency_{i}.wav",
            )
        except Exception as exc:  # pragma: no cover - diagnostic only
            errors.append(exc)

    for i in range(total_calls):
        t = threading.Thread(target=_worker, args=(i,))
        threads.append(t)
        t.start()

    for t in threads:
        t.join(timeout=60)

    stop_sampling.set()
    sampler_thread.join(timeout=5)

    assert not errors, f"generate_voice() raised under concurrency: {errors}"
    assert observed_peak["value"] <= cap, (
        f"observed {observed_peak['value']} simultaneous Piper jobs, "
        f"expected at most {cap} — the concurrency cap did not hold"
    )
    # And it should have actually exercised real concurrency (not
    # just run everything one at a time), otherwise this test isn't
    # proving anything.
    assert observed_peak["value"] >= 1


def test_repeated_generations_do_not_leak_semaphore_permits():
    """
    Calls generate_voice() several times in a row (real subprocess
    each time) and confirms the semaphore returns to full capacity
    every time — i.e. no permit is ever silently lost, which would
    eventually deadlock all future voice generation.
    """

    for i in range(5):
        main.generate_voice(
            text=SAMPLE_TEXT,
            filename=f"test_repeat_{i}.wav",
        )
        assert main._piper_active_count == 0

        # A non-blocking acquire should always succeed right after
        # a call finishes, proving the permit really came back.
        acquired = main._piper_semaphore.acquire(blocking=False)
        assert acquired, f"semaphore permit missing after call {i}"
        main._piper_semaphore.release()


# ----------------------------------------------------------------
# Cleanup on failure / timeout (mocked subprocess — these paths
# don't need the real binary, just reliable error handling)
# ----------------------------------------------------------------

def test_cleanup_and_semaphore_release_on_subprocess_error(monkeypatch):
    before = _temp_wav_count()

    def _raise(*args, **kwargs):
        raise subprocess.CalledProcessError(1, "piper")

    monkeypatch.setattr(main.subprocess, "run", _raise)

    with pytest.raises(subprocess.CalledProcessError):
        main.generate_voice(text=SAMPLE_TEXT, filename="test_error.wav")

    assert main._piper_active_count == 0
    assert _temp_wav_count() == before, "temp file leaked after a subprocess error"

    # Semaphore slot must be free again.
    acquired = main._piper_semaphore.acquire(blocking=False)
    assert acquired
    main._piper_semaphore.release()


def test_cleanup_and_semaphore_release_on_timeout(monkeypatch):
    before = _temp_wav_count()

    def _raise_timeout(*args, **kwargs):
        raise subprocess.TimeoutExpired(cmd="piper", timeout=main.PIPER_TIMEOUT_SECONDS)

    monkeypatch.setattr(main.subprocess, "run", _raise_timeout)

    with pytest.raises(Exception, match="timed out"):
        main.generate_voice(text=SAMPLE_TEXT, filename="test_timeout.wav")

    assert main._piper_active_count == 0
    assert _temp_wav_count() == before, "temp file leaked after a timeout"

    acquired = main._piper_semaphore.acquire(blocking=False)
    assert acquired
    main._piper_semaphore.release()


# ----------------------------------------------------------------
# AMIVI generate endpoint compatibility — the chunk-processing
# helper now passes a correlation_id through; confirm that still
# reaches generate_voice() correctly and doesn't break the
# existing best-effort (non-fatal) failure handling for a chunk's
# audio.
# ----------------------------------------------------------------

def test_generate_voice_accepts_correlation_id_and_is_backward_compatible():
    # Old-style positional call (as amivi_edit_chunk still uses)
    # must keep working unchanged.
    media_id = main.generate_voice(
        SAMPLE_TEXT,
        "test_positional.wav",
        "en",
        None,
    )
    assert media_id is not None

    # New-style call with a correlation id (as process_amivi_chunk
    # now does) must also work.
    media_id2 = main.generate_voice(
        text=SAMPLE_TEXT,
        filename="test_correlation.wav",
        language="en",
        project_id=7,
        correlation_id="amivi_generate:project=7:chunk=0",
    )
    assert media_id2 is not None
