from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from dotenv import load_dotenv
from PIL import Image, ImageDraw, ImageFont

from datetime import datetime

import os
import json
import base64
import math
import colorsys
import tempfile
import subprocess
import platform
import io
import glob
import re
import secrets
import shutil
import uuid
import textwrap

from urllib.parse import urlparse

from openai import OpenAI

from moviepy.editor import (
    ImageClip,
    AudioFileClip,
    concatenate_videoclips,
)

# pyrefly: ignore [missing-import]
from pypdf import PdfReader
from docx import Document

import requests
import yt_dlp
import bcrypt

from database import SessionLocal, engine, create_tables

from models import (
    User,
    UserSession,
    Project,
    MediaAsset,
    Comic,
    Quiz,
    AmiviChunk,
    Avatar,
    WrongAnswer,
    LearningRoom,
    RoomMember,
    RoomMessage,
    Classroom,
    ClassroomMember,
    Assignment,
    AssignmentSubmission,
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
TRANSCRIBE_MODEL = "gpt-4o-mini-transcribe"


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
    version="2.3.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://comic-1-zbq8.onrender.com",
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

class AuthRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "student"  # "student" | "teacher"


class AuthLoginRequest(BaseModel):
    email: str
    password: str


class AmiviRequest(BaseModel):
    text: str = ""
    language: str = "en"
    generate_video: bool = True
    video_url: str | None = None


class AmiviRegenerateImageRequest(BaseModel):
    project_id: int | None = None
    chunk_id: int | None = None
    text: str = ""
    slogan: str = ""
    description: str = ""
    image_prompt: str = ""
    language: str = "en"


class AmiviEditChunkRequest(BaseModel):
    project_id: int | None = None
    chunk_id: int | None = None
    text: str = ""
    slogan: str = ""
    description: str = ""
    voice_script: str = ""
    language: str = "en"


class AmicoRequest(BaseModel):
    homework_prompt: str = ""
    language: str = "en"

    # Pull the source material from an existing AMIVI project
    # instead of (or in addition to) free-typed homework_prompt.
    source_project_id: int | None = None

    # 2-7 panels per page, 1+ pages, matching the AMICO brief.
    panels_per_page: int = 4
    pages: int = 1

    # "horizontal" (wide grid, like the current sheet) or
    # "vertical" (single-column, stacked panels).
    layout: str = "horizontal"

    # A previously saved Avatar to keep the main character's
    # appearance consistent across panels.
    avatar_id: int | None = None


class AmicoRegeneratePanelRequest(BaseModel):
    project_id: int | None = None
    panel_number: int | None = None
    title: str = ""
    scene: str = ""
    image_prompt: str = ""


class AmicoEditPanelRequest(BaseModel):
    project_id: int
    panel_number: int
    title: str | None = None
    dialogue: str | None = None
    learning_point: str | None = None


class AmicoAddPanelRequest(BaseModel):
    project_id: int
    language: str = "en"
    insert_after: int = 0
    topic_hint: str = ""


class AmicoRecomposeRequest(BaseModel):
    project_id: int
    panels: list = []
    panels_per_page: int = 4
    layout: str = "horizontal"


class WrongAnswerRequest(BaseModel):
    quiz_id: int | None = None
    quiz_title: str = ""
    q: str = ""
    options: list = []
    correct: int = 0
    explanation: str = ""
    image_id: int | None = None
    video_id: int | None = None


# ------------------------------------------------------------
# COLLABORATIVE LEARNING ROOMS
# ------------------------------------------------------------

class RoomCreateRequest(BaseModel):
    name: str
    topic: str = ""
    description: str = ""
    display_name: str


class RoomJoinRequest(BaseModel):
    room_code: str
    display_name: str


class RoomMaterialRequest(BaseModel):
    member_token: str
    shared_material: str = ""


class RoomMessageRequest(BaseModel):
    member_token: str
    message: str


class RoomLinkRequest(BaseModel):
    member_token: str
    kind: str  # "amivi" | "amico" | "quiz"
    project_id: int


class RoomScoreRequest(BaseModel):
    member_token: str
    score: int
    total: int


class RoomLeaveRequest(BaseModel):
    member_token: str


# ------------------------------------------------------------
# TEACHER/STUDENT CLASSROOMS
# ------------------------------------------------------------

class ClassroomCreateRequest(BaseModel):
    name: str
    subject: str = ""
    description: str = ""
    display_name: str


class ClassroomJoinRequest(BaseModel):
    class_code: str
    display_name: str


class AssignmentCreateRequest(BaseModel):
    member_token: str
    title: str
    instructions: str = ""
    quiz_project_id: int
    amivi_project_id: int | None = None
    amico_project_id: int | None = None
    due_at: str | None = None  # ISO 8601, optional


class SubmissionAnswer(BaseModel):
    question_index: int
    selected: int | None = None
    correct: int | None = None
    is_correct: bool = False


class SubmissionCreateRequest(BaseModel):
    member_token: str
    score: int
    total: int
    answers: list[SubmissionAnswer] = []


class ClassroomLeaveRequest(BaseModel):
    member_token: str


class ParentCodeRequest(BaseModel):
    member_token: str
    regenerate: bool = False


class ParentLoginRequest(BaseModel):
    parent_code: str


class TeacherCodeRequest(BaseModel):
    member_token: str
    regenerate: bool = False


class TeacherLoginRequest(BaseModel):
    teacher_code: str


class StudentCodeRequest(BaseModel):
    member_token: str
    regenerate: bool = False


class StudentLoginRequest(BaseModel):
    student_code: str


# ============================================================
# AUTH — REGISTER / LOGIN / SESSION
#
# The platform's real, account-based auth: email + password,
# hashed with bcrypt, session identified by an opaque token (the
# same "token in the browser" idea used everywhere else in this
# app — RoomMember, ClassroomMember — just platform-wide via
# UserSession instead of scoped to one room/classroom). The token
# travels as `Authorization: Bearer <token>` and is looked up via
# the get_current_user dependency on any endpoint that needs to
# know who's asking.
# ============================================================

def hash_password(password: str) -> str:

    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:

    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except (ValueError, TypeError):
        # a malformed/missing hash should never match
        return False


def serialize_user(user) -> dict:

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


def get_current_user(authorization: str | None = Header(default=None)):

    if not authorization or not authorization.lower().startswith("bearer "):

        raise HTTPException(status_code=401, detail="Not signed in.")

    token = authorization[7:].strip()

    if not token:
        raise HTTPException(status_code=401, detail="Not signed in.")

    db = SessionLocal()

    try:

        session = (
            db.query(UserSession)
            .filter(UserSession.token == token)
            .first()
        )

        if not session:
            raise HTTPException(status_code=401, detail="Your session has expired. Please log in again.")

        user = db.query(User).filter(User.id == session.user_id).first()

        if not user:
            raise HTTPException(status_code=401, detail="Your session has expired. Please log in again.")

        return user

    finally:
        db.close()


def get_current_user_optional(authorization: str | None = Header(default=None)):
    """
    Same lookup as get_current_user, but returns None instead of
    raising when there's no (or an invalid) session — for endpoints
    like Classroom join/create that must keep working for someone
    who isn't logged into a real account, but should silently link
    the membership to their account when they are.
    """

    if not authorization or not authorization.lower().startswith("bearer "):
        return None

    token = authorization[7:].strip()

    if not token:
        return None

    db = SessionLocal()

    try:

        session = (
            db.query(UserSession)
            .filter(UserSession.token == token)
            .first()
        )

        if not session:
            return None

        return db.query(User).filter(User.id == session.user_id).first()

    finally:
        db.close()


@app.post("/api/auth/register")
def auth_register(payload: AuthRegisterRequest):

    name = payload.name.strip()
    email = payload.email.strip().lower()
    password = payload.password
    role = payload.role.strip().lower() if payload.role else "student"

    if not name:
        raise HTTPException(status_code=400, detail="Your name is required.")

    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="A valid email is required.")

    if not password or len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    if role not in ("student", "teacher"):
        role = "student"

    db = SessionLocal()

    try:

        existing = db.query(User).filter(User.email == email).first()

        if existing:
            raise HTTPException(status_code=409, detail="An account with that email already exists.")

        user = User(
            name=name,
            email=email,
            role=role,
            password_hash=hash_password(password),
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        session = UserSession(
            user_id=user.id,
            token=secrets.token_urlsafe(32),
        )

        db.add(session)
        db.commit()

        return {
            "status": "success",
            "user": serialize_user(user),
            "token": session.token,
        }

    finally:
        db.close()


@app.post("/api/auth/login")
def auth_login(payload: AuthLoginRequest):

    email = payload.email.strip().lower()
    password = payload.password

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are both required.")

    db = SessionLocal()

    try:

        user = db.query(User).filter(User.email == email).first()

        if not user or not user.password_hash or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=401, detail="Incorrect email or password.")

        session = UserSession(
            user_id=user.id,
            token=secrets.token_urlsafe(32),
        )

        db.add(session)
        db.commit()

        return {
            "status": "success",
            "user": serialize_user(user),
            "token": session.token,
        }

    finally:
        db.close()


@app.post("/api/auth/logout")
def auth_logout(authorization: str | None = Header(default=None)):

    if not authorization or not authorization.lower().startswith("bearer "):
        return {"status": "success"}

    token = authorization[7:].strip()

    db = SessionLocal()

    try:

        session = db.query(UserSession).filter(UserSession.token == token).first()

        if session:
            db.delete(session)
            db.commit()

        return {"status": "success"}

    finally:
        db.close()


@app.get("/api/auth/me")
def auth_me(current_user=Depends(get_current_user)):

    return {"user": serialize_user(current_user)}


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


# ============================================================
# GUARDRAILS
# (AMIVI, AMICO and Quiz are used by students and teachers —
# every piece of free text and every uploaded photo passes
# through here before it reaches a model, and every generated
# image is forced into a kid-safe style.)
# ============================================================

MODERATION_MODEL = "omni-moderation-latest"

KID_SAFE_IMAGE_SUFFIX = (
    " The image must be clearly safe and appropriate for "
    "children: bright, friendly, educational art style. "
    "No violence, weapons, blood, gore, or scary/disturbing "
    "imagery. No nudity, no suggestive poses, no adult or "
    "revealing clothing of any kind. Any people shown must be "
    "fully and modestly dressed in ordinary, everyday, "
    "age-appropriate clothing suitable for a children's "
    "classroom."
)


def moderate_text(text, context="This"):
    """
    Blocks clearly unsafe text (sexual, sexual/minors, violent,
    hateful, self-harm, etc.) using OpenAI's moderation endpoint.
    Fails OPEN (allows the request through) if the moderation
    call itself errors, so a transient API hiccup never blocks
    normal classroom use.
    """

    if not text or not text.strip() or not client:
        return

    try:

        result = client.moderations.create(
            model=MODERATION_MODEL,
            input=text[:8000],
        )

        flagged = result.results[0].flagged

    except Exception as exc:

        print(
            f"Text moderation check failed "
            f"(allowing through): {exc}"
        )
        return

    if flagged:

        raise HTTPException(
            status_code=400,
            detail=(
                f"{context} isn't appropriate for this "
                "learning tool. Please use age-appropriate, "
                "educational content only."
            ),
        )


def moderate_image_bytes(image_bytes, mime_type, context="This photo"):
    """
    Same idea as moderate_text but for an uploaded photo (avatar
    photo, photo-story photo). Fails open on any error.
    """

    if not image_bytes or not client:
        return

    try:

        encoded = base64.b64encode(
            image_bytes
        ).decode("utf-8")

        result = client.moderations.create(
            model=MODERATION_MODEL,
            input=[
                {
                    "type": "image_url",
                    "image_url": {
                        "url": (
                            f"data:{mime_type};base64,{encoded}"
                        )
                    },
                }
            ],
        )

        flagged = result.results[0].flagged

    except Exception as exc:

        print(
            f"Image moderation check failed "
            f"(allowing through): {exc}"
        )
        return

    if flagged:

        raise HTTPException(
            status_code=400,
            detail=(
                f"{context} isn't appropriate for this "
                "learning tool. Please upload a different photo."
            ),
        )


def verify_educational_content(text, min_length=12):
    """
    Scope-lock: rejects text that plainly isn't educational /
    learning material (off-topic chit-chat, personal messages,
    etc.). Skips very short strings and fails open on errors.
    """

    text = (text or "").strip()

    if len(text) < min_length or not client:
        return

    try:

        result = call_json_model(
            LUNA_MODEL,
            (
                "You are a strict content-scope classifier for a "
                "K-12 educational app used by students and "
                "teachers. Decide whether the supplied text is "
                "educational / learning material suitable for a "
                "classroom: a topic, subject matter, textbook "
                "excerpt, article, or homework prompt all count. "
                "Off-topic chit-chat, personal messages, adult "
                "content, or anything unrelated to learning "
                "should be rejected.\n\n"
                'Return ONLY JSON: {"is_educational": true or false}'
            ),
            text[:4000],
        )

    except Exception as exc:

        print(
            f"Educational-scope check failed "
            f"(allowing through): {exc}"
        )
        return

    if result.get("is_educational") is False:

        raise HTTPException(
            status_code=400,
            detail=(
                "Please use educational / learning material "
                "only — this doesn't look like study content."
            ),
        )


def guard_learning_input(text, context="This"):
    """
    Combined guardrail for a primary content field a student or
    teacher submits directly (a topic, pasted material, extracted
    file text, a homework prompt): must pass moderation AND look
    like real educational content.
    """

    moderate_text(text, context)
    verify_educational_content(text)


def get_language_instruction(language: str) -> str:

    if language == "es":

        return (
            "Generate ALL output in natural, child-friendly Spanish. "
            "Do not mix English and Spanish. "
            "All chunks, slogans, descriptions, image prompts, "
            "dialogue and narration must be written in Spanish."
        )

    return "Generate all output in English."


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
            f"{model} returned invalid JSON: "
            f"{exc}. Output: {raw_output[:1500]}"
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
    user_id=None,
):

    db = SessionLocal()

    try:

        row = Project(
            project_type=project_type,
            title=title,
            input_text=input_text,
            language=language,
            data=data,
            user_id=user_id,
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


def save_wrong_answer(
    quiz_id,
    quiz_title,
    question_text,
    options,
    correct,
    explanation,
    image_id,
    video_id,
):

    db = SessionLocal()

    try:

        row = WrongAnswer(
            quiz_id=quiz_id,
            quiz_title=quiz_title,
            question_text=question_text,
            options=options,
            correct=correct,
            explanation=explanation,
            image_id=image_id,
            video_id=video_id,
        )

        db.add(row)
        db.commit()
        db.refresh(row)

        return row.id

    finally:
        db.close()


def list_wrong_answers():

    db = SessionLocal()

    try:

        return (
            db.query(WrongAnswer)
            .order_by(WrongAnswer.created_at.desc())
            .all()
        )

    finally:
        db.close()


def delete_wrong_answer(wrong_answer_id: int):

    db = SessionLocal()

    try:

        row = (
            db.query(WrongAnswer)
            .filter(WrongAnswer.id == wrong_answer_id)
            .first()
        )

        if not row:

            raise HTTPException(
                status_code=404,
                detail="Wrong answer not found.",
            )

        db.delete(row)
        db.commit()

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


def get_project(project_id: int):

    db = SessionLocal()

    try:

        row = (
            db.query(Project)
            .filter(Project.id == project_id)
            .first()
        )

        if not row:

            raise HTTPException(
                status_code=404,
                detail="Project not found.",
            )

        return row

    finally:
        db.close()


def list_projects(project_type: str | None = None):

    db = SessionLocal()

    try:

        query = db.query(Project)

        if project_type:

            query = query.filter(
                Project.project_type == project_type
            )

        return (
            query.order_by(Project.id.desc())
            .limit(100)
            .all()
        )

    finally:
        db.close()


def get_comic(comic_id: int):

    db = SessionLocal()

    try:

        row = (
            db.query(Comic)
            .filter(Comic.id == comic_id)
            .first()
        )

        if not row:

            raise HTTPException(
                status_code=404,
                detail="Comic not found.",
            )

        return row

    finally:
        db.close()


def list_comics():

    db = SessionLocal()

    try:

        return (
            db.query(Comic)
            .order_by(Comic.id.desc())
            .limit(100)
            .all()
        )

    finally:
        db.close()


def update_comic(comic_id: int, data: dict):

    db = SessionLocal()

    try:

        row = (
            db.query(Comic)
            .filter(Comic.id == comic_id)
            .first()
        )

        if not row:

            raise HTTPException(
                status_code=404,
                detail="Comic not found.",
            )

        row.data = data

        db.add(row)
        db.commit()
        db.refresh(row)

        return row

    finally:
        db.close()


def latest_comic_for_project(project_id: int):

    db = SessionLocal()

    try:

        return (
            db.query(Comic)
            .filter(Comic.project_id == project_id)
            .order_by(Comic.id.desc())
            .first()
        )

    finally:
        db.close()


def latest_quiz_for_project(project_id: int):

    db = SessionLocal()

    try:

        return (
            db.query(Quiz)
            .filter(Quiz.project_id == project_id)
            .order_by(Quiz.id.desc())
            .first()
        )

    finally:
        db.close()


def list_amivi_chunks_for_project(project_id: int):

    db = SessionLocal()

    try:

        return (
            db.query(AmiviChunk)
            .filter(AmiviChunk.project_id == project_id)
            .order_by(AmiviChunk.chunk_number.asc())
            .all()
        )

    finally:
        db.close()


def update_project_data(project_id: int, patch: dict):
    """
    Merges `patch` into the project's existing `data` JSON
    (creating it if it doesn't exist yet) instead of overwriting
    it. Used after generation finishes to record things like
    `thumbnail_media_id` / `video_id`, once the underlying media
    actually exists.

    Best-effort: swallows errors so a Library bookkeeping hiccup
    never breaks the AMIVI/AMICO generation flow that's already
    returned its result to the user.
    """

    db = SessionLocal()

    try:

        row = (
            db.query(Project)
            .filter(Project.id == project_id)
            .first()
        )

        if not row:
            return

        merged = dict(row.data or {})
        merged.update(patch)
        row.data = merged

        db.add(row)
        db.commit()

    except Exception as exc:

        print(
            f"update_project_data failed for "
            f"project {project_id} (non-fatal): {exc}"
        )
        db.rollback()

    finally:
        db.close()


def delete_project(project_id: int):
    """
    Deletes a project. Related media, AMIVI chunks, comics and
    quizzes are removed automatically via the existing PostgreSQL
    foreign-key ON DELETE CASCADE relationships defined in
    models.py — no manual cleanup needed here.
    """

    db = SessionLocal()

    try:

        row = (
            db.query(Project)
            .filter(Project.id == project_id)
            .first()
        )

        if not row:

            raise HTTPException(
                status_code=404,
                detail="Project not found.",
            )

        db.delete(row)
        db.commit()

    finally:
        db.close()


def save_avatar(
    name,
    description,
    image_id,
):

    db = SessionLocal()

    try:

        row = Avatar(
            name=name,
            description=description,
            image_id=image_id,
        )

        db.add(row)
        db.commit()
        db.refresh(row)

        return row.id

    finally:
        db.close()


def list_avatars():

    db = SessionLocal()

    try:

        return (
            db.query(Avatar)
            .order_by(Avatar.id.desc())
            .limit(100)
            .all()
        )

    finally:
        db.close()


def get_avatar(avatar_id: int):

    db = SessionLocal()

    try:

        row = (
            db.query(Avatar)
            .filter(Avatar.id == avatar_id)
            .first()
        )

        if not row:

            raise HTTPException(
                status_code=404,
                detail="Avatar not found.",
            )

        return row

    finally:
        db.close()


def delete_avatar(avatar_id: int):

    db = SessionLocal()

    try:

        row = (
            db.query(Avatar)
            .filter(Avatar.id == avatar_id)
            .first()
        )

        if not row:

            raise HTTPException(
                status_code=404,
                detail="Avatar not found.",
            )

        db.delete(row)
        db.commit()

    finally:
        db.close()


# ============================================================
# FILE EXTRACTION
# ============================================================

def extract_text_from_file(
    file_bytes: bytes,
    filename: str,
) -> str:

    extension = os.path.splitext(
        filename
    )[1].lower()

    # TXT
    if extension == ".txt":

        return file_bytes.decode(
            "utf-8",
            errors="ignore",
        )

    # PDF
    if extension == ".pdf":

        reader = PdfReader(
            io.BytesIO(file_bytes)
        )

        pages = []

        for page in reader.pages:

            text = page.extract_text()

            if text:
                pages.append(text)

        return "\n".join(pages)

    # DOCX
    if extension == ".docx":

        document = Document(
            io.BytesIO(file_bytes)
        )

        return "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
            if paragraph.text.strip()
        )

    raise HTTPException(
        status_code=400,
        detail=(
            "Unsupported file type. "
            "Supported formats: PDF, DOCX and TXT."
        ),
    )


