from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, LargeBinary, JSON
from sqlalchemy.orm import declarative_base, sessionmaker
from openai import OpenAI
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips, TextClip, CompositeVideoClip
import os, sys, json, base64, tempfile, subprocess, platform
from datetime import datetime

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")

TERRA_MODEL = "gpt-5.6-terra"
SOL_MODEL = "gpt-5.6-sol"
LUNA_MODEL = "gpt-5.6-luna"
IMAGE_MODEL = "gpt-image-2"

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

Base = declarative_base()
engine = create_engine(DATABASE_URL, pool_pre_ping=True) if DATABASE_URL else None
SessionLocal = sessionmaker(bind=engine) if engine else None


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True)
    project_type = Column(String(50), nullable=False)
    title = Column(String(255))
    input_text = Column(Text)
    language = Column(String(10), default="en")
    data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)


class MediaAsset(Base):
    __tablename__ = "media_assets"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer)
    asset_type = Column(String(30), nullable=False)
    filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    data = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Comic(Base):
    __tablename__ = "comics"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer)
    title = Column(String(255))
    data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Quiz(Base):
    __tablename__ = "quizzes"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer)
    title = Column(String(255))
    data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


app = FastAPI(
    title="AMIVI & AMICO API",
    description="Backend for Visual Learning, Comic Generation",
    version="2.0.0",
)

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


@app.on_event("startup")
def startup():
    if not OPENAI_API_KEY:
        print("WARNING: OPENAI_API_KEY is not set.")
    if not DATABASE_URL:
        print("WARNING: DATABASE_URL is not set.")
    if engine:
        Base.metadata.create_all(bind=engine)
        print("PostgreSQL tables are ready.")


class AmiviRequest(BaseModel):
    text: str
    language: str = "en"


class AmicoRequest(BaseModel):
    homework_prompt: str
    language: str = "en"


def require_services():
    if not client:
        raise HTTPException(500, "OPENAI_API_KEY is not set.")
    if not SessionLocal:
        raise HTTPException(500, "DATABASE_URL is not set.")


def language_instruction(language: str) -> str:
    if language == "es":
        return "Generate ALL output in natural, child-friendly Spanish. Do not mix English and Spanish."
    return "Generate all output in English."


def call_json_model(model: str, instructions: str, user_input: str) -> dict:
    require_services()
    response = client.responses.create(
        model=model,
        instructions=instructions,
        input=user_input,
    )
    raw = response.output_text.strip().replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise Exception(f"{model} returned invalid JSON: {exc}; output={raw[:1000]}")


def save_project(project_type, title, input_text, language, data):
    db = SessionLocal()
    try:
        row = Project(project_type=project_type, title=title, input_text=input_text, language=language, data=data)
        db.add(row); db.commit(); db.refresh(row)
        return row.id
    finally:
        db.close()


def save_media(data: bytes, filename: str, mime_type: str, asset_type: str, project_id=None):
    db = SessionLocal()
    try:
        row = MediaAsset(project_id=project_id, asset_type=asset_type, filename=filename, mime_type=mime_type, data=data)
        db.add(row); db.commit(); db.refresh(row)
        return row.id
    finally:
        db.close()


def save_comic(project_id, title, data):
    db = SessionLocal()
    try:
        row = Comic(project_id=project_id, title=title, data=data)
        db.add(row); db.commit(); db.refresh(row)
        return row.id
    finally:
        db.close()


def save_quiz(project_id, title, data):
    db = SessionLocal()
    try:
        row = Quiz(project_id=project_id, title=title, data=data)
        db.add(row); db.commit(); db.refresh(row)
        return row.id
    finally:
        db.close()


def get_media(media_id: int):
    db = SessionLocal()
    try:
        row = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
        if not row:
            raise HTTPException(404, "Media not found.")
        return row
    finally:
        db.close()


def generate_amivi_content(text_input, language="en"):
    prompt = f"""
You are AMIVI's educational AI engine. Turn the material into 5-7 bite-sized visual learning slides.
Each slide must contain: slide_number, text (max 10 words), slogan, image_prompt, voice_script (max 2 sentences).
Return ONLY JSON in this form:
{{"slides":[{{"slide_number":1,"text":"...","slogan":"...","image_prompt":"...","voice_script":"..."}}]}}
{language_instruction(language)}
"""
    return call_json_model(TERRA_MODEL, prompt, text_input)


