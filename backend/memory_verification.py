"""
Standalone, non-pytest diagnostic script: measures REAL combined
memory usage of concurrent Piper subprocesses, with and without
the PIPER_MAX_CONCURRENCY cap, using the actual `piper` binary and
voice model.

This is the "controlled concurrency test + measured memory" piece
of the verification deliverable — pytest doesn't attribute
subprocess memory well, so this samples `ps` directly for all
running `piper` processes while N concurrent generate_voice()
calls are in flight.

Usage:
    python backend/memory_verification.py
"""

import os
import sys
import time
import threading
import subprocess

sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost/test")
os.environ.setdefault("OPENAI_API_KEY", "")

import main  # noqa: E402

main.save_media = lambda data, filename, mime_type, asset_type, project_id=None: "fake"

SAMPLE_TEXT = (
    "Measuring real combined memory usage of concurrent Piper "
    "subprocesses for the AMIVI backend memory investigation."
)

TOTAL_CALLS = 8


def _sample_piper_rss_kb():
    """Sum RSS (KB) across every currently-running `piper` process."""

    try:
        out = subprocess.check_output(
            ["ps", "-eo", "rss,comm"], text=True
        )
    except Exception:
        return 0

    total = 0
    for line in out.splitlines()[1:]:
        parts = line.split(None, 1)
        if len(parts) == 2 and parts[1].strip() == "piper":
            total += int(parts[0])
    return total


def _run_batch(label, cap):
    main._piper_semaphore = threading.Semaphore(cap)
    main.PIPER_MAX_CONCURRENCY = cap

    peak = {"kb": 0}
    stop = threading.Event()

    def _sampler():
        while not stop.is_set():
            peak["kb"] = max(peak["kb"], _sample_piper_rss_kb())
            time.sleep(0.01)

    sampler = threading.Thread(target=_sampler, daemon=True)
    sampler.start()

    start = time.monotonic()
    threads = []
    for i in range(TOTAL_CALLS):
        t = threading.Thread(
            target=main.generate_voice,
            kwargs=dict(text=SAMPLE_TEXT, filename=f"{label}_{i}.wav"),
        )
        threads.append(t)
        t.start()
    for t in threads:
        t.join()
    duration = time.monotonic() - start

    stop.set()
    sampler.join(timeout=5)

    print(
        f"[{label}] cap={cap} calls={TOTAL_CALLS} "
        f"duration_s={round(duration, 2)} "
        f"peak_combined_piper_rss_mb={round(peak['kb'] / 1024, 1)}"
    )
    return peak["kb"]


if __name__ == "__main__":
    print("Measuring real concurrent Piper subprocess memory usage...")
    print(f"(each call synthesizes: {SAMPLE_TEXT!r})\n")

    # "Before" — effectively unbounded, matching the unpatched
    # behavior where up to 8 chunks could each fire a Piper call
    # at the same time with no concurrency gate at all.
    before_kb = _run_batch("uncapped", cap=TOTAL_CALLS)

    # "After" — the shipped default.
    after_kb = _run_batch("capped_default", cap=2)

    print(
        "\nPeak combined Piper RSS — uncapped: "
        f"{round(before_kb / 1024, 1)} MB vs capped(2): "
        f"{round(after_kb / 1024, 1)} MB"
    )
