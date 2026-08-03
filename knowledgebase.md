# VLQ Platform: Knowledge Base

Welcome to the knowledge base for the **VLQ (Visual Learning Platform)**, featuring the core products **AMIVI** and **AMICO**.

## 1. Project Overview

The VLQ Platform is designed to transform traditional, text-heavy learning into engaging, visual, and interactive experiences. The platform comprises two main AI-driven tools:

### AMIVI (Amit's Visuals)
- **Purpose**: An AI-driven Visual Synthesis Engine.
- **Function**: Breaks down live teaching or lengthy texts into "micro-bits" or chunks. It instantly generates simple, impactful visuals (diagrams, maps, charts) and narrated videos that represent core concepts.
- **Goal**: Accelerate learning speed, lower cognitive load, and boost memory retention by prioritizing visual content over textual content.

### AMICO (Amit's Comics)
- **Purpose**: A Creative Reporting Module and Storytelling Engine.
- **Function**: Synthesizes what learners have studied (like homework or assignments) into personalized, multi-panel comic strips. 
- **Goal**: Applies the "mastery through teaching" approach, cementing long-term memory while providing a fun, shareable, and interactive output.

---

## 2. Architecture & Technology Stack

The platform uses a split, modern architecture to separate AI processing from the user interface.

### Backend (Python & FastAPI)
Located in the `backend/` directory, this server handles heavy processing, media generation, and AI API integrations.
- **Web Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Chosen for fast asynchronous execution).
- **LLM Engine**: **Groq API** (using models like Llama3) for rapid text summarization and script generation.
- **Image Engine**: **Pollinations.ai / Hugging Face Inference API** (Free, fast image synthesis).
- **Voice Engine**: **Piper TTS** (Self-hosted, offline text-to-speech engine).
- **Video Engine**: **MoviePy** / FFmpeg (Programmatic video editing to stitch images and audio into mp4 slides).

### Frontend (React, Vite, & Tailwind CSS)
Located in the `frontend/` directory, this provides the interactive UI for the learners.
- **Framework**: React via Vite.
- **Styling**: Tailwind CSS, utilizing a dark-themed, visually rich aesthetic to align with the "Speed of Sight" learning methodology.

---

## 3. The Visual Learning Methodology

The platform is built on the premise that:
> *"The human brain processes images 60,000 times faster than words!"*

### Why Traditional Methods Fail (The Learning Trap):
1. **Poor Retention**: Listening is the primary, yet least effective, teaching method (90% forgotten within a week).
2. **One-Size-Fits-All**: Results in low engagement.
3. **Slow Learning Speed**: Lengthy texts without visuals impede learning.

### The VLQ Solution (Learn at the Speed of Sight):
1. **See It**: Quick visuals grab attention.
2. **Understand It**: Clear visuals simplify complex ideas.
3. **Remember It**: Visual patterns lock in knowledge.
4. **Apply It**: Use learned confidence in real life.
5. **Master It**: Reinforce and revisit.

---

## 4. Gamification (Future Scope)

Future iterations of the platform will integrate gamified elements:
- **Learn, Play, Earn, Grow**: Points, badges, leaderboards, and real-world rewards.
- **Board Games**: Integrating digital quizzes with physical board games like *Visual Pursuit*.
- **Collaborative Digital Library**: A centralized hub to create quizzes, share with friends, and collaborate on projects.

## 5. Development Setup Guide
Please refer to the `walkthrough.md` in the project artifacts or the setup sections in the respective backend/frontend `README.md` files to get the servers running locally.

---

## 6. Project Status (What is Done vs. Remaining)

### ✅ What is Done (Phase 1)
- **Backend Infrastructure**: Python FastAPI environment set up with robust dependency management.
- **LLM Engine (`llm_service.py`)**: Groq API integrated for fast script and micro-bit generation (AMIVI & AMICO logic).
- **Image Engine (`image_service.py`)**: Pollinations.ai integration complete for rapid, free image synthesis.
- **Voice Engine (`voice_service.py`)**: Piper TTS wrapper integrated for local audio generation.
- **Video Engine (`video_service.py`)**: MoviePy integration complete for stitching slides into `.mp4` video modules.
- **API Endpoints**: `/api/amivi/generate` and `/api/amico/generate` are fully operational.
- **Frontend Architecture**: React + Vite + Tailwind CSS initialized.
- **AMIVI Dashboard UI**: Modern dark-themed dashboard built to input text and view generated video and slide breakdowns.
- **AMICO Studio UI**: Interactive dashboard built to input homework prompts and view the resulting comic strip panels with speech bubbles.
- **Full Integration**: Frontend successfully hooked up to the FastAPI backend endpoints.

### 🚧 What is Remaining (Future Phases)
- **Quizzes Module for AMIVI**: Extending the LLM engine to generate multi-choice quizzes based on the text chunks.
- **Gamification Mechanics**: Adding User profiles, points, leaderboards, and streak tracking.
- **Collaborative Digital Library**: Building the database (e.g., PostgreSQL or MongoDB) and UI for learners to save, tag, and share generated modules with friends.
- **Board Game UI**: Creating the electronic quiz interfaces for "Visual Pursuit".
- **Production Polish**: 
  - Advanced error handling in the frontend (handling missing TTS engines gracefully).
  - Adding Dockerfiles for easy deployment.
  - Adding user authentication.
