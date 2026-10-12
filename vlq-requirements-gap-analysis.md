# VLQ Product Definition — Requirements Extraction & Platform Gap Analysis

**Source document:** `VLQ - Product Definitions.pdf` (20-page vision/pitch deck, prepared by Amit Chaudhuri, founder)
**Compared against:** the live VLQ codebase at `~/Documents/GitHub/comic` (React/Vite frontend + FastAPI/PostgreSQL backend)
**Date:** October 9, 2026

A note on the source: this deck is an investor/vision presentation, not a technical spec. It states outcomes and concepts (infographics, comic-style explainer panels, marketing framing like "The Super-Boon of Digitalisation + AI") rather than itemized feature requirements. The list below is reconstructed from what the deck visually and textually implies the product should do.

---

## 1. Requirements extracted from the deck

### A. Core AI content engines
- **AMIVI** ("Visual Synthesis Engine") — ingest a subject/source material, break it into "micro-bits/chunks," and instantly generate simple visuals (diagrams, images) with a short slogan per chunk, plus narration/video.
- **AMICO** ("Story-telling Engine") — turn learned material into a personalized multi-panel comic ("mastery through teaching"); also a homework generator.
- Quiz/assessment generation tied to the same material, feeding "Interactive Learning Activities" and homework.
- Multi-format source input: typed text, a "text-extraction scanner" (OCR of physical/scanned material), and "video content curation," feeding a single ingestion pipeline ("Step 1: Initial Data Collection & Preparation").
- Multi-lingual support, explicitly called out for AMIVI/AMICO ("built with universal accessibility in mind — multi-lingual").

### B. "Visual Pursuit" (also shown as "VisuO Pursuit") — gamified learning board game
- A board-game-style gamification layer, including flashcards and an "electronic version" of the game.

### C. Essential platform tools
- Note taking (digital notes — "easy capture, search, and organization").
- A persistent "Visuals Database" / lifelong Library of everything generated.
- Learner & educator tools (classroom/teacher/student/parent flows).
- Homework & quiz generation (covered under A).
- "Smart Analytics" (progress, strengths/weaknesses, intervention signals).
- A "Learners Club."
- Subject-rich curriculum selection spanning K-12 and university subjects, browsable by topic (a topic web shows History, Math, Science, Art, Reading, Literature, Music, Coding).

### D. Collaboration
- Group work and peer feedback, shared/collaborative learning spaces.

### E. Gamification & motivation
- Leaderboards, achievement rewards, badges/medals for progress.

### F. Career readiness track
- Tracking of Leadership, Critical Thinking, and Digital Fluency, with "checkpoints" and "measurable progress" toward being "career ready."

### G. "AI Assistants" as a platform-level component
- The deck positions "AI Assistants" as a top-level core component, distinct from (above) the AMIVI/AMICO generators — implying some form of general AI assistant, not just one-shot content generation.

### H. Business model
- "Low Accessibility Costs: Affordable, subscription-based, accessible for all" — implies a real subscription/billing system.

### I. Personalization
- "Personalized Teaching: Adaptive pace and content tailored for each individual" — implies some adaptive-difficulty or personalization logic driven by learner history.

---

