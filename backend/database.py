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