def generate_amico_comic(topic, language="en"):
    prompt = f"""
You are AMICO's storytelling engine. Create a connected 4-panel educational comic.
Return ONLY JSON with title, learning_objective, characters and panels.
Each panel needs panel_number, scene, image_prompt and dialogue.
{language_instruction(language)}
"""
    return call_json_model(TERRA_MODEL, prompt, topic)


def review_amico_comic(comic, language="en"):
    prompt = f"""
You are AMICO quality control. Review and correct educational accuracy, story continuity,
character consistency, panel continuity, dialogue and image-prompt consistency.
Return the COMPLETE corrected comic as JSON using the same structure.
{language_instruction(language)}
"""
    return call_json_model(SOL_MODEL, prompt, json.dumps(comic, ensure_ascii=False))


def generate_amivi_quiz(text_input, language="en"):
    prompt = f"""
Create a 5-question multiple-choice quiz strictly from the supplied material.
Each question needs q, exactly 4 options, correct (0-3), and explanation.
Return ONLY JSON: {{"quiz":{{"title":"...","questions":[...]}}}}
{language_instruction(language)}
"""
    return call_json_model(TERRA_MODEL, prompt, text_input)


def generate_quiz_metadata(quiz, language="en"):
    prompt = f"""
You are AMIVI's lightweight metadata engine. Do not change quiz questions or answers.
Return ONLY JSON with category, difficulty (easy|medium|hard), tags and language.
{language_instruction(language)}
"""
    return call_json_model(LUNA_MODEL, prompt, json.dumps(quiz, ensure_ascii=False))


def generate_image(prompt, filename, project_id=None):
    require_services()
    result = client.images.generate(model=IMAGE_MODEL, prompt=prompt or "Educational illustration", size="1024x1024")
    if not result.data or not result.data[0].b64_json:
        raise Exception("OpenAI returned no image data.")
    data = base64.b64decode(result.data[0].b64_json)
    return save_media(data, filename, "image/png", "image", project_id)


def generate_voice(text, filename, language="en", project_id=None):
    piper_exec = "piper.exe" if platform.system() == "Windows" else "piper"
    piper_path = os.path.join(os.path.dirname(__file__), "piper", piper_exec)
    if not os.path.exists(piper_path):
        piper_path = piper_exec
    model_name = "es_ES-sharvard-medium.onnx" if language == "es" else "en_US-lessac-medium.onnx"
    model_path = os.path.join(os.path.dirname(__file__), "piper", model_name)
    if not os.path.exists(model_path):
        raise Exception(f"Piper model not found: {model_path}")
    temp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            temp_path = f.name
        subprocess.run([piper_path, "--model", model_path, "--output_file", temp_path], input=text.encode("utf-8"), check=True)
        with open(temp_path, "rb") as f:
            data = f.read()
        return save_media(data, filename, "audio/wav", "audio", project_id)
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


def create_amivi_video(slides, filename, project_id=None):
    clips, temp_paths = [], []
    output_path = None
    try:
        for slide in slides:
            image = get_media(slide["image_id"])
            audio = get_media(slide["audio_id"])
            img_file = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
            img_file.write(image.data); img_file.close()
            aud_file = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
            aud_file.write(audio.data); aud_file.close()
            temp_paths += [img_file.name, aud_file.name]
            audio_clip = AudioFileClip(aud_file.name)
            duration = audio_clip.duration
            img_clip = ImageClip(img_file.name).set_duration(duration)
            try:
                txt = TextClip(slide.get("text", ""), fontsize=70, color="white", bg_color="black", size=(img_clip.w, None), method="caption").set_pos("bottom").set_duration(duration)
                clip = CompositeVideoClip([img_clip, txt])
            except Exception:
                clip = img_clip
            clip = clip.set_audio(audio_clip)
            clips.append(clip)
        if not clips:
            raise Exception("No valid clips generated.")
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
            output_path = f.name
        final = concatenate_videoclips(clips, method="compose")
        final.write_videofile(output_path, fps=24, codec="libx264", audio_codec="aac", preset="ultrafast", threads=4, logger=None)
        with open(output_path, "rb") as f:
            data = f.read()
        return save_media(data, filename, "video/mp4", "video", project_id)
    finally:
        for clip in clips:
            try: clip.close()
            except Exception: pass
        for path in temp_paths:
            if os.path.exists(path): os.remove(path)
        if output_path and os.path.exists(output_path): os.remove(output_path)


