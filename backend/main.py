from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import sys
import uuid
import json
import requests
import urllib.parse
import time
import random
import subprocess
import platform
from groq import Groq
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips, TextClip, CompositeVideoClip

# Load environment variables
load_dotenv()

# Ensure piper is installed on startup to avoid deployment issues
piper_dir = os.path.join(os.path.dirname(__file__), "piper")
piper_exe = os.path.join(piper_dir, "piper") if sys.platform != "win32" else os.path.join(piper_dir, "piper.exe")
if not os.path.exists(piper_exe):
    print("Piper not found on startup. Installing it now...")
    try:
        from install_piper import install_piper
        install_piper()
    except Exception as e:
        print(f"Failed to install piper on startup: {e}")

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI(
    title="AMIVI & AMICO API",
    description="Backend services for Visual Learning and Comic Generation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files to serve generated media
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

class AmiviRequest(BaseModel):
    text: str

class AmicoRequest(BaseModel):
    homework_prompt: str

# ----------------- Service Functions -----------------

def generate_amivi_content(text_input: str) -> dict:
    system_prompt = (
        "You are an educational AI assistant for AMIVI. Break down the provided educational text into "
        "5 to 7 bite-sized visual chunks (slides). Respond ONLY in valid JSON format containing a single key 'slides' "
        "which is a list of objects. "
        "Each object should have: 'slide_number', 'text' (a concise bullet point, max 10 words), "
        "'image_prompt' (a detailed prompt to generate an image for this slide), and "
        "'voice_script' (what the narrator should say for this slide, max 2 sentences)."
    )
    
    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text_input}
        ],
        model="openai/gpt-oss-120b",
        response_format={"type": "json_object"},
        temperature=0.5,
    )
    return json.loads(response.choices[0].message.content)

def generate_amico_comic(homework_prompt: str) -> dict:
    system_prompt = (
        "You are a creative storyteller for AMICO. Transform the user's homework topic into a "
        "fun, educational 4-panel comic strip script. Respond ONLY in valid JSON format containing a key 'panels' "
        "which is a list of 4 objects. Each object should have: 'panel_number', 'image_prompt' "
        "(detailed visual description of the comic panel), and 'dialogue' (what characters are saying)."
    )
    
    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": homework_prompt}
        ],
        model="openai/gpt-oss-120b",
        response_format={"type": "json_object"},
        temperature=0.7,
    )
    return json.loads(response.choices[0].message.content)

def generate_amivi_quiz(text_input: str) -> dict:
    system_prompt = (
        "You are an educational AI assistant for AMIVI. Create a 5-question multiple-choice quiz based on the provided text. "
        "Respond ONLY in valid JSON format containing a single key 'quiz' which is an object. "
        "The 'quiz' object should have a 'title' (string) and a 'questions' (list of objects) key. "
        "Each object in the 'questions' list should have: "
        "'q' (the question string), 'options' (a list of 4 possible answers), "
        "'correct' (the integer index 0-3 of the correct option), and "
        "'explanation' (a brief explanation of why the answer is correct)."
    )
    
    response = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": text_input}
        ],
        model="openai/gpt-oss-120b",
        response_format={"type": "json_object"},
        temperature=0.7,
    )
    return json.loads(response.choices[0].message.content)

def generate_image(prompt: str, filename: str) -> str:
    short_prompt = prompt[:200] if prompt else "educational illustration"
    encoded_prompt = urllib.parse.quote(short_prompt)
    seed = random.randint(1, 100000)
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true&seed={seed}"
    max_retries = 3
    for attempt in range(max_retries):
        try:
            if attempt > 0:
                print(f"Retry attempt {attempt} for image: {filename}")
                time.sleep(5)
            response = requests.get(url, timeout=60)
            if response.status_code == 200 and 'image' in response.headers.get('content-type', ''):
                output_dir = os.path.join(os.path.dirname(__file__), "static", "images")
                os.makedirs(output_dir, exist_ok=True)
                file_path = os.path.join(output_dir, filename)
                with open(file_path, 'wb') as f:
                    f.write(response.content)
                return file_path
            elif response.status_code == 429:
                print("Pollinations API rate limited. Retrying...")
                continue
            else:
                print(f"Pollinations returned invalid data. Status: {response.status_code}")
        except Exception as e:
            print(f"Warning: Image generation failed or timed out: {e}")
            
    print("All image generation retries failed. Using fallback blank image.")
    try:
        from PIL import Image
        output_dir = os.path.join(os.path.dirname(__file__), "static", "images")
        os.makedirs(output_dir, exist_ok=True)
        file_path = os.path.join(output_dir, filename)
        img = Image.new('RGB', (1024, 1024), color=(40, 40, 40))
        img.save(file_path)
        return file_path
    except:
        raise Exception("Failed to generate image and fallback failed.")

