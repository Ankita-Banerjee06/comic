"""
Tests for the AMIVI INTRODUCE / EXPLAIN pipeline against the five
priority checks requested for this pass:

1. INTRODUCE — each Microbit gets a Key Point, an image, and a
   slogan capped at 4 words; the Microbit count follows the
   subject rather than a fixed number.
2. EXPLAIN — reuses the exact same Key Point Name and slogan from
   INTRODUCE (never re-invents them) while adding an explanation.
4. RELIABILITY — generation across multiple subjects (including
   THE HUMAN HEART) must not crash the whole batch when one
   chunk's image fails to generate or its DB save fails.
5. DEMONSTRATION READINESS — video generation defaults to OFF.

These mock the two things that leave the process — the LLM calls
(generate_amivi_content / generate_amivi_explanation) and the
per-chunk side effects (image generation, voice generation, DB
save) — so they exercise the REAL batching/concurrency/error-
handling logic in amivi_generate() and process_amivi_chunk,
without needing a live OpenAI key or a real Postgres database.

Run with:
    pytest backend/test_amivi_reliability.py -v
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


class _FakeUser:
    id = 1


def _content_for(subject, chunks):
    """Shapes a generate_amivi_content()-style return value from a
    plain list of (key_point, slogan) tuples, mirroring exactly what
    the real INTRODUCE call returns."""

    return {
        "title": subject,
        "subject_description": f"{subject} is the subject of this lesson.",
        "subject_category": "Science",
        "chunks": [
            {
                "chunk_number": i + 1,
                "key_point": kp,
                "text": kp,
                "slogan": slogan,
                "description": "",
                "image_prompt": f"An illustration of {kp}",
                "image_prompt_2": f"A second illustration of {kp}",
                "voice_script": f"Let's talk about {kp}!",
            }
            for i, (kp, slogan) in enumerate(chunks)
        ],
    }


# Three different subjects with three different, genuinely varying
# Microbit counts — including THE HUMAN HEART as required — so a
# passing run also demonstrates the count tracks the subject
# instead of being clamped to some fixed number.
SUBJECT_HUMAN_HEART = _content_for(
    "The Human Heart",
    [
        ("Four Chambers", "Four rooms, one pump"),
        ("Valves Control Flow", "One-way doors for blood"),
        ("Arteries Carry Blood Out", "Highways leaving the heart"),
        ("Veins Bring Blood Back", "The road back home"),
        ("Heartbeat Rhythm", "Lub-dub, every second"),
    ],
)

SUBJECT_WATER_CYCLE = _content_for(
    "The Water Cycle",
    [
        ("Evaporation", "Water rises as vapor"),
        ("Condensation", "Vapor becomes clouds"),
        ("Precipitation", "Clouds release rain"),
    ],
)

SUBJECT_SOLAR_SYSTEM = _content_for(
    "The Solar System",
    [
        ("The Sun", "Our star at the center"),
        ("Inner Rocky Planets", "Small and close to the sun"),
        ("Outer Gas Giants", "Huge and far away"),
        ("Asteroid Belt", "Rocky rubble between orbits"),
        ("Comets", "Icy visitors from afar"),
        ("Orbits", "Everything circles the sun"),
        ("Moons", "Many worlds have company"),
    ],
)


def _run_generate(
    request,
    mocked_content,
    image_side_effect=None,
    save_side_effect=None,
    explain_return=None,
    explain_side_effect=None,
):
    """Runs the real amivi_generate() coroutine with the minimum set
    of mocks needed to keep it from touching a live LLM, a real image
    model, or a real database, while leaving every other code path —
    concurrency, per-chunk error handling, slogan capping — real."""

    if explain_side_effect is not None:
        explain_patch = patch(
            "main.generate_amivi_explanation",
            side_effect=explain_side_effect,
        )
    else:
        explain_patch = patch(
            "main.generate_amivi_explanation",
            return_value=explain_return
            or {"explanation": "A short, accurate explanation."},
        )

    with patch("main.require_services", return_value=None), \
         patch("main.guard_learning_input", return_value=None), \
         patch("main.generate_amivi_content", return_value=mocked_content), \
         patch("main.generate_voice", return_value=None), \
         patch("main.save_project", return_value=777), \
         patch("main.resolve_chapter_metadata", return_value=("Science", mocked_content["title"], "science")), \
         patch("main.update_project_data", return_value=None), \
         patch("main.create_amivi_video") as mock_video:

        image_patch = patch(
            "main.generate_image_resilient",
            side_effect=image_side_effect,
        ) if image_side_effect else patch(
            "main.generate_image_resilient", return_value=101
        )

        save_patch = patch(
            "main.save_amivi_chunk",
            side_effect=save_side_effect,
        ) if save_side_effect else patch(
            "main.save_amivi_chunk", return_value=555
        )

        with image_patch, save_patch, explain_patch as mock_explain:
            result = asyncio.run(
                main.amivi_generate(request, current_user=_FakeUser())
            )

        return result, {"video": mock_video, "explain": mock_explain}


# ============================================================
# RELIABILITY — three subjects including THE HUMAN HEART
# ============================================================

@pytest.mark.parametrize(
    "mocked_content",
    [SUBJECT_HUMAN_HEART, SUBJECT_WATER_CYCLE, SUBJECT_SOLAR_SYSTEM],
    ids=["human_heart", "water_cycle", "solar_system"],
)
def test_generation_succeeds_across_subjects_no_crash(mocked_content):
    request = main.AmiviRequest(text="source material", language="en")

    result, _ = _run_generate(request, mocked_content)

    assert result["status"] == "success"
    assert len(result["chunks"]) == len(mocked_content["chunks"])

    for chunk in result["chunks"]:
        assert chunk["image_id"] is not None
        assert chunk["image_url"] is not None
        assert chunk["key_point"]


def test_microbit_count_tracks_the_subject_not_a_fixed_number():
    """The three subjects above deliberately have different counts
    (5, 3, 7) — confirms nothing in the pipeline clamps or pads the
    count to a fixed number."""

    counts = {}

    for mocked_content in (SUBJECT_HUMAN_HEART, SUBJECT_WATER_CYCLE, SUBJECT_SOLAR_SYSTEM):
        request = main.AmiviRequest(text="source material", language="en")
        result, _ = _run_generate(request, mocked_content)
        counts[mocked_content["title"]] = len(result["chunks"])

    assert counts["The Human Heart"] == 5
    assert counts["The Water Cycle"] == 3
    assert counts["The Solar System"] == 7
    assert len(set(counts.values())) == 3  # all genuinely different


def test_one_failed_image_does_not_crash_the_whole_batch():
    """Simulates a persistent image-generation failure (e.g. content
    moderation) for exactly one Microbit in THE HUMAN HEART set —
    the request must still succeed, with every other chunk's image
    intact and only the failed one coming back with image_id=None."""

    request = main.AmiviRequest(text="source material", language="en")

    call_count = {"n": 0}

    def flaky_image(**kwargs):
        call_count["n"] += 1
        # Fail every call whose filename contains "_chunk_1_" (the
        # second Microbit, 0-indexed) — both its primary and second
        # image — to simulate that one Microbit being unrenderable.
        if "_chunk_1_" in kwargs.get("filename", "") or kwargs.get("filename", "").endswith("_chunk_1.png"):
            return None
        return 101

    result, _ = _run_generate(
        request, SUBJECT_HUMAN_HEART, image_side_effect=flaky_image
    )

    assert result["status"] == "success"
    assert len(result["chunks"]) == 5

    failed = [c for c in result["chunks"] if c["image_id"] is None]
    succeeded = [c for c in result["chunks"] if c["image_id"] is not None]

    assert len(failed) == 1
    assert len(succeeded) == 4


def test_one_chunk_db_save_failure_does_not_crash_the_whole_batch():
    """Before this fix, save_amivi_chunk() was the one unguarded
    step in process_amivi_chunk — an exception there propagated out
    of the whole /api/amivi/generate request over a single chunk's
    DB hiccup, losing every other chunk's already-generated work
    too. Simulates exactly that for one chunk."""

    request = main.AmiviRequest(text="source material", language="en")

    def flaky_save(**kwargs):
        if kwargs.get("key_point") == "Valves Control Flow":
            raise RuntimeError("simulated DB write failure")
        return 555

    result, _ = _run_generate(
        request, SUBJECT_HUMAN_HEART, save_side_effect=flaky_save
    )

    assert result["status"] == "success"
    assert len(result["chunks"]) == 5

    failed = [c for c in result["chunks"] if c["save_failed"]]
    assert len(failed) == 1
    assert failed[0]["key_point"] == "Valves Control Flow"
    assert failed[0]["chunk_id"] is None

    # Every other chunk still saved normally.
    ok = [c for c in result["chunks"] if not c["save_failed"]]
    assert len(ok) == 4
    assert all(c["chunk_id"] == 555 for c in ok)


# ============================================================
# INTRODUCE — slogan word cap
# ============================================================

def test_overlong_slogan_is_capped_at_four_words_server_side():
    content = _content_for(
        "Test Subject",
        [("Some Key Point", "This slogan definitely has way more than four words in it")],
    )

    request = main.AmiviRequest(text="source material", language="en")
    result, _ = _run_generate(request, content)

    slogan = result["chunks"][0]["slogan"]
    assert len(slogan.split()) <= 4
    assert slogan == "This slogan definitely has"


def test_short_slogan_is_left_untouched():
    content = _content_for(
        "Test Subject",
        [("Some Key Point", "Short and sweet")],
    )

    request = main.AmiviRequest(text="source material", language="en")
    result, _ = _run_generate(request, content)

    assert result["chunks"][0]["slogan"] == "Short and sweet"


# ============================================================
# EXPLAIN — identity preserved
# ============================================================

def test_explain_reuses_same_key_point_and_slogan():
    content = _content_for(
        "The Human Heart",
        [("Four Chambers", "Four rooms, one pump")],
    )

    # description="" in the mocked content forces _gen_explanation to
    # actually call generate_amivi_explanation, same as a fresh
    # generation (not a reload of an already-explained project).
    request = main.AmiviRequest(text="source material", language="en")

    result, mocks = _run_generate(
        request,
        content,
        explain_return={"explanation": "The heart has four chambers that pump blood."},
    )

    chunk = result["chunks"][0]
    assert chunk["key_point"] == "Four Chambers"
    assert chunk["slogan"] == "Four rooms, one pump"
    assert chunk["description"] == "The heart has four chambers that pump blood."

    # Called with exactly this Microbit's own stored Key Point and
    # slogan — not re-derived or altered.
    _, call_kwargs = mocks["explain"].call_args
    assert call_kwargs["key_point"] == "Four Chambers"
    assert call_kwargs["slogan"] == "Four rooms, one pump"


def test_explain_failure_is_non_fatal_and_keeps_key_point_and_slogan():
    content = _content_for(
        "The Human Heart",
        [("Four Chambers", "Four rooms, one pump")],
    )

    request = main.AmiviRequest(text="source material", language="en")
    result, _ = _run_generate(
        request, content, explain_side_effect=RuntimeError("LLM timeout")
    )

    chunk = result["chunks"][0]
    assert chunk["key_point"] == "Four Chambers"
    assert chunk["slogan"] == "Four rooms, one pump"
    assert chunk["description"] == ""  # degraded, not crashed


# ============================================================
# DEMONSTRATION READINESS — video off by default
# ============================================================

def test_generate_video_defaults_to_false():
    request = main.AmiviRequest(text="source material", language="en")
    assert request.generate_video is False


def test_video_generation_is_skipped_when_not_requested():
    content = _content_for("Test Subject", [("Point", "A short slogan")])

    request = main.AmiviRequest(text="source material", language="en")
    assert request.generate_video is False

    result, mocks = _run_generate(request, content)

    mocks["video"].assert_not_called()
    assert result["video_id"] is None
    assert result["video_url"] is None


def test_video_generation_runs_when_explicitly_requested():
    content = _content_for("Test Subject", [("Point", "A short slogan")])

    request = main.AmiviRequest(
        text="source material", language="en", generate_video=True
    )

    result, mocks = _run_generate(request, content)

    mocks["video"].assert_called_once()
