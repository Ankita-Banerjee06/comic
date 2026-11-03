# Teacher Workspace — Implementation Plan

Written after inspecting the existing backend (`backend/models.py`, `backend/main.py`,
`backend/database.py`) and frontend (`frontend/src/App.jsx`, `pages/Dashboard.jsx`,
`pages/Classroom.jsx`, `contexts/AuthContext.jsx`, `components/layout/Navbar.jsx`).
Kept here so the build can continue across multiple sessions without re-deriving it.

## What already exists (reuse, do not duplicate)

- **Real accounts + roles**: `User.role` ("student"/"teacher"), `useAuth()` on the
  frontend, `Navbar`'s "Switch to Teacher view". Teacher Workspace is gated on
  `role === 'teacher'`, same as `Dashboard.jsx`'s `TeacherDashboard`.
- **Classroom / ClassroomMember**: a teacher-led class with a join code
  (`class_code`), a teacher re-login code (`teacher_code`), and per-member tokens.
  This *is* "My Classes" — Teacher Workspace will list/create/open these, not a
  new parallel "class" concept. Auth for every classroom-scoped write is the
  existing pattern: payload carries `member_token`, backend calls
  `get_classroom_member_by_token()` + `require_teacher()` (see `create_assignment`
  in `main.py` ~line 9274). All new endpoints follow this exact pattern.
- **Assignment / AssignmentSubmission**: homework with a due date, pointers to
  generated content, and append-only per-student submissions (score/total/answers
  JSON). Extended (not replaced) to also support manually-authored content and
  plain file attachments.
- **Project / Quiz**: an AI-generated quiz is a `Project` (project_type="quiz")
  + a `Quiz` row holding the question JSON. A **manually-built quiz reuses this
  same pair** — just authored by a teacher instead of the AI — so it automatically
  gets a `quiz_project_id` that slots straight into the existing
  `create_assignment` / `AssignmentSubmission` / scoring pipeline with zero
  changes to that machinery.
- **MediaAsset**: generic binary blob storage (image/audio/video/document) in
  Postgres, already used everywhere else in the app. Lesson/material/assignment
  file uploads (images, PDF, PPT, DOC/DOCX) reuse this table and the existing
  `GET /api/media/{id}` retrieval route — matches the app's existing media
  security posture (unguessable id, no extra ACL), consistent with how every
  other image/audio/video in the app already works.
- **`/api/me/classrooms`**: already returns every classroom a logged-in user
  belongs to, with role, student/assignment counts — the data source for the
  Teacher Workspace dashboard's class list and summary cards.
- **Design language**: `bg-white rounded-2xl border border-slate-200 shadow-sm`
  cards, the `DashboardHeader` gradient-banner pattern, `TileGrid`/`DashboardTile`
  tile cards, lucide-react icons. New screens match this, not a new style.

## What's genuinely new

### New DB tables (models.py — picked up automatically by `create_all()`, no
migration needed for brand-new tables)

- **`Lesson`**: `classroom_id` FK, `title`, `topic`, `description`,
  `content` (Text — rich HTML from the lesson editor), `status`
  ("draft"/"published"), `attachments` (JSON list of
  `{media_asset_id, filename, mime_type}`), `created_by_member_id` FK,
  `created_at`, `updated_at`.
- **`TeachingMaterial`**: `classroom_id` FK (nullable — can be unfiled),
  `title`, `description`, `attachments` (JSON, same shape), `created_by_member_id`
  FK, `created_at`.

### Changes to existing tables (safe `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
in `database.py`'s `_run_lightweight_migrations()`, same pattern already used
for every past schema change)

- `classrooms`: `+ grade_level VARCHAR(50)`, `+ topic VARCHAR(255)` (nullable —
  existing classrooms are unaffected).
- `assignments`: `+ attachments JSON` (lets a teacher attach files directly,
  without requiring a quiz/AMIVI/AMICO project), `+ lesson_id INTEGER REFERENCES
  lessons(id) ON DELETE SET NULL` (lets an assignment point at a Lesson too).
