from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from dotenv import load_dotenv

import os
import json
import base64
import tempfile
import subprocess
import platform
import io
import glob
import re
from urllib.parse import urlparse

import yt_dlp

from openai import OpenAI

from moviepy.editor import (
    ImageClip,
    AudioFileClip,
    concatenate_videoclips,
    TextClip,
    CompositeVideoClip,
)

from pypdf import PdfReader
from docx import Document

from database import SessionLocal, engine, create_tables

from models import (
    User,
    Project,
    MediaAsset,
    Comic,
    Quiz,
    AmiviChunk,
)


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")


# ============================================================
# OPENAI MODELS
# ============================================================

TERRA_MODEL = "gpt-5.6-terra"
SOL_MODEL = "gpt-5.6-sol"
LUNA_MODEL = "gpt-5.6-luna"
IMAGE_MODEL = "gpt-image-2"


client = (
    OpenAI(api_key=OPENAI_API_KEY)
    if OPENAI_API_KEY
    else None
)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="AMIVI & AMICO API",
    description="Backend for Visual Learning and Comic Generation",
    version="2.1.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
def startup():

    if not OPENAI_API_KEY:
        print("WARNING: OPENAI_API_KEY is not set.")

    if not DATABASE_URL:
        print("WARNING: DATABASE_URL is not set.")

    if engine:
        create_tables()
        print("PostgreSQL tables are ready.")


# ============================================================
# REQUEST MODELS
# ============================================================

class AmiviRequest(BaseModel):
    text: str
    language: str = "en"
    generate_video: bool = True
    video_url:str | None=None


class AmicoRequest(BaseModel):
    homework_prompt: str
    language: str = "en"


# ============================================================
# BASIC HELPERS
# ============================================================

def require_services():

    if not client:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is not set.",
        )

    if not SessionLocal:
        raise HTTPException(
            status_code=500,
            detail="DATABASE_URL is not set.",
        )


def get_language_instruction(language: str) -> str:

    if language == "es":

        return (
            "Generate ALL output in natural, child-friendly Spanish. "
            "Do not mix English and Spanish. "
            "All chunks, slogans, descriptions, image prompts, "
            "dialogue and narration must be written in Spanish."
        )

    return "Generate all output in English."


# ============================================================
# OPENAI JSON HELPER
# ============================================================

