"""
Tests for the two features added on top of the AMIVI backend:

1. Narration moved from local Piper (flat, single fixed voice) to
   OpenAI's TTS (generate_voice() in main.py) — warmer, expressive,
   instructable delivery.
2. The "paste a website URL" extractor for the Uploads box
   (extract_webpage_text(), _is_safe_external_url(), and the
   /api/amivi/extract_url endpoint) — reads a pasted article URL
   (e.g. a Wikipedia page) and pulls out its educational text,
   the same way the existing file-upload extractor already does
   for PDFs/DOCX/TXT.

Piper is gone (no local subprocess, no binary/model file to
check), so these tests mock the two things that leave the process
— the OpenAI client and outbound HTTP — rather than depending on
a real network or a live OpenAI account. That still exercises all
the real logic: the concurrency gate, cleanup on failure, the
SSRF guard's resolved-IP check (not just a hostname blocklist),
and the actual HTML-parsing/text-cleanup pipeline against a
realistic page structure (nav/header/footer/script stripped,
<article> content kept).

Run with:
    pytest backend/test_narration.py -v
"""

import os
import sys
import threading
import time
from unittest.mock import patch, MagicMock

import pytest

sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault(
    "DATABASE_URL", "postgresql://test:test@localhost/test"
)
os.environ.setdefault("OPENAI_API_KEY", "")

import main  # noqa: E402


SAMPLE_TEXT = (
    "Water rises as vapor, drifts as clouds, and falls again as "
    "rain."
)


def _fake_speech_client(audio_bytes=b"RIFF_FAKE_WAV", delay=0.0, error=None):
    """A MagicMock standing in for the OpenAI client, shaped like
    client.with_options(timeout=...).audio.speech.create(...)."""

    def _create(**kwargs):
        if delay:
            time.sleep(delay)
        if error:
            raise error
        response = MagicMock()
        response.content = audio_bytes
        return response

    fake_client = MagicMock()
    fake_client.with_options.return_value.audio.speech.create.side_effect = _create
    return fake_client


# ============================================================
# generate_voice() — OpenAI TTS narration
# ============================================================

def test_generate_voice_calls_openai_with_expected_params():
    fake_client = _fake_speech_client()

    with patch("main.client", fake_client):
        with patch("main.save_media", return_value=42) as mock_save:
            result = main.generate_voice(
                text=SAMPLE_TEXT,
                filename="chunk.wav",
                language="en",
                project_id=7,
                correlation_id="test:chunk=1",
            )

    assert result == 42

    mock_save.assert_called_once_with(
        data=b"RIFF_FAKE_WAV",
        filename="chunk.wav",
        mime_type="audio/wav",
        asset_type="audio",
        project_id=7,
    )

    call_kwargs = fake_client.with_options.return_value.audio.speech.create.call_args.kwargs
    assert call_kwargs["model"] == main.NARRATOR_MODEL
    assert call_kwargs["voice"] == main.NARRATOR_VOICE
    assert call_kwargs["input"] == SAMPLE_TEXT
    assert call_kwargs["response_format"] == "wav"
    # The whole point of this change: a real style instruction,
    # not Piper's one-fixed-delivery-always behavior.
    assert "instructions" in call_kwargs
    assert len(call_kwargs["instructions"]) > 20


def test_empty_text_raises_without_touching_openai():
    fake_client = _fake_speech_client()

    with patch("main.client", fake_client):
        with pytest.raises(Exception, match="Voice text is empty"):
            main.generate_voice(text="", filename="x.wav")

    fake_client.with_options.return_value.audio.speech.create.assert_not_called()


def test_missing_openai_client_raises_clearly():
    with patch("main.client", None):
        with pytest.raises(Exception, match="OpenAI client is not configured"):
            main.generate_voice(text=SAMPLE_TEXT, filename="x.wav")


def test_failure_releases_concurrency_slot():
    fake_client = _fake_speech_client(error=RuntimeError("rate limited"))

    before = main._narration_active_count

    with patch("main.client", fake_client):
        with pytest.raises(Exception, match="Narration generation failed"):
            main.generate_voice(text=SAMPLE_TEXT, filename="x.wav")

    assert main._narration_active_count == before


def test_backward_compatible_positional_call():
    """amivi_edit_chunk still calls generate_voice positionally
    (text, filename, language, project_id) — must keep working."""

    fake_client = _fake_speech_client()

    with patch("main.client", fake_client):
        with patch("main.save_media", return_value=99):
            result = main.generate_voice(
                SAMPLE_TEXT,
                "positional.wav",
                "en",
                None,
            )

    assert result == 99


def test_concurrency_cap_is_enforced():
    """Fires more calls at once than NARRATION_MAX_CONCURRENCY allows
    and confirms the observed peak concurrent count never exceeds it
    — the same property the old Piper semaphore test checked, now
    against the TTS call path."""

    peak = {"n": 0}
    lock = threading.Lock()

    def _create(**kwargs):
        with lock:
            peak["n"] = max(peak["n"], main._narration_active_count)
        time.sleep(0.05)
        response = MagicMock()
        response.content = b"x"
        return response

    fake_client = MagicMock()
    fake_client.with_options.return_value.audio.speech.create.side_effect = _create

    threads_n = main.NARRATION_MAX_CONCURRENCY * 3

    with patch("main.client", fake_client):
        with patch("main.save_media", return_value=1):
            threads = [
                threading.Thread(
                    target=main.generate_voice,
                    kwargs=dict(text=SAMPLE_TEXT, filename=f"t{i}.wav"),
                )
                for i in range(threads_n)
            ]
            for t in threads:
                t.start()
            for t in threads:
                t.join()

    assert peak["n"] <= main.NARRATION_MAX_CONCURRENCY
    assert main._narration_active_count == 0