@app.get("/")
def root():
    return {"message": "Welcome to the AMIVI & AMICO API"}


@app.get("/health")
def health():
    return {"status": "ok", "openai_configured": bool(OPENAI_API_KEY), "database_configured": bool(DATABASE_URL)}


@app.post("/api/amivi/generate")
async def amivi_generate(request: AmiviRequest):
    try:
        require_services()
        content = generate_amivi_content(request.text, request.language)
        project_id = save_project("amivi", "AMIVI Visual Learning", request.text, request.language, content)
        processed = []
        for i, slide in enumerate(content.get("slides", [])):
            image_id = generate_image(slide.get("image_prompt", ""), f"amivi_{project_id}_{i}.png", project_id)
            audio_id = generate_voice(slide.get("voice_script", ""), f"amivi_{project_id}_{i}.wav", request.language, project_id)
            processed.append({"slide_number": slide.get("slide_number", i + 1), "text": slide.get("text", ""), "slogan": slide.get("slogan", ""), "image_id": image_id, "image_url": f"/api/media/{image_id}", "audio_id": audio_id, "audio_url": f"/api/media/{audio_id}"})
        video_id = create_amivi_video(processed, f"amivi_{project_id}.mp4", project_id)
        return {"status": "success", "project_id": project_id, "video_id": video_id, "video_url": f"/api/media/{video_id}", "slides": processed}
    except HTTPException: raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(500, str(e))


@app.post("/api/amico/generate")
async def amico_generate(request: AmicoRequest):
    try:
        require_services()
        comic = review_amico_comic(generate_amico_comic(request.homework_prompt, request.language), request.language)
        project_id = save_project("amico", comic.get("title", "AMICO Comic"), request.homework_prompt, request.language, comic)
        panels = []
        for i, panel in enumerate(comic.get("panels", [])):
            image_id = generate_image(panel.get("image_prompt", ""), f"comic_{project_id}_{i}.png", project_id)
            panels.append({"panel_number": i + 1, "scene": panel.get("scene", ""), "dialogue": panel.get("dialogue", ""), "image_id": image_id, "image_url": f"/api/media/{image_id}"})
        comic["panels"] = panels
        dbid = save_comic(project_id, comic.get("title", "AMICO Comic"), comic)
        return {"status": "success", "project_id": project_id, "comic_id": dbid, **{k: comic.get(k) for k in ["title", "learning_objective", "characters", "panels"]}}
    except HTTPException: raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(500, str(e))


@app.post("/api/amivi/generate_quiz")
async def generate_quiz(request: AmiviRequest):
    try:
        require_services()
        result = generate_amivi_quiz(request.text, request.language)
        quiz = result.get("quiz", result)
        quiz["metadata"] = generate_quiz_metadata(quiz, request.language)
        project_id = save_project("quiz", quiz.get("title", "AMIVI Quiz"), request.text, request.language, quiz)
        quiz_id = save_quiz(project_id, quiz.get("title", "AMIVI Quiz"), quiz)
        return {"status": "success", "project_id": project_id, "quiz_id": quiz_id, "quiz": quiz}
    except HTTPException: raise
    except Exception as e:
        import traceback; traceback.print_exc()
        raise HTTPException(500, str(e))


@app.get("/api/media/{media_id}")
def media(media_id: int):
    asset = get_media(media_id)
    return Response(content=asset.data, media_type=asset.mime_type, headers={"Content-Disposition": f'inline; filename="{asset.filename}"'})


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=False)

#test
@app.middleware("http")
async def log_requests(request, call_next):
    print(
        f"REQUEST: {request.method} {request.url.path} "
        f"FROM: {request.client.host}"
    )

    response = await call_next(request)
    return response