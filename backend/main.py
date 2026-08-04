from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import uuid

# Load environment variables
load_dotenv()

from services.llm_service import generate_amivi_content, generate_amico_comic
from services.image_service import generate_image
from services.voice_service import generate_voice
from services.video_service import create_amivi_video

app = FastAPI(
    title="AMIVI & AMICO API",
    description="Backend services for Visual Learning and Comic Generation",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # "https://comic-weld.vercel.app/",
        "https://comic-nine-iota.vercel.app",
        "https://comic-khaki.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Mount static files to serve generated media
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

class AmiviRequest(BaseModel):
    text: str

class AmicoRequest(BaseModel):
    homework_prompt: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the AMIVI & AMICO API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/amivi/generate")
async def generate_amivi(request: AmiviRequest):
    """
    AMIVI flow:
    1. Send text to LLM to get slides (text, image_prompt, voice_script).
    2. For each slide, generate image and audio.
    3. Generate the video.
    """
    try:
        if not os.getenv("GROQ_API_KEY"):
            raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set.")
            
        slides_data = generate_amivi_content(request.text)
        
        # Prepare slides for video service
        processed_slides = []
        video_id = str(uuid.uuid4())
        
        # Process each slide
        # (Note: This is sequential for simplicity, but could be parallelized)
        if 'slides' in slides_data:
            slides_list = slides_data['slides']
        else:
            slides_list = slides_data # Fallback if returned as a list directly
            
        for idx, slide in enumerate(slides_list):
            image_prompt = slide.get('image_prompt', '')
            voice_script = slide.get('voice_script', '')
            slide_text = slide.get('text', '')
            
            image_filename = f"{video_id}_slide_{idx}.png"
            audio_filename = f"{video_id}_slide_{idx}.wav"
            
            # Generate Media
            image_path = generate_image(image_prompt, image_filename)
            audio_path = generate_voice(voice_script, audio_filename)
            
            processed_slides.append({
                'image_path': image_path,
                'audio_path': audio_path,
                'text': slide_text
            })
            
        # Generate final video
        video_filename = f"{video_id}_final.mp4"
        create_amivi_video(processed_slides, video_filename)
        
        return {
            "status": "success",
            "video_url": f"/static/videos/{video_filename}",
            "slides": processed_slides
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/amico/generate")
async def generate_amico(request: AmicoRequest):
    """
    AMICO flow:
    1. Send homework to LLM to get comic script (panels).
    2. Generate an image for each panel based on image_prompt.
    """
    try:
        if not os.getenv("GROQ_API_KEY"):
            raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set.")
            
        comic_data = generate_amico_comic(request.homework_prompt)
        comic_id = str(uuid.uuid4())
        
        panels_list = comic_data.get('panels', [])
        
        processed_panels = []
        for idx, panel in enumerate(panels_list):
            image_prompt = panel.get('image_prompt', '')
            dialogue = panel.get('dialogue', '')
            
            image_filename = f"comic_{comic_id}_panel_{idx}.png"
            
            # Generate Image
            image_path = generate_image(image_prompt, image_filename)
            
            processed_panels.append({
                'panel_number': idx + 1,
                'image_url': f"/static/images/{image_filename}",
                'dialogue': dialogue
            })
            
        return {
            "status": "success",
            "comic_id": comic_id,
            "panels": processed_panels
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/amivi/generate_quiz")
async def generate_quiz(request: AmiviRequest):
    """
    AMIVI flow: Generate a quiz from text.
    """
    try:
        if not os.getenv("GROQ_API_KEY"):
            raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set.")
            
        from services.llm_service import generate_amivi_quiz
        quiz_data = generate_amivi_quiz(request.text)
        
        # Robustly extract the quiz regardless of whether the LLM nested it under a 'quiz' key
        final_quiz = quiz_data.get('quiz', {})
        if not final_quiz and 'title' in quiz_data and 'questions' in quiz_data:
            final_quiz = quiz_data
        
        return {
            "status": "success",
            "quiz": final_quiz
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