def call_json_model(
    model: str,
    instructions: str,
    user_input: str,
) -> dict:

    require_services()

    response = client.responses.create(
        model=model,
        instructions=instructions,
        input=user_input,
    )

    raw_output = response.output_text.strip()

    raw_output = (
        raw_output
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    try:

        return json.loads(raw_output)

    except json.JSONDecodeError as exc:

        raise Exception(
            f"{model} returned invalid JSON: {exc}. "
            f"Output: {raw_output[:1500]}"
        )


# ============================================================
# DATABASE HELPERS
# ============================================================

def save_project(
    project_type,
    title,
    input_text,
    language,
    data,
):

    db = SessionLocal()

    try:

        row = Project(
            project_type=project_type,
            title=title,
            input_text=input_text,
            language=language,
            data=data,
        )

        db.add(row)

        db.commit()

        db.refresh(row)

        return row.id

    finally:

        db.close()


def save_media(
    data: bytes,
    filename: str,
    mime_type: str,
    asset_type: str,
    project_id=None,
):

    db = SessionLocal()

    try:

        row = MediaAsset(
            project_id=project_id,
            asset_type=asset_type,
            filename=filename,
            mime_type=mime_type,
            data=data,
        )

        db.add(row)

        db.commit()

        db.refresh(row)

        return row.id

    finally:

        db.close()


def save_amivi_chunk(
    project_id,
    chunk_number,
    key_point,
    text,
    slogan,
    description,
    image_id,
    audio_id,
    voice_script,
):

    db = SessionLocal()

    try:

        row = AmiviChunk(
            project_id=project_id,
            chunk_number=chunk_number,
            key_point=key_point,
            text=text,
            slogan=slogan,
            description=description,
            image_id=image_id,
            audio_id=audio_id,
            voice_script=voice_script,
        )

        db.add(row)

        db.commit()

        db.refresh(row)

        return row.id

    finally:

        db.close()


def save_comic(
    project_id,
    title,
    data,
):

    db = SessionLocal()

    try:

        row = Comic(
            project_id=project_id,
            title=title,
            data=data,
        )

        db.add(row)

        db.commit()

        db.refresh(row)

        return row.id

    finally:

        db.close()


def save_quiz(
    project_id,
    title,
    data,
):

    db = SessionLocal()

    try:

        row = Quiz(
            project_id=project_id,
            title=title,
            data=data,
        )

        db.add(row)

        db.commit()

        db.refresh(row)

        return row.id

    finally:

        db.close()


def get_media(media_id: int):

    db = SessionLocal()

    try:

        row = (
            db.query(MediaAsset)
            .filter(
                MediaAsset.id == media_id
            )
            .first()
        )

        if not row:

            raise HTTPException(
                status_code=404,
                detail="Media not found.",
            )

        return row

    finally:

        db.close()


# ============================================================
# FILE EXTRACTION
# ============================================================

def extract_text_from_file(
    file_bytes: bytes,
    filename: str,
) -> str:

    extension = (
        os.path.splitext(filename)[1]
        .lower()
    )

    # ----------------------------------------
    # TXT
    # ----------------------------------------

    if extension == ".txt":

        return file_bytes.decode(
            "utf-8",
            errors="ignore",
        )


    # ----------------------------------------
    # PDF
    # ----------------------------------------

    if extension == ".pdf":

        pdf_file = io.BytesIO(
            file_bytes
        )

        reader = PdfReader(
            pdf_file
        )

        pages = []

        for page in reader.pages:

            text = page.extract_text()

            if text:

                pages.append(text)

        return "\n".join(pages)


    # ----------------------------------------
    # DOCX
    # ----------------------------------------

    if extension == ".docx":

        doc_file = io.BytesIO(
            file_bytes
        )

        document = Document(
            doc_file
        )

        paragraphs = []

        for paragraph in document.paragraphs:

            if paragraph.text.strip():

                paragraphs.append(
                    paragraph.text
                )

        return "\n".join(
            paragraphs
        )


    raise HTTPException(
        status_code=400,
        detail=(
            "Unsupported file type. "
            "Supported formats: PDF, DOCX and TXT."
        ),
    )


# ============================================================
# AMIVI CONTENT GENERATION
#
# LARGE PARAGRAPH
#        ↓
# TERRА
#        ↓
# 5–10 MEANINGFUL CHUNKS
# ============================================================

def clean_caption_text(text: str) -> str:
    """
    Convert subtitle/caption text into clean readable text.
    """
    text = re.sub(
        r"<[^>]+>",
        " ",
        text,
    )

    text = re.sub(
        r"\[[^\]]*\]",
        " ",
        text,
    )

    text = re.sub(
        r"\([^)]*\)",
        " ",
        text,
    )

    text = re.sub(
        r"\s+",
        " ",
        text,
    )

    return text.strip()


def get_caption_url(
    caption_dict,
    language,
):
    """
    Find a suitable caption URL from yt-dlp's
    subtitles/automatic_captions dictionary.
    """

    if not caption_dict:
        return None

    language = (language or "en").lower()

    preferred_languages = []

    if language == "es":
        preferred_languages = [
            "es",
            "es-ES",
            "es.*",
            "en",
            "en.*",
        ]
    else:
        preferred_languages = [
            "en",
            "en-US",
            "en-GB",
            "en.*",
            "es",
            "es.*",
        ]

    for preferred in preferred_languages:

        # Exact language
        if preferred in caption_dict:

            tracks = caption_dict[
                preferred
            ]

            if tracks:
                return tracks[-1].get(
                    "url"
                )

        # Regex-like matching
        if preferred.endswith(".*"):

            prefix = preferred[:-2]

            for key, tracks in caption_dict.items():

                if key.lower().startswith(
                    prefix
                ):
                    if tracks:
                        return tracks[-1].get(
                            "url"
                        )

    # Fall back to first available language
    for tracks in caption_dict.values():

        if tracks:
            url = tracks[-1].get(
                "url"
            )

            if url:
                return url

    return None


def parse_vtt_text(vtt_text: str) -> str:
    """
    Convert WebVTT subtitle content into plain text.
    """

    lines = []

    for raw_line in vtt_text.splitlines():

        line = raw_line.strip()

        if not line:
            continue

        if line.upper() == "WEBVTT":
            continue

        if "-->" in line:
            continue

        if re.match(
            r"^\d+$",
            line,
        ):
            continue

        line = re.sub(
            r"<[^>]+>",
            "",
            line,
        )

        if line:
            lines.append(line)

    # Remove repeated consecutive captions
    cleaned = []

    previous = None

    for line in lines:

        if line != previous:
            cleaned.append(line)

        previous = line

    return clean_caption_text(
        " ".join(cleaned)
    )


def transcribe_video_audio(
    audio_path: str,
    language: str = "en",
) -> str:
    """
    Transcribe downloaded video audio using OpenAI.
    """

    require_services()

    with open(
        audio_path,
        "rb",
    ) as audio_file:

        transcript = (
            client.audio.transcriptions.create(
                model="gpt-4o-mini-transcribe",
                file=audio_file,
                response_format="text",
            )
        )

    if hasattr(
        transcript,
        "text",
    ):
        return transcript.text

    return str(transcript)


def extract_video_text(
    video_url: str,
    language: str = "en",
) -> dict:
    """
    Extract educational text from a YouTube
    or another publicly accessible video URL.

    Strategy:
    1. Try subtitles.
    2. Try automatic captions.
    3. If unavailable, download audio.
    4. Transcribe audio with OpenAI.
    """

    if not video_url:
        raise HTTPException(
            status_code=400,
            detail="Video URL is required.",
        )

    parsed = urlparse(
        video_url
    )

    if parsed.scheme not in {
        "http",
        "https",
    }:
        raise HTTPException(
            status_code=400,
            detail="Please provide a valid http/https video URL.",
        )

    temp_dir = tempfile.mkdtemp(
        prefix="amivi_video_"
    )

    try:

        # ====================================================
        # First attempt: subtitles / automatic captions
        # ====================================================

        subtitle_options = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
            "writesubtitles": False,
            "writeautomaticsub": False,
        }

        with yt_dlp.YoutubeDL(
            subtitle_options
        ) as ydl:

            info = ydl.extract_info(
                video_url,
                download=False,
            )

        title = info.get(
            "title",
            "Video",
        )

        duration = info.get(
            "duration"
        )

        # Manual captions
        manual_caption_url = (
            get_caption_url(
                info.get("subtitles"),
                language,
            )
        )

        # Automatic captions
        auto_caption_url = (
            get_caption_url(
                info.get(
                    "automatic_captions"
                ),
                language,
            )
        )

        caption_url = (
            manual_caption_url
            or auto_caption_url
        )

        if caption_url:

            import requests

            response = requests.get(
                caption_url,
                timeout=30,
            )

            response.raise_for_status()

            caption_text = (
                parse_vtt_text(
                    response.text
                )
            )

            if len(caption_text) > 100:

                return {
                    "title": title,
                    "duration": duration,
                    "text": caption_text,
                    "source": "captions",
                    "url": video_url,
                }

        # ====================================================
        # Fallback: download audio
        # ====================================================

        output_template = os.path.join(
            temp_dir,
            "%(id)s.%(ext)s",
        )

        download_options = {
            "format": "bestaudio/best",
            "outtmpl": output_template,
            "quiet": True,
            "no_warnings": True,
            "noplaylist": True,
        }

        with yt_dlp.YoutubeDL(
            download_options
        ) as ydl:

            info = ydl.extract_info(
                video_url,
                download=True,
            )

            title = info.get(
                "title",
                title,
            )

            duration = info.get(
                "duration",
                duration,
            )

        downloaded_files = glob.glob(
            os.path.join(
                temp_dir,
                "*",
            )
        )

        audio_files = [
            path
            for path in downloaded_files
            if os.path.isfile(path)
        ]

        if not audio_files:

            raise Exception(
                "The video audio could not be downloaded."
            )

        audio_path = audio_files[0]

        # ====================================================
        # OpenAI transcription
        # ====================================================

        transcript_text = (
            transcribe_video_audio(
                audio_path,
                language,
            )
        )

        transcript_text = clean_caption_text(
            transcript_text
        )

        if len(
            transcript_text
        ) < 50:

            raise Exception(
                "Could not extract enough spoken content from the video."
            )

        return {
            "title": title,
            "duration": duration,
            "text": transcript_text,
            "source": "openai_transcription",
            "url": video_url,
        }

    except HTTPException:
        raise

    except Exception as exc:

        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=400,
            detail=(
                "Could not process this video URL. "
                f"{str(exc)}"
            ),
        )

    finally:

        import shutil

        if os.path.exists(
            temp_dir
        ):

            shutil.rmtree(
                temp_dir,
                ignore_errors=True,
            )