# ============================================================
# VIDEO URL EXTRACTION
# ============================================================

def clean_caption_text(
    text: str,
) -> str:

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

    if not caption_dict:
        return None

    language = (
        language or "en"
    ).lower()

    preferred_languages = (
        [
            "es",
            "es-ES",
            "en",
            "en-US",
            "en-GB",
        ]
        if language == "es"
        else [
            "en",
            "en-US",
            "en-GB",
            "es",
            "es-ES",
        ]
    )

    for preferred in preferred_languages:

        if preferred in caption_dict:

            tracks = caption_dict[
                preferred
            ]

            if tracks:
                return tracks[-1].get(
                    "url"
                )

    for key, tracks in caption_dict.items():

        if key.lower().startswith(
            language
        ):

            if tracks:
                return tracks[-1].get(
                    "url"
                )

    for tracks in caption_dict.values():

        if tracks:

            url = tracks[-1].get(
                "url"
            )

            if url:
                return url

    return None


def parse_vtt_text(
    vtt_text: str,
) -> str:

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

    require_services()

    with open(
        audio_path,
        "rb",
    ) as audio_file:

        transcript = (
            client.audio.transcriptions.create(
                model=TRANSCRIBE_MODEL,
                file=audio_file,
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
            detail=(
                "Please provide a valid "
                "http/https video URL."
            ),
        )

    temp_dir = tempfile.mkdtemp(
        prefix="amivi_video_"
    )

    try:

        info_options = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
            "noplaylist": True,
        }

        with yt_dlp.YoutubeDL(
            info_options
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

        caption_url = (
            get_caption_url(
                info.get("subtitles"),
                language,
            )
            or
            get_caption_url(
                info.get("automatic_captions"),
                language,
            )
        )

        if caption_url:

            response = requests.get(
                caption_url,
                timeout=30,
            )

            response.raise_for_status()

            caption_text = parse_vtt_text(
                response.text
            )

            if len(caption_text) > 100:

                return {
                    "title": title,
                    "duration": duration,
                    "text": caption_text,
                    "source": "captions",
                    "url": video_url,
                }

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

        downloaded_files = [
            path
            for path in glob.glob(
                os.path.join(
                    temp_dir,
                    "*",
                )
            )
            if os.path.isfile(path)
        ]

        if not downloaded_files:

            raise Exception(
                "The video audio could not be downloaded."
            )

        transcript_text = (
            transcribe_video_audio(
                downloaded_files[0],
                language,
            )
        )

        transcript_text = clean_caption_text(
            transcript_text
        )

        if len(transcript_text) < 50:

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
                "Could not process this video URL: "
                f"{exc}"
            ),
        )

    finally:

        shutil.rmtree(
            temp_dir,
            ignore_errors=True,
        )


# ============================================================
# AMIVI
# ============================================================

def generate_amivi_content(
    text_input,
    language="en",
):

    prompt = (
        "You are AMIVI, an educational visual synthesis engine.\n\n"

        "The user will provide one large educational passage.\n\n"

        "Transform that material into meaningful educational "
        "micro-bits or chunks.\n\n"

        "Rules:\n"
        "- Create 5 to 10 chunks depending on the length and complexity.\n"
        "- Do not split randomly.\n"
        "- Each chunk must represent ONE important learning idea.\n"
        "- Keep all important educational information.\n"
        "- Do not invent facts that are not supported by the source.\n"
        "- Rewrite the content in simple learner-friendly language.\n"
        "- Each chunk should be understandable on its own.\n"
        "- Create a short memorable slogan for each chunk.\n"
        "- Create a clear explanation for each chunk.\n"
        "- Create a detailed supporting image prompt for each chunk.\n"
        "- Prefer educational visuals such as diagrams, labeled illustrations, "
        "process visuals, maps, charts or realistic educational scenes when appropriate.\n"
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
# AMICO STORY GENERATION
# ============================================================

def build_amico_structure_hint(total_panels):

    middle_count = max(
        0,
        total_panels - 2,
    )

    return (
        f"Panel 1: Introduce the topic through a character "
        f"and an engaging question. Give a simple, plain-language "
        f"definition of the topic here — assume the reader has "
        f"never heard of it before.\n"

        f"Panels 2 to {total_panels - 1} ({middle_count} panels): "
        f"progressively and COMPLETELY explain the concept, "
        f"spreading the explanation ONE PIECE AT A TIME across "
        f"these panels so a total beginner fully understands it "
        f"by the end — together these panels should cover, in "
        f"order: what it actually is, WHY or HOW it happens (the "
        f"real cause or mechanism, not just a description of what "
        f"it looks like), the key steps or parts in the correct "
        f"order, and a concrete real-world example a beginner can "
        f"picture. EACH INDIVIDUAL PANEL should focus on just ONE "
        f"of these pieces (or one step) — never try to fit several "
        f"pieces into a single panel. Define any term the first "
        f"time it is used. Do not skip a piece that's needed to "
        f"understand the topic — if there are more pieces than "
        f"panels, prioritize the most essential ones and only "
        f"combine the smallest, most closely related pieces into "
        f"one panel when there truly isn't room for a panel each.\n"

        f"Panel {total_panels}: End with a memorable recap, "
        f"mnemonic, question, or fun takeaway that reinforces the "
        f"WHY, not just the what.\n\n"
    )


def generate_amico_comic(
    topic,
    language="en",
    total_panels=8,
    character_reference="",
    character_name="",
):

    if character_name and character_reference:

        character_line = (
            "The main character's name MUST be exactly "
            f"\"{character_name}\" — use that exact name (not a "
            "different name of your own choosing) for this "
            "character in every panel's dialogue and in the "
            "characters list, and their appearance MUST match "
            f"exactly in every panel: {character_reference}.\n\n"
        )

    elif character_name:

        character_line = (
            "The main character's name MUST be exactly "
            f"\"{character_name}\" — use that exact name (not a "
            "different name of your own choosing) for this "
            "character in every panel's dialogue and in the "
            "characters list.\n\n"
        )

    elif character_reference:

        character_line = (
            "The main character MUST match this appearance "
            f"exactly in every panel: {character_reference}.\n\n"
        )

    else:

        character_line = ""

    prompt = (
        "You are AMICO's storytelling engine.\n\n"

        f"Create a connected {total_panels}-panel educational "
        "comic that teaches the learner the given topic through "
        "storytelling and visual explanation.\n\n"

        "MOST IMPORTANT RULE: the comic must be genuinely "
        "DESCRIPTIVE and COMPLETE. Write for someone who has "
        "never heard of this topic before — by the last panel "
        "they should fully understand it, with no gaps. Always "
        "explain WHY or HOW something happens (the real cause or "
        "mechanism), not just WHAT it looks like or a surface-"
        "level description. Define every key term in plain "
        "language the first time it appears. Completeness and "
        "correctness always come before brevity or decoration — "
        "if a step is needed to understand the topic, include it.\n\n"

        "ALSO IMPORTANT: use simple, easy everyday words a young "
        "learner can read at a glance — short, plain sentences "
        "instead of long or complicated ones. Each panel should "
        "focus on just ONE small idea, explained in ONE short "
        "simple line. Do not try to pack a big idea into a single "
        "panel by piling up extra dialogue lines — if an idea is "
        "too big for one short line, split it ACROSS PANELS "
        "(following the structure below), not into extra lines "
        "inside the same panel.\n\n"

        "The comic must follow this structure:\n"

        + build_amico_structure_hint(
            total_panels
        )

        + "Keep the story connected across all panels.\n"
        "Characters must remain visually consistent.\n"
        "The setting should remain consistent unless the story "
        "requires a meaningful change.\n\n"

        + character_line

        + "Each panel must contain:\n"
        "- panel_number\n"
        "- title\n"
        "- scene\n"
        "- image_prompt\n"
        "- dialogue\n"
        "- learning_point\n\n"

        "Dialogue should read like a warm, natural GROUP "
        "conversation, not a strict back-and-forth between only "
        "two people. Use one consistent 'explainer' character "
        "(e.g. a grandparent, parent, or teacher) who introduces "
        "each panel's idea in ONE short, simple line using easy "
        "everyday words — start with the key term in CAPITAL "
        "LETTERS followed by one short explanation, e.g. "
        "\"EVAPORATION - the sun heats the water.\". Then have one "
        "of the other recurring characters react in a short, "
        "natural burst — a question, a guess, or a quick "
        "interjection like \"Really?\", \"Something we can't "
        "see!\", or \"True!\" — so the group feels like they are "
        "genuinely listening and reacting together across the "
        "whole comic. Every line must be prefixed with that "
        "character's name, e.g. \"Grandpa: EVAPORATION - the sun "
        "heats the water.\\nMia: Something we can't see!\".\n\n"

        "STRICT LIMIT: each panel's dialogue must contain EXACTLY "
        "ONE line from the explainer character, plus at most two "
        "short reaction lines from OTHER characters (3 lines "
        "total, never more). The explainer NEVER speaks twice in "
        "the same panel, even briefly — do not add a second "
        "explainer line, and do not have the same character speak "
        "back-to-back. Keep every line short: reaction lines under "
        "8 words, the explainer line under 15 words. If this "
        "panel's idea is too big to explain in that one short "
        "line, do NOT add a second line from the explainer — "
        "instead simplify to the single clearest point for this "
        "panel, and let the rest of the idea unfold naturally "
        "across the panels that follow.\n\n"

        "For PANEL 1 ONLY, the image_prompt may also describe a "
        "small caption-style tag in a corner of the scene (a soft "
        "rounded label with a short setting description, e.g. "
        "\"A lovely garden in springtime\"), the way a comic book "
        "grounds its story's setting — this is optional polish, "
        "not required for every panel.\n\n"

        "The image_prompt must describe the complete visual scene "
        "for that panel, explicitly preserve character appearance, "
        "clothing, age, hairstyle and other important visual traits, "
        "and MUST also instruct the image model to draw the dialogue "
        "directly in the image as large, clean, easily readable "
        "comic speech bubbles (oversized white bubble with generous "
        "padding, thick black outline, big bold black lettering "
        "sized so it is comfortably readable at a glance, a pointed "
        "tail toward the speaking character) — one bubble per line "
        "of dialogue (at most 3 bubbles total), positioned near the "
        "character who says it, using EXACTLY the same wording as "
        "this panel's dialogue field, with no other text anywhere "
        "in the image. Inside each bubble, the speaker's name (the "
        "word before the colon) must be written in bold colored "
        "lettering — a distinct color per character, kept "
        "consistent for that character across every panel — while "
        "the rest of the line stays in plain black lettering, so "
        "each speaker is easy to tell apart at a glance.\n"
        "The image_prompt must explicitly instruct the image model "
        "to draw ONE single, unified scene for this panel — never "
        "a grid, filmstrip, sequence of smaller pictures, or "
        "multiple sub-panels crammed into one image. It should "
        "look like one continuous illustration with its (at most "
        "3) speech bubbles placed on it, not a collage or comic "
        "strip within the panel.\n"
        "IMPORTANT: Choose a small, consistent cast whose SIZE "
        "fits this specific topic — usually just 2 characters "
        "(e.g. one parent explaining to one curious child, or two "
        "friends figuring something out together) is enough. Only "
        "use 3-4 characters when the topic genuinely benefits from "
        "more voices reacting — do not add extra characters just "
        "to fill a quota, since a crowded panel is harder to draw "
        "clearly and harder to read than a focused one. Whatever "
        "size you choose, include the same cast together in every "
        "panel's image_prompt so they can talk and react to each "
        "other throughout the whole comic.\n\n"

        "Return ONLY valid JSON using exactly this structure:\n\n"

        "{\n"
        '  "title": "...",\n'
        '  "learning_objective": "...",\n'
        '  "characters": [\n'
        "    {\n"
        '      "name": "...",\n'
        '      "role": "...",\n'
        '      "appearance": "..."\n'
        "    }\n"
        "  ],\n"
        '  "panels": [\n'
        "    {\n"
        '      "panel_number": 1,\n'
        '      "title": "...",\n'
        '      "scene": "...",\n'
        '      "image_prompt": "...",\n'
        '      "dialogue": "...",\n'
        '      "learning_point": "..."\n'
        "    }\n"
        "  ]\n"
        "}\n\n"

        f"Generate exactly {total_panels} panels.\n\n"

        + get_language_instruction(
            language
        )
    )

    return call_json_model(
        TERRA_MODEL,
        prompt,
        topic,
    )


# ============================================================
# AMICO REVIEW
# ============================================================

def review_amico_comic(
    comic,
    language="en",
    total_panels=8,
):

    prompt = (
        "You are AMICO quality control.\n\n"

        "Review the complete educational comic and correct any problems.\n\n"

        "Check:\n"
        "1. Educational accuracy.\n"
        "2. Learner-friendly explanations.\n"
        f"3. Story continuity across all {total_panels} panels.\n"
        "4. Character consistency.\n"
        "5. Visual consistency between image prompts.\n"
        "6. Dialogue uses short, simple, easy-to-read sentences "
        "(reaction lines under 8 words, the explainer line under "
        "15 words) AND every panel has EXACTLY ONE line from the "
        "explainer plus at most two reaction lines from OTHER "
        "characters (3 lines total, never more, and the explainer "
        "never speaks twice or back-to-back in the same panel). If "
        "a panel breaks this — too many lines, a line too long, or "
        "the same character speaking twice — do NOT just add or "
        "lengthen lines: simplify the panel to its single clearest "
        "point and move the rest to a later panel, so no panel "
        "ever ends up crowded with speech bubbles.\n"
        "7. Correct concept ordering.\n"
        "8. Whether every panel contributes to learning.\n"
        "9. Whether the final panel provides a useful recap, "
        "mnemonic or memorable takeaway.\n"
        f"10. Whether there are exactly {total_panels} panels.\n"
        "11. Ensure a small, consistent cast appears together "
        "throughout, with one explainer introducing each idea and "
        "the other(s) reacting in short, natural bursts. The cast "
        "size should fit the topic — usually just 2 characters is "
        "plenty; only 3-4 if the topic genuinely benefits from "
        "more voices. If characters were added beyond what the "
        "story needs, trim the cast down rather than leaving it "
        "crowded.\n"
        "12. Ensure EVERY image_prompt explicitly instructs the image "
        "model to render that panel's dialogue as large, easily "
        "readable comic speech bubbles with big bold lettering "
        "(exact wording, one bubble per line) drawn directly in "
        "the image, next to the character who says it, with each "
        "speaker's name highlighted in a distinct color (consistent "
        "per character) inside the bubble, AND explicitly instructs "
        "the image model to draw ONE single unified scene — never "
        "a grid, filmstrip, or multiple sub-panels within one "
        "image.\n"
        "13. Beginner completeness: imagine a reader who has never "
        "heard of this topic before. Confirm every cause or "
        "mechanism is genuinely EXPLAINED (the real WHY/HOW), not "
        "just described on the surface; every key term is defined "
        "in plain language the first time it appears; and no "
        "logical step needed to understand the topic was skipped "
        "just to save space. If any panel would leave a total "
        "beginner confused or with an unanswered 'why', fix it "
        "WITHOUT exceeding 3 dialogue lines on any single panel: "
        "either tighten that panel's explainer line to state the "
        "missing piece more clearly, or move the missing piece "
        "into its own panel earlier or later in the comic — never "
        "by stacking extra lines onto one panel.\n\n"

        "If anything is incorrect, incomplete, repetitive, "
        "or confusing, fix it.\n\n"

        "Maintain the same characters unless a correction "
        "is necessary.\n\n"

        "Return ONLY the COMPLETE corrected comic "
        "using exactly the same JSON structure.\n\n"

        "{\n"
        '  "title": "...",\n'
        '  "learning_objective": "...",\n'
        '  "characters": [...],\n'
        '  "panels": [\n'
        "    {\n"
        '      "panel_number": 1,\n'
        '      "title": "...",\n'
        '      "scene": "...",\n'
        '      "image_prompt": "...",\n'
        '      "dialogue": "...",\n'
        '      "learning_point": "..."\n'
        "    }\n"
        "  ]\n"
        "}\n\n"

        f"The final response must contain exactly {total_panels} panels.\n\n"

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
# AMICO PHOTO STORY (one uploaded photo -> a character-free,
# diagram-style educational story, e.g. a "Water Cycle Diagram")
# ============================================================

def build_photostory_structure_hint(total_panels):

    middle_count = max(
        0,
        total_panels - 2,
    )

    return (
        f"Panel 1: Show the very first stage of the process or "
        f"cycle, defined in simple plain language — assume the "
        f"reader has never heard of this topic before.\n"

        f"Panels 2 to {total_panels - 1} ({middle_count} panels): "
        f"each panel is the NEXT stage of the process, in the "
        f"correct causal order, genuinely explaining WHY or HOW "
        f"that stage happens (the real cause or mechanism, not "
        f"just what it looks like). Define any term the first "
        f"time it appears.\n"

        f"Panel {total_panels}: the final stage that completes "
        f"the cycle or process, or a closing panel that ties "
        f"everything together.\n\n"
    )


def generate_amico_photostory(
    photo_description,
    language="en",
    total_panels=6,
):

    prompt = (
        "You are AMICO's Photo Story engine.\n\n"

        "A user uploaded a photo. Below is a short description of "
        "it. Based on what it shows, pick the single most fitting "
        "educational NATURAL PROCESS, CYCLE, or HOW-SOMETHING-"
        "WORKS topic it relates to (for example, a photo of rain "
        "or a lake suggests 'the water cycle'; a photo of a plant "
        "suggests 'photosynthesis'; a photo of a bicycle suggests "
        "'how a bicycle works'), then create a "
        f"{total_panels}-panel visual diagram story that teaches "
        "that topic step by step — like a real educational process "
        "diagram poster (e.g. a 'Water Cycle Diagram'), NOT a "
        "comic strip with characters.\n\n"

        "MOST IMPORTANT RULES:\n"
        "- Do NOT include any human or animal characters, "
        "dialogue, or speech bubbles anywhere. Every panel is a "
        "clean, labeled illustration of that stage of the process "
        "— no one talking about it.\n"
        "- The story must be genuinely DESCRIPTIVE and COMPLETE: "
        "write for someone who has never heard of this topic "
        "before — by the last panel they should fully understand "
        "the whole process, with no gaps. Always explain WHY or "
        "HOW each stage happens (the real cause or mechanism), not "
        "just WHAT it looks like. Define every key term in plain "
        "language the first time it appears.\n"
        "- Every panel must use the exact same clean, colorful, "
        "flat illustration art style so the panels feel like one "
        "consistent diagram set.\n\n"

        "The story must follow this structure:\n"

        + build_photostory_structure_hint(
            total_panels
        )

        + "Each panel must contain:\n"
        "- panel_number\n"
        "- title (a short 1-3 word stage name, e.g. "
        "\"Evaporation\")\n"
        "- caption (1-3 full sentences explaining that stage — "
        "usually 25-45 words, but completeness comes first: if "
        "fully and correctly explaining this stage's WHY/HOW "
        "genuinely needs more room, let it run a little longer "
        "rather than leaving the explanation vague or "
        "incomplete)\n"
        "- image_prompt\n\n"

        "The image_prompt must describe a clean, colorful, "
        "labeled educational diagram-style illustration of that "
        "single stage only (use arrows, icons, or simple labels "
        "inside the artwork where helpful to show direction or "
        "movement, e.g. an upward arrow for rising water vapor), "
        "matching the same consistent art style, color palette, "
        "and setting across every panel. The image_prompt must "
        "explicitly instruct the image model NOT to draw any "
        "people, animals, speech bubbles, or paragraphs of text "
        "inside the image — the title and caption are added "
        "separately underneath.\n\n"

        "Return ONLY valid JSON using exactly this structure:\n\n"

        "{\n"
        '  "title": "...",\n'
        '  "panels": [\n'
        "    {\n"
        '      "panel_number": 1,\n'
        '      "title": "...",\n'
        '      "caption": "...",\n'
        '      "image_prompt": "..."\n'
        "    }\n"
        "  ]\n"
        "}\n\n"

        f"Generate exactly {total_panels} panels.\n\n"

        + get_language_instruction(
            language
        )
    )

    return call_json_model(
        TERRA_MODEL,
        prompt,
        photo_description,
    )


def review_amico_photostory(
    story,
    language="en",
    total_panels=6,
):

    prompt = (
        "You are AMICO quality control for Photo Stories.\n\n"

        "Review the complete diagram-style visual story and "
        "correct any problems.\n\n"

        "Check:\n"
        "1. Educational accuracy.\n"
        "2. Learner-friendly explanations.\n"
        f"3. Correct step order across all {total_panels} panels.\n"
        "4. Visual consistency between image prompts (same art "
        "style, color palette, and setting).\n"
        "5. Caption clarity and length.\n"
        "6. Whether every panel contributes to understanding the "
        "process end to end.\n"
        f"7. Whether there are exactly {total_panels} panels.\n"
        "8. Ensure NO panel's caption or image_prompt introduces "
        "human/animal characters, dialogue, or speech bubbles — "
        "this is a character-free diagram story.\n"
        "9. Beginner completeness: imagine a reader who has never "
        "heard of this topic before. Confirm every cause or "
        "mechanism is genuinely EXPLAINED (the real WHY/HOW), not "
        "just described on the surface, and every key term is "
        "defined in plain language the first time it appears. If "
        "any panel would leave a total beginner confused, rewrite "
        "that panel's caption to close the gap.\n\n"

        "If anything is incorrect, incomplete, repetitive, or "
        "confusing, fix it.\n\n"

        "Return ONLY the COMPLETE corrected story using exactly "
        "the same JSON structure.\n\n"

        "{\n"
        '  "title": "...",\n'
        '  "panels": [\n'
        "    {\n"
        '      "panel_number": 1,\n'
        '      "title": "...",\n'
        '      "caption": "...",\n'
        '      "image_prompt": "..."\n'
        "    }\n"
        "  ]\n"
        "}\n\n"

        f"The final response must contain exactly {total_panels} panels.\n\n"

        + get_language_instruction(
            language
        )
    )

    return call_json_model(
        SOL_MODEL,
        prompt,
        json.dumps(
            story,
            ensure_ascii=False,
        ),
    )


# ============================================================
# QUIZ
# ============================================================

def generate_quiz_from_source(
    source_text,
    topic,
    language="en",
    num_questions=5,
):
    """
    Standalone Quiz generator.

    If `source_text` is supplied, the quiz is built strictly
    from that material (uploaded / pasted). Otherwise the quiz
    is built from the model's own knowledge of `topic`.

    Each question includes an `image_prompt` describing a simple
    supporting illustration (e.g. a labeled map or diagram) for
    the correct answer.
    """

    num_questions = max(
        1,
        min(
            int(num_questions or 5),
            15,
        ),
    )

    if source_text:

        grounding = (
            "Create a "
            f"{num_questions}-question multiple-choice quiz "
            "strictly from the supplied educational material. "
            "Do not invent facts outside the material.\n\n"
        )

        user_input = source_text

    else:

        grounding = (
            "Create a "
            f"{num_questions}-question multiple-choice quiz "
            "about the following topic, using your own accurate "
            "knowledge. Keep every question factually correct.\n\n"
        )

        user_input = topic or "General knowledge"

    prompt = (
        grounding

        + "Each question must contain: "
        "q (the question), "
        "options (3 or 4 short answer choices), "
        "correct (integer index of the right option), "
        "explanation (1-2 short, simple sentences explaining "
        "why the correct answer is right), and "
        "image_prompt (a short description of a simple, clear "
        "illustration or labeled map/diagram that supports the "
        "correct answer).\n\n"

        'Return ONLY JSON in this structure: '
        '{"quiz":{"title":"...","questions":[...]}}\n\n'

        + get_language_instruction(
            language
        )
    )

    return call_json_model(
        TERRA_MODEL,
        prompt,
        user_input,
    )


# ============================================================
# GPT IMAGE 2
# ============================================================

def generate_image(
    prompt,
    filename,
    project_id=None,
):

    require_services()

    safe_prompt = (
        (prompt or "Educational illustration")
        + KID_SAFE_IMAGE_SUFFIX
    )

    result = client.images.generate(
        model=IMAGE_MODEL,
        prompt=safe_prompt,
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
# AVATAR (photo -> appearance description -> comic avatar)
# ============================================================

def describe_photo_for_avatar(photo_bytes, mime_type):

    require_services()

    encoded = base64.b64encode(
        photo_bytes
    ).decode("utf-8")

    response = client.responses.create(
        model=TERRA_MODEL,
        instructions=(
            "You describe a person's visible appearance for use "
            "as a consistent comic-book character design in a "
            "children's educational app: hair style and color, "
            "skin tone, approximate age range, and any "
            "distinctive visual features. Keep it to 2-3 "
            "sentences, purely visual and descriptive, suitable "
            "for an image generation prompt. Do not identify or "
            "name the person.\n\n"
            "CLOTHING SAFETY RULE: always describe the character "
            "wearing simple, modest, fully-covering everyday "
            "clothing appropriate for a children's classroom "
            "(e.g. a t-shirt and pants, a plain dress, a sweater) "
            "— regardless of what the person is actually wearing "
            "in the photo. Never describe swimwear, underwear, "
            "or any revealing or adult clothing."
        ),
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": (
                            "Describe this person's appearance "
                            "for a comic-book avatar."
                        ),
                    },
                    {
                        "type": "input_image",
                        "image_url": (
                            f"data:{mime_type};base64,{encoded}"
                        ),
                    },
                ],
            }
        ],
    )

    return response.output_text.strip()


