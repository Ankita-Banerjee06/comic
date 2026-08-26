"""
generate_platform_images.py

One-time helper script that generates a fresh set of platform-branded
marketing images for the VLQ frontend (Landing page + section headers
on AMIVI / AMICO / Quiz / Dashboard / Collaborative Learning) and saves
them into frontend/public/.

This reuses the exact same OpenAI setup already configured for the
running app (OPENAI_API_KEY from backend/.env, gpt-image-2) so no new
credentials are needed. It applies the same kid-safety constraints as
the app's own guardrails (backend/main.py -> KID_SAFE_IMAGE_SUFFIX),
adapted for a professional marketing/editorial look instead of a
cartoon classroom-art style, since these images need to read as
appropriate for adult learners as well as kids.

Usage (run once from the backend/ folder, with the same virtualenv /
dependencies the app already uses):

    python generate_platform_images.py

Images are written to ../frontend/public/vlq-gen-*.png . Re-run any
time to regenerate; existing files are simply overwritten.
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

# Same safety intent as the app's KID_SAFE_IMAGE_SUFFIX (no violence,
# no nudity/suggestive content, everyone fully and modestly dressed,
# appropriate for children) but described as a realistic editorial
# photography style rather than bright cartoon art, since these are
# marketing images meant to read as credible for adult learners too.
MARKETING_SAFE_SUFFIX = (
    " Style: realistic, warm, professional editorial photography "
    "suitable for a modern education technology brand -- natural "
    "lighting, diverse people of varied ages genuinely engaged in "
    "learning, a clean modern setting. Not a cartoon or illustration. "
    "The image must be clearly safe and appropriate for all "
    "audiences including children: no violence, weapons, blood, "
    "gore, or scary/disturbing imagery. No nudity, no suggestive "
    "poses, no adult or revealing clothing of any kind. Any people "
    "shown must be fully and modestly dressed in ordinary, everyday, "
    "age-appropriate clothing. Do not render any readable text, "
    "logos, or watermarks in the image."
)

IMAGES = [
    {
        "filename": "vlq-gen-hero.png",
        "prompt": (
            "A bright, modern photo of a mixed-age group of learners "
            "-- a teenager, a young adult, and an older adult -- "
            "gathered around a table, looking together with curiosity "
            "and delight at a large glowing digital screen that shows "
            "colorful visual diagrams and charts instead of dense "
            "text. The mood is collaborative, curious and optimistic, "
            "like a next-generation classroom that welcomes every age."
        ),
    },
    {
        "filename": "vlq-gen-amivi.png",
        "prompt": (
            "A close, photo-realistic scene of a person's hands "
            "turning the pages of a textbook, with colorful glowing "
            "visual diagrams, icons and infographics gently rising "
            "into the air above the book, as if the text is "
            "transforming into visual understanding. Clean, modern, "
            "softly lit desk setting."
        ),
    },
    {
        "filename": "vlq-gen-amico.png",
        "prompt": (
            "A creative desk scene showing a tablet screen displaying "
            "a colorful multi-panel illustrated story about a science "
            "topic, with a person's hand sketching alongside it, warm "
            "creative-studio lighting, modern and artistic but "
            "professional, not childish."
        ),
    },
    {
        "filename": "vlq-gen-quiz.png",
        "prompt": (
            "A bright, modern photo of a person confidently answering "
            "a multiple-choice quiz on a tablet, with a subtle glowing "
            "checkmark and progress-bar graphic near the screen, clean "
            "minimal workspace, focused and confident mood, suitable "
            "for both a student and a working professional."
        ),
    },
    {
        "filename": "vlq-gen-dashboard.png",
        "prompt": (
            "A clean modern photo of a person reviewing their "
            "learning progress on a laptop showing simple colorful "
            "charts and a course library, sitting in a bright modern "
            "study or office space, calm and organized mood."
        ),
    },
    {
        "filename": "vlq-gen-collab.png",
        "prompt": (
            "A warm photo of a small, diverse group of people of "
            "different ages sitting together around a table with "
            "laptops and tablets, pointing at a shared screen and "
            "smiling, collaborative discussion, bright modern room, "
            "professional yet friendly atmosphere."
        ),
    },
]


def generate_one(spec, attempt=1, max_attempts=3):

    safe_prompt = spec["prompt"] + MARKETING_SAFE_SUFFIX

    try:

        result = client.images.generate(
            model=IMAGE_MODEL,
            prompt=safe_prompt,
            size="1024x1024",
        )

        if not result.data or not result.data[0].b64_json:
            raise Exception("OpenAI returned no image data.")

        image_bytes = base64.b64decode(result.data[0].b64_json)

        out_path = os.path.join(PUBLIC_DIR, spec["filename"])
        with open(out_path, "wb") as f:
            f.write(image_bytes)

        print(f"  saved {spec['filename']} ({len(image_bytes)} bytes)")

    except Exception as exc:

        if attempt < max_attempts:
            print(
                f"  attempt {attempt} failed for "
                f"{spec['filename']} ({exc}), retrying..."
            )
            time.sleep(2 * attempt)
            generate_one(spec, attempt=attempt + 1, max_attempts=max_attempts)
        else:
            print(
                f"  FAILED to generate {spec['filename']} after "
                f"{max_attempts} attempts: {exc}"
            )


def main():

    os.makedirs(PUBLIC_DIR, exist_ok=True)

    print(f"Generating {len(IMAGES)} platform images into {PUBLIC_DIR} ...")

    for spec in IMAGES:
        print(f"Generating {spec['filename']} ...")
        generate_one(spec)

    print("Done. Restart your frontend dev server if it's already running.")


if __name__ == "__main__":
    main()