def generate_amivi_content(
    text_input,
    language="en",
):

    prompt = (

        "You are AMIVI, an educational visual synthesis engine.\n\n"

        "The user will provide one large educational passage.\n\n"

        "Your job is to transform that passage into meaningful "
        "educational micro-bits or chunks.\n\n"

        "IMPORTANT RULES:\n"

        "- Create 5 to 10 chunks depending on the length and complexity "
        "of the material.\n"

        "- Do not split the text randomly.\n"

        "- Each chunk must represent ONE important learning idea.\n"

        "- Keep all important educational information.\n"

        "- Do not invent facts that are not supported by the source.\n"

        "- Rewrite the content in simple learner-friendly language.\n"

        "- Each chunk should be understandable on its own.\n"

        "- Create a short memorable slogan for each chunk.\n"

        "- Create a clear explanation for each chunk.\n"

        "- Create a detailed supporting image prompt for each chunk.\n"

        "- The image prompt should describe an educational visual such as "
        "a diagram, process illustration, labeled concept, map, chart, "
        "scientific illustration, or realistic educational scene when appropriate.\n"

        "- Create a short narration script for each chunk.\n\n"

        "Return ONLY valid JSON in this exact structure:\n"

        "{\n"
        '  "chunks": [\n'
        "    {\n"
        '      "chunk_number": 1,\n'
        '      "key_point": "...",\n'
        '      "text": "...",\n'
        '      "slogan": "...",\n'
        '      "description": "...",\n'
        '      "image_prompt": "...",\n'
        '      "voice_script": "..."\n'
        "    }\n"
        "  ]\n"
        "}\n\n"

        + get_language_instruction(
            language
        )
    )

    return call_json_model(
        TERRA_MODEL,
        prompt,
        text_input,
    )


