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