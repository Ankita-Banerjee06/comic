# VLQ MVP Walkthrough & Readiness Audit
**Bridge Building lesson — Teacher and Learner journeys**

This is a code-level walkthrough of both demos you asked for, using the real screen and button labels in your current `comic` repo. I traced every step through the actual frontend/backend logic rather than guessing, and I flag two steps that are **not yet functional** as you described them — they need a fix before you can demo them honestly, let alone finalize the MVP.

A note on method: I can't click or type inside your browser from here — the remote-access tier I'm given for browsers is view-only. So this document is a precise trace of the code (every screen, button, and API call named below is copied from the actual files), not a guess. Where I flag something as unverified live (mainly the EXPLAIN slide-count question from earlier), I'm ready to do a real-time walkthrough with you right now: you click, I take a screenshot after each step and tell you what I see. Say the word and we'll start.

---

## DEMO 1 — TEACHER: Presenting a Classroom Lesson

### 1. Teacher logs in and retrieves the lesson from the Digital Library
**Status: ✅ Works**

- Teacher clicks **Log in** in the top navbar, signs in with email + password (this is the main account system — `AuthContext`, registered with `role: "teacher"`).
- Lands on **Dashboard**, clicks **Library** in the nav.
- Library page shows a **"Search your library..."** box and type filter chips (All / AMIVI / AMICO / Quiz). Typing "Bridge" finds the **Bridge Building** AMIVI card.
- Clicking it opens the saved project via `GET /api/library/{id}` — this reads the already-generated data back out; it does **not** call any AI-generation endpoint, so nothing is regenerated or re-billed.

### 2 & 3. INTRODUCE Classroom Mode — one Microbit at a time, forward/backward
**Status: ✅ Works (confirmed from code), live slide count still open**

- From the opened AMIVI project, the teacher enters Classroom/Presentation mode. The slide list is built as `const total = result.chunks.length` — it is **not** hardcoded to 6 or any fixed number; it always equals however many Microbits are actually saved for that lesson.
- **Next** / **Previous** are implemented as clamped index moves (`presentNext` / `presentPrev`), so they can never walk past the first or last saved slide — there's no scenario in the code where Next silently generates new content.
- Open item: you reported seeing 6 slides in INTRODUCE but 9 in EXPLAIN for the same lesson on different days. Since both screens read `chunks.length` from the same saved project, a difference means the underlying saved chunk count for that project actually changed between those sessions (e.g., more Microbits were added later) — it is not a bug in the navigation logic itself. I can't confirm the current live count without either DB access or watching your screen; this is the one item worth doing live.

### 4. Switch to EXPLAIN, present images with descriptions
**Status: ✅ Works**

- Same screen, a mode toggle switches from INTRODUCE to **EXPLAIN** (Box 2). It reads the identical saved `chunks` array — just renders the description/explanation field instead of the slogan — so switching modes mid-lesson does not reload or regenerate anything.
- Counter and Next/Previous use the same clamped-index logic as INTRODUCE.

### 5. Finish presentation, return to Library without losing or regenerating material
**Status: ✅ Works**

- **Exit/close** on the presentation screen is `closePresentMode = () => setPresentMode(null)` — a pure local state change. It makes **zero** network calls, so there is nothing to lose and nothing that could trigger regeneration.
- Returning to Library and reopening the same project re-reads it from `GET /api/library/{id}` exactly as in Step 1 — same saved panels, same saved images.

### 6. Teacher assigns homework, using the images and other data
**Status: ❌ Not functional as you described it — confirmed gap**

This is the one I want to be very direct about rather than stage a fake demo.

- Assigning homework lives in **Classroom → Assign new homework** (teacher view). That form is: a blank **"Learning material"** textbox, plus three chips — **Quiz** (required), **AMIVI Visuals**, **AMICO Comic**.
- Each chip's only behavior is: take whatever text is currently in that blank textbox and call the AI generator fresh (`generateQuiz`, `generateAmivi`, `generateAmico`) to build a brand-new project from scratch.
- There is **no control anywhere on this screen to pick an existing Library project** — not Bridge Building, not anything else. To "assign homework using the images and other data" from the already-made Bridge Building lesson, a teacher would have to re-paste the original material and regenerate a new AMIVI/AMICO/quiz, which may not even come out identical to the original, and burns a fresh AI generation for content you already paid to generate once.
- This directly contradicts the "don't force regeneration" principle you've had me build toward all session for AMIVI/AMICO/Quiz — it just hasn't been applied to the homework-assignment screen yet.
- **Fix, if you want it before finalizing MVP:** add a "Use existing from Library" option next to each chip that lets the teacher pick Bridge Building's already-saved AMIVI/AMICO/quiz project IDs and pass those straight to `createAssignment` (the backend call already accepts arbitrary `quizProjectId` / `amiviProjectId` / `amicoProjectId` — it's purely a missing picker on the frontend, not a backend rewrite). I can build this if you'd like.

