"""
Tests for the AMICO comic pipeline against the checks raised in the
teacher feedback on the Human Heart (#80) test:

1. Educational completeness — when an AMIVI package (Microbits) has
   more Key Points than the teacher's chosen panel count, AMICO must
   not silently drop or blend Key Points together. Before this fix,
   total_panels came only from panels_per_page * pages (default 4),
   completely independent of how many Key Points the source package
   actually had, so a 6-Key-Point package condensed into a 4-panel
   comic (only 2 "middle" content panels, since panel 1 is the intro
   and the last panel is the recap) forced the model to choose
   between "never drop a Key Point" and "you only have 2 panels" —
   two instructions that can't both hold.
4. Reliability — generation across multiple subjects, and one
   panel's image failing to generate, must not crash the whole
   request.
5. Export/retrieval — every generated page has a resolvable
   comic_image_url, and recomposing (as happens on reopening a saved
   project) produces the same page count from the same panel data.

These mock the two things that leave the process — the LLM calls
(generate_amico_comic / review_amico_comic) and the per-panel/page
side effects (image generation, DB saves) — so they exercise the
REAL total_panels sizing, concurrency, and per-panel error-handling
logic in amico_generate() and compose_amico_comic(), without needing
a live OpenAI key or a real Postgres database.

Run with:
    pytest backend/test_amico_reliability.py -v
"""

import asyncio
import itertools
import os
import sys
from types import SimpleNamespace
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


class _FakeChunk:
    """Stands in for the ORM row list_amivi_chunks_for_project()
    returns — only the attributes amico_generate actually reads."""

    def __init__(self, id, key_point, slogan, description):
        self.id = id
        self.key_point = key_point
        self.text = key_point
        self.slogan = slogan
        self.description = description


def _amivi_chunks(pairs):
    """pairs: list of (key_point, slogan) tuples. description is
    always pre-filled so amico_generate never needs to call
    generate_amivi_explanation (keeps these tests focused on the
    comic pipeline itself)."""

    return [
        _FakeChunk(
            id=100 + i,
            key_point=kp,
            slogan=slogan,
            description=f"{kp} explained simply.",
        )
        for i, (kp, slogan) in enumerate(pairs)
    ]


HUMAN_HEART_CHUNKS = _amivi_chunks(
    [
        ("Four Chambers", "Four rooms, one pump"),
        ("Valves Control Flow", "One-way doors for blood"),
        ("Arteries Carry Blood Out", "Highways leaving the heart"),
        ("Veins Bring Blood Back", "The road back home"),
        ("Heartbeat Rhythm", "Lub-dub, every second"),
        ("Blood Carries Oxygen", "A river of fuel"),
    ]
)

WATER_CYCLE_CHUNKS = _amivi_chunks(
    [
        ("Evaporation", "Water rises as vapor"),
        ("Condensation", "Vapor becomes clouds"),
        ("Precipitation", "Clouds release rain"),
    ]
)

SOLAR_SYSTEM_CHUNKS = _amivi_chunks(
    [
        ("The Sun", "Our star at the center"),
        ("Inner Rocky Planets", "Small and close to the sun"),
        ("Outer Gas Giants", "Huge and far away"),
        ("Asteroid Belt", "Rocky rubble between orbits"),
        ("Comets", "Icy visitors from afar"),
        ("Orbits", "Everything circles the sun"),
        ("Moons", "Many worlds have company"),
    ]
)


def _mock_comic(total_panels, title="Test Comic"):
    """Shapes a generate_amico_comic()-style return value with
    exactly total_panels panels, so the endpoint's own
    len(panels) != total_panels check passes."""

    return {
        "title": title,
        "subject_category": "Science",
        "learning_objective": f"Understand {title}.",
        "characters": [
            {"name": "Dr. Ana", "role": "explainer", "appearance": "a friendly scientist"},
            {"name": "Mia", "role": "curious student", "appearance": "a curious kid"},
        ],
        "panels": [
            {
                "panel_number": i + 1,
                "title": f"Panel {i + 1}",
                "scene": f"Scene {i + 1}",
                "image_prompt": f"An illustration for panel {i + 1}",
                "dialogue": f"Dr. Ana: FACT {i + 1} - a short fact.\nMia: Really?",
                "learning_point": f"Learning point {i + 1}",
            }
            for i in range(total_panels)
        ],
    }


