import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Add it to your .env file."
    )

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    # Generation endpoints run in FastAPI's threadpool and fan out
    # to 8 worker threads each, so concurrent requests need more
    # than SQLAlchemy's default 5 (+10 overflow) connections.
    pool_size=10,
    max_overflow=20,
    pool_timeout=60,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
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
        Lesson,
        TeachingMaterial,
        ClassroomLiveSession,
    )

    Base.metadata.create_all(bind=engine)
    _run_lightweight_migrations()


def _run_lightweight_migrations():
    """
    create_all() only creates tables that don't exist yet — it never
    alters a table this app already created in an earlier version.
    `users` is one of those pre-existing tables, so a new column
    added to the User model (like password_hash) needs to be added
    here explicitly. Safe to run on every startup: IF NOT EXISTS
    makes it a no-op once the column is already there.
    """
    from sqlalchemy import text

    with engine.begin() as conn:
        # Every ALTER TABLE below takes an exclusive lock, even when
        # IF NOT EXISTS makes it a no-op. During a zero-downtime
        # deploy the OLD instance is still serving traffic; if one
        # of its queries holds a lock, an ALTER waiting behind it
        # would queue every later query on that table too, freezing
        # the live site. With a timeout, the new instance's startup
        # fails instead (the deploy is retried / the old instance
        # keeps serving) rather than stalling production.
        conn.execute(text("SET LOCAL lock_timeout = '10s'"))
        conn.execute(
            text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)")
        )
        conn.execute(
            text("ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS answers JSON")
        )
        # classroom_members.user_id / room_members.user_id should already
        # exist (those tables were created with the column already in the
        # model), but this is a harmless no-op if so — cheap insurance
        # against ever trying to write to a column that isn't there.
        conn.execute(
            text("ALTER TABLE classroom_members ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL")
        )
        # AMIVI chunks: a second illustration per chunk, and an
        # optional inline 2-option "check yourself" question.
        conn.execute(
            text("ALTER TABLE amivi_chunks ADD COLUMN IF NOT EXISTS image2_id INTEGER REFERENCES media_assets(id) ON DELETE SET NULL")
        )
        conn.execute(
            text("ALTER TABLE amivi_chunks ADD COLUMN IF NOT EXISTS mcq_question TEXT")
        )
        conn.execute(
            text("ALTER TABLE amivi_chunks ADD COLUMN IF NOT EXISTS mcq_option_a TEXT")
        )
        conn.execute(
            text("ALTER TABLE amivi_chunks ADD COLUMN IF NOT EXISTS mcq_option_b TEXT")
        )
        conn.execute(
            text("ALTER TABLE amivi_chunks ADD COLUMN IF NOT EXISTS mcq_correct VARCHAR(1)")
        )
        # Essential Learning: Subject/Chapter grouping for saved
        # AMIVI/AMICO/Quiz projects (see models.Project).
        conn.execute(
            text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS subject VARCHAR(50)")
        )
        conn.execute(
            text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS chapter VARCHAR(255)")
        )
        conn.execute(
            text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS chapter_key VARCHAR(255)")
        )
        # Classroom re-login codes (teacher_code / parent_code /
        # student_code): added to the models in the same feature pass,
        # on `classrooms` and `classroom_members` tables that already
        # existed in the database at the time — exactly the situation
        # this function exists to patch up. Missing any one of these
        # throws UndefinedColumn the moment someone creates or opens a
        # classroom, so all three get the same IF NOT EXISTS treatment,
        # plus the unique index the model declares on each.
        conn.execute(
            text("ALTER TABLE classrooms ADD COLUMN IF NOT EXISTS teacher_code VARCHAR(20)")
        )
        conn.execute(
            text("CREATE UNIQUE INDEX IF NOT EXISTS ix_classrooms_teacher_code ON classrooms (teacher_code)")
        )
        conn.execute(
            text("ALTER TABLE classroom_members ADD COLUMN IF NOT EXISTS parent_code VARCHAR(20)")
        )
        conn.execute(
            text("CREATE UNIQUE INDEX IF NOT EXISTS ix_classroom_members_parent_code ON classroom_members (parent_code)")
        )
        conn.execute(
            text("ALTER TABLE classroom_members ADD COLUMN IF NOT EXISTS student_code VARCHAR(20)")
        )
        conn.execute(
            text("CREATE UNIQUE INDEX IF NOT EXISTS ix_classroom_members_student_code ON classroom_members (student_code)")
        )
        # Avatars used to have no owner at all, so every account
        # could see, use, and delete every other account's saved
        # avatars. Existing rows get user_id = NULL and are now
        # excluded from everyone's avatar list going forward (see
        # list_avatars/get_avatar/delete_avatar in main.py) — there's
        # no way to know after the fact who originally made them, so
        # the safe choice is to stop showing them to anyone rather
        # than guess an owner.
        conn.execute(
            text("ALTER TABLE avatars ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE")
        )
        # Teacher Workspace: Grade/Standard and Chapter-or-Topic on a
        # classroom, plain file attachments + an optional Lesson
        # pointer on an assignment (alongside the existing AI-content
        # pointers), and a label distinguishing a teacher-authored
        # quiz from an AI-generated one (both still live in the same
        # projects/quizzes tables — see models.Lesson/TeachingMaterial
        # docstrings and TEACHER_WORKSPACE_PLAN.md).
        conn.execute(
            text("ALTER TABLE classrooms ADD COLUMN IF NOT EXISTS grade_level VARCHAR(50)")
        )
        conn.execute(
            text("ALTER TABLE classrooms ADD COLUMN IF NOT EXISTS topic VARCHAR(255)")
        )
        conn.execute(
            text("ALTER TABLE assignments ADD COLUMN IF NOT EXISTS attachments JSON")
        )
        conn.execute(
            text("ALTER TABLE assignments ADD COLUMN IF NOT EXISTS lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL")
        )
        conn.execute(
            text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_via VARCHAR(20)")
        )
        conn.execute(
            text("ALTER TABLE projects ADD COLUMN IF NOT EXISTS classroom_id INTEGER REFERENCES classrooms(id) ON DELETE SET NULL")
        )
        # Wrong Answers bank used to be one global list shared by
        # every account. Existing rows get user_id = NULL and are
        # hidden from everyone, same reasoning as avatars above.
        conn.execute(
            text("ALTER TABLE wrong_answers ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE")
        )
        conn.execute(
            text("CREATE INDEX IF NOT EXISTS ix_wrong_answers_user_id ON wrong_answers (user_id)")
        )
        # Indexes added to columns of tables that already existed.
        # amivi_chunks' media FKs: deleting a media row makes Postgres
        # find chunks pointing at it (ON DELETE SET NULL), which was a
        # full-table scan per deleted media row. classroom_members
        # .user_id: filtered on every Teacher Workspace / "my
        # classrooms" load. Names match what create_all() generates,
        # so fresh databases and migrated ones end up identical.
        conn.execute(
            text("CREATE INDEX IF NOT EXISTS ix_amivi_chunks_image_id ON amivi_chunks (image_id)")
        )
        conn.execute(
            text("CREATE INDEX IF NOT EXISTS ix_amivi_chunks_image2_id ON amivi_chunks (image2_id)")
        )
        conn.execute(
            text("CREATE INDEX IF NOT EXISTS ix_amivi_chunks_audio_id ON amivi_chunks (audio_id)")
        )
        conn.execute(
            text("CREATE INDEX IF NOT EXISTS ix_classroom_members_user_id ON classroom_members (user_id)")
        )