def generate_voice(text: str, filename: str) -> str:
    output_dir = os.path.join(os.path.dirname(__file__), "static", "audio")
    os.makedirs(output_dir, exist_ok=True)
    file_path = os.path.join(output_dir, filename)
    piper_exec = "piper.exe" if platform.system() == "Windows" else "piper"
    piper_path = os.path.join(os.path.dirname(__file__), "piper", piper_exec)
    model_path = os.path.join(os.path.dirname(__file__), "piper", "en_US-lessac-medium.onnx")
    
    if not os.path.exists(piper_path):
        piper_path = piper_exec
        
    try:
        command = f'echo "{text}" | {piper_path} --model {model_path} --output_file {file_path}'
        subprocess.run(command, shell=True, check=True)
        return file_path
    except subprocess.CalledProcessError as e:
        print(f"Failed to generate voice. Is Piper TTS installed? Error: {e}")
        with open(file_path, "wb") as f:
            pass
        return file_path

def create_amivi_video(slides: list, output_filename: str) -> str:
    output_dir = os.path.join(os.path.dirname(__file__), "static", "videos")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, output_filename)
    clips = []
    for slide in slides:
        image_path = slide.get('image_path')
        audio_path = slide.get('audio_path')
        text = slide.get('text', '')
        
        duration = 3
        audio_clip = None
        if audio_path and os.path.exists(audio_path) and os.path.getsize(audio_path) > 0:
            try:
                audio_clip = AudioFileClip(audio_path)
                duration = audio_clip.duration
            except Exception as e:
                print(f"Warning: Could not load audio {audio_path}: {e}")
        
        if image_path and os.path.exists(image_path):
            img_clip = ImageClip(image_path).set_duration(duration)
            try:
                txt_clip = TextClip(text, fontsize=70, color='white', bg_color='black', size=(img_clip.w, None), method='caption')
                txt_clip = txt_clip.set_pos('bottom').set_duration(duration)
                video_clip = CompositeVideoClip([img_clip, txt_clip])
            except Exception as e:
                print(f"Warning: Could not create TextClip (ImageMagick might be missing): {e}")
                video_clip = img_clip
                
            if audio_clip:
                video_clip = video_clip.set_audio(audio_clip)
            clips.append(video_clip)
            
    if not clips:
        raise Exception("No valid clips generated for the video.")
        
    final_video = concatenate_videoclips(clips, method="compose")
    final_video.write_videofile(output_path, fps=24, codec="libx264", audio_codec="aac", preset="ultrafast", threads=4)
    return output_path


# ----------------- API Endpoints -----------------

@app.get("/")
def read_root():
    return {"message": "Welcome to the AMIVI & AMICO API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/amivi/generate")
async def generate_amivi(request: AmiviRequest):
    try:
        if not os.getenv("GROQ_API_KEY"):
            raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set.")
            
        slides_data = generate_amivi_content(request.text)
        
        processed_slides = []
        video_id = str(uuid.uuid4())
        
        if 'slides' in slides_data:
            slides_list = slides_data['slides']
        else:
            slides_list = slides_data 
            
        for idx, slide in enumerate(slides_list):
            image_prompt = slide.get('image_prompt', '')
            voice_script = slide.get('voice_script', '')
            slide_text = slide.get('text', '')
            
            image_filename = f"{video_id}_slide_{idx}.png"
            audio_filename = f"{video_id}_slide_{idx}.wav"
            
            image_path = generate_image(image_prompt, image_filename)
            audio_path = generate_voice(voice_script, audio_filename)
            
            processed_slides.append({
                'image_path': image_path,
                'audio_path': audio_path,
                'text': slide_text
            })
            
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
    try:
        if not os.getenv("GROQ_API_KEY"):
            raise HTTPException(status_code=500, detail="GROQ_API_KEY is not set.")
            
        quiz_data = generate_amivi_quiz(request.text)
        
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