## 2. Gap analysis: Implemented / Partial / Missing

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 1 | AMIVI (text-to-visual microbits, image + slogan + narration, text/video input, multi-language) | **Implemented** | `generate_amivi_content` / `amivi_generate` in `backend/main.py`; `Amivi.jsx` |
| 2 | AMICO (comic/story generator + homework generator) | **Implemented** | `generate_amico_comic` / `amico_generate`; `Amico.jsx` |
| 3 | AMICO Photo Story (comic from an uploaded photo) | **Implemented** | `amico_photostory` call site; `generateAmicoPhotoStory` in `api.js` |
| 4 | Quiz generation (topic or material/file-based, with per-question images + explanation videos) | **Implemented** | `generate_quiz_from_source` / `quiz_generate`; `Quiz.jsx`, `QuizDecks.jsx` |
| 5 | Library / "Visuals Database" (every saved AMIVI/AMICO/Quiz project, lifelong) | **Implemented** | `Library.jsx`, `/api/library` |
| 6 | Subject-rich curriculum browsing (K-12 & university subjects, topic-based) | **Implemented** | `Courses.jsx` "Essential Learning" (Subject → Chapter → Chapter hub), shipped this session |
| 7 | Multi-lingual support | **Implemented** | `language` param threaded through every generator; real `LanguageContext` in `Settings.jsx` |
| 8 | Classroom / teacher-student-parent flows, assignments, results | **Implemented** | Full backend endpoint set (create/join classroom, assignments, parent/teacher/student codes, history); `Classroom.jsx`, `Dashboard.jsx` |
| 9 | Collaborative learning rooms (group work, shared material, group quiz, chat) | **Implemented** (as `Collaborate.jsx`) | Real `/api/rooms*` endpoints backed by `LearningRoom`/`RoomMember`/`RoomMessage`; chat is polling-based, not websocket. **Note:** `CollaborativeLearning.jsx` is a separate, unused/orphaned file not wired into any route — dead code, not a second feature. |
| 10 | "Visual Pursuit" gamified board game + flashcards + electronic version | **Missing** | Only the brand name appears as marketing copy on the Gamification/Explore pages; no board game, no flashcard component, no electronic-version concept anywhere in frontend or backend |
| 11 | Digital note-taking (capture/search/organize notes) | **Missing** | No Notes page, component, model, or endpoint exists anywhere |
| 12 | Gamification (leaderboards, badges, points, levels, challenges) | **Partial — UI mock only** | `Gamification.jsx` is fully hardcoded (the file's own comment admits "mock data... until live progress is wired in"); zero backend support (no badge/leaderboard/streak/points/xp tables or endpoints) |
| 13 | Smart Analytics (progress, strengths/weaknesses, interventions) | **Partial — UI mock only** | `Analytics.jsx` is built entirely on hardcoded constants; "intervention" buttons just call `alert(...)`; no backend analytics endpoint exists |
| 14 | "Learners Club" | **Missing** | No trace anywhere in frontend or backend |
| 15 | Career skills tracking (Leadership / Critical Thinking / Digital Fluency / checkpoints / measurable progress) | **Missing** | Only generic marketing copy on the `HowWeDoIt.jsx` page ("Build skills. Earn credentials. Advance careers."); no tracking mechanism or data model |
| 16 | AI Assistants as a conversational/chat tutor (distinct from AMIVI/AMICO's one-shot generation) | **Missing** | No chat/assistant UI anywhere; the only "chat" references in the backend are content-moderation prompt text inside AMIVI's generation instructions, unrelated to a real feature |
| 17 | Subscription / billing | **Partial — marketing page only** | `Plans.jsx`'s own header comment: *"No billing provider is wired up yet... Swap that TODO... for real checkout / a payment provider (Stripe, etc.) once billing is built."* "Contact Us" is inert; the Pro plan button just routes to `/register`. No billing code anywhere in the backend |
| 18 | Text-extraction scanner / OCR + varied content inputs feeding AMIVI specifically | **Partial — and currently broken** | AMIVI's request schema only accepts typed text, a video URL, or a `source_project_id` — no file field. **However, `Amivi.jsx`'s UI already has an "Upload a PDF, Word document or TXT file" button that POSTs to `/api/amivi/extract` — a route that does not exist in the backend at all, so that button currently 404s.** OCR/text-extraction (`extract_text_from_file`) is fully implemented, but only wired into Quiz's file-upload path, not AMIVI's |
| 19 | Personalized / adaptive pacing | **Missing** | No adaptive-difficulty, spaced-repetition, or per-learner personalization logic anywhere; content generation is identical regardless of a learner's history. The only hits are marketing phrases in `Tutorials.jsx` ("Reinforce learning with spaced-repetition quizzes") with no logic behind them |

### Other pages checked (not explicit deck requirements, but part of the current app)
| Page | Status |
|---|---|
| `Dashboard.jsx` | Implemented — real, branches teacher vs. student view off live classroom data |
| `Admin.jsx` | Missing/stub — hardcoded fake stats and activity table, no backend admin endpoint |
| `Tutorials.jsx` | Partial — hardcoded tutorial-card content describing real features, no actual video backend |
| `Introduction.jsx`, `HowWeDoIt.jsx` | Static marketing content pages, not functional features |
| `Video.jsx` | Missing/stub — hardcoded placeholder video ("Chapter 4: Quantum Mechanics"), not connected to real generated content |
| `Profile.jsx` | Missing/stub — hardcoded name and a hardcoded "Pro Plan" badge, no edit functionality |
| `Settings.jsx` | Partial — language selector is real; notification toggles and "Delete Account Data" are inert UI only |
| `CoreEcosystems.jsx` | Not routed at all — its own header comment says "not yet wired into navigation/routes" |

---

## 3. Summary

**Solidly built and matching the deck:** the two headline inventions — AMIVI and AMICO — along with Quiz generation, the Library, multi-language support, Classroom/teacher-student-parent flows, and the Collaborative Learning rooms are all real, working, backend-integrated features. The newly built "Essential Learning" Subject → Chapter browsing (this session) also directly matches the deck's "subject-rich curriculum selection" concept.

**Marketing surface without substance:** Gamification, Smart Analytics, and the subscription/Plans page all exist as polished frontend pages but run entirely on hardcoded mock data — none of the three have a backend behind them yet. These are the fastest wins if the goal is to make the deck's claims true, since the UI shells already exist.

**Not started at all:** the "Visual Pursuit" board game/flashcards concept, digital note-taking, a "Learners Club," career-skills tracking, a conversational AI assistant, and adaptive/personalized pacing. These are the largest net-new builds implied by the deck.

**A bug worth fixing regardless of roadmap priority:** AMIVI's own file-upload button is live in the UI but points at a backend route that doesn't exist (`/api/amivi/extract`), so uploading a PDF/Word/TXT file to AMIVI currently fails silently with a 404. Quiz already has working OCR/text-extraction (`extract_text_from_file`) — wiring that same function into AMIVI's generate endpoint would both fix the dead button and deliver the deck's "text-extraction scanner" requirement for AMIVI in one small change.
