"""
Tests for friendly_error_detail() — added after a real production
incident: a client saw the raw OpenAI SDK error text directly in the
app ("Error 429 — insufficient_quota — credit_balance_exhausted")
when the OpenAI account ran out of credits, because every endpoint's
catch-all exception handler sent str(exc) straight through as the
HTTPException detail.

friendly_error_detail() now sits in front of that str(exc) call at
all 18 of those call sites (every `except Exception as exc:` catch-
all in main.py), mapping the handful of OpenAI failure modes the app
has actually hit in production to a short, plain-language message,
and leaving anything unrecognized unchanged so a genuinely new bug
is still fully visible for debugging.

Run with:
    pytest backend/test_friendly_errors.py -v
"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault(
    "DATABASE_URL", "postgresql://test:test@localhost/test"
)
os.environ.setdefault("OPENAI_API_KEY", "")

import main  # noqa: E402


# The exact real-world error text seen in production (from the
# OpenAI Python SDK's own exception __str__).
REAL_QUOTA_ERROR = (
    "Error code: 429 - {'error': {'message': 'You exceeded your "
    "current quota, please check your plan and billing details.', "
    "'type': 'insufficient_quota', 'param': None, "
    "'code': 'credit_balance_exhausted'}}"
)

REAL_MODERATION_ERROR = (
    "Error code: 400 - {'error': {'message': 'Your request was "
    "rejected by the safety system.', "
    "'type': 'image_generation_user_error', 'param': None, "
    "'code': 'moderation_blocked', 'moderation_details': "
    "{'moderation_stage': 'output', 'categories': ['other']}}}"
)


def test_quota_exhausted_error_becomes_friendly():
    detail = main.friendly_error_detail(Exception(REAL_QUOTA_ERROR))

    # No raw SDK/account internals leak through.
    assert "insufficient_quota" not in detail
    assert "credit_balance_exhausted" not in detail
    assert "429" not in detail

    # Plain-language, actionable instead.
    assert "credits" in detail.lower()


def test_rate_limit_error_becomes_friendly():
    exc = Exception(
        "Error code: 429 - {'error': {'type': 'rate_limit_exceeded'}}"
    )
    detail = main.friendly_error_detail(exc)

    assert "rate_limit_exceeded" not in detail
    assert "try again" in detail.lower()


def test_moderation_blocked_error_becomes_friendly():
    detail = main.friendly_error_detail(Exception(REAL_MODERATION_ERROR))

    assert "moderation_blocked" not in detail
    assert "safety system" in detail.lower()


def test_unrecognized_error_passes_through_unchanged():
    """A genuinely new/unexpected error must stay fully visible —
    this only softens the handful of well-known OpenAI failure
    modes above, never hides something a developer needs to see."""

    exc = ValueError("some totally different, unrelated bug")
    assert main.friendly_error_detail(exc) == str(exc)


def test_no_raw_str_exc_remains_in_any_endpoint_handler():
    """Regression guard: every one of main.py's generic
    `except Exception as exc:` catch-all handlers must route through
    friendly_error_detail() — not send str(exc) straight through —
    so this specific class of bug can't quietly come back if a new
    endpoint copies the old pattern."""

    import inspect

    source = inspect.getsource(main)
    assert "detail=str(exc)" not in source