# ============================================================
# AMICO GENERATION
# ============================================================

def generate_amico_comic(
    topic,
    language="en",
):

    prompt = (

        "You are AMICO's storytelling engine.\n\n"

        "Create a connected 4-panel educational comic "
        "from the supplied educational topic.\n\n"

        "The story must be fun, accurate and child-friendly.\n\n"

        "Return ONLY JSON containing:\n"
        "- title\n"
        "- learning_objective\n"
        "- characters\n"
        "- panels\n\n"

        "Each panel must contain:\n"
        "- panel_number\n"
        "- scene\n"
        "- image_prompt\n"
        "- dialogue\n\n"

        + get_language_instruction(
            language
        )
    )

    return call_json_model(
        TERRA_MODEL,
        prompt,
        topic,
    )


def review_amico_comic(
    comic,
    language="en",
):

    prompt = (

        "You are AMICO quality control.\n\n"

        "Review and correct the comic for:\n"
        "- educational accuracy\n"
        "- story continuity\n"
        "- character consistency\n"
        "- panel continuity\n"
        "- dialogue quality\n"
        "- image prompt consistency\n\n"

        "Return the COMPLETE corrected comic "
        "using the same JSON structure.\n\n"

        + get_language_instruction(
            language
        )
    )

    return call_json_model(
        SOL_MODEL,
        prompt,
        json.dumps(
            comic,
            ensure_ascii=False,
        ),
    )