def describe_photo_for_story(photo_bytes, mime_type):

    require_services()

    encoded = base64.b64encode(
        photo_bytes
    ).decode("utf-8")

    response = client.responses.create(
        model=TERRA_MODEL,
        instructions=(
            "You describe a photo's subject in plain, factual "
            "language, and identify what real-world natural "
            "process, cycle, or mechanism it most relates to, so "
            "an educational diagram-style story can be built about "
            "it. Keep it to 2-4 sentences: what the photo shows, "
            "and the single most fitting topic to explain (e.g. "
            "\"the water cycle\", \"photosynthesis\", \"how "
            "volcanoes erupt\")."
        ),
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": (
                            "Describe this photo and suggest the "
                            "best educational process/cycle topic "
                            "it relates to."
                        ),
                    },
                    {
                        "type": "input_image",
                        "image_url": (
                            f"data:{mime_type};base64,{encoded}"
                        ),
                    },
                ],
            }
        ],
    )

    return response.output_text.strip()


def generate_avatar_image(
    description,
    style,
    filename,
):

    style_text = (
        style
        or "colorful, friendly educational comic-book style"
    )

    prompt = (
        "A comic-book character avatar illustration, "
        f"{style_text}. Appearance: {description}. "
        "Clear face, upper-body portrait, plain simple "
        "background, no text, no watermark, no speech bubbles."
    )

    return generate_image(
        prompt=prompt,
        filename=filename,
    )


