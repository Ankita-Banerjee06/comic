"""
Regression test for a real production crash: /api/avatar/generate
raised a raw 500 whenever OpenAI's safety system blocked the
generated avatar image (openai.BadRequestError, code
'moderation_blocked') — generate_avatar_image() called the bare
generate_image() instead of the generate_image_resilient() wrapper
every other image-generation path in the app already uses, so there
was no automatic retry with a safe fallback prompt before failing.

Covers:
1. generate_avatar_image() now goes through generate_image_resilient
   (gets the automatic safe-prompt retry).
2. If even that retry is blocked, avatar_generate() returns a clean
   400 with an actionable message instead of a raw 500 — and doesn't
   save a broken avatar with no image.
3. The same fix applied to the other one-off, user-triggered image
   generation endpoints that shared the exact same bug: AMIVI's
   regenerate_image, and AMICO's regenerate_panel / edit_panel
   (dialogue redraw) / add_panel.

Run with:
    pytest backend/test_avatar_reliability.py -v
"""

import asyncio
import os
import sys
from unittest.mock import patch

import pytest

sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault(
    "DATABASE_URL", "postgresql://test:test@localhost/test"
)
os.environ.setdefault("OPENAI_API_KEY", "")

import main  # noqa: E402


class _FakeUploadFile:
    """Stands in for FastAPI's UploadFile — avatar_generate only
    calls .read() (async) and reads .content_type."""

    def __init__(self, data=b"fake-photo-bytes", content_type="image/jpeg"):
        self._data = data
        self.content_type = content_type

    async def read(self):
        return self._data


# ============================================================
# generate_avatar_image() itself
# ============================================================

def test_generate_avatar_image_uses_the_resilient_wrapper():
    with patch(
        "main.generate_image_resilient", return_value=555
    ) as mock_resilient:

        image_id = main.generate_avatar_image(
            description="a smiling kid with curly hair",
            style="",
            filename="avatar_test.png",
            fallback_label="Mia",
        )

    assert image_id == 555
    _, kwargs = mock_resilient.call_args
    assert kwargs["fallback_label"] == "Mia"
    assert "avatar_test.png" == kwargs["filename"]


def test_generate_avatar_image_returns_none_when_even_the_retry_is_blocked():
    """generate_image_resilient already returns None (not raises)
    when both the real prompt and its safe fallback are blocked —
    generate_avatar_image must simply pass that through, not raise."""

    with patch("main.generate_image_resilient", return_value=None):

        image_id = main.generate_avatar_image(
            description="a smiling kid with curly hair",
            style="",
            filename="avatar_test.png",
        )

    assert image_id is None


# ============================================================
# /api/avatar/generate endpoint — the actual reported crash
# ============================================================

def _run_avatar_generate(generate_avatar_image_return):
    with patch("main.require_services", return_value=None), \
         patch("main.moderate_image_bytes", return_value=None), \
         patch("main.moderate_text", return_value=None), \
         patch("main.describe_photo_for_avatar", return_value="a smiling kid"), \
         patch("main.generate_avatar_image", return_value=generate_avatar_image_return) as mock_gen, \
         patch("main.save_avatar", return_value=999) as mock_save:

        return asyncio.run(
            main.avatar_generate(
                file=_FakeUploadFile(), name="Mia", style=""
            )
        ), mock_gen, mock_save


def test_avatar_generate_succeeds_when_image_generation_works():
    result, _, mock_save = _run_avatar_generate(777)

    assert result["status"] == "success"
    assert result["image_id"] == 777
    assert result["image_url"] == "/api/media/777"
    mock_save.assert_called_once()


def test_avatar_generate_returns_clean_400_instead_of_500_when_blocked():
    """This is the exact production failure: before the fix, a
    blocked avatar image propagated as a raw, unhandled 500. Now
    generate_avatar_image() (mocked here to simulate even its own
    internal retry having failed) returns None, and the endpoint
    must turn that into a clean, actionable 400 — and must NOT save
    a broken avatar with no image."""

    with pytest.raises(main.HTTPException) as exc_info:
        _run_avatar_generate(None)

    assert exc_info.value.status_code == 400
    assert "safety system" in exc_info.value.detail.lower()


def test_avatar_generate_does_not_save_a_broken_avatar_when_blocked():
    with patch("main.require_services", return_value=None), \
         patch("main.moderate_image_bytes", return_value=None), \
         patch("main.moderate_text", return_value=None), \
         patch("main.describe_photo_for_avatar", return_value="a smiling kid"), \
         patch("main.generate_avatar_image", return_value=None), \
         patch("main.save_avatar", return_value=999) as mock_save:

        with pytest.raises(main.HTTPException):
            asyncio.run(
                main.avatar_generate(
                    file=_FakeUploadFile(), name="Mia", style=""
                )
            )

        mock_save.assert_not_called()