# ============================================================
# QUIZ
# ============================================================

def generate_amivi_quiz(
    text_input,
    language="en",
):

    prompt = (

        "Create a 5-question multiple-choice quiz "
        "strictly from the supplied educational material.\n\n"

        "Each question must contain:\n"
        "- q\n"
        "- exactly 4 options\n"
        "- correct as integer 0-3\n"
        "- explanation\n\n"

        "Return ONLY valid JSON in this structure:\n"

        '{'
        '"quiz": {'
        '"title": "...",'
        '"questions": [...]'
        "}"
        "}\n\n"

        + get_language_instruction(
            language
        )
    )

    return call_json_model(
        TERRA_MODEL,
        prompt,
        text_input,
    )


def generate_quiz_metadata(
    quiz,
    language="en",
):

    prompt = (

        "You are AMIVI's lightweight metadata engine.\n\n"

        "Do not change the quiz questions or answers.\n\n"

        "Return ONLY JSON containing:\n"
        "- category\n"
        "- difficulty (easy, medium or hard)\n"
        "- tags\n"
        "- language\n\n"

        + get_language_instruction(
            language
        )
    )

    return call_json_model(
        LUNA_MODEL,
        prompt,
        json.dumps(
            quiz,
            ensure_ascii=False,
        ),
    )


# ============================================================
# GPT IMAGE 2
# IMAGE -> POSTGRESQL
# ============================================================

def generate_image(
    prompt,
    filename,
    project_id=None,
):

    require_services()

    result = client.images.generate(
        model=IMAGE_MODEL,
        prompt=(
            prompt
            or "Educational illustration"
        ),
        size="1024x1024",
    )

    if (
        not result.data
        or not result.data[0].b64_json
    ):

        raise Exception(
            "OpenAI returned no image data."
        )

    image_data = base64.b64decode(
        result.data[0].b64_json
    )

    return save_media(
        data=image_data,
        filename=filename,
        mime_type="image/png",
        asset_type="image",
        project_id=project_id,
    )


# ============================================================
# PIPER TTS
# AUDIO -> POSTGRESQL
# ============================================================

def generate_voice(
    text,
    filename,
    language="en",
    project_id=None,
):

    if not text:

        raise Exception(
            "Voice text is empty."
        )

    piper_exec = (
        "piper.exe"
        if platform.system()
        == "Windows"
        else "piper"
    )

    piper_path = os.path.join(
        os.path.dirname(__file__),
        "piper",
        piper_exec,
    )

    if not os.path.exists(
        piper_path
    ):

        piper_path = piper_exec

    if language == "es":

        model_name = (
            "es_ES-sharvard-medium.onnx"
        )

    else:

        model_name = (
            "en_US-lessac-medium.onnx"
        )

    model_path = os.path.join(
        os.path.dirname(__file__),
        "piper",
        model_name,
    )

    if not os.path.exists(
        model_path
    ):

        raise Exception(
            f"Piper model not found: {model_path}"
        )

    temp_path = None

    try:

        with tempfile.NamedTemporaryFile(
            suffix=".wav",
            delete=False,
        ) as temp_file:

            temp_path = temp_file.name

        subprocess.run(
            [
                piper_path,
                "--model",
                model_path,
                "--output_file",
                temp_path,
            ],
            input=text.encode(
                "utf-8"
            ),
            check=True,
        )

        with open(
            temp_path,
            "rb",
        ) as audio_file:

            audio_data = (
                audio_file.read()
            )

        return save_media(
            data=audio_data,
            filename=filename,
            mime_type="audio/wav",
            asset_type="audio",
            project_id=project_id,
        )

    finally:

        if (
            temp_path
            and os.path.exists(temp_path)
        ):

            os.remove(temp_path)


# ============================================================
# MOVIEPY VIDEO
# IMAGES + AUDIO -> VIDEO -> POSTGRESQL
# ============================================================

