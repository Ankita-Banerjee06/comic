from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    LargeBinary,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    role = Column(String(30), nullable=False, default="student")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    projects = relationship(
        "Project",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    project_type = Column(String(50), nullable=False, index=True)
    title = Column(String(255), nullable=True)
    input_text = Column(Text, nullable=True)
    language = Column(String(10), nullable=False, default="en")

    # Stores structured AMIVI/AMICO/Quiz JSON data.
    data = Column(JSON, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    user = relationship(
        "User",
        back_populates="projects",
    )

    media = relationship(
        "MediaAsset",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    comics = relationship(
        "Comic",
        back_populates="project",
        cascade="all, delete-orphan",
    )

    quizzes = relationship(
        "Quiz",
        back_populates="project",
        cascade="all, delete-orphan",
    )


class MediaAsset(Base):
    """
    Stores actual images, audio and videos in PostgreSQL.

    asset_type:
        image
        audio
        video
    """

    __tablename__ = "media_assets"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    asset_type = Column(
        String(30),
        nullable=False,
        index=True,
    )

    filename = Column(
        String(255),
        nullable=False,
    )

    mime_type = Column(
        String(100),
        nullable=False,
    )

    # PostgreSQL BYTEA
    data = Column(
        LargeBinary,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    project = relationship(
        "Project",
        back_populates="media",
    )


class Comic(Base):
    __tablename__ = "comics"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    title = Column(
        String(255),
        nullable=True,
    )

    data = Column(
        JSON,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    project = relationship(
        "Project",
        back_populates="comics",
    )


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    title = Column(
        String(255),
        nullable=True,
    )

    data = Column(
        JSON,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    project = relationship(
        "Project",
        back_populates="quizzes",
    )


class WrongAnswer(Base):
    """
    A durable record of a question a teacher/student answered
    incorrectly in the standalone Quiz section. Stays here
    indefinitely (months or years) until it's answered correctly
    during a "Wrong Answers" bank retake, at which point it's
    removed.
    """

    __tablename__ = "wrong_answers"

    id = Column(Integer, primary_key=True, index=True)

    quiz_id = Column(
        Integer,
        ForeignKey("quizzes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    quiz_title = Column(String(255), nullable=True)

    question_text = Column(Text, nullable=True)

    options = Column(JSON, nullable=True)

    correct = Column(Integer, nullable=False, default=0)

    explanation = Column(Text, nullable=True)

    image_id = Column(
        Integer,
        ForeignKey("media_assets.id", ondelete="SET NULL"),
        nullable=True,
    )

    video_id = Column(
        Integer,
        ForeignKey("media_assets.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )


class AmiviChunk(Base):
    __tablename__ = "amivi_chunks"

    id = Column(Integer, primary_key=True, index=True)

    project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    chunk_number = Column(Integer, nullable=False)
    
    key_point = Column(Text, nullable=True)

    text = Column(Text, nullable=True)

    slogan = Column(Text, nullable=True)

    description = Column(Text, nullable=True)

    image_id = Column(
        Integer,
        ForeignKey("media_assets.id", ondelete="SET NULL"),
        nullable=True,
    )

    audio_id = Column(
        Integer,
        ForeignKey("media_assets.id", ondelete="SET NULL"),
        nullable=True,
    )

    voice_script = Column(Text, nullable=True)

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    project = relationship("Project")


class Avatar(Base):
    """
    A saved character avatar: an AI-generated illustration
    derived from a user-uploaded photo, plus the appearance
    description used to keep that character consistent across
    AMICO comic panels.
    """

    __tablename__ = "avatars"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=True)

    description = Column(Text, nullable=True)

    image_id = Column(
        Integer,
        ForeignKey("media_assets.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )