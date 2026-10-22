"""
Tests for the two bandwidth-reduction changes made after the Render
workspace hit its Hobby-plan 5 GB/month included bandwidth (almost
entirely "HTTP Responses" — i.e. images served from /api/media/...):

1. Every image generated via generate_image() is now losslessly
   re-compressed before being saved, since OpenAI's own PNG encoder
   isn't tuned for file size and the saved bytes are never touched
   again afterwards (immutable once saved).
2. /api/media/{id} now sends long-lived, immutable Cache-Control and
   ETag headers (and honors If-None-Match with a 304) instead of no
   cache headers at all — previously every single page view
   re-downloaded the same already-seen images over the network.

Run with:
    pytest backend/test_bandwidth_optimizations.py -v
"""

import io
import os
import sys
from unittest.mock import MagicMock, patch

import pytest
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault(
    "DATABASE_URL", "postgresql://test:test@localhost/test"
)
os.environ.setdefault("OPENAI_API_KEY", "")

import main  # noqa: E402


def _real_png_bytes(size=(256, 256), color=(120, 60, 200)):
    """A real, valid (but not pre-optimized) PNG, saved WITHOUT
    optimize=True so there's real room for optimize_png_bytes to
    shrink it — mirrors an AI image model's own, size-unaware
    encoder."""

    image = Image.new("RGB", size, color)
    buffer = io.BytesIO()
    image.save(buffer, format="PNG", optimize=False, compress_level=0)
    return buffer.getvalue()


# ============================================================
# optimize_png_bytes()
# ============================================================

def test_optimize_png_bytes_shrinks_an_unoptimized_png():
    original = _real_png_bytes()
    optimized = main.optimize_png_bytes(original)

    assert len(optimized) <= len(original)

    # Still a valid, pixel-identical PNG — lossless, not just smaller.
    before = Image.open(io.BytesIO(original)).convert("RGB")
    after = Image.open(io.BytesIO(optimized)).convert("RGB")
    assert before.tobytes() == after.tobytes()


def test_optimize_png_bytes_falls_back_to_original_on_garbage_input():
    garbage = b"not a real image, just some bytes"
    result = main.optimize_png_bytes(garbage)
    assert result == garbage  # no crash, no corruption — passthrough


def test_optimize_png_bytes_never_returns_something_larger():
    # An already-maximally-optimized PNG shouldn't grow from a
    # second pass through this function.
    already_optimized = main.optimize_png_bytes(_real_png_bytes())
    twice_optimized = main.optimize_png_bytes(already_optimized)
    assert len(twice_optimized) <= len(already_optimized)


def test_generate_image_saves_optimized_bytes():
    """generate_image() must run the decoded OpenAI image through
    optimize_png_bytes() before handing it to save_media()."""

    import base64

    raw_png = _real_png_bytes()
    b64 = base64.b64encode(raw_png).decode()

    fake_result = MagicMock()
    fake_result.data = [MagicMock(b64_json=b64)]

    captured = {}

    def fake_save_media(**kwargs):
        captured.update(kwargs)
        return 42

    with patch("main.require_services", return_value=None), \
         patch.object(main, "client", MagicMock(
             images=MagicMock(generate=MagicMock(return_value=fake_result))
         )), \
         patch("main.save_media", side_effect=fake_save_media):

        media_id = main.generate_image(
            prompt="a friendly cartoon robot",
            filename="test.png",
        )

    assert media_id == 42
    assert captured["data"] == main.optimize_png_bytes(raw_png)


# ============================================================
# /api/media/{id} — cache headers
# ============================================================

class _FakeAsset:
    def __init__(self, data=b"fake-image-bytes", mime_type="image/png", filename="x.png"):
        self.data = data
        self.mime_type = mime_type
        self.filename = filename


class _FakeHeaders(dict):
    def get(self, key, default=None):
        return super().get(key.lower(), default)


class _FakeRequest:
    def __init__(self, if_none_match=None):
        headers = _FakeHeaders()
        if if_none_match is not None:
            headers["if-none-match"] = if_none_match
        self.headers = headers


def test_media_endpoint_sends_long_lived_immutable_cache_headers():
    with patch("main.get_media", return_value=_FakeAsset()):
        response = main.media(
            media_id=123, request=_FakeRequest(), download=False
        )

    assert response.status_code == 200
    assert response.headers["cache-control"] == "public, max-age=31536000, immutable"
    assert response.headers["etag"] == '"123"'


def test_media_endpoint_returns_304_when_etag_matches():
    with patch("main.get_media", return_value=_FakeAsset()):
        response = main.media(
            media_id=123,
            request=_FakeRequest(if_none_match='"123"'),
            download=False,
        )

    assert response.status_code == 304
    # A 304 still carries cache headers so the browser refreshes its
    # cache lifetime, but no body needs to be re-sent.
    assert response.headers["cache-control"] == "public, max-age=31536000, immutable"


def test_media_endpoint_returns_200_when_etag_does_not_match():
    with patch("main.get_media", return_value=_FakeAsset(data=b"actual bytes")):
        response = main.media(
            media_id=123,
            request=_FakeRequest(if_none_match='"999"'),
            download=False,
        )

    assert response.status_code == 200
    assert response.body == b"actual bytes"


def test_media_endpoint_different_ids_get_different_etags():
    with patch("main.get_media", return_value=_FakeAsset()):
        r1 = main.media(media_id=1, request=_FakeRequest(), download=False)
        r2 = main.media(media_id=2, request=_FakeRequest(), download=False)

    assert r1.headers["etag"] != r2.headers["etag"]