def _run_amico_generate(
    request,
    chunks=None,
    image_side_effect=None,
    save_media_side_effect=None,
):
    """Runs the real amico_generate() coroutine with the minimum set
    of mocks needed to avoid a live LLM, a real image model, or a
    real database, while leaving total_panels sizing, the per-panel
    concurrency, and the real render_amico_page/compose_amico_comic
    rendering code real."""

    source_project = (
        SimpleNamespace(title="The Human Heart", input_text="")
        if chunks
        else None
    )

    def fake_generate_amico_comic(
        topic, language, total_panels, character_reference,
        character_name, from_amivi_package, key_point_count=None,
    ):
        return _mock_comic(total_panels)

    def fake_review_amico_comic(comic, language, total_panels):
        return comic  # pass-through identity, same panel count

    image_patch = (
        patch("main.generate_image_resilient", side_effect=image_side_effect)
        if image_side_effect
        else patch("main.generate_image_resilient", return_value=201)
    )

    save_media_patch = (
        patch("main.save_media", side_effect=save_media_side_effect)
        if save_media_side_effect
        else patch("main.save_media", side_effect=itertools.count(900))
    )

    with patch("main.require_services", return_value=None), \
         patch("main.guard_learning_input", return_value=None), \
         patch("main.get_project", return_value=source_project), \
         patch("main.list_amivi_chunks_for_project", return_value=chunks or []), \
         patch("main.generate_amico_comic", side_effect=fake_generate_amico_comic) as mock_gen, \
         patch("main.review_amico_comic", side_effect=fake_review_amico_comic), \
         patch("main.save_project", return_value=321), \
         patch("main.resolve_chapter_metadata", return_value=("Science", "Test Comic", "science")), \
         patch("main.update_project_data", return_value=None), \
         patch("main.save_comic", return_value=654):

        with image_patch, save_media_patch:
            result = asyncio.run(
                main.amico_generate(request, current_user=_FakeUser())
            )

    return result, {"generate_amico_comic": mock_gen}


# ============================================================
# EDUCATIONAL COMPLETENESS — panel count follows the Key Points,
# not just panels_per_page * pages
# ============================================================

def test_amico_bumps_pages_so_every_key_point_gets_its_own_panel():
    """6 Key Points (Human Heart), default request (4 panels per
    page, 1 page = 4 total panels, only 2 of which are 'middle'
    content panels). Before this fix, total_panels stayed at 4 no
    matter how many Key Points existed. It must now be bumped so
    there's a middle panel per Key Point (>= 6 + 2 = 8), while
    keeping the teacher's chosen panels_per_page layout."""

    request = main.AmicoRequest(
        source_project_id=42,
        panels_per_page=4,
        pages=1,
    )

    result, mocks = _run_amico_generate(request, chunks=HUMAN_HEART_CHUNKS)

    assert result["status"] == "success"
    assert result["panels_per_page"] == 4  # teacher's layout choice unchanged
    assert result["pages_count"] >= 2  # pages bumped, not panels_per_page

    total_panels_requested = mocks["generate_amico_comic"].call_args.args[2]
    assert total_panels_requested >= 6 + 2  # 1 panel per Key Point + intro + recap
    assert total_panels_requested == result["panels_per_page"] * result["pages_count"]


def test_amico_does_not_bump_when_panels_already_cover_every_key_point():
    """3 Key Points (Water Cycle) comfortably fit in the default 4
    panels (2 middle panels... actually need >=3, so this also
    bumps) — use a request that already has enough room (6 panels,
    2 pages of 3) and confirm no further bump happens."""

    request = main.AmicoRequest(
        source_project_id=42,
        panels_per_page=5,
        pages=1,
    )  # 5 total panels, 3 middle panels >= 3 Key Points

    result, mocks = _run_amico_generate(request, chunks=WATER_CYCLE_CHUNKS)

    assert result["pages_count"] == 1
    total_panels_requested = mocks["generate_amico_comic"].call_args.args[2]
    assert total_panels_requested == 5


def test_amico_does_not_bump_for_free_typed_topic_without_source_project():
    """No AMIVI source package (just a typed homework topic) — the
    bump logic must not apply; total_panels stays exactly what the
    teacher selected."""

    request = main.AmicoRequest(
        homework_prompt="Photosynthesis for a 5th grader",
        panels_per_page=4,
        pages=1,
    )

    result, mocks = _run_amico_generate(request, chunks=None)

    assert result["pages_count"] == 1
    total_panels_requested = mocks["generate_amico_comic"].call_args.args[2]
    assert total_panels_requested == 4


def test_build_amico_structure_hint_gives_one_middle_panel_per_key_point():
    hint = main.build_amico_structure_hint(8, key_point_count=6)
    assert "exactly 6 Key Points" in hint
    assert "6 middle panels" in hint
    assert "Do not skip, merge, or combine any Key Point" in hint


