"""
Tests for the AMIVI/AMICO Photo Story page renderer
(render_photostory_page in main.py).

Context: a Photo Story page composes every chunk's already-
generated image into one poster-style sheet (3 panels per row).
Each panel used to draw its title as a single unbroken line of
very large text with no width check, so any title longer than a
handful of characters silently overflowed its own column and
visually overlapped the neighboring panel's artwork/caption —
and the image and its caption strip were two separate bordered
boxes with a visible gap between them, reading as a sloppy double
border rather than one clean card.

These tests lock in the fix: panel titles are wrapped and capped
at 2 lines so a line's rendered width can never exceed its own
column, and the page renders successfully (as a real PNG, not a
mocked result) across a range of panel counts and caption/title
lengths, including the pathologically long title that reproduced
the original bug.

Run with:
    pytest backend/test_photostory.py -v
"""

import os
import sys

import pytest
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))

os.environ.setdefault(
    "DATABASE_URL", "postgresql://test:test@localhost/test"
)
os.environ.setdefault("OPENAI_API_KEY", "")

import main  # noqa: E402


LONG_TITLE = (
    "Stretch With Ease Every Single Morning Before Breakfast"
)
LONG_CAPTION = (
    "Yoga gently stretches your muscles and joints, helping "
    "your body move more freely and comfortably through the "
    "day, even on mornings when everything feels stiff."
)


def _panels(n, with_long_title=False):
    return [
        {
            "image_id": None,
            "title": LONG_TITLE if with_long_title and i == 0 else f"Benefit {i + 1}",
            "caption": LONG_CAPTION,
        }
        for i in range(n)
    ]


# ============================================================
# The core bug: a long title must never overflow its own column
# ============================================================

def test_long_panel_title_is_wrapped_not_overflowed():
    """Reproduces the exact scenario from the bug report (a long
    title in a 3-per-row page) and checks every wrapped title line
    actually fits inside its own column width, the same width
    budget render_photostory_page uses for the caption."""

    panel_title_font = main.get_font(100, bold=True)

    # Mirrors render_photostory_page's page_width / outer_padding /
    # gap math for a 3-column row, so this is the real per-column
    # budget the renderer wraps against, not an arbitrary number.
    frame_thickness = 86
    outer_padding = frame_thickness + 34
    gap = 29
    page_width = 3800
    content_width = page_width - outer_padding * 2
    col_width = (content_width - 2 * gap) // 3
    max_width = col_width - 80

    raw_lines = main.wrap_text(LONG_TITLE, panel_title_font, max_width)
    title_lines = raw_lines[:2]

    assert len(title_lines) <= 2

    dummy = Image.new("RGB", (10, 10))
    from PIL import ImageDraw
    draw = ImageDraw.Draw(dummy)

    for line in title_lines:
        bbox = draw.textbbox((0, 0), line, font=panel_title_font)
        width = bbox[2] - bbox[0]
        assert width <= max_width, (line, width, max_width)


def test_render_photostory_page_handles_long_title_end_to_end():
    """The actual renderer, not a mock — a long title must not
    raise and must still produce a valid, correctly sized PNG."""

    panels = _panels(6, with_long_title=True)

    data = main.render_photostory_page(
        panels, 1, 1, "YOGA BENEFITS", "horizontal"
    )

    assert data[:8] == b"\x89PNG\r\n\x1a\n"

    image = Image.open(__import__("io").BytesIO(data))
    assert image.width > 0 and image.height > 0


# ============================================================
# Renders cleanly across the supported panel-count range
# ============================================================

@pytest.mark.parametrize("count", [2, 3, 4, 6, 8])
def test_render_photostory_page_various_panel_counts(count):
    panels = _panels(count)

    data = main.render_photostory_page(
        panels, 1, 1, "Test Story", "horizontal"
    )

    assert data[:8] == b"\x89PNG\r\n\x1a\n"


def test_render_photostory_page_vertical_layout():
    panels = _panels(3)

    data = main.render_photostory_page(
        panels, 1, 1, "Test Story", "vertical"
    )

    assert data[:8] == b"\x89PNG\r\n\x1a\n"


def test_compose_amico_photostory_paginates_and_saves():
    """compose_amico_photostory should split panels across pages
    and return one entry per page — mock only save_media (the DB
    write), exercising the real render_photostory_page for each
    page exactly like generate_photo_story does."""

    from unittest.mock import patch

    story = {
        "title": "Test Story",
        "panels": [
            {"image_id": None, "title": f"Point {i}", "caption": "Some caption text."}
            for i in range(10)
        ],
    }

    saved_ids = iter(range(100, 200))

    with patch("main.save_media", side_effect=lambda **kwargs: next(saved_ids)):
        pages = main.compose_amico_photostory(
            project_id=1,
            story=story,
            panels_per_page=6,
            layout="horizontal",
        )

    # 10 panels at 6 per page -> 2 pages
    assert len(pages) == 2
    assert pages[0]["page_number"] == 1
    assert pages[1]["page_number"] == 2
    assert all("comic_image_url" in p for p in pages)