def create_amivi_video(
    chunks,
    filename,
    project_id=None,
):
    clips = []
    temp_paths = []
    output_path = None

    try:
        for chunk in chunks:

            # Get image and audio from PostgreSQL
            image_asset = get_media(
                chunk["image_id"]
            )

            audio_asset = get_media(
                chunk["audio_id"]
            )

            # ------------------------------------------------
            # Create temporary image file
            # ------------------------------------------------
            image_file = tempfile.NamedTemporaryFile(
                suffix=".png",
                delete=False,
            )

            image_file.write(
                image_asset.data
            )

            image_file.close()

            # ------------------------------------------------
            # Create temporary audio file
            # ------------------------------------------------
            audio_file = tempfile.NamedTemporaryFile(
                suffix=".wav",
                delete=False,
            )

            audio_file.write(
                audio_asset.data
            )

            audio_file.close()

            temp_paths.append(
                image_file.name
            )

            temp_paths.append(
                audio_file.name
            )

            # ------------------------------------------------
            # Load audio
            # ------------------------------------------------
            audio_clip = AudioFileClip(
                audio_file.name
            )

            duration = audio_clip.duration

            # ------------------------------------------------
            # Load image
            # ------------------------------------------------
            image_clip = (
                ImageClip(
                    image_file.name
                )
                .set_duration(duration)
            )

            # ------------------------------------------------
            # No TextClip / ImageMagick
            #
            # We use the generated image directly.
            # This avoids the ImageMagick dependency.
            # ------------------------------------------------
            video_clip = image_clip

            # Add Piper narration
            video_clip = video_clip.set_audio(
                audio_clip
            )

            clips.append(
                video_clip
            )

        # ----------------------------------------------------
        # Make sure we have clips
        # ----------------------------------------------------
        if not clips:
            raise Exception(
                "No valid clips generated."
            )

        # ----------------------------------------------------
        # Temporary output video
        # ----------------------------------------------------
        with tempfile.NamedTemporaryFile(
            suffix=".mp4",
            delete=False,
        ) as video_file:

            output_path = video_file.name

        # ----------------------------------------------------
        # Combine all clips
        # ----------------------------------------------------
        final_video = concatenate_videoclips(
            clips,
            method="compose",
        )

        # ----------------------------------------------------
        # Render video
        # ----------------------------------------------------
        final_video.write_videofile(
            output_path,
            fps=24,
            codec="libx264",
            audio_codec="aac",
            preset="ultrafast",
            threads=4,
            logger=None,
        )

        # ----------------------------------------------------
        # Read final video
        # ----------------------------------------------------
        with open(
            output_path,
            "rb",
        ) as video_file:

            video_data = video_file.read()

        # ----------------------------------------------------
        # Store video in PostgreSQL
        # ----------------------------------------------------
        video_id = save_media(
            data=video_data,
            filename=filename,
            mime_type="video/mp4",
            asset_type="video",
            project_id=project_id,
        )

        return video_id

    finally:

        # ----------------------------------------------------
        # Close clips
        # ----------------------------------------------------
        for clip in clips:
            try:
                clip.close()
            except Exception:
                pass

        # ----------------------------------------------------
        # Remove temporary image/audio files
        # ----------------------------------------------------
        for path in temp_paths:
            try:
                if os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass

        # ----------------------------------------------------
        # Remove temporary video
        # ----------------------------------------------------
        if (
            output_path
            and os.path.exists(output_path)
        ):
            try:
                os.remove(output_path)
            except Exception:
                pass

# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message": (
            "Welcome to the AMIVI & AMICO API"
        )
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "ok",
        "openai_configured": bool(
            OPENAI_API_KEY
        ),
        "database_configured": bool(
            DATABASE_URL
        ),
    }


# ============================================================
# AMIVI FILE EXTRACTION
# ============================================================