def test_build_amico_structure_hint_falls_back_when_still_not_enough_room():
    """Defensive case: if key_point_count somehow still exceeds the
    available middle panels (e.g. the 6-page system cap was hit),
    structure hint must fall back to the generic 'prioritize the
    most essential' wording rather than claiming a false 1:1 that
    isn't actually possible."""

    hint = main.build_amico_structure_hint(4, key_point_count=6)
    assert "exactly 6 Key Points" not in hint
    assert "prioritize the most essential" in hint


# ============================================================
# RELIABILITY — multiple subjects, no crash
# ============================================================

@pytest.mark.parametrize(
    "chunks",
    [HUMAN_HEART_CHUNKS, WATER_CYCLE_CHUNKS, SOLAR_SYSTEM_CHUNKS],
    ids=["human_heart", "water_cycle", "solar_system"],
)
def test_amico_generation_succeeds_across_subjects_no_crash(chunks):
    request = main.AmicoRequest(
        source_project_id=42, panels_per_page=4, pages=1
    )

    result, _ = _run_amico_generate(request, chunks=chunks)

    assert result["status"] == "success"
    assert len(result["panels"]) == result["panels_per_page"] * result["pages_count"]
    assert len(result["pages"]) == result["pages_count"]


def test_amico_repeated_generation_is_consistent():
    """Running generation twice in a row for the same package must
    not crash or produce a different panel count between runs."""

    request = main.AmicoRequest(
        source_project_id=42, panels_per_page=4, pages=1
    )

    first, _ = _run_amico_generate(request, chunks=HUMAN_HEART_CHUNKS)
    second, _ = _run_amico_generate(request, chunks=HUMAN_HEART_CHUNKS)

    assert first["status"] == second["status"] == "success"
    assert len(first["panels"]) == len(second["panels"])
    assert first["pages_count"] == second["pages_count"]


def test_one_panel_image_failure_does_not_crash_the_whole_comic():
    """Simulates a persistent image-generation failure (e.g. content
    moderation) for exactly one panel — the request must still
    succeed, every other panel's image intact, render_amico_page
    falling back to a placeholder for the missing one instead of
    the whole request failing."""

    request = main.AmicoRequest(
        source_project_id=42, panels_per_page=4, pages=1
    )

    def flaky_image(**kwargs):
        if "_panel_2.png" in kwargs.get("filename", ""):
            return None
        return 201

    result, _ = _run_amico_generate(
        request, chunks=HUMAN_HEART_CHUNKS, image_side_effect=flaky_image
    )

    assert result["status"] == "success"

    failed = [p for p in result["panels"] if p["image_id"] is None]
    succeeded = [p for p in result["panels"] if p["image_id"] is not None]

    assert len(failed) == 1
    assert len(succeeded) == len(result["panels"]) - 1

    # The page sheet itself still rendered (placeholder art for the
    # missing panel) instead of the whole comic failing.
    assert len(result["pages"]) == result["pages_count"]
    assert all(p["comic_image_url"] for p in result["pages"])


# ============================================================
# EXPORT / RETRIEVAL — every page has a resolvable URL, and
# recomposing (as happens on reopening a saved project) is stable
# ============================================================

def test_every_generated_page_has_a_comic_image_url():
    request = main.AmicoRequest(
        source_project_id=42, panels_per_page=4, pages=1
    )

    result, _ = _run_amico_generate(request, chunks=HUMAN_HEART_CHUNKS)

    assert len(result["pages"]) >= 1
    for page in result["pages"]:
        assert page["comic_image_url"].startswith("/api/media/")
        assert page["comic_image_id"] is not None

    # Back-compatible single-image fields point at the first page.
    assert result["comic_image_url"] == result["pages"][0]["comic_image_url"]


def test_recompose_from_saved_panels_is_stable():
    """Mirrors what happens when a saved AMICO project is reopened
    and its pages are recomposed from the already-generated panel
    data — compose_amico_comic() on the same panels/panels_per_page
    must yield the same page count every time."""

    comic = _mock_comic(8, title="The Human Heart")
    comic["panels"] = [
        {**p, "image_id": None, "image_url": None}
        for p in comic["panels"]
    ]

    with patch("main.save_media", side_effect=itertools.count(900)):
        pages_a = main.compose_amico_comic(
            project_id=1, comic=comic, panels_per_page=4, layout="horizontal"
        )

    with patch("main.save_media", side_effect=itertools.count(900)):
        pages_b = main.compose_amico_comic(
            project_id=1, comic=comic, panels_per_page=4, layout="horizontal"
        )

    assert len(pages_a) == len(pages_b) == 2  # 8 panels / 4 per page
    assert [p["page_number"] for p in pages_a] == [p["page_number"] for p in pages_b]