# ============================================================
# Webpage URL extraction (Uploads box's "paste a website URL")
# ============================================================

SAMPLE_ARTICLE_HTML = """
<html>
<head><title>Water cycle - Wikipedia</title></head>
<body>
<nav>NAV_JUNK should not appear in output</nav>
<header>HEADER_JUNK should not appear in output</header>
<div id="content">
<article>
<h1>Water cycle</h1>
<p>The water cycle is the continuous movement of water within the
Earth and atmosphere.</p>
<p>It involves evaporation, condensation, precipitation and
runoff, repeating endlessly.</p>
<script>var SCRIPT_JUNK = "should not appear";</script>
<p>""" + ("Additional educational sentence about the hydrologic cycle. " * 15) + """</p>
</article>
</div>
<footer>FOOTER_JUNK should not appear in output</footer>
</body>
</html>
"""


def _fake_html_response(html=SAMPLE_ARTICLE_HTML, content_type="text/html; charset=UTF-8"):
    response = MagicMock()
    response.raise_for_status = MagicMock()
    response.headers = {"content-type": content_type}
    response.encoding = "utf-8"
    response.raw = MagicMock()
    response.raw.read = MagicMock(return_value=html.encode("utf-8"))
    return response


def test_is_safe_external_url_blocks_private_and_loopback_ips():
    cases = [
        ("127.0.0.1", False),
        ("169.254.169.254", False),  # cloud metadata endpoint
        ("10.0.0.5", False),
        ("192.168.1.1", False),
        ("93.184.216.34", True),  # ordinary public IP
    ]

    for ip, expected in cases:
        with patch("main.socket.getaddrinfo", return_value=[(2, 1, 6, "", (ip, 0))]):
            assert main._is_safe_external_url("https://example.com/") == expected, ip


def test_is_safe_external_url_rejects_bad_schemes_and_unresolvable_hosts():
    assert main._is_safe_external_url("ftp://example.com/") is False
    assert main._is_safe_external_url("not a url") is False

    with patch("main.socket.getaddrinfo", side_effect=main.socket.gaierror):
        assert main._is_safe_external_url("https://nowhere.invalid/") is False


def test_extract_webpage_text_strips_boilerplate_and_keeps_article():
    with patch("main.socket.getaddrinfo", return_value=[(2, 1, 6, "", ("93.184.216.34", 0))]):
        with patch("main.requests.get", return_value=_fake_html_response()):
            result = main.extract_webpage_text(
                "https://en.wikipedia.org/wiki/Water_cycle"
            )

    assert result["title"] == "Water cycle - Wikipedia"
    assert result["source"] == "webpage"
    assert "water cycle is the continuous movement" in result["text"].lower()
    for junk in ("NAV_JUNK", "HEADER_JUNK", "FOOTER_JUNK", "SCRIPT_JUNK"):
        assert junk not in result["text"]


def test_extract_webpage_text_rejects_non_html_content_type():
    with patch("main.socket.getaddrinfo", return_value=[(2, 1, 6, "", ("93.184.216.34", 0))]):
        with patch(
            "main.requests.get",
            return_value=_fake_html_response(content_type="application/pdf"),
        ):
            with pytest.raises(Exception, match="doesn't look like a webpage"):
                main.extract_webpage_text("https://example.com/file.pdf")


def test_extract_webpage_text_rejects_unsafe_url_before_any_request():
    with patch("main.requests.get") as mock_get:
        with pytest.raises(Exception):
            main.extract_webpage_text("http://127.0.0.1/admin")
    mock_get.assert_not_called()


# ============================================================
# /api/amivi/extract_url — video vs. webpage routing
# ============================================================

def test_extract_url_endpoint_routes_generic_urls_to_webpage_extractor():
    import asyncio

    with patch(
        "main.extract_webpage_text",
        return_value={"title": "Water cycle", "text": "educational text", "source": "webpage", "url": "x"},
    ) as mock_webpage:
        req = main.AmiviUrlExtractRequest(
            url="https://en.wikipedia.org/wiki/Water_cycle", language="en"
        )
        result = asyncio.run(main.amivi_extract_url(req))

    assert result == {"text": "educational text", "title": "Water cycle"}
    mock_webpage.assert_called_once()


def test_extract_url_endpoint_tries_video_extraction_for_video_hosts():
    import asyncio

    with patch(
        "main.extract_video_text",
        return_value={"title": "Some Video", "duration": 90, "text": "transcript text", "source": "captions", "url": "x"},
    ) as mock_video:
        req = main.AmiviUrlExtractRequest(
            url="https://www.youtube.com/watch?v=abc123", language="en"
        )
        result = asyncio.run(main.amivi_extract_url(req))

    assert result == {"text": "transcript text", "title": "Some Video"}
    mock_video.assert_called_once()


def test_extract_url_endpoint_rejects_empty_url():
    import asyncio
    from fastapi import HTTPException

    req = main.AmiviUrlExtractRequest(url="   ", language="en")

    with pytest.raises(HTTPException) as excinfo:
        asyncio.run(main.amivi_extract_url(req))

    assert excinfo.value.status_code == 400