- `projects`: `+ created_via VARCHAR(20)` (nullable; `"manual"` for
  teacher-authored quizzes, left `NULL`/implicitly "ai" for everything that
  exists today — purely informational, used to label manual quizzes in the UI).

### New API endpoints (all under `/api/classrooms/{class_code}/...`, all
teacher-scoped via `member_token` + `require_teacher()`, matching existing style)

- `POST/GET/PUT/DELETE .../lessons[/{id}]` — lesson CRUD. Student-facing GET
  filters to `status == "published"` only.
- `POST/GET/DELETE .../materials[/{id}]` — Teaching Materials CRUD.
- `POST .../quizzes/manual`, `PUT .../quizzes/manual/{project_id}` — manual
  quiz builder; returns a `quiz_project_id` usable as-is by the existing
  assignment-creation endpoint.
- `POST /api/media/upload` — new generic authenticated upload endpoint (the
  existing `save_media()` helper is currently only called internally by
  generation code; this exposes it for teacher-supplied files), returns a
  `media_asset_id` to attach to a lesson/material/assignment.
- Existing `POST .../assignments` extended to also accept `attachments` and
  `lesson_id`, and its "must include a quiz/AMIVI/AMICO" validation relaxed to
  also allow a lesson or a bare attachment.
- `GET /api/me/teacher-workspace/summary` — one round-trip for the dashboard's
  four summary cards (classes / students / quizzes / pending assignments),
  instead of N+1 calls from the frontend.

### New frontend pages (new files; nothing existing is restyled or rerouted)

- `pages/TeacherWorkspace.jsx` — dashboard: summary cards, "+ Create New Class"
  (reuses `createClassroom()`), class list (reuses `getMyClassrooms()`).
- `pages/TeacherWorkspace/ClassDetail.jsx` — tabbed class workspace: Overview,
  Lessons, Study Materials, Quizzes, Assignments, Students.
- `pages/TeacherWorkspace/LessonEditor.jsx` — rich-text lesson builder
  (draft/preview/publish) with file upload.
- `pages/TeacherWorkspace/QuizBuilder.jsx` — manual MCQ quiz editor
  (questions, 4 options, correct answer, explanation, image, marks, duration,
  preview, draft/publish).
- `pages/TeacherWorkspace/AssignmentManager.jsx` — create assignments (quiz/
  lesson/file + due date), view submissions/completion per student.
- Shared: a small rich-text editor (likely a lightweight library, to be
  confirmed — no existing one in this repo) and a file-attachment uploader
  built on the existing `FileUpload.jsx` component.
- New nav entry: "Teacher Workspace" link/tile, visible only when
  `role === 'teacher'` (Navbar + a new TeacherDashboard tile on `/dashboard`
  alongside the existing ones) routing to `/teacher-workspace`.

## Build order (matches the doc's step 12)

1. Teacher Workspace dashboard (backend models/migrations + summary endpoint +
   dashboard page + nav entry + Create Class, reusing `createClassroom`).
2. Class Workspace shell (tabs) + Students tab (reuses roster/code endpoints
   already built for Classroom.jsx).
3. Lessons + Teaching Materials (CRUD endpoints, upload endpoint, editor UI).
4. Manual Quiz Builder.
5. Assignment Management (extended to support lessons/attachments, submission/
   completion view).
6. End-to-end test pass: teacher + student accounts, permissions, file access,
   and a regression check that AMIVI/AMICO/Quiz/Library/existing Classroom
   flows are untouched.

## Explicit restrictions honored

No AI generation anywhere in this feature. Existing AMIVI/AMICO/Quiz
Generator/Library/Classroom code paths are not modified except the two additive,
backward-compatible changes to `create_assignment` (new optional fields) and
`projects`/`classrooms`/`assignments` (new nullable columns) — all existing data
and behavior is preserved. Role-based access enforced the same way the app
already enforces it (`member_token` + `require_teacher()`; student-facing reads
filtered to published content).