@app.post("/api/amivi/extract")
async def amivi_extract(
    file: UploadFile = File(...)
):

    try:

        if not file.filename:

            raise HTTPException(
                status_code=400,
                detail="Filename is required.",
            )

        file_bytes = await file.read()

        if not file_bytes:

            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty.",
            )

        text = extract_text_from_file(
            file_bytes,
            file.filename,
        )

        if not text.strip():

            raise HTTPException(
                status_code=400,
                detail=(
                    "No readable text could be "
                    "extracted from this file."
                ),
            )

        extension = os.path.splitext(
            file.filename
        )[1].lower()

        return {
            "status": "success",
            "filename": file.filename,
            "source_type": (
                extension
                .replace(".", "")
            ),
            "text": text,
        }

    except HTTPException:

        raise

    except Exception as exc:

        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# ============================================================
# AMIVI GENERATE
#
# LARGE PARAGRAPH
#       ↓
# TERRA
#       ↓
# CHUNKS
#       ↓
# IMAGE + AUDIO
#       ↓
# OPTIONAL VIDEO
#       ↓
# POSTGRESQL
# ============================================================

@app.post("/api/amivi/extract-video")
async def amivi_extract_video(
    request: AmiviRequest,
):
    try:

        if not request.video_url:
            raise HTTPException(
                status_code=400,
                detail="Please provide a video URL.",
            )

        result = extract_video_text(
            request.video_url,
            request.language,
        )

        return {
            "status": "success",
            "title": result["title"],
            "duration": result["duration"],
            "source": result["source"],
            "url": result["url"],
            "text": result["text"],
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )

@app.post("/api/amivi/generate")
async def amivi_generate(
    request: AmiviRequest,
):

    try:

        require_services()

        # ----------------------------------------
        # Generate chunks
        # ----------------------------------------

        content = (
            generate_amivi_content(
                request.text,
                request.language,
            )
        )

        chunks = content.get(
            "chunks",
            [],
        )

        if not chunks:

            raise HTTPException(
                status_code=500,
                detail=(
                    "AMIVI did not generate "
                    "any chunks."
                ),
            )

        # ----------------------------------------
        # Create project
        # ----------------------------------------

        project_id = save_project(
            project_type="amivi",
            title="AMIVI Visual Learning",
            input_text=request.text,
            language=request.language,
            data=content,
        )

        processed_chunks = []

        # ----------------------------------------
        # Process every chunk
        # ----------------------------------------

        for index, chunk in enumerate(
            chunks
        ):

            chunk_number = chunk.get(
                "chunk_number",
                index + 1,
            )

            key_point = chunk.get(
                "key_point",
                "",
            )

            text = chunk.get(
                "text",
                "",
            )

            slogan = chunk.get(
                "slogan",
                "",
            )

            description = chunk.get(
                "description",
                "",
            )

            voice_script = chunk.get(
                "voice_script",
                "",
            )

            # ----------------------------------------
            # Generate image
            # ----------------------------------------

            image_id = generate_image(
                prompt=chunk.get(
                    "image_prompt",
                    "",
                ),
                filename=(
                    f"amivi_{project_id}"
                    f"_chunk_{index}.png"
                ),
                project_id=project_id,
            )

            # ----------------------------------------
            # Generate voice
            # ----------------------------------------

            audio_id = generate_voice(
                text=voice_script,
                filename=(
                    f"amivi_{project_id}"
                    f"_chunk_{index}.wav"
                ),
                language=request.language,
                project_id=project_id,
            )

            # ----------------------------------------
            # Save chunk
            # ----------------------------------------

            chunk_id = save_amivi_chunk(
                project_id=project_id,
                chunk_number=chunk_number,
                key_point=key_point,
                text=text,
                slogan=slogan,
                description=description,
                image_id=image_id,
                audio_id=audio_id,
                voice_script=voice_script,
            )

            # ----------------------------------------
            # Response object
            # ----------------------------------------

            processed_chunks.append(
                {
                    "chunk_id": chunk_id,
                    "chunk_number": chunk_number,
                    "key_point": key_point,
                    "text": text,
                    "slogan": slogan,
                    "description": description,
                    "image_prompt": chunk.get(
                        "image_prompt",
                        "",
                    ),
                    "voice_script": voice_script,
                    "image_id": image_id,
                    "image_url": (
                        f"/api/media/{image_id}"
                    ),
                    "audio_id": audio_id,
                    "audio_url": (
                        f"/api/media/{audio_id}"
                    ),
                }
            )

        # ----------------------------------------
        # Optional video
        # ----------------------------------------

        video_id = None

        if (
            request.generate_video
            and processed_chunks
        ):

            video_id = (
                create_amivi_video(
                    processed_chunks,
                    f"amivi_{project_id}.mp4",
                    project_id,
                )
            )

        # ----------------------------------------
        # Final response
        # ----------------------------------------

        return {
            "status": "success",
            "project_id": project_id,
            "video_id": video_id,
            "video_url": (
                f"/api/media/{video_id}"
                if video_id
                else None
            ),
            "chunks": processed_chunks,
        }

    except HTTPException:

        raise

    except Exception as exc:

        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# ============================================================