---

## DEMO 2 — LEARNER: Creating a Story from Homework

### 1. Learner receives/accesses the VLQ images and material the teacher provided
**Status: ❌ Not functional — confirmed gap, and it's a blocker for the rest of Demo 2**

- Classroom has its **own separate, lightweight login**: "I'm a student" → register with a **class code** from the teacher, or log back in with a personal code. This is deliberately not a full email/password account — it's a `memberToken`, completely separate from the main `AuthContext` login used for Library/AMIVI/AMICO/Quiz.
- When a teacher does attach AMIVI/AMICO to a homework assignment (via the Step 6 flow above), the student's "My Homework" row shows **View AMIVI** / **View AMICO** buttons that navigate to `/amivi/{id}` and `/amico/{id}`.
- Those pages require a Library API call (`GET /api/library/{id}`) which is gated by the **main account system**, and the backend explicitly checks `project.user_id != current_user.id` → **404 "Project not found"** for anyone other than the owning teacher's own account.
- A classroom-code student has no main-account token at all, so this call fails outright — and even a student who *does* have a separate main account would still be blocked, because the project belongs to the teacher's account, not theirs.
- In short: right now, a student who joins purely with a class code has **no working path** to open material a teacher attached to a homework assignment. The buttons exist and look right, but they lead to a dead end.
- **Fix, if you want it before finalizing MVP:** the assignment endpoints need to grant read access to the specific `amivi_project_id`/`amico_project_id`/`quiz_project_id` attached to an assignment the student is legitimately enrolled in — i.e., a classroom-scoped exception to the per-owner Library check, rather than requiring the student to own the project. This is a backend change (a few lines in `library_project_detail`, or a dedicated "view via assignment" endpoint) plus wiring the student's `memberToken` through to it.

### 2. Learner opens this material in AMICO
**Status: ⚠️ Works only once Step 1 is fixed**

- The `/amico/{projectId}` route itself is built correctly — it calls `getLibraryProject(projectId)` and renders the saved comic in view mode with no regeneration. The only reason this doesn't work today is the access gap in Step 1 above; once that's fixed, this step works as-is with no further changes.

### 3. Learner generates a Comic Story (or another format) independently
**Status: ✅ Works**

- Separately from the homework-assignment flow: any logged-in account (teacher or student role, via the main login) can go to **AMICO** directly from the navbar and generate a new comic from typed material or from an AMIVI project they themselves made — the routes aren't role-restricted. This is the same AMIVI→AMICO transfer path we already fixed and tested for you earlier this session, so a learner with their own full account can absolutely do this part today.

### 4. Learner views the completed story
**Status: ✅ Works**

- Standard AMICO viewer — paginated comic view reading already-composed page images, same mechanism verified earlier this session (including the "Fix page display" repair button for the duplicate-page issue we fixed).

### 5. Learner saves and retrieves the story later
**Status: ✅ Works**

- Every AMICO project is saved automatically on generation and shows up in that account's **Library**, reopenable anytime via `GET /api/library/{id}` with no regeneration — same mechanism verified in Demo 1 Step 1 and Step 5.

---

## Summary — what's genuinely ready vs. what needs work

**Ready for MVP demo as-is:** Teacher login → Library retrieval → INTRODUCE → EXPLAIN → exit/return (Demo 1, Steps 1–5), and a learner independently generating/viewing/saving their own AMICO story (Demo 2, Steps 3–5).

**Not ready — needs a fix, not just a demo script:**
1. **Assigning homework from existing Library content** (Demo 1, Step 6) — no "use existing project" option; forces regeneration.
2. **Student access to teacher-attached AMIVI/AMICO via an assignment** (Demo 2, Step 1) — hits a 404 because of a per-owner access check that doesn't account for the classroom/assignment relationship. This one blocks Demo 2, Step 2 as well.

**Still open from earlier in this session:** the INTRODUCE-showed-6/EXPLAIN-showed-9 slide count discrepancy. The navigation code is correct either way; this needs either DB access or a live screen check to resolve — happy to do that walkthrough with you right now if you want it settled before finalizing.

Want me to go ahead and build the two fixes above?