# ============================================================
# PIPER
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
        if platform.system() == "Windows"
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

    model_name = (
        "es_ES-sharvard-medium.onnx"
        if language == "es"
        else "en_US-lessac-medium.onnx"
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
# AMIVI VIDEO
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

            image_asset = get_media(
                chunk["image_id"]
            )

            audio_asset = get_media(
                chunk["audio_id"]
            )

            image_file = tempfile.NamedTemporaryFile(
                suffix=".png",
                delete=False,
            )

            image_file.write(
                image_asset.data
            )

            image_file.close()

            audio_file = tempfile.NamedTemporaryFile(
                suffix=".wav",
                delete=False,
            )

            audio_file.write(
                audio_asset.data
            )

            audio_file.close()

            temp_paths.extend(
                [
                    image_file.name,
                    audio_file.name,
                ]
            )

            audio_clip = AudioFileClip(
                audio_file.name
            )

            duration = audio_clip.duration

            image_clip = (
                ImageClip(
                    image_file.name
                )
                .set_duration(
                    duration
                )
            )

            video_clip = (
                image_clip.set_audio(
                    audio_clip
                )
            )

            clips.append(
                video_clip
            )

        if not clips:

            raise Exception(
                "No valid clips generated."
            )

        with tempfile.NamedTemporaryFile(
            suffix=".mp4",
            delete=False,
        ) as video_file:

            output_path = video_file.name

        final_video = concatenate_videoclips(
            clips,
            method="compose",
        )

        final_video.write_videofile(
            output_path,
            fps=24,
            codec="libx264",
            audio_codec="aac",
            preset="ultrafast",
            threads=4,
            logger=None,
        )

        with open(
            output_path,
            "rb",
        ) as video_file:

            video_data = (
                video_file.read()
            )

        return save_media(
            data=video_data,
            filename=filename,
            mime_type="video/mp4",
            asset_type="video",
            project_id=project_id,
        )

    finally:

        for clip in clips:

            try:
                clip.close()

            except Exception:
                pass

        for path in temp_paths:

            if os.path.exists(path):

                os.remove(path)

        if (
            output_path
            and os.path.exists(output_path)
        ):

            os.remove(
                output_path
            )


# ============================================================
# QUIZ EXPLANATION VIDEO
# (narrated audio over the question's supporting image)
# ============================================================

def generate_quiz_explanation_video(
    explanation_text,
    image_id,
    filename,
    language="en",
    project_id=None,
):

    if not explanation_text:
        return None

    audio_id = generate_voice(
        text=explanation_text,
        filename=filename.replace(
            ".mp4",
            ".wav",
        ),
        language=language,
        project_id=project_id,
    )

    return create_amivi_video(
        [
            {
                "image_id": image_id,
                "audio_id": audio_id,
            }
        ],
        filename,
        project_id,
    )


# ============================================================
# AMICO COMIC COMPOSER
# PostgreSQL -> PIL -> PostgreSQL
# ============================================================

def get_font(
    size: int,
    bold: bool = False,
):

    possible_paths = []

    if platform.system() == "Windows":

        possible_paths.extend(
            [
                r"C:\Windows\Fonts\arialbd.ttf"
                if bold
                else r"C:\Windows\Fonts\arial.ttf",
                r"C:\Windows\Fonts\calibrib.ttf"
                if bold
                else r"C:\Windows\Fonts\calibri.ttf",
            ]
        )

    possible_paths.extend(
        [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
            if bold
            else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ]
    )

    for path in possible_paths:

        try:

            if os.path.exists(path):

                return ImageFont.truetype(
                    path,
                    size,
                )

        except Exception:
            pass

    return ImageFont.load_default()


def wrap_text(
    text: str,
    font,
    max_width: int,
):

    if not text:
        return []

    words = text.split()
    lines = []
    current = ""

    dummy_image = Image.new(
        "RGB",
        (10, 10),
    )

    draw = ImageDraw.Draw(
        dummy_image
    )

    for word in words:

        candidate = (
            f"{current} {word}".strip()
        )

        bbox = draw.textbbox(
            (0, 0),
            candidate,
            font=font,
        )

        width = bbox[2] - bbox[0]

        if width <= max_width:

            current = candidate

        else:

            if current:
                lines.append(current)

            current = word

    if current:
        lines.append(current)

    return lines


def draw_wrapped_text(
    draw,
    text,
    xy,
    font,
    fill,
    max_width,
    line_spacing=6,
):

    lines = wrap_text(
        text,
        font,
        max_width,
    )

    x, y = xy

    bbox = draw.textbbox(
        (0, 0),
        "Ag",
        font=font,
    )

    line_height = (
        bbox[3] - bbox[1]
        + line_spacing
    )

    for line in lines:

        draw.text(
            (x, y),
            line,
            font=font,
            fill=fill,
        )

        y += line_height

    return y


def cover_crop(
    image,
    target_width,
    target_height,
):

    """
    Resizes an image to fit ENTIRELY inside a target_width x
    target_height box (CSS object-fit: contain) and centers it
    on a white background sized exactly to that box — no part of
    the artwork is ever cropped away.

    Panels can be a very different shape from the square source
    art (e.g. a tall 2-per-row A4 grid cell), and hard-cropping
    to fill the panel was slicing dialogue speech bubbles off
    whichever edge the crop trimmed. Padding instead of cropping
    guarantees every bubble stays fully readable, at the cost of
    a thin white bar on panels whose shape doesn't match the
    source image.
    """

    src_width, src_height = image.size

    scale = min(
        target_width / src_width,
        target_height / src_height,
    )

    new_width = max(1, round(src_width * scale))
    new_height = max(1, round(src_height * scale))

    resized = image.resize(
        (
            new_width,
            new_height,
        ),
        Image.LANCZOS,
    )

    padded = Image.new(
        "RGB",
        (
            target_width,
            target_height,
        ),
        "#FFFFFF",
    )

    paste_x = (target_width - new_width) // 2
    paste_y = (target_height - new_height) // 2

    padded.paste(
        resized,
        (
            paste_x,
            paste_y,
        ),
    )

    return padded


def split_into_rows(panel_count):

    """
    Splits a page's panels into rows of up to 2 panels each (any
    leftover panel gets its own final row) — the classic comic
    book / manga page grid, e.g. 4 panels -> a 2x2 grid, 5 panels
    -> two rows of 2 plus a final row of 1. Every row's panels
    are stretched to span the whole page width, so there is never
    a leftover empty grid cell.
    """

    rows = []

    remaining = panel_count

    while remaining > 0:

        take = min(2, remaining)

        rows.append(take)

        remaining -= take

    return rows


def distribute(total, count):

    """
    Splits an integer `total` into `count` near-equal integer
    parts that sum back to exactly `total` (any leftover pixel
    goes to the first few parts) — used to size rows/panels so
    they butt up against each other with no rounding gaps.
    """

    base = total // count
    extra = total % count

    return [
        base + (1 if i < extra else 0)
        for i in range(count)
    ]


def draw_rainbow_frame(
    draw,
    width,
    height,
    thickness,
    radius,
):

    """
    Draws a soft pastel rainbow ring around the whole canvas — a
    stack of concentric rounded-rectangle outlines that sweep
    through the hue wheel from the outer edge inward, giving the
    page a gentle glowing frame (low saturation, high brightness,
    so it reads as pastel rather than neon).
    """

    for i in range(thickness):

        hue = i / thickness

        r, g, b = colorsys.hsv_to_rgb(hue, 0.4, 1.0)

        color = (
            int(r * 255),
            int(g * 255),
            int(b * 255),
        )

        draw.rounded_rectangle(
            (
                i,
                i,
                width - 1 - i,
                height - 1 - i,
            ),
            radius=max(radius - i, 0),
            outline=color,
            width=2,
        )


def render_amico_page(
    panels,
    page_number,
    total_pages,
    comic_title,
    objective,
    layout,
    panels_per_page=None,
):

    """
    Renders one AMICO comic page (2-7 panels) to PNG bytes,
    reading each panel's image straight from PostgreSQL
    MediaAsset.data. No media/ folder and no file_path used.

    Dialogue is baked directly into each panel's artwork now, so
    panels are drawn edge-to-edge like a real comic book page —
    no per-panel number badge, title bar, or caption strip. The
    whole page sits inside a glowing rainbow border frame, with
    "Produced by Amit" in the footer.
    """

    panel_images = []

    for panel in panels:

        image_id = panel.get(
            "image_id"
        )

        if not image_id:
            raise ValueError(
                "A panel is missing image_id."
            )

        media = get_media(
            image_id
        )

        if not media.data:

            raise ValueError(
                f"Panel image {image_id} has no data."
            )

        try:

            image = Image.open(
                io.BytesIO(
                    media.data
                )
            ).convert("RGB")

        except Exception as exc:

            raise ValueError(
                f"Could not open panel image {image_id}: {exc}"
            )

        panel_images.append(
            (
                image,
                panel,
            )
        )

    # --------------------------------------------------------
    # Layout: "horizontal" arranges panels into a fixed
    # A4-portrait page (rows of up to 2 panels — e.g. 4 panels
    # becomes a 2x2 grid, like a real comic book page), or a
    # single "vertical" scrolling column. Every row's panels
    # are stretched to span the whole page width, so there is
    # never a leftover empty grid cell, and every page of a
    # comic keeps the exact same page shape regardless of how
    # many panels it holds.
    # --------------------------------------------------------

    row_plan = (
        [1] * len(panels)
        if layout == "vertical"
        else split_into_rows(len(panels))
    )

    frame_thickness = 81
    frame_radius = 103

    outer_padding = frame_thickness + 32
    gap = 23

    header_height = 207 if comic_title else 0
    footer_height = 185

    if layout == "vertical":

        content_width = 2062
        row_heights = [1102] * len(row_plan)

    else:

        # Fixed A4 portrait proportions (210 x 297 mm) — every
        # comic page has this same shape no matter the panel
        # count; panels simply resize row by row to fit inside.
        # Sized up well past a real A4 sheet, and wider than
        # before, so the page (and its dialogue) fills more of
        # the screen and stays sharp when viewed full screen or
        # zoomed in.

        page_width = 3200
        page_height = round(page_width * 297 / 210)

        content_width = page_width - outer_padding * 2

        page_content_height = (
            page_height
            - outer_padding * 2
            - header_height
            - footer_height
        )

        row_heights = distribute(
            page_content_height
            - (len(row_plan) - 1) * gap,
            len(row_plan),
        )

    content_height = (
        sum(row_heights)
        + (len(row_heights) - 1) * gap
    )

    canvas_width = (
        outer_padding * 2
        + content_width
    )

    canvas_height = (
        outer_padding * 2
        + header_height
        + content_height
        + footer_height
    )

    canvas = Image.new(
        "RGB",
        (
            canvas_width,
            canvas_height,
        ),
        "#0b0b12",
    )

    draw = ImageDraw.Draw(
        canvas
    )

    # White "page" card, inset from the rainbow frame

    draw.rounded_rectangle(
        (
            outer_padding - 17,
            outer_padding - 17,
            canvas_width - outer_padding + 17,
            canvas_height - outer_padding + 17,
        ),
        radius=49,
        fill="#FFFFFF",
    )

    # --------------------------------------------------------
    # Fonts
    # --------------------------------------------------------

    title_font = get_font(
        92,
        bold=True,
    )

    subtitle_font = get_font(
        47,
        bold=False,
    )

    footer_font = get_font(
        49,
        bold=True,
    )

    logo_font = get_font(
        64,
        bold=True,
    )

    # --------------------------------------------------------
    # Header (kept slim — the art is the star now)
    # --------------------------------------------------------

    if comic_title:

        draw.text(
            (
                canvas_width // 2,
                outer_padding + 17,
            ),
            comic_title,
            fill="#111111",
            font=title_font,
            anchor="ma",
        )

        header_subtitle = objective

        if total_pages > 1:

            page_label = f"Page {page_number} of {total_pages}"

            header_subtitle = (
                f"{objective}  •  {page_label}"
                if objective
                else page_label
            )

        if header_subtitle:

            draw.text(
                (
                    canvas_width // 2,
                    outer_padding + 135,
                ),
                header_subtitle,
                fill="#555555",
                font=subtitle_font,
                anchor="ma",
            )

    # --------------------------------------------------------
    # Panel rendering — every row's panels are widened so they
    # together span the full content width exactly (no gaps),
    # and art fills each panel completely (cover-crop, no
    # letterboxing), butting up against its neighbors with
    # only a thin dark gutter between them.
    # --------------------------------------------------------

    panels_top = outer_padding + header_height

    panel_index = 0
    y = panels_top

    for row_index, row_count in enumerate(row_plan):

        row_height = row_heights[row_index]

        row_span = (
            content_width
            - (row_count - 1) * gap
        )

        row_widths = distribute(
            row_span,
            row_count,
        )

        x = outer_padding

        for column in range(row_count):

            this_width = row_widths[column]

            image, panel = panel_images[panel_index]

            panel_index += 1

            cover_image = cover_crop(
                image,
                this_width,
                row_height,
            )

            canvas.paste(
                cover_image,
                (
                    x,
                    y,
                ),
            )

            draw.rectangle(
                (
                    x,
                    y,
                    x + this_width - 1,
                    y + row_height - 1,
                ),
                outline="#111111",
                width=7,
            )

            x += this_width + gap

        y += row_height + gap

    # --------------------------------------------------------
    # Footer — "Produced by Amit", matching the reference
    # comic-book page.
    # --------------------------------------------------------

    footer_y = (
        canvas_height
        - outer_padding
        - footer_height // 2
    )

    draw.text(
        (
            canvas_width // 2,
            footer_y,
        ),
        "Produced by Amit",
        fill="#222222",
        font=footer_font,
        anchor="mm",
    )

    # --------------------------------------------------------
    # Glowing rainbow border frame around the whole page
    # --------------------------------------------------------

    draw_rainbow_frame(
        draw,
        canvas_width,
        canvas_height,
        frame_thickness,
        frame_radius,
    )

    # --------------------------------------------------------
    # Convert to PNG bytes
    # --------------------------------------------------------

    output_buffer = io.BytesIO()

    canvas.save(
        output_buffer,
        format="PNG",
        optimize=True,
    )

    output_buffer.seek(0)

    return output_buffer.read()


def compose_amico_comic(
    project_id,
    comic,
    panels_per_page=4,
    layout="horizontal",
):

    """
    Creates one AMICO comic sheet PNG per page (2-7 panels each,
    "horizontal" grid or single "vertical" column) and saves
    every page straight into PostgreSQL. No media/ folder and
    no file_path are used.

    Returns a list of {page_number, comic_image_id,
    comic_image_url} — one entry per page.
    """

    panels = comic.get(
        "panels",
        [],
    )

    panels_per_page = max(
        2,
        min(7, panels_per_page),
    )

    if not panels:

        raise ValueError(
            "AMICO comic has no panels."
        )

    title = comic.get(
        "title",
        "AMICO Educational Comic",
    )

    objective = comic.get(
        "learning_objective",
        "",
    )

    # The last page may end up with fewer panels than
    # panels_per_page (e.g. after adding/removing a panel) —
    # render_amico_page handles any panel count from 1-7 fine.

    total_pages = math.ceil(
        len(panels) / panels_per_page
    )

    pages = []

    for page_index in range(total_pages):

        page_panels = panels[
            page_index * panels_per_page
            : (page_index + 1) * panels_per_page
        ]

        page_bytes = render_amico_page(
            page_panels,
            page_index + 1,
            total_pages,
            title,
            objective,
            layout,
            panels_per_page,
        )

        media_id = save_media(
            data=page_bytes,
            filename=(
                f"amico_comic_{project_id}"
                f"_page_{page_index + 1}.png"
            ),
            mime_type="image/png",
            asset_type="image",
            project_id=project_id,
        )

        pages.append(
            {
                "page_number": page_index + 1,
                "comic_image_id": media_id,
                "comic_image_url": f"/api/media/{media_id}",
            }
        )

    return pages


def render_photostory_page(
    panels,
    page_number,
    total_pages,
    story_title,
    layout,
):

    """
    Renders one AMICO Photo Story page (2-8 panels) to PNG bytes.
    Unlike the character comic, a Photo Story panel has NO baked-
    in dialogue or speech bubbles — each panel is a clean labeled
    illustration with its stage title and explanation captioned
    underneath in a light gray box, the way a real educational
    process/diagram poster looks (e.g. a "Water Cycle Diagram").
    """

    panel_images = []

    for panel in panels:

        image_id = panel.get(
            "image_id"
        )

        if not image_id:
            raise ValueError(
                "A panel is missing image_id."
            )

        media = get_media(
            image_id
        )

        if not media.data:

            raise ValueError(
                f"Panel image {image_id} has no data."
            )

        try:

            image = Image.open(
                io.BytesIO(
                    media.data
                )
            ).convert("RGB")

        except Exception as exc:

            raise ValueError(
                f"Could not open panel image {image_id}: {exc}"
            )

        panel_images.append(
            (
                image,
                panel,
            )
        )

    row_plan = (
        [1] * len(panels)
        if layout == "vertical"
        else split_into_rows(len(panels))
    )

    # Sized up well past a real A4 sheet (like the character
    # comic page) so the diagram and its captions fill more of
    # the screen and stay sharp when viewed full screen or
    # zoomed in.

    frame_thickness = 86
    frame_radius = 110

    outer_padding = frame_thickness + 34
    gap = 29

    header_height = 220 if story_title else 0
    footer_height = 196

    if layout == "vertical":

        content_width = 2190
        row_heights = [940] * len(row_plan)

    else:

        page_width = 3400
        page_height = round(page_width * 297 / 210)

        content_width = page_width - outer_padding * 2

        page_content_height = (
            page_height
            - outer_padding * 2
            - header_height
            - footer_height
        )

        row_heights = distribute(
            page_content_height
            - (len(row_plan) - 1) * gap,
            len(row_plan),
        )

    content_height = (
        sum(row_heights)
        + (len(row_heights) - 1) * gap
    )

    canvas_width = (
        outer_padding * 2
        + content_width
    )

    canvas_height = (
        outer_padding * 2
        + header_height
        + content_height
        + footer_height
    )

    canvas = Image.new(
        "RGB",
        (
            canvas_width,
            canvas_height,
        ),
        "#0b0b12",
    )

    draw = ImageDraw.Draw(
        canvas
    )

    draw.rounded_rectangle(
        (
            outer_padding - 18,
            outer_padding - 18,
            canvas_width - outer_padding + 18,
            canvas_height - outer_padding + 18,
        ),
        radius=52,
        fill="#FFFFFF",
    )

    title_font = get_font(
        98,
        bold=True,
    )

    subtitle_font = get_font(
        50,
        bold=False,
    )

    panel_title_font = get_font(
        78,
        bold=True,
    )

    caption_font = get_font(
        58,
        bold=False,
    )

    footer_font = get_font(
        52,
        bold=True,
    )

    logo_font = get_font(
        68,
        bold=True,
    )

    if story_title:

        draw.text(
            (
                canvas_width // 2,
                outer_padding + 18,
            ),
            story_title.upper(),
            fill="#111111",
            font=title_font,
            anchor="ma",
        )

        if total_pages > 1:

            draw.text(
                (
                    canvas_width // 2,
                    outer_padding + 144,
                ),
                f"Page {page_number} of {total_pages}",
                fill="#555555",
                font=subtitle_font,
                anchor="ma",
            )

    # --------------------------------------------------------
    # Panel rendering — each cell is the illustration on top and
    # a captioned label strip underneath (no in-image text), so
    # every explanation stays crisp and readable regardless of
    # how well the image model follows instructions.
    # --------------------------------------------------------

    panels_top = outer_padding + header_height

    palette = [
        "#E64980", "#1E88E5", "#F5A623",
        "#43A047", "#8E24AA", "#00897B",
        "#EF5350", "#5C6BC0",
    ]

    panel_index = 0
    y = panels_top

    for row_index, row_count in enumerate(row_plan):

        row_height = row_heights[row_index]

        caption_height = max(
            225,
            round(row_height * 0.40),
        )

        image_height = (
            row_height
            - caption_height
            - 10
        )

        row_span = (
            content_width
            - (row_count - 1) * gap
        )

        row_widths = distribute(
            row_span,
            row_count,
        )

        x = outer_padding

        for column in range(row_count):

            this_width = row_widths[column]

            image, panel = panel_images[panel_index]

            color = palette[
                panel_index % len(palette)
            ]

            panel_index += 1

            fitted_image = cover_crop(
                image,
                this_width,
                image_height,
            )

            canvas.paste(
                fitted_image,
                (
                    x,
                    y,
                ),
            )

            draw.rectangle(
                (
                    x,
                    y,
                    x + this_width - 1,
                    y + image_height - 1,
                ),
                outline="#111111",
                width=8,
            )

            caption_top = (
                y
                + image_height
                + 10
            )

            draw.rectangle(
                (
                    x,
                    caption_top,
                    x + this_width - 1,
                    caption_top + caption_height - 10,
                ),
                fill="#F1F1F4",
                outline="#111111",
                width=5,
            )

            text_x = x + 40
            text_y = caption_top + 24

            panel_title = panel.get(
                "title",
                "",
            )

            if panel_title:

                draw.text(
                    (
                        text_x,
                        text_y,
                    ),
                    panel_title,
                    fill=color,
                    font=panel_title_font,
                )

                text_y += 100

            # Clip the caption to however many lines actually fit
            # inside the caption box (rather than trusting the
            # model's word count), so a longer-than-expected
            # caption can never visually collide with the next
            # row of panels — it just ends with an ellipsis.

            caption_line_spacing = 14

            line_bbox = draw.textbbox(
                (0, 0),
                "Ag",
                font=caption_font,
            )

            caption_line_height = (
                line_bbox[3] - line_bbox[1]
                + caption_line_spacing
            )

            available_caption_height = (
                caption_top
                + caption_height
                - 24
                - text_y
            )

            max_caption_lines = max(
                1,
                available_caption_height // caption_line_height,
            )

            caption_lines = wrap_text(
                panel.get(
                    "caption",
                    "",
                ),
                caption_font,
                this_width - 80,
            )

            if len(caption_lines) > max_caption_lines:

                caption_lines = caption_lines[:max_caption_lines]
                caption_lines[-1] = (
                    caption_lines[-1].rstrip() + "…"
                )

            caption_y = text_y

            for line in caption_lines:

                draw.text(
                    (
                        text_x,
                        caption_y,
                    ),
                    line,
                    font=caption_font,
                    fill="#222222",
                )

                caption_y += caption_line_height

            x += this_width + gap

        y += row_height + gap

    footer_y = (
        canvas_height
        - outer_padding
        - footer_height // 2
    )

    draw.text(
        (
            canvas_width // 2,
            footer_y,
        ),
        "Produced by Amit",
        fill="#222222",
        font=footer_font,
        anchor="mm",
    )

    draw_rainbow_frame(
        draw,
        canvas_width,
        canvas_height,
        frame_thickness,
        frame_radius,
    )

    output_buffer = io.BytesIO()

    canvas.save(
        output_buffer,
        format="PNG",
        optimize=True,
    )

    output_buffer.seek(0)

    return output_buffer.read()


def compose_amico_photostory(
    project_id,
    story,
    panels_per_page=6,
    layout="horizontal",
):

    """
    Creates one Photo Story sheet PNG per page (2-8 panels each)
    and saves every page straight into PostgreSQL, mirroring
    compose_amico_comic but for the character-free, diagram-style
    Photo Story format.
    """

    panels = story.get(
        "panels",
        [],
    )

    panels_per_page = max(
        2,
        min(8, panels_per_page),
    )

    if not panels:

        raise ValueError(
            "Photo Story has no panels."
        )

    title = story.get(
        "title",
        "Photo Story",
    )

    total_pages = math.ceil(
        len(panels) / panels_per_page
    )

    pages = []

    for page_index in range(total_pages):

        page_panels = panels[
            page_index * panels_per_page
            : (page_index + 1) * panels_per_page
        ]

        page_bytes = render_photostory_page(
            page_panels,
            page_index + 1,
            total_pages,
            title,
            layout,
        )

        media_id = save_media(
            data=page_bytes,
            filename=(
                f"amico_photostory_{project_id}"
                f"_page_{page_index + 1}.png"
            ),
            mime_type="image/png",
            asset_type="image",
            project_id=project_id,
        )

        pages.append(
            {
                "page_number": page_index + 1,
                "comic_image_id": media_id,
                "comic_image_url": f"/api/media/{media_id}",
            }
        )

    return pages


# ============================================================
# AMIVI GENERATE
# ============================================================

@app.post("/api/amivi/generate")
async def amivi_generate(
    request: AmiviRequest,
    current_user=Depends(get_current_user),
):

    try:

        require_services()

        source_text = (
            request.text.strip()
        )

        source_title = (
            "AMIVI Visual Learning"
        )

        source_url = None

        # -----------------------------------------------------
        # Video input
        # -----------------------------------------------------

        if request.video_url:

            video_result = extract_video_text(
                request.video_url,
                request.language,
            )

            source_text = (
                video_result["text"]
            )

            source_title = (
                f"AMIVI - "
                f"{video_result['title']}"
            )

            source_url = (
                request.video_url
            )

        if not source_text:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Please provide learning "
                    "text or a video URL."
                ),
            )

        guard_learning_input(
            source_text,
            "Your learning material",
        )

        # -----------------------------------------------------
        # Terra
        # -----------------------------------------------------

        content = generate_amivi_content(
            source_text,
            request.language,
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

        # -----------------------------------------------------
        # Project
        # -----------------------------------------------------

        project_id = save_project(
            project_type="amivi",
            title=source_title,
            input_text=source_text,
            language=request.language,
            data={
                **content,
                "source_url": source_url,
            },
            user_id=current_user.id,
        )

        processed_chunks = [None] * len(chunks)

        # -----------------------------------------------------
        # Generate each chunk's image + narration (in parallel —
        # these are independent per-chunk network calls, so
        # running them one at a time was the main reason AMIVI
        # generation was slow; each chunk still saves through
        # its own DB session via save_amivi_chunk, so this is
        # safe to run concurrently, same pattern as AMICO panels)
        # -----------------------------------------------------

        import concurrent.futures

        def process_amivi_chunk(index, chunk):

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

            audio_id = generate_voice(
                text=voice_script,
                filename=(
                    f"amivi_{project_id}"
                    f"_chunk_{index}.wav"
                ),
                language=request.language,
                project_id=project_id,
            )

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

            return {
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

        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            futures = {
                executor.submit(process_amivi_chunk, idx, c): idx
                for idx, c in enumerate(chunks)
            }

            for future in concurrent.futures.as_completed(futures):
                idx = futures[future]
                processed_chunks[idx] = future.result()

        # -----------------------------------------------------
        # Optional video
        # -----------------------------------------------------

        video_id = None

        if (
            request.generate_video
            and processed_chunks
        ):

            video_id = create_amivi_video(
                processed_chunks,
                f"amivi_{project_id}.mp4",
                project_id,
            )

        # -----------------------------------------------------
        # Record the Library thumbnail (first chunk's image)
        # and the video, now that they actually exist.
        # -----------------------------------------------------

        update_project_data(
            project_id,
            {
                "thumbnail_media_id": (
                    processed_chunks[0]["image_id"]
                    if processed_chunks
                    else None
                ),
                "video_id": video_id,
            },
        )

        return {
            "status": "success",
            "project_id": project_id,
            "source_url": source_url,
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
# AMIVI REGENERATE IMAGE
# ============================================================

@app.post("/api/amivi/regenerate_image")
async def amivi_regenerate_image(
    request: AmiviRegenerateImageRequest,
):

    try:

        require_services()

        project_id = (
            request.project_id
            or None
        )

        prompt = (
            request.image_prompt
            or request.description
            or request.text
            or "Educational illustration"
        )

        moderate_text(prompt, "This image request")

        image_id = generate_image(
            prompt,
            (
                f"amivi_regen_"
                f"{uuid.uuid4().hex[:8]}.png"
            ),
            project_id,
        )

        return {
            "status": "success",
            "image_id": image_id,
            "image_url": (
                f"/api/media/{image_id}"
            ),
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# ============================================================
# AMIVI EDIT CHUNK
# ============================================================

@app.post("/api/amivi/edit_chunk")
async def amivi_edit_chunk(
    request: AmiviEditChunkRequest,
):

    try:

        require_services()

        project_id = (
            request.project_id
            or None
        )

        audio_id = None

        if request.voice_script:

            audio_id = generate_voice(
                request.voice_script,
                (
                    f"amivi_edit_"
                    f"{uuid.uuid4().hex[:8]}.wav"
                ),
                request.language,
                project_id,
            )

        return {
            "status": "success",
            "audio_id": audio_id,
            "audio_url": (
                f"/api/media/{audio_id}"
                if audio_id
                else None
            ),
            "text": request.text,
            "slogan": request.slogan,
            "description": request.description,
            "voice_script": request.voice_script,
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# ============================================================
# AMICO GENERATE
# ============================================================

@app.post("/api/amico/generate")
async def amico_generate(
    request: AmicoRequest,
    current_user=Depends(get_current_user),
):

    try:

        require_services()

        # -----------------------------------------------------
        # Resolve panel/page counts and layout
        # -----------------------------------------------------

        panels_per_page = max(
            2,
            min(7, request.panels_per_page),
        )

        pages_count = max(
            1,
            min(6, request.pages),
        )

        layout = (
            "vertical"
            if request.layout == "vertical"
            else "horizontal"
        )

        total_panels = panels_per_page * pages_count

        # -----------------------------------------------------
        # Resolve the source material: free-typed homework
        # prompt, an existing AMIVI project, or both
        # -----------------------------------------------------

        topic = request.homework_prompt.strip()

        if request.source_project_id:

            source_project = get_project(
                request.source_project_id
            )

            source_text = (
                source_project.input_text
                or source_project.title
                or ""
            )

            topic = (
                f"{topic}\n\nBased on this material:\n{source_text}"
                if topic
                else source_text
            )

        if not topic:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Please provide a homework topic or "
                    "select an AMIVI project as the source."
                ),
            )

        guard_learning_input(
            topic,
            "Your homework topic",
        )

        # -----------------------------------------------------
        # Resolve a saved avatar for character consistency
        # -----------------------------------------------------

        character_reference = ""
        character_name = ""

        if request.avatar_id:

            avatar = get_avatar(
                request.avatar_id
            )

            character_reference = (
                avatar.description or ""
            )

            # "My Avatar" is just the placeholder name used when
            # the user left the name field blank while uploading —
            # don't force the story to literally name a character
            # that.
            if avatar.name and avatar.name != "My Avatar":

                character_name = avatar.name

        # -----------------------------------------------------
        # Terra creates the panel structure
        # -----------------------------------------------------

        comic = generate_amico_comic(
            topic,
            request.language,
            total_panels,
            character_reference,
            character_name,
        )

        # -----------------------------------------------------
        # Sol reviews and corrects it
        # -----------------------------------------------------

        comic = review_amico_comic(
            comic,
            request.language,
            total_panels,
        )

        # -----------------------------------------------------
        # Validate the expected panel count
        # -----------------------------------------------------

        panels = comic.get(
            "panels",
            [],
        )

        if len(panels) != total_panels:

            raise HTTPException(
                status_code=500,
                detail=(
                    f"AMICO must generate exactly "
                    f"{total_panels} panels."
                ),
            )

        # -----------------------------------------------------
        # Remember the layout choices on the comic itself, so
        # later edits/regenerations/recomposes don't need them
        # passed in again.
        # -----------------------------------------------------

        comic["panels_per_page"] = panels_per_page
        comic["layout"] = layout

        # -----------------------------------------------------
        # Save project
        # -----------------------------------------------------

        project_id = save_project(
            project_type="amico",
            title=comic.get(
                "title",
                "AMICO Comic",
            ),
            input_text=topic,
            language=request.language,
            data=comic,
            user_id=current_user.id,
        )

        # -----------------------------------------------------
        # Generate each panel image (in parallel)
        # -----------------------------------------------------

        import concurrent.futures

        processed_panels = [None] * len(panels)

        def process_panel(index, panel):
            panel_number = panel.get("panel_number", index + 1)
            image_prompt = panel.get("image_prompt", "")

            if not image_prompt:
                image_prompt = (
                    "Educational comic panel "
                    f"for panel {panel_number}: "
                    f"{panel.get('scene', '')}"
                )

            image_id = generate_image(
                prompt=image_prompt,
                filename=(
                    f"amico_{project_id}"
                    f"_panel_{index + 1}.png"
                ),
                project_id=project_id,
            )

            return {
                "panel_number": panel_number,
                "title": panel.get("title", ""),
                "scene": panel.get("scene", ""),
                "dialogue": panel.get("dialogue", ""),
                "learning_point": panel.get("learning_point", ""),
                "image_prompt": image_prompt,
                "image_id": image_id,
                "image_url": f"/api/media/{image_id}",
            }

        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            futures = {
                executor.submit(process_panel, idx, p): idx
                for idx, p in enumerate(panels)
            }

            for future in concurrent.futures.as_completed(futures):
                idx = futures[future]
                processed_panels[idx] = future.result()

        # -----------------------------------------------------
        # Put processed panels back into comic
        # -----------------------------------------------------

        comic["panels"] = (
            processed_panels
        )

        # -----------------------------------------------------
        # Compose one comic sheet per page
        # -----------------------------------------------------

        pages = compose_amico_comic(
            project_id=project_id,
            comic=comic,
            panels_per_page=panels_per_page,
            layout=layout,
        )

        comic["pages"] = pages

        # -----------------------------------------------------
        # Save comic JSON
        # -----------------------------------------------------

        comic_id = save_comic(
            project_id,
            comic.get(
                "title",
                "AMICO Comic",
            ),
            comic,
        )

        # -----------------------------------------------------
        # Record the Library thumbnail (the final composed
        # comic sheet for the first page), now that it exists.
        # -----------------------------------------------------

        first_page = pages[0] if pages else None

        update_project_data(
            project_id,
            {
                "thumbnail_media_id": (
                    first_page["comic_image_id"]
                    if first_page
                    else None
                ),
                "comic_id": comic_id,
            },
        )

        # -----------------------------------------------------
        # Response
        # -----------------------------------------------------

        return {
            "status": "success",
            "project_id": project_id,
            "comic_id": comic_id,
            "panels_per_page": panels_per_page,
            "pages_count": pages_count,
            "layout": layout,
            "pages": pages,
            # Back-compatible single-image fields (first page).
            "comic_image_id": (
                first_page["comic_image_id"]
                if first_page
                else None
            ),
            "comic_image_url": (
                first_page["comic_image_url"]
                if first_page
                else None
            ),
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
# AMICO REGENERATE PANEL
# ============================================================

@app.post("/api/amico/regenerate_panel")
async def amico_regenerate_panel(
    request: AmicoRegeneratePanelRequest,
):

    try:

        require_services()

        prompt = (
            request.image_prompt
            or request.scene
            or request.title
            or "Educational comic panel"
        )

        moderate_text(prompt, "This panel request")

        image_id = generate_image(
            prompt,
            (
                f"amico_regen_"
                f"{uuid.uuid4().hex[:8]}.png"
            ),
            request.project_id,
        )

        return {
            "status": "success",
            "image_id": image_id,
            "image_url": (
                f"/api/media/{image_id}"
            ),
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# ============================================================
# AMICO EDIT PANEL
# ============================================================

@app.post("/api/amico/edit_panel")
async def amico_edit_panel(
    request: AmicoEditPanelRequest,
):

    try:

        comic_row = latest_comic_for_project(
            request.project_id
        )

        if not comic_row:

            raise HTTPException(
                status_code=404,
                detail="No comic found for this project.",
            )

        data = dict(comic_row.data or {})
        panels = data.get("panels", [])

        found = False
        target_panel = None
        dialogue_changed = False

        for panel in panels:

            if panel.get("panel_number") == request.panel_number:

                dialogue_changed = (
                    request.dialogue is not None
                    and request.dialogue != panel.get("dialogue", "")
                )

                if request.title is not None:
                    panel["title"] = request.title

                if request.dialogue is not None:
                    panel["dialogue"] = request.dialogue

                if request.learning_point is not None:
                    panel["learning_point"] = request.learning_point

                found = True
                target_panel = panel
                break

        if not found:

            raise HTTPException(
                status_code=404,
                detail="Panel not found.",
            )

        # The dialogue is drawn directly inside the panel image, so
        # editing it means the artwork has to be redrawn with the
        # new wording — the old picture still shows the old text.

        if dialogue_changed:

            require_services()

            base_prompt = (
                target_panel.get("image_prompt", "")
                or target_panel.get("scene", "")
            )

            override_prompt = (
                base_prompt
                + "\n\nIMPORTANT OVERRIDE: ignore any earlier "
                "dialogue wording in this description. Draw ONLY "
                "this dialogue as large, easily readable comic "
                "speech bubbles (oversized white bubble with "
                "generous padding, thick black outline, big bold "
                "black lettering sized to be comfortably readable "
                "at a glance, tail toward the speaker), one bubble "
                "per line, with each speaker's name (the word "
                "before the colon) highlighted in bold colored "
                "lettering — a distinct color per character — "
                "while the rest of the line stays plain black, "
                f"with no other text:\n{request.dialogue}"
            )

            new_image_id = generate_image(
                prompt=override_prompt,
                filename=(
                    f"amico_edit_{uuid.uuid4().hex[:8]}.png"
                ),
                project_id=request.project_id,
            )

            target_panel["image_id"] = new_image_id
            target_panel["image_url"] = f"/api/media/{new_image_id}"

        data["panels"] = panels

        update_comic(comic_row.id, data)

        return {
            "status": "success",
            "comic_id": comic_row.id,
            "panels": panels,
        }

    except HTTPException:
        raise

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )


# ============================================================
# AMICO ADD PANEL
# ============================================================

@app.post("/api/amico/add_panel")
async def amico_add_panel(
    request: AmicoAddPanelRequest,
):

    try:

        require_services()

        comic_row = latest_comic_for_project(
            request.project_id
        )

        if not comic_row:

            raise HTTPException(
                status_code=404,
                detail="No comic found for this project.",
            )

        data = dict(comic_row.data or {})
        panels = data.get("panels", [])

        if request.topic_hint:
            moderate_text(request.topic_hint, "Your panel topic")

        prompt = (
            "You are AMICO's storytelling engine.\n\n"
            "A comic titled "
            f"\"{data.get('title', '')}\" already exists with "
            f"{len(panels)} panels. Write ONE new panel to be "
            f"inserted into the story"
            + (
                f" about: {request.topic_hint}.\n\n"
                if request.topic_hint
                else ".\n\n"
            )
            + "The panel must fit naturally with the existing "
            "story and characters described below.\n\n"
            "Existing comic JSON:\n"
            + json.dumps(data, ensure_ascii=False)
            + "\n\nReturn ONLY valid JSON for the single new "
            "panel using exactly this structure:\n\n"
            "{\n"
            '  "title": "...",\n'
            '  "scene": "...",\n'
            '  "image_prompt": "...",\n'
            '  "dialogue": "...",\n'
            '  "learning_point": "..."\n'
            "}\n\n"
            "This panel must be genuinely DESCRIPTIVE and focus on "
            "ONE small idea: write it for a reader who has never "
            "heard of this topic before, so the dialogue covers "
            "WHY or HOW this specific idea happens (the real cause "
            "or mechanism, not just what it looks like) and defines "
            "any key term the first time it appears. Use simple, "
            "easy everyday words.\n"
            "Dialogue must fit the existing cast's natural group "
            "conversation style: one explainer character "
            "introduces the idea in ONE short line, and one of the "
            "other existing characters reacts in a short, natural "
            "burst (a question, a guess, a quick interjection) "
            "rather than a strict two-person back-and-forth. Every "
            "line must be prefixed with that character's name — "
            "keep every line short and simple: reaction lines under "
            "8 words, the explainer line under 15 words. STRICT "
            "LIMIT: EXACTLY one line from the explainer plus at "
            "most two reaction lines from OTHER characters (3 "
            "lines total, never more) — the explainer never speaks "
            "twice in this panel; if the idea is too big for one "
            "short line, simplify to its single clearest point "
            "rather than adding a second explainer line.\n"
            "The image_prompt must instruct the image model to draw "
            "that exact dialogue directly in the image as large, "
            "easily readable comic speech bubbles (oversized white "
            "bubble with generous padding, thick black outline, "
            "big bold black lettering sized to be comfortably "
            "readable at a glance, tail toward the speaker) — one "
            "bubble per line (at most 3 total), with each speaker's "
            "name highlighted in bold colored lettering (a distinct "
            "color per character) while the rest of the line stays "
            "plain black, with no other text anywhere in the image. "
            "The image_prompt must also instruct the image model to "
            "draw ONE single unified scene — never a grid, "
            "filmstrip, or multiple sub-panels within one image.\n\n"
            + get_language_instruction(
                request.language
            )
        )

        new_panel = call_json_model(
            TERRA_MODEL,
            prompt,
            request.topic_hint or data.get("title", ""),
        )

        image_id = generate_image(
            prompt=new_panel.get("image_prompt", ""),
            filename=(
                f"amico_add_"
                f"{uuid.uuid4().hex[:8]}.png"
            ),
            project_id=request.project_id,
        )

        insert_at = max(
            0,
            min(len(panels), request.insert_after),
        )

        panels.insert(
            insert_at,
            {
                "panel_number": insert_at + 1,
                "title": new_panel.get("title", ""),
                "scene": new_panel.get("scene", ""),
                "dialogue": new_panel.get("dialogue", ""),
                "learning_point": new_panel.get("learning_point", ""),
                "image_prompt": new_panel.get("image_prompt", ""),
                "image_id": image_id,
                "image_url": f"/api/media/{image_id}",
            },
        )

        for position, panel in enumerate(panels):
            panel["panel_number"] = position + 1

        data["panels"] = panels

        update_comic(comic_row.id, data)

        return {
            "status": "success",
            "comic_id": comic_row.id,
            "panels": panels,
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
# AMICO RECOMPOSE (re-render pages after edit/regenerate/
# add/remove panel, without calling the LLM again)
# ============================================================

@app.post("/api/amico/recompose")
async def amico_recompose(
    request: AmicoRecomposeRequest,
):

    try:

        comic_row = latest_comic_for_project(
            request.project_id
        )

        if not comic_row:

            raise HTTPException(
                status_code=404,
                detail="No comic found for this project.",
            )

        data = dict(comic_row.data or {})

        panels = (
            request.panels
            or data.get("panels", [])
        )

        for position, panel in enumerate(panels):
            panel["panel_number"] = position + 1

        panels_per_page = max(
            2,
            min(7, request.panels_per_page),
        )

        layout = (
            "vertical"
            if request.layout == "vertical"
            else "horizontal"
        )

        data["panels"] = panels
        data["panels_per_page"] = panels_per_page
        data["layout"] = layout

        pages = compose_amico_comic(
            project_id=request.project_id,
            comic=data,
            panels_per_page=panels_per_page,
            layout=layout,
        )

        data["pages"] = pages

        update_comic(comic_row.id, data)

        return {
            "status": "success",
            "comic_id": comic_row.id,
            "pages": pages,
            "panels": panels,
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
# AMICO PHOTO STORY GENERATE
# ============================================================

@app.post("/api/amico/photostory/generate")
async def amico_photostory_generate(
    file: UploadFile = File(...),
    language: str = Form("en"),
    panel_count: int = Form(6),
    current_user=Depends(get_current_user),
):

    try:

        require_services()

        total_panels = max(
            4,
            min(8, panel_count),
        )

        # -----------------------------------------------------
        # Look at the uploaded photo and pick the topic
        # -----------------------------------------------------

        photo_bytes = await file.read()

        moderate_image_bytes(
            photo_bytes,
            file.content_type or "image/jpeg",
            "This photo",
        )

        photo_description = describe_photo_for_story(
            photo_bytes,
            file.content_type or "image/jpeg",
        )

        moderate_text(photo_description, "This photo")

        # -----------------------------------------------------
        # Terra writes the diagram-style panel structure
        # -----------------------------------------------------

        story = generate_amico_photostory(
            photo_description,
            language,
            total_panels,
        )

        # -----------------------------------------------------
        # Sol reviews and corrects it
        # -----------------------------------------------------

        story = review_amico_photostory(
            story,
            language,
            total_panels,
        )

        panels = story.get(
            "panels",
            [],
        )

        if len(panels) != total_panels:

            raise HTTPException(
                status_code=500,
                detail=(
                    f"AMICO Photo Story must generate exactly "
                    f"{total_panels} panels."
                ),
            )

        story["panels_per_page"] = total_panels
        story["layout"] = "horizontal"

        # -----------------------------------------------------
        # Save project
        # -----------------------------------------------------

        project_id = save_project(
            project_type="amico_photostory",
            title=story.get(
                "title",
                "Photo Story",
            ),
            input_text=photo_description,
            language=language,
            data=story,
            user_id=current_user.id,
        )

        # -----------------------------------------------------
        # Generate each panel image (in parallel)
        # -----------------------------------------------------

        import concurrent.futures

        processed_panels = [None] * len(panels)

        def process_panel(index, panel):
            panel_number = panel.get("panel_number", index + 1)
            image_prompt = panel.get("image_prompt", "")

            if not image_prompt:
                image_prompt = (
                    "Clean educational diagram illustration "
                    f"for stage {panel_number}: "
                    f"{panel.get('title', '')}"
                )

            image_id = generate_image(
                prompt=image_prompt,
                filename=(
                    f"amico_photostory_{project_id}"
                    f"_panel_{index + 1}.png"
                ),
                project_id=project_id,
            )

            return {
                "panel_number": panel_number,
                "title": panel.get("title", ""),
                "caption": panel.get("caption", ""),
                "image_prompt": image_prompt,
                "image_id": image_id,
                "image_url": f"/api/media/{image_id}",
            }

        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            futures = {
                executor.submit(process_panel, idx, p): idx
                for idx, p in enumerate(panels)
            }

            for future in concurrent.futures.as_completed(futures):
                idx = futures[future]
                processed_panels[idx] = future.result()

        story["panels"] = (
            processed_panels
        )

        # -----------------------------------------------------
        # Compose the diagram sheet
        # -----------------------------------------------------

        pages = compose_amico_photostory(
            project_id=project_id,
            story=story,
            panels_per_page=total_panels,
            layout="horizontal",
        )

        story["pages"] = pages

        # -----------------------------------------------------
        # Save story JSON (reuses the same Comic table as AMICO
        # comics — it's just a generic project_id + title + data
        # record)
        # -----------------------------------------------------

        comic_id = save_comic(
            project_id,
            story.get(
                "title",
                "Photo Story",
            ),
            story,
        )

        first_page = pages[0] if pages else None

        return {
            "status": "success",
            "project_id": project_id,
            "comic_id": comic_id,
            "pages": pages,
            "comic_image_id": (
                first_page["comic_image_id"]
                if first_page
                else None
            ),
            "comic_image_url": (
                first_page["comic_image_url"]
                if first_page
                else None
            ),
            "title": story.get(
                "title",
                "",
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
# AVATARS
# ============================================================

@app.post("/api/avatar/generate")
async def avatar_generate(
    file: UploadFile = File(...),
    name: str = Form(""),
    style: str = Form(""),
):

    try:

        require_services()

        photo_bytes = await file.read()

        moderate_image_bytes(
            photo_bytes,
            file.content_type or "image/jpeg",
            "This photo",
        )

        moderate_text(name, "This avatar name")
        moderate_text(style, "This avatar style")

        description = describe_photo_for_avatar(
            photo_bytes,
            file.content_type or "image/jpeg",
        )

        moderate_text(description, "This avatar photo")

        image_id = generate_avatar_image(
            description,
            style,
            filename=(
                f"avatar_{uuid.uuid4().hex[:8]}.png"
            ),
        )

        avatar_id = save_avatar(
            name=name or "My Avatar",
            description=description,
            image_id=image_id,
        )

        return {
            "status": "success",
            "avatar_id": avatar_id,
            "name": name or "My Avatar",
            "description": description,
            "image_id": image_id,
            "image_url": f"/api/media/{image_id}",
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


@app.get("/api/avatars")
def avatars_list():

    avatars = list_avatars()

    return {
        "avatars": [
            {
                "avatar_id": row.id,
                "name": row.name,
                "description": row.description,
                "image_id": row.image_id,
                "image_url": (
                    f"/api/media/{row.image_id}"
                    if row.image_id
                    else None
                ),
                "created_at": (
                    row.created_at.isoformat()
                    if row.created_at
                    else None
                ),
            }
            for row in avatars
        ]
    }


@app.delete("/api/avatar/{avatar_id}")
def avatar_delete(avatar_id: int):

    try:

        delete_avatar(avatar_id)

        return {
            "status": "success",
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
# PROJECTS + COMICS (for the Library and "import from AMIVI")
# ============================================================

@app.get("/api/projects")
def projects_list(project_type: str | None = None):

    projects = list_projects(project_type)

    return {
        "projects": [
            {
                "project_id": row.id,
                "project_type": row.project_type,
                "title": row.title,
                "language": row.language,
                "created_at": (
                    row.created_at.isoformat()
                    if row.created_at
                    else None
                ),
            }
            for row in projects
        ]
    }


@app.get("/api/comics")
def comics_list():

    comics = list_comics()

    results = []

    for row in comics:

        data = row.data or {}

        pages = data.get("pages", [])

        results.append(
            {
                "comic_id": row.id,
                "project_id": row.project_id,
                "title": row.title,
                "pages": pages,
                "thumbnail_url": (
                    pages[0]["comic_image_url"]
                    if pages
                    else None
                ),
                "created_at": (
                    row.created_at.isoformat()
                    if row.created_at
                    else None
                ),
            }
        )

    return {"comics": results}


@app.get("/api/comics/{comic_id}")
def comic_detail(comic_id: int):

    row = get_comic(comic_id)

    return {
        "comic_id": row.id,
        "project_id": row.project_id,
        "title": row.title,
        "data": row.data,
        "created_at": (
            row.created_at.isoformat()
            if row.created_at
            else None
        ),
    }


# ============================================================
# LIBRARY
#
# The central place a user can see, open and delete every
# AMIVI / AMICO / Quiz project they've created. Built entirely
# on the existing Project / MediaAsset / AmiviChunk / Comic /
# Quiz tables and their existing FK ON DELETE CASCADE
# relationships — no new storage, no static media folder.
# ============================================================

LIBRARY_PROJECT_TYPES = ("amivi", "amico", "quiz")


def list_library_projects(user_id=None):

    db = SessionLocal()

    try:

        query = db.query(Project).filter(
            Project.project_type.in_(LIBRARY_PROJECT_TYPES)
        )

        if user_id is not None:
            # A user sees their own projects, plus the legacy
            # ones created before accounts existed (user_id is
            # NULL on those) — those stay visible to everyone
            # rather than becoming orphaned and invisible.
            query = query.filter(
                (Project.user_id == user_id) | (Project.user_id.is_(None))
            )

        return query.order_by(Project.id.desc()).all()

    finally:
        db.close()


@app.get("/api/library")
def library_list(current_user=Depends(get_current_user)):

    projects = list_library_projects(user_id=current_user.id)

    results = []

    for row in projects:

        data = row.data or {}

        thumbnail_media_id = data.get(
            "thumbnail_media_id"
        )

        results.append(
            {
                "id": row.id,
                "type": row.project_type,
                "title": row.title,
                "input_text": row.input_text,
                "language": row.language,
                "created_at": (
                    row.created_at.isoformat()
                    if row.created_at
                    else None
                ),
                "thumbnail_url": (
                    f"/api/media/{thumbnail_media_id}"
                    if thumbnail_media_id
                    else None
                ),
            }
        )

    return {"projects": results}


@app.get("/api/library/{project_id}")
def library_project_detail(project_id: int, current_user=Depends(get_current_user)):

    project = get_project(project_id)

    if project.project_type not in LIBRARY_PROJECT_TYPES:

        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    # Legacy (pre-auth) projects have no owner and stay visible to
    # everyone. A project owned by someone else is reported as
    # not-found rather than forbidden, so we don't leak whether a
    # given project id exists.
    if project.user_id is not None and project.user_id != current_user.id:

        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    # Start from whatever's on the project itself, then layer
    # in the fully up-to-date content from the child table that
    # actually stays current across edits (AmiviChunk rows for
    # AMIVI, the latest Comic row for AMICO, the latest Quiz row
    # for Quiz) — Project.data alone can be stale for AMIVI/AMICO
    # since their images are generated *after* the project row
    # is first created.

    data = dict(project.data or {})

    if project.project_type == "amivi":

        chunks = list_amivi_chunks_for_project(
            project_id
        )

        data["chunks"] = [
            {
                "chunk_id": chunk.id,
                "chunk_number": chunk.chunk_number,
                "key_point": chunk.key_point,
                "text": chunk.text,
                "slogan": chunk.slogan,
                "description": chunk.description,
                "voice_script": chunk.voice_script,
                "image_id": chunk.image_id,
                "image_url": (
                    f"/api/media/{chunk.image_id}"
                    if chunk.image_id
                    else None
                ),
                "audio_id": chunk.audio_id,
                "audio_url": (
                    f"/api/media/{chunk.audio_id}"
                    if chunk.audio_id
                    else None
                ),
            }
            for chunk in chunks
        ]

        video_id = data.get("video_id")

        data["video_url"] = (
            f"/api/media/{video_id}"
            if video_id
            else None
        )

    elif project.project_type == "amico":

        comic = latest_comic_for_project(
            project_id
        )

        if comic:
            data = dict(comic.data or {})

    elif project.project_type == "quiz":

        quiz = latest_quiz_for_project(
            project_id
        )

        if quiz:
            data = dict(quiz.data or {})

    return {
        "id": project.id,
        "type": project.project_type,
        "title": project.title,
        "input_text": project.input_text,
        "language": project.language,
        "data": data,
        "created_at": (
            project.created_at.isoformat()
            if project.created_at
            else None
        ),
    }


@app.delete("/api/library/{project_id}")
def library_project_delete(project_id: int, current_user=Depends(get_current_user)):

    project = get_project(project_id)

    if project.project_type not in LIBRARY_PROJECT_TYPES:

        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    # Legacy (pre-auth) projects have no owner and remain deletable
    # by anyone, consistent with the "keep globally visible" choice.
    # A project owned by someone else is reported as not-found rather
    # than forbidden, so we don't leak whether a given project id exists.
    if project.user_id is not None and project.user_id != current_user.id:

        raise HTTPException(
            status_code=404,
            detail="Project not found.",
        )

    delete_project(project_id)

    return {
        "status": "success",
        "project_id": project_id,
        "message": "Project deleted.",
    }


# ============================================================
# QUIZ
# ============================================================

@app.post("/api/quiz/generate")
async def quiz_generate(
    mode: str = Form("topic"),
    topic: str = Form(""),
    material_text: str = Form(""),
    language: str = Form("en"),
    num_questions: int = Form(5),
    generate_images: bool = Form(True),
    generate_videos: bool = Form(True),
    file: UploadFile | None = File(None),
    current_user=Depends(get_current_user),
):

    try:

        require_services()

        source_text = material_text.strip()
        topic_clean = topic.strip()

        if file is not None:

            file_bytes = await file.read()

            if file_bytes:

                extracted = extract_text_from_file(
                    file_bytes,
                    file.filename or "upload.txt",
                )

                source_text = (
                    f"{source_text}\n{extracted}"
                    if source_text
                    else extracted
                )

        use_material = (
            mode == "material"
            and bool(source_text)
        )

        if mode == "material" and not source_text:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Please paste or upload learning "
                    "material for the quiz."
                ),
            )

        if mode != "material" and not topic_clean:

            raise HTTPException(
                status_code=400,
                detail="Please enter a topic for the quiz.",
            )

        guard_learning_input(
            source_text if use_material else topic_clean,
            "This quiz material"
            if use_material
            else "This quiz topic",
        )

        result = generate_quiz_from_source(
            source_text if use_material else "",
            topic_clean,
            language,
            num_questions,
        )

        quiz = result.get(
            "quiz",
            result,
        )

        quiz_title = quiz.get(
            "title",
            topic_clean or "Quiz",
        )

        project_id = save_project(
            project_type="quiz",
            title=quiz_title,
            input_text=source_text or topic_clean,
            language=language,
            data=quiz,
            user_id=current_user.id,
        )

        processed_questions = []

        for index, question in enumerate(
            quiz.get(
                "questions",
                [],
            )
        ):

            image_id = None
            video_id = None

            if generate_images:

                try:

                    image_id = generate_image(
                        prompt=question.get(
                            "image_prompt",
                            question.get("q", ""),
                        ),
                        filename=(
                            f"quiz_{project_id}"
                            f"_q{index}.png"
                        ),
                        project_id=project_id,
                    )

                except Exception as image_exc:

                    print(
                        "Quiz image generation "
                        f"failed for question {index}: "
                        f"{image_exc}"
                    )

            if generate_videos and image_id:

                try:

                    video_id = generate_quiz_explanation_video(
                        explanation_text=question.get(
                            "explanation",
                            "",
                        ),
                        image_id=image_id,
                        filename=(
                            f"quiz_{project_id}"
                            f"_q{index}.mp4"
                        ),
                        language=language,
                        project_id=project_id,
                    )

                except Exception as video_exc:

                    print(
                        "Quiz video generation "
                        f"failed for question {index}: "
                        f"{video_exc}"
                    )

            processed_questions.append(
                {
                    "question_id": index,
                    "q": question.get("q", ""),
                    "options": question.get(
                        "options",
                        [],
                    ),
                    "correct": question.get(
                        "correct",
                        0,
                    ),
                    "explanation": question.get(
                        "explanation",
                        "",
                    ),
                    "image_id": image_id,
                    "image_url": (
                        f"/api/media/{image_id}"
                        if image_id
                        else None
                    ),
                    "video_id": video_id,
                    "video_url": (
                        f"/api/media/{video_id}"
                        if video_id
                        else None
                    ),
                }
            )

        final_quiz = {
            "title": quiz_title,
            "questions": processed_questions,
        }

        quiz_id = save_quiz(
            project_id,
            quiz_title,
            final_quiz,
        )

        return {
            "status": "success",
            "project_id": project_id,
            "quiz_id": quiz_id,
            "quiz": final_quiz,
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
# QUIZ WRONG ANSWERS BANK
# (durable — persists in PostgreSQL until answered correctly
# during a bank retake, so teachers can come back after a
# month or a year and still find it here)
# ============================================================

@app.post("/api/quiz/wrong_answers")
def quiz_wrong_answer_save(
    request: WrongAnswerRequest,
):

    try:

        wrong_answer_id = save_wrong_answer(
            quiz_id=request.quiz_id,
            quiz_title=request.quiz_title,
            question_text=request.q,
            options=request.options,
            correct=request.correct,
            explanation=request.explanation,
            image_id=request.image_id,
            video_id=request.video_id,
        )

        return {
            "status": "success",
            "id": wrong_answer_id,
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


@app.get("/api/quiz/wrong_answers")
def quiz_wrong_answers_list():

    rows = list_wrong_answers()

    return {
        "items": [
            {
                "id": row.id,
                "quiz_id": row.quiz_id,
                "quiz_title": row.quiz_title,
                "q": row.question_text,
                "options": row.options or [],
                "correct": row.correct,
                "explanation": row.explanation,
                "image_id": row.image_id,
                "image_url": (
                    f"/api/media/{row.image_id}"
                    if row.image_id
                    else None
                ),
                "video_id": row.video_id,
                "video_url": (
                    f"/api/media/{row.video_id}"
                    if row.video_id
                    else None
                ),
                "created_at": (
                    row.created_at.isoformat()
                    if row.created_at
                    else None
                ),
            }
            for row in rows
        ]
    }


@app.delete("/api/quiz/wrong_answers/{wrong_answer_id}")
def quiz_wrong_answer_delete(wrong_answer_id: int):

    try:

        delete_wrong_answer(wrong_answer_id)

        return {
            "status": "success",
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
# MEDIA ENDPOINT
# ============================================================

@app.get("/api/media/{media_id}")
def media(
    media_id: int,
    download: bool = False,
):

    asset = get_media(
        media_id
    )

    disposition = (
        "attachment"
        if download
        else "inline"
    )

    return Response(
        content=asset.data,
        media_type=asset.mime_type,
        headers={
            "Content-Disposition": (
                f'{disposition}; '
                f'filename="{asset.filename}"'
            )
        },
    )


# ============================================================
# COLLABORATIVE LEARNING ROOMS
#
# Built entirely on three new tables (learning_rooms,
# room_members, room_messages) plus pointers into the EXISTING
# Project / MediaAsset / Comic / Quiz tables. AMIVI, AMICO and
# Quiz content shared in a room is generated by calling the
# normal, already-existing /api/amivi/generate, /api/amico/generate
# and /api/quiz/generate endpoints — this section never
# regenerates or duplicates that logic, it only remembers which
# existing Project a room is pointing at.
#
# There's no authentication in this app yet, so a room
# "membership" is a lightweight token handed back on join/create
# and kept client-side — enough to know who's who inside one
# room, without building a real login system.
# ============================================================

ROOM_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"  # no 0/O, 1/I/L


def generate_room_code(length: int = 6) -> str:

    return "".join(
        secrets.choice(ROOM_CODE_ALPHABET)
        for _ in range(length)
    )


def get_room_member_by_token(db, room_id: int, member_token: str):

    member = (
        db.query(RoomMember)
        .filter(
            RoomMember.room_id == room_id,
            RoomMember.token == member_token,
        )
        .first()
    )

    if not member:

        raise HTTPException(
            status_code=403,
            detail="You are not a member of this room.",
        )

    return member


def serialize_member(member) -> dict:

    return {
        "id": member.id,
        "display_name": member.display_name,
        "is_host": member.is_host,
        "quiz_score": member.quiz_score,
        "quiz_total": member.quiz_total,
        "joined_at": (
            member.joined_at.isoformat()
            if member.joined_at
            else None
        ),
    }


def serialize_room(room, members=None) -> dict:

    return {
        "id": room.id,
        "name": room.name,
        "topic": room.topic,
        "description": room.description,
        "room_code": room.room_code,
        "shared_material": room.shared_material,
        "created_by_name": room.created_by_name,
        "amivi_project_id": room.amivi_project_id,
        "amico_project_id": room.amico_project_id,
        "quiz_project_id": room.quiz_project_id,
        "created_at": (
            room.created_at.isoformat()
            if room.created_at
            else None
        ),
        "members": (
            [serialize_member(m) for m in members]
            if members is not None
            else []
        ),
    }


def room_project_summary(project_id):

    if not project_id:
        return None

    db = SessionLocal()

    try:

        row = (
            db.query(Project)
            .filter(Project.id == project_id)
            .first()
        )

        if not row:
            return None

        data = row.data or {}
        thumbnail_media_id = data.get("thumbnail_media_id")

        return {
            "project_id": row.id,
            "title": row.title,
            "type": row.project_type,
            "thumbnail_url": (
                f"/api/media/{thumbnail_media_id}"
                if thumbnail_media_id
                else None
            ),
        }

    finally:
        db.close()


def get_room_or_404(db, room_code: str):

    room = (
        db.query(LearningRoom)
        .filter(
            LearningRoom.room_code == room_code.strip().upper()
        )
        .first()
    )

    if not room:

        raise HTTPException(
            status_code=404,
            detail="No room found with that code.",
        )

    return room


@app.post("/api/rooms")
def create_room(payload: RoomCreateRequest):

    name = payload.name.strip()
    display_name = payload.display_name.strip()

    if not name:
        raise HTTPException(status_code=400, detail="Room name is required.")

    if not display_name:
        raise HTTPException(status_code=400, detail="Your name is required.")

    db = SessionLocal()

    try:

        room_code = None

        for _ in range(10):

            candidate = generate_room_code()

            clash = (
                db.query(LearningRoom)
                .filter(LearningRoom.room_code == candidate)
                .first()
            )

            if not clash:
                room_code = candidate
                break

        if not room_code:

            raise HTTPException(
                status_code=500,
                detail="Could not generate a unique room code. Please try again.",
            )

        room = LearningRoom(
            name=name,
            topic=payload.topic.strip() or None,
            description=payload.description.strip() or None,
            room_code=room_code,
            created_by_name=display_name,
        )

        db.add(room)
        db.flush()  # assigns room.id before the member row needs it

        member = RoomMember(
            room_id=room.id,
            display_name=display_name,
            token=secrets.token_urlsafe(24),
            is_host=True,
        )

        db.add(member)
        db.commit()
        db.refresh(room)
        db.refresh(member)

        return {
            "status": "success",
            "room": serialize_room(room, members=[member]),
            "member": {**serialize_member(member), "token": member.token},
        }

    finally:
        db.close()


@app.post("/api/rooms/join")
def join_room(payload: RoomJoinRequest):

    display_name = payload.display_name.strip()

    if not display_name:
        raise HTTPException(status_code=400, detail="Your name is required.")

    if not payload.room_code.strip():
        raise HTTPException(status_code=400, detail="Room code is required.")

    db = SessionLocal()

    try:

        room = get_room_or_404(db, payload.room_code)

        member = RoomMember(
            room_id=room.id,
            display_name=display_name,
            token=secrets.token_urlsafe(24),
            is_host=False,
        )

        db.add(member)
        db.commit()
        db.refresh(member)

        members = (
            db.query(RoomMember)
            .filter(RoomMember.room_id == room.id)
            .order_by(RoomMember.joined_at.asc())
            .all()
        )

        return {
            "status": "success",
            "room": serialize_room(room, members=members),
            "member": {**serialize_member(member), "token": member.token},
        }

    finally:
        db.close()


@app.get("/api/rooms/{room_code}")
def room_detail(room_code: str):

    db = SessionLocal()

    try:

        room = get_room_or_404(db, room_code)

        members = (
            db.query(RoomMember)
            .filter(RoomMember.room_id == room.id)
            .order_by(RoomMember.joined_at.asc())
            .all()
        )

        message_count = (
            db.query(RoomMessage)
            .filter(RoomMessage.room_id == room.id)
            .count()
        )

        payload = serialize_room(room, members=members)
        payload["message_count"] = message_count

        amivi_id = room.amivi_project_id
        amico_id = room.amico_project_id
        quiz_id = room.quiz_project_id

    finally:
        db.close()

    payload["amivi"] = room_project_summary(amivi_id)
    payload["amico"] = room_project_summary(amico_id)
    payload["quiz"] = room_project_summary(quiz_id)

    return payload


@app.get("/api/rooms/{room_code}/messages")
def room_messages(room_code: str):

    db = SessionLocal()

    try:

        room = get_room_or_404(db, room_code)

        rows = (
            db.query(RoomMessage)
            .filter(RoomMessage.room_id == room.id)
            .order_by(RoomMessage.created_at.asc())
            .limit(300)
            .all()
        )

        return {
            "messages": [
                {
                    "id": m.id,
                    "sender_name": m.sender_name,
                    "message": m.message,
                    "created_at": (
                        m.created_at.isoformat()
                        if m.created_at
                        else None
                    ),
                }
                for m in rows
            ]
        }

    finally:
        db.close()


@app.post("/api/rooms/{room_code}/messages")
def room_send_message(room_code: str, payload: RoomMessageRequest):

    text = payload.message.strip()

    if not text:
        raise HTTPException(status_code=400, detail="Message can't be empty.")

    db = SessionLocal()

    try:

        room = get_room_or_404(db, room_code)
        member = get_room_member_by_token(db, room.id, payload.member_token)

        msg = RoomMessage(
            room_id=room.id,
            sender_name=member.display_name,
            message=text,
        )

        db.add(msg)
        db.commit()
        db.refresh(msg)

        return {
            "status": "success",
            "message": {
                "id": msg.id,
                "sender_name": msg.sender_name,
                "message": msg.message,
                "created_at": (
                    msg.created_at.isoformat()
                    if msg.created_at
                    else None
                ),
            },
        }

    finally:
        db.close()


@app.post("/api/rooms/{room_code}/material")
def room_update_material(room_code: str, payload: RoomMaterialRequest):

    db = SessionLocal()

    try:

        room = get_room_or_404(db, room_code)
        get_room_member_by_token(db, room.id, payload.member_token)

        room.shared_material = payload.shared_material
        db.add(room)
        db.commit()
        db.refresh(room)

        return {
            "status": "success",
            "shared_material": room.shared_material,
        }

    finally:
        db.close()


@app.post("/api/rooms/{room_code}/link")
def room_link_project(room_code: str, payload: RoomLinkRequest):

    if payload.kind not in ("amivi", "amico", "quiz"):

        raise HTTPException(
            status_code=400,
            detail="kind must be amivi, amico or quiz.",
        )

    db = SessionLocal()

    try:

        room = get_room_or_404(db, room_code)
        get_room_member_by_token(db, room.id, payload.member_token)

        project = (
            db.query(Project)
            .filter(Project.id == payload.project_id)
            .first()
        )

        if not project:
            raise HTTPException(status_code=404, detail="Project not found.")

        if project.project_type != payload.kind:

            raise HTTPException(
                status_code=400,
                detail=f"That project isn't a {payload.kind} project.",
            )

        setattr(room, f"{payload.kind}_project_id", project.id)

        db.add(room)
        db.commit()
        db.refresh(room)

        amivi_id = room.amivi_project_id
        amico_id = room.amico_project_id
        quiz_id = room.quiz_project_id

    finally:
        db.close()

    return {
        "status": "success",
        "amivi": room_project_summary(amivi_id),
        "amico": room_project_summary(amico_id),
        "quiz": room_project_summary(quiz_id),
    }


@app.post("/api/rooms/{room_code}/score")
def room_submit_score(room_code: str, payload: RoomScoreRequest):

    db = SessionLocal()

    try:

        room = get_room_or_404(db, room_code)
        member = get_room_member_by_token(db, room.id, payload.member_token)

        member.quiz_score = max(0, payload.score)
        member.quiz_total = max(0, payload.total)

        db.add(member)
        db.commit()

        members = (
            db.query(RoomMember)
            .filter(RoomMember.room_id == room.id)
            .order_by(RoomMember.joined_at.asc())
            .all()
        )

        return {
            "status": "success",
            "members": [serialize_member(m) for m in members],
        }

    finally:
        db.close()


@app.post("/api/rooms/{room_code}/leave")
def room_leave(room_code: str, payload: RoomLeaveRequest):

    db = SessionLocal()

    try:

        room = get_room_or_404(db, room_code)
        member = get_room_member_by_token(db, room.id, payload.member_token)

        db.delete(member)
        db.commit()

        return {"status": "success"}

    finally:
        db.close()


# ============================================================
# TEACHER/STUDENT CLASSROOMS
#
# A separate concept from the peer-to-peer LearningRoom above:
# one teacher, any number of students, homework assignments and
# a gradebook. Reuses the same lightweight token-based
# "membership" pattern (no passwords), and reuses the existing
# AMIVI / AMICO / Quiz generation endpoints + the Project table
# for all generated content — Assignment only ever stores
# pointers (project_id), never a copy of the content itself.
# ============================================================

def get_classroom_or_404(db, class_code: str):

    classroom = (
        db.query(Classroom)
        .filter(
            Classroom.class_code == class_code.strip().upper()
        )
        .first()
    )

    if not classroom:

        raise HTTPException(
            status_code=404,
            detail="No classroom found with that code.",
        )

    return classroom


def get_classroom_member_by_token(db, classroom_id: int, member_token: str):

    member = (
        db.query(ClassroomMember)
        .filter(
            ClassroomMember.classroom_id == classroom_id,
            ClassroomMember.token == member_token,
        )
        .first()
    )

    if not member:

        raise HTTPException(
            status_code=403,
            detail="You are not a member of this classroom.",
        )

    return member


def require_teacher(member):

    if member.role != "teacher":

        raise HTTPException(
            status_code=403,
            detail="Only the teacher can do that.",
        )

    return member


def serialize_classroom_member(member) -> dict:

    return {
        "id": member.id,
        "display_name": member.display_name,
        "role": member.role,
        "joined_at": (
            member.joined_at.isoformat()
            if member.joined_at
            else None
        ),
    }


def serialize_assignment(db, assignment, student_count: int) -> dict:

    submitted_member_ids = {
        row[0]
        for row in (
            db.query(AssignmentSubmission.member_id)
            .filter(AssignmentSubmission.assignment_id == assignment.id)
            .distinct()
            .all()
        )
    }

    return {
        "id": assignment.id,
        "title": assignment.title,
        "instructions": assignment.instructions,
        "quiz_project_id": assignment.quiz_project_id,
        "amivi_project_id": assignment.amivi_project_id,
        "amico_project_id": assignment.amico_project_id,
        "due_at": (
            assignment.due_at.isoformat()
            if assignment.due_at
            else None
        ),
        "created_at": (
            assignment.created_at.isoformat()
            if assignment.created_at
            else None
        ),
        "submitted_count": len(submitted_member_ids),
        "student_count": student_count,
    }


def parse_due_at(raw: str | None):

    if not raw:
        return None

    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except ValueError:

        raise HTTPException(
            status_code=400,
            detail="due_at must be an ISO 8601 date/time.",
        )


def serialize_assignment_for_member(db, assignment, member_id: int) -> dict:
    """
    Same shape as serialize_assignment, but scoped to one member's
    own status/score/history on this assignment instead of the
    whole-class tally — used by the student's own assignment list
    and by the read-only parent view.
    """

    latest = (
        db.query(AssignmentSubmission)
        .filter(
            AssignmentSubmission.assignment_id == assignment.id,
            AssignmentSubmission.member_id == member_id,
        )
        .order_by(AssignmentSubmission.submitted_at.desc())
        .first()
    )

    attempt_count = (
        db.query(AssignmentSubmission)
        .filter(
            AssignmentSubmission.assignment_id == assignment.id,
            AssignmentSubmission.member_id == member_id,
        )
        .count()
    )

    return {
        "id": assignment.id,
        "title": assignment.title,
        "instructions": assignment.instructions,
        "due_at": (
            assignment.due_at.isoformat()
            if assignment.due_at
            else None
        ),
        "created_at": (
            assignment.created_at.isoformat()
            if assignment.created_at
            else None
        ),
        "status": "submitted" if latest else "not_started",
        "score": latest.score if latest else None,
        "total": latest.total if latest else None,
        "attempts": attempt_count,
        "last_submitted_at": (
            latest.submitted_at.isoformat() if latest else None
        ),
    }


@app.post("/api/classrooms")
def create_classroom(payload: ClassroomCreateRequest, current_user=Depends(get_current_user_optional)):

    name = payload.name.strip()
    display_name = payload.display_name.strip()

    if not name:
        raise HTTPException(status_code=400, detail="Classroom name is required.")

    if not display_name:
        raise HTTPException(status_code=400, detail="Your name is required.")

    db = SessionLocal()

    try:

        class_code = None

        for _ in range(10):

            candidate = generate_room_code()

            clash = (
                db.query(Classroom)
                .filter(Classroom.class_code == candidate)
                .first()
            )

            if not clash:
                class_code = candidate
                break

        if not class_code:

            raise HTTPException(
                status_code=500,
                detail="Could not generate a unique class code. Please try again.",
            )

        teacher_code = None

        for _ in range(10):

            candidate = generate_room_code(length=10)

            clash = (
                db.query(Classroom)
                .filter(Classroom.teacher_code == candidate)
                .first()
            )

            if not clash:
                teacher_code = candidate
                break

        if not teacher_code:

            raise HTTPException(
                status_code=500,
                detail="Could not generate a unique teacher code. Please try again.",
            )

        classroom = Classroom(
            name=name,
            subject=payload.subject.strip() or None,
            description=payload.description.strip() or None,
            class_code=class_code,
            teacher_code=teacher_code,
            teacher_name=display_name,
        )

        db.add(classroom)
        db.flush()

        member = ClassroomMember(
            classroom_id=classroom.id,
            display_name=display_name,
            token=secrets.token_urlsafe(24),
            role="teacher",
            # Auto-link to the real account when the browser is
            # logged in — lets the Teacher Dashboard show this
            # classroom without the teacher having to do anything
            # extra. Classroom creation still works fine when no
            # one's logged into a real account (current_user is
            # None), unchanged from before.
            user_id=current_user.id if current_user else None,
        )

        db.add(member)
        db.commit()
        db.refresh(classroom)
        db.refresh(member)

        return {
            "status": "success",
            "classroom": {
                "id": classroom.id,
                "name": classroom.name,
                "subject": classroom.subject,
                "description": classroom.description,
                "class_code": classroom.class_code,
                "teacher_name": classroom.teacher_name,
                "created_at": classroom.created_at.isoformat(),
                "members": [serialize_classroom_member(member)],
                "assignments": [],
            },
            "member": {**serialize_classroom_member(member), "token": member.token},
            "teacher_code": classroom.teacher_code,
        }

    finally:
        db.close()


@app.post("/api/classrooms/join")
def join_classroom(payload: ClassroomJoinRequest, current_user=Depends(get_current_user_optional)):

    display_name = payload.display_name.strip()

    if not display_name:
        raise HTTPException(status_code=400, detail="Your name is required.")

    if not payload.class_code.strip():
        raise HTTPException(status_code=400, detail="Class code is required.")

    db = SessionLocal()

    try:

        classroom = get_classroom_or_404(db, payload.class_code)

        student_code = None

        for _ in range(10):

            candidate = generate_room_code(length=10)

            clash = (
                db.query(ClassroomMember)
                .filter(ClassroomMember.student_code == candidate)
                .first()
            )

            if not clash:
                student_code = candidate
                break

        if not student_code:

            raise HTTPException(
                status_code=500,
                detail="Could not generate a unique login code. Please try again.",
            )

        member = ClassroomMember(
            classroom_id=classroom.id,
            display_name=display_name,
            token=secrets.token_urlsafe(24),
            role="student",
            student_code=student_code,
            # Same auto-link as the teacher side above — safe no-op
            # when nobody's logged into a real account.
            user_id=current_user.id if current_user else None,
        )

        db.add(member)
        db.commit()
        db.refresh(member)

        return {
            "status": "success",
            "member": {**serialize_classroom_member(member), "token": member.token},
            "student_code": member.student_code,
        }

    finally:
        db.close()


@app.get("/api/classrooms/{class_code}")
def classroom_detail(class_code: str):

    db = SessionLocal()

    try:

        classroom = get_classroom_or_404(db, class_code)

        members = (
            db.query(ClassroomMember)
            .filter(ClassroomMember.classroom_id == classroom.id)
            .order_by(ClassroomMember.joined_at.asc())
            .all()
        )

        student_count = sum(1 for m in members if m.role == "student")

        assignments = (
            db.query(Assignment)
            .filter(Assignment.classroom_id == classroom.id)
            .order_by(Assignment.created_at.desc())
            .all()
        )

        return {
            "id": classroom.id,
            "name": classroom.name,
            "subject": classroom.subject,
            "description": classroom.description,
            "class_code": classroom.class_code,
            "teacher_name": classroom.teacher_name,
            "created_at": (
                classroom.created_at.isoformat()
                if classroom.created_at
                else None
            ),
            "members": [serialize_classroom_member(m) for m in members],
            "assignments": [
                serialize_assignment(db, a, student_count) for a in assignments
            ],
        }

    finally:
        db.close()


@app.post("/api/classrooms/{class_code}/assignments")
def create_assignment(class_code: str, payload: AssignmentCreateRequest):

    title = payload.title.strip()

    if not title:
        raise HTTPException(status_code=400, detail="Assignment title is required.")

    due_at = parse_due_at(payload.due_at)

    db = SessionLocal()

    try:

        classroom = get_classroom_or_404(db, class_code)
        member = get_classroom_member_by_token(db, classroom.id, payload.member_token)
        require_teacher(member)

        quiz_project = (
            db.query(Project)
            .filter(Project.id == payload.quiz_project_id)
            .first()
        )

        if not quiz_project or quiz_project.project_type != "quiz":

            raise HTTPException(
                status_code=400,
                detail="quiz_project_id must point at an existing quiz project.",
            )

        assignment = Assignment(
            classroom_id=classroom.id,
            title=title,
            instructions=payload.instructions.strip() or None,
            quiz_project_id=payload.quiz_project_id,
            amivi_project_id=payload.amivi_project_id,
            amico_project_id=payload.amico_project_id,
            due_at=due_at,
        )

        db.add(assignment)
        db.commit()
        db.refresh(assignment)

        student_count = (
            db.query(ClassroomMember)
            .filter(
                ClassroomMember.classroom_id == classroom.id,
                ClassroomMember.role == "student",
            )
            .count()
        )

        return {
            "status": "success",
            "assignment": serialize_assignment(db, assignment, student_count),
        }

    finally:
        db.close()


@app.get("/api/classrooms/{class_code}/assignments/{assignment_id}")
def assignment_detail(class_code: str, assignment_id: int):

    db = SessionLocal()

    try:

        classroom = get_classroom_or_404(db, class_code)

        assignment = (
            db.query(Assignment)
            .filter(
                Assignment.id == assignment_id,
                Assignment.classroom_id == classroom.id,
            )
            .first()
        )

        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found.")

        student_count = (
            db.query(ClassroomMember)
            .filter(
                ClassroomMember.classroom_id == classroom.id,
                ClassroomMember.role == "student",
            )
            .count()
        )

        return serialize_assignment(db, assignment, student_count)

    finally:
        db.close()


@app.post("/api/classrooms/{class_code}/assignments/{assignment_id}/submit")
def submit_assignment(class_code: str, assignment_id: int, payload: SubmissionCreateRequest):

    db = SessionLocal()

    try:

        classroom = get_classroom_or_404(db, class_code)
        member = get_classroom_member_by_token(db, classroom.id, payload.member_token)

        assignment = (
            db.query(Assignment)
            .filter(
                Assignment.id == assignment_id,
                Assignment.classroom_id == classroom.id,
            )
            .first()
        )

        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found.")

        submission = AssignmentSubmission(
            assignment_id=assignment.id,
            member_id=member.id,
            score=max(0, payload.score),
            total=max(0, payload.total),
            answers=[a.model_dump() for a in payload.answers] if payload.answers else None,
        )

        db.add(submission)
        db.commit()
        db.refresh(submission)

        return {
            "status": "success",
            "submission": {
                "id": submission.id,
                "score": submission.score,
                "total": submission.total,
                "submitted_at": submission.submitted_at.isoformat(),
            },
        }

    finally:
        db.close()


@app.get("/api/classrooms/{class_code}/assignments/{assignment_id}/results")
def assignment_results(class_code: str, assignment_id: int, member_token: str):

    db = SessionLocal()

    try:

        classroom = get_classroom_or_404(db, class_code)
        teacher = get_classroom_member_by_token(db, classroom.id, member_token)
        require_teacher(teacher)

        assignment = (
            db.query(Assignment)
            .filter(
                Assignment.id == assignment_id,
                Assignment.classroom_id == classroom.id,
            )
            .first()
        )

        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found.")

        students = (
            db.query(ClassroomMember)
            .filter(
                ClassroomMember.classroom_id == classroom.id,
                ClassroomMember.role == "student",
            )
            .order_by(ClassroomMember.joined_at.asc())
            .all()
        )

        results = []

        for student in students:

            latest = (
                db.query(AssignmentSubmission)
                .filter(
                    AssignmentSubmission.assignment_id == assignment.id,
                    AssignmentSubmission.member_id == student.id,
                )
                .order_by(AssignmentSubmission.submitted_at.desc())
                .first()
            )

            attempt_count = (
                db.query(AssignmentSubmission)
                .filter(
                    AssignmentSubmission.assignment_id == assignment.id,
                    AssignmentSubmission.member_id == student.id,
                )
                .count()
            )

            results.append(
                {
                    "member_id": student.id,
                    "display_name": student.display_name,
                    "score": latest.score if latest else None,
                    "total": latest.total if latest else None,
                    "attempts": attempt_count,
                    "last_submitted_at": (
                        latest.submitted_at.isoformat() if latest else None
                    ),
                }
            )

        return {"assignment_id": assignment.id, "results": results}

    finally:
        db.close()


@app.get("/api/classrooms/{class_code}/assignments/{assignment_id}/submissions/{member_id}")
def assignment_submission_detail(class_code: str, assignment_id: int, member_id: int, member_token: str):
    """
    Teacher-only, question-by-question view of one student's latest
    attempt: what they picked, what was correct, and (when available)
    the explanation — pulled from the quiz's own question bank and
    overlaid with what AssignmentSubmission.answers recorded.
    """

    db = SessionLocal()

    try:

        classroom = get_classroom_or_404(db, class_code)
        teacher = get_classroom_member_by_token(db, classroom.id, member_token)
        require_teacher(teacher)

        assignment = (
            db.query(Assignment)
            .filter(
                Assignment.id == assignment_id,
                Assignment.classroom_id == classroom.id,
            )
            .first()
        )

        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found.")

        student = (
            db.query(ClassroomMember)
            .filter(
                ClassroomMember.id == member_id,
                ClassroomMember.classroom_id == classroom.id,
            )
            .first()
        )

        if not student:
            raise HTTPException(status_code=404, detail="Student not found in this classroom.")

        submission = (
            db.query(AssignmentSubmission)
            .filter(
                AssignmentSubmission.assignment_id == assignment.id,
                AssignmentSubmission.member_id == member_id,
            )
            .order_by(AssignmentSubmission.submitted_at.desc())
            .first()
        )

        if not submission:
            return {
                "display_name": student.display_name,
                "assignment_title": assignment.title,
                "submitted": False,
                "questions": [],
            }

        # The submission only recorded which option index was picked
        # per question — the question text/options/explanation still
        # live on the quiz's own Project row, so pull that back in.
        # A deleted quiz project shouldn't break this view; just show
        # the score with no question detail underneath it.
        questions_bank = []

        if assignment.quiz_project_id:

            try:
                quiz_project = get_project(assignment.quiz_project_id)
                questions_bank = (quiz_project.data or {}).get("questions", [])
            except HTTPException:
                questions_bank = []

        answers_by_index = {
            a.get("question_index"): a
            for a in (submission.answers or [])
        }

        questions = []

        for idx, q in enumerate(questions_bank):

            a = answers_by_index.get(idx)

            questions.append(
                {
                    "question_index": idx,
                    "question": q.get("q", ""),
                    "options": q.get("options", []),
                    "correct": q.get("correct"),
                    "explanation": q.get("explanation"),
                    "image_url": q.get("image_url"),
                    "selected": a.get("selected") if a else None,
                    "is_correct": a.get("is_correct") if a else None,
                }
            )

        return {
            "display_name": student.display_name,
            "assignment_title": assignment.title,
            "submitted": True,
            "score": submission.score,
            "total": submission.total,
            "submitted_at": submission.submitted_at.isoformat(),
            "questions": questions,
        }

    finally:
        db.close()


@app.get("/api/classrooms/{class_code}/history")
def classroom_history(class_code: str, member_token: str):

    db = SessionLocal()

    try:

        classroom = get_classroom_or_404(db, class_code)
        member = get_classroom_member_by_token(db, classroom.id, member_token)

        rows = (
            db.query(AssignmentSubmission, Assignment)
            .join(Assignment, AssignmentSubmission.assignment_id == Assignment.id)
            .filter(AssignmentSubmission.member_id == member.id)
            .order_by(AssignmentSubmission.submitted_at.desc())
            .all()
        )

        return {
            "history": [
                {
                    "submission_id": submission.id,
                    "assignment_id": assignment.id,
                    "assignment_title": assignment.title,
                    "score": submission.score,
                    "total": submission.total,
                    "submitted_at": (
                        submission.submitted_at.isoformat()
                        if submission.submitted_at
                        else None
                    ),
                }
                for submission, assignment in rows
            ]
        }

    finally:
        db.close()


@app.post("/api/classrooms/{class_code}/leave")
def leave_classroom(class_code: str, payload: ClassroomLeaveRequest):

    db = SessionLocal()

    try:

        classroom = get_classroom_or_404(db, class_code)
        member = get_classroom_member_by_token(db, classroom.id, payload.member_token)

        db.delete(member)
        db.commit()

        return {"status": "success"}

    finally:
        db.close()


# ------------------------------------------------------------
# Parent access — a student can generate their own read-only
# "parent code" and hand it to a parent. The code alone is
# enough to view that one student's assignments/scores/history
# in this classroom; it carries no class code and no password,
# and it can't write anything.
# ------------------------------------------------------------

@app.post("/api/classrooms/{class_code}/parent-code")
def classroom_parent_code(class_code: str, payload: ParentCodeRequest):

    db = SessionLocal()

    try:

        classroom = get_classroom_or_404(db, class_code)
        member = get_classroom_member_by_token(db, classroom.id, payload.member_token)

        if member.parent_code and not payload.regenerate:

            return {
                "status": "success",
                "parent_code": member.parent_code,
            }

        parent_code = None

        for _ in range(10):

            candidate = generate_room_code(length=10)

            clash = (
                db.query(ClassroomMember)
                .filter(ClassroomMember.parent_code == candidate)
                .first()
            )

            if not clash:
                parent_code = candidate
                break

        if not parent_code:

            raise HTTPException(
                status_code=500,
                detail="Could not generate a unique parent code. Please try again.",
            )

        member.parent_code = parent_code
        db.commit()

        return {
            "status": "success",
            "parent_code": parent_code,
        }

    finally:
        db.close()


@app.get("/api/parents/{parent_code}")
def parent_view(parent_code: str):

    db = SessionLocal()

    try:

        member = (
            db.query(ClassroomMember)
            .filter(ClassroomMember.parent_code == parent_code.strip())
            .first()
        )

        if not member:

            raise HTTPException(
                status_code=404,
                detail="That parent code isn't recognized. Double-check it with your student.",
            )

        classroom = (
            db.query(Classroom)
            .filter(Classroom.id == member.classroom_id)
            .first()
        )

        if not classroom:
            raise HTTPException(status_code=404, detail="Classroom not found.")

        assignments = (
            db.query(Assignment)
            .filter(Assignment.classroom_id == classroom.id)
            .order_by(Assignment.created_at.desc())
            .all()
        )

        history_rows = (
            db.query(AssignmentSubmission, Assignment)
            .join(Assignment, AssignmentSubmission.assignment_id == Assignment.id)
            .filter(AssignmentSubmission.member_id == member.id)
            .order_by(AssignmentSubmission.submitted_at.desc())
            .all()
        )

        return {
            "classroom": {
                "name": classroom.name,
                "subject": classroom.subject,
                "description": classroom.description,
                "teacher_name": classroom.teacher_name,
            },
            "student": {
                "display_name": member.display_name,
                "joined_at": (
                    member.joined_at.isoformat()
                    if member.joined_at
                    else None
                ),
            },
            "assignments": [
                serialize_assignment_for_member(db, a, member.id)
                for a in assignments
            ],
            "history": [
                {
                    "submission_id": submission.id,
                    "assignment_id": assignment.id,
                    "assignment_title": assignment.title,
                    "score": submission.score,
                    "total": submission.total,
                    "submitted_at": (
                        submission.submitted_at.isoformat()
                        if submission.submitted_at
                        else None
                    ),
                }
                for submission, assignment in history_rows
            ],
        }

    finally:
        db.close()


# ------------------------------------------------------------
# Teacher login — recovers teacher access to an EXISTING
# classroom from a new device/browser (the browser-stored
# session is the only thing that normally keeps a teacher
# "logged in", so losing it with no recovery path would lock
# them out of their own classroom). The teacher_code is private
# — never shown to students — and is distinct from class_code,
# which anyone with it can use to join as a student.
# ------------------------------------------------------------

@app.post("/api/classrooms/{class_code}/teacher-code")
def classroom_teacher_code(class_code: str, payload: TeacherCodeRequest):

    db = SessionLocal()

    try:

        classroom = get_classroom_or_404(db, class_code)
        member = get_classroom_member_by_token(db, classroom.id, payload.member_token)
        require_teacher(member)

        if classroom.teacher_code and not payload.regenerate:

            return {
                "status": "success",
                "teacher_code": classroom.teacher_code,
            }

        teacher_code = None

        for _ in range(10):

            candidate = generate_room_code(length=10)

            clash = (
                db.query(Classroom)
                .filter(Classroom.teacher_code == candidate)
                .first()
            )

            if not clash:
                teacher_code = candidate
                break

        if not teacher_code:

            raise HTTPException(
                status_code=500,
                detail="Could not generate a unique teacher code. Please try again.",
            )

        classroom.teacher_code = teacher_code
        db.commit()

        return {
            "status": "success",
            "teacher_code": teacher_code,
        }

    finally:
        db.close()


@app.post("/api/classrooms/{class_code}/teacher-login")
def classroom_teacher_login(class_code: str, payload: TeacherLoginRequest, current_user=Depends(get_current_user_optional)):

    db = SessionLocal()

    try:

        classroom = get_classroom_or_404(db, class_code)

        code = payload.teacher_code.strip()

        if not code or not classroom.teacher_code or not secrets.compare_digest(classroom.teacher_code, code):

            raise HTTPException(status_code=403, detail="Invalid teacher code.")

        teacher = (
            db.query(ClassroomMember)
            .filter(
                ClassroomMember.classroom_id == classroom.id,
                ClassroomMember.role == "teacher",
            )
            .first()
        )

        if not teacher:
            raise HTTPException(status_code=404, detail="No teacher found for this classroom.")

        # Opportunistically link this (possibly pre-existing, from
        # before real accounts existed) membership to whoever's
        # logged in right now, so it starts showing up on their
        # Teacher Dashboard too.
        if current_user and not teacher.user_id:
            teacher.user_id = current_user.id
            db.commit()

        return {
            "status": "success",
            "member": {**serialize_classroom_member(teacher), "token": teacher.token},
        }

    finally:
        db.close()


# ------------------------------------------------------------
# Student login — the same recovery idea as teacher login, for
# a student's own membership. A student_code is issued the
# moment they register (join), so this is available to them
# from the start, not something they have to think to set up.
# ------------------------------------------------------------

@app.post("/api/classrooms/{class_code}/student-code")
def classroom_student_code(class_code: str, payload: StudentCodeRequest):

    db = SessionLocal()

    try:

        classroom = get_classroom_or_404(db, class_code)
        member = get_classroom_member_by_token(db, classroom.id, payload.member_token)

        if member.student_code and not payload.regenerate:

            return {
                "status": "success",
                "student_code": member.student_code,
            }

        student_code = None

        for _ in range(10):

            candidate = generate_room_code(length=10)

            clash = (
                db.query(ClassroomMember)
                .filter(ClassroomMember.student_code == candidate)
                .first()
            )

            if not clash:
                student_code = candidate
                break

        if not student_code:

            raise HTTPException(
                status_code=500,
                detail="Could not generate a unique login code. Please try again.",
            )

        member.student_code = student_code
        db.commit()

        return {
            "status": "success",
            "student_code": student_code,
        }

    finally:
        db.close()


@app.post("/api/classrooms/{class_code}/student-login")
def classroom_student_login(class_code: str, payload: StudentLoginRequest, current_user=Depends(get_current_user_optional)):

    db = SessionLocal()

    try:

        classroom = get_classroom_or_404(db, class_code)

        code = payload.student_code.strip()

        member = None

        if code:
            member = (
                db.query(ClassroomMember)
                .filter(
                    ClassroomMember.classroom_id == classroom.id,
                    ClassroomMember.role == "student",
                    ClassroomMember.student_code == code,
                )
                .first()
            )

        if not member:

            raise HTTPException(status_code=403, detail="Invalid login code.")

        # Same opportunistic link as teacher-login above.
        if current_user and not member.user_id:
            member.user_id = current_user.id
            db.commit()

        return {
            "status": "success",
            "member": {**serialize_classroom_member(member), "token": member.token},
        }

    finally:
        db.close()


# ============================================================
# MY CLASSROOMS (real account — Teacher/Student Dashboard)
#
# Lists every classroom a logged-in User's account has been
# linked to (see the auto-link at classroom create/join/
# teacher-login/student-login above). Each entry carries the
# ClassroomMember's own token, so the frontend can drop straight
# into the existing token-scoped Classroom endpoints without any
# of them needing to change.
# ============================================================

@app.get("/api/me/classrooms")
def my_classrooms(current_user=Depends(get_current_user)):

    db = SessionLocal()

    try:

        memberships = (
            db.query(ClassroomMember)
            .filter(ClassroomMember.user_id == current_user.id)
            .order_by(ClassroomMember.joined_at.desc())
            .all()
        )

        classrooms = []

        for member in memberships:

            classroom = (
                db.query(Classroom)
                .filter(Classroom.id == member.classroom_id)
                .first()
            )

            if not classroom:
                continue

            assignment_count = (
                db.query(Assignment)
                .filter(Assignment.classroom_id == classroom.id)
                .count()
            )

            student_count = None

            if member.role == "teacher":

                student_count = (
                    db.query(ClassroomMember)
                    .filter(
                        ClassroomMember.classroom_id == classroom.id,
                        ClassroomMember.role == "student",
                    )
                    .count()
                )

            classrooms.append(
                {
                    "classroom_id": classroom.id,
                    "class_code": classroom.class_code,
                    "name": classroom.name,
                    "subject": classroom.subject,
                    "role": member.role,
                    "member_id": member.id,
                    "member_token": member.token,
                    "display_name": member.display_name,
                    "assignment_count": assignment_count,
                    "student_count": student_count,
                }
            )

        return {"classrooms": classrooms}

    finally:
        db.close()


# ============================================================
# REQUEST LOGGING
# ============================================================

@app.middleware("http")
async def log_requests(
    request,
    call_next,
):

    print(
        f"REQUEST: "
        f"{request.method} "
        f"{request.url.path} "
        f"FROM: "
        f"{request.client.host}"
    )

    response = await call_next(
        request
    )

    return response


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