# AMICO
# ============================================================

@app.post("/api/amico/generate")
async def amico_generate(
    request: AmicoRequest,
):

    try:

        require_services()

        # Terra creates
        comic = generate_amico_comic(
            request.homework_prompt,
            request.language,
        )

        # Sol reviews
        comic = review_amico_comic(
            comic,
            request.language,
        )

        project_id = save_project(
            project_type="amico",
            title=comic.get(
                "title",
                "AMICO Comic",
            ),
            input_text=request.homework_prompt,
            language=request.language,
            data=comic,
        )

        processed_panels = []

        for index, panel in enumerate(
            comic.get("panels", [])
        ):

            image_id = generate_image(
                prompt=panel.get(
                    "image_prompt",
                    "",
                ),
                filename=(
                    f"comic_{project_id}"
                    f"_panel_{index}.png"
                ),
                project_id=project_id,
            )

            processed_panels.append(
                {
                    "panel_number": index + 1,
                    "scene": panel.get(
                        "scene",
                        "",
                    ),
                    "dialogue": panel.get(
                        "dialogue",
                        "",
                    ),
                    "image_id": image_id,
                    "image_url": (
                        f"/api/media/{image_id}"
                    ),
                }
            )

        comic["panels"] = (
            processed_panels
        )

        comic_id = save_comic(
            project_id,
            comic.get(
                "title",
                "AMICO Comic",
            ),
            comic,
        )

        return {
            "status": "success",
            "project_id": project_id,
            "comic_id": comic_id,
            "title": comic.get(
                "title",
                "",
            ),
            "learning_objective": comic.get(
                "learning_objective",
                "",
            ),
            "characters": comic.get(
                "characters",
                [],
            ),
            "panels": processed_panels,
        }

    except HTTPException:

        raise

    except Exception as exc:

        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# ============================================================
# QUIZ
# ============================================================

@app.post("/api/amivi/generate_quiz")
async def generate_quiz(
    request: AmiviRequest,
):

    try:

        require_services()

        result = generate_amivi_quiz(
            request.text,
            request.language,
        )

        quiz = result.get(
            "quiz",
            result,
        )

        metadata = (
            generate_quiz_metadata(
                quiz,
                request.language,
            )
        )

        quiz["metadata"] = metadata

        project_id = save_project(
            project_type="quiz",
            title=quiz.get(
                "title",
                "AMIVI Quiz",
            ),
            input_text=request.text,
            language=request.language,
            data=quiz,
        )

        quiz_id = save_quiz(
            project_id,
            quiz.get(
                "title",
                "AMIVI Quiz",
            ),
            quiz,
        )

        return {
            "status": "success",
            "project_id": project_id,
            "quiz_id": quiz_id,
            "quiz": quiz,
        }

    except HTTPException:

        raise

    except Exception as exc:

        import traceback

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# ============================================================
# MEDIA
#
# PostgreSQL -> browser
# ============================================================

@app.get("/api/media/{media_id}")
def media(
    media_id: int,
):

    asset = get_media(
        media_id
    )

    return Response(
        content=asset.data,
        media_type=asset.mime_type,
        headers={
            "Content-Disposition": (
                f'inline; '
                f'filename="{asset.filename}"'
            )
        },
    )


# ============================================================
# RUN DIRECTLY
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(
            os.getenv(
                "PORT",
                "8000",
            )
        ),
        reload=False,
    )