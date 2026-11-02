"""
generate_comic_story_presets.py

One-time helper script that generates the thumbnail art for AMICO's
Comic Story quick-pick options:

  - 4 preset character avatars (2 female teachers, 2 male teachers)
  - 4 preset story backgrounds (Garden, Lakeside, Jungle, Breakfast
    Table)

and saves them into frontend/public/, where the Comic Story screen
(frontend/src/pages/Amico.jsx) already looks for them by filename.
Until these files exist, that screen falls back to a plain colored
initial circle (avatars) or a line icon (backgrounds) automatically,
so nothing breaks before this script is run.

This follows the exact same pattern as generate_platform_images.py
in this folder: it reuses the running app's own OPENAI_API_KEY (from
backend/.env), no new credentials needed, and is meant to be run
once from the backend/ folder:

    python generate_comic_story_presets.py

Re-run any time to regenerate; existing files are simply overwritten.

The character/background descriptions below are kept in sync by hand
with PRESET_AVATARS / PRESET_BACKGROUNDS in backend/main.py — if you
change a description there (to tweak how a character looks in the
generated comic itself), update it here too so the picker's thumbnail
actually matches what gets drawn into the story.
"""

import base64
import os
import time

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise SystemExit(
        "OPENAI_API_KEY is not set. Make sure backend/.env has the "
        "same OPENAI_API_KEY the running app uses, then try again."
    )

client = OpenAI(api_key=OPENAI_API_KEY)

IMAGE_MODEL = "gpt-image-2"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(SCRIPT_DIR, "..", "frontend", "public")

# Same safety intent as the app's own KID_SAFE_IMAGE_SUFFIX in
# main.py, phrased for a comic-book character/scene illustration
# rather than a general image.
KID_SAFE_SUFFIX = (
    " The image must be clearly safe and appropriate for children: "
    "bright, friendly, educational art style. No violence, weapons, "
    "blood, gore, or scary/disturbing imagery. No nudity, no "
    "suggestive poses, no adult or revealing clothing of any kind. "
    "Any people shown must be fully and modestly dressed in "
    "ordinary, everyday, age-appropriate clothing suitable for a "
    "children's classroom."
)

# Matches the comic's own look (see generate_amico_comic in
# main.py): warm, bright, flat cartoon shading with clean bold
# outlines, not a photo-realistic style.
COMIC_STYLE_SUFFIX = (
    " Style: warm, bright, colorful children's comic-book "
    "illustration, flat cartoon shading, clean bold outlines, "
    "friendly and expressive, matching a kids' educational comic."
)

AVATARS = [
    {
        "filename": "vlq-avatar-amara.png",
        "name": "Ms. Amara",
        # Kept in sync with PRESET_AVATARS["amara"]["description"] in main.py
        "description": (
            "a warm, friendly young woman teacher with curly black "
            "hair, warm brown skin, glasses, wearing a soft yellow "
            "cardigan over a white blouse"
        ),
    },
    {
        "filename": "vlq-avatar-priya.png",
        "name": "Ms. Priya",
        # Kept in sync with PRESET_AVATARS["priya"]["description"] in main.py
        "description": (
            "a warm, friendly teacher with long straight dark hair "
            "tied in a ponytail, light brown skin, wearing a bright "
            "teal blouse and a simple necklace"
        ),
    },
    {
        "filename": "vlq-avatar-daniel.png",
        "name": "Mr. Daniel",
        # Kept in sync with PRESET_AVATARS["daniel"]["description"] in main.py
        "description": (
            "a warm, friendly male teacher with short brown hair, "
            "light skin, glasses, wearing a navy sweater vest over "
            "a collared shirt"
        ),
    },
    {
        "filename": "vlq-avatar-arjun.png",
        "name": "Mr. Arjun",
        # Kept in sync with PRESET_AVATARS["arjun"]["description"] in main.py
        "description": (
            "a warm, friendly male teacher with short black hair, "
            "a neat short beard, brown skin, wearing a light green "
            "collared shirt with sleeves rolled up"
        ),
    },
]

BACKGROUNDS = [
    {
        "filename": "vlq-bg-garden.png",
        "label": "Garden",
        # Kept in sync with PRESET_BACKGROUNDS["garden"] in main.py
        "description": "a bright, colorful outdoor garden with flowers, grass, and sunlight",
    },
    {
        "filename": "vlq-bg-lakeside.png",
        "label": "Lakeside",
        # Kept in sync with PRESET_BACKGROUNDS["lakeside"] in main.py
        "description": "a calm lakeside with clear blue water, a grassy bank, and distant hills",
    },
    {
        "filename": "vlq-bg-jungle.png",
        "label": "Jungle",
        # Kept in sync with PRESET_BACKGROUNDS["jungle"] in main.py
        "description": "a lush green jungle with tall trees, vines, and dappled sunlight",
    },
    {
        "filename": "vlq-bg-breakfast_table.png",
        "label": "Breakfast Table",
        # Kept in sync with PRESET_BACKGROUNDS["breakfast_table"] in main.py
        "description": "a cozy kitchen breakfast table with morning light, plates, and cups",
    },
]


def build_avatar_prompt(avatar):
    return (
        "A simple, friendly comic-book character portrait, head and "
        f"shoulders, centered, of {avatar['description']}. Plain "
        "soft-colored background (no scenery, no text, no props), "
        "warm welcoming smile, facing slightly toward the viewer, "
        "like a character reference sheet for a kids' educational "
        "comic."
        + COMIC_STYLE_SUFFIX
        + KID_SAFE_SUFFIX
    )


def build_background_prompt(bg):
    return (
        f"A simple, colorful comic-book scene of {bg['description']}, "
        "with no people, animals, or text in the image — just the "
        "setting itself, like a background plate for a kids' "
        "educational comic panel."
        + COMIC_STYLE_SUFFIX
        + KID_SAFE_SUFFIX
    )


def generate_one(filename, prompt, attempt=1, max_attempts=3):

    try:

        result = client.images.generate(
            model=IMAGE_MODEL,
            prompt=prompt,
            size="1024x1024",
        )

        if not result.data or not result.data[0].b64_json:
            raise Exception("OpenAI returned no image data.")

        image_bytes = base64.b64decode(result.data[0].b64_json)

        out_path = os.path.join(PUBLIC_DIR, filename)
        with open(out_path, "wb") as f:
            f.write(image_bytes)

        print(f"  saved {filename} ({len(image_bytes)} bytes)")

    except Exception as exc:

        if attempt < max_attempts:
            print(f"  attempt {attempt} failed for {filename} ({exc}), retrying...")
            time.sleep(2 * attempt)
            generate_one(filename, prompt, attempt=attempt + 1, max_attempts=max_attempts)
        else:
            print(f"  FAILED to generate {filename} after {max_attempts} attempts: {exc}")


def main():

    os.makedirs(PUBLIC_DIR, exist_ok=True)

    print(f"Generating {len(AVATARS)} avatar portraits + {len(BACKGROUNDS)} backgrounds into {PUBLIC_DIR} ...")

    for avatar in AVATARS:
        print(f"Generating {avatar['filename']} ({avatar['name']}) ...")
        generate_one(avatar["filename"], build_avatar_prompt(avatar))

    for bg in BACKGROUNDS:
        print(f"Generating {bg['filename']} ({bg['label']}) ...")
        generate_one(bg["filename"], build_background_prompt(bg))

    print("Done. Commit the new files in frontend/public/ and redeploy the frontend.")


if __name__ == "__main__":
    main()
