from datetime import datetime

from sqlalchemy import (
    Boolean,
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

    # Hashed with bcrypt — never store or log the raw password.
    # Nullable at the DB level (this column is added to an
    # already-existing table by a lightweight migration, not by
    # create_all) even though registration always sets it.
    password_hash = Column(String(255), nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    projects = relationship(
        "Project",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    sessions = relationship(
        "UserSession",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class UserSession(Base):
    """
    A logged-in session for a real (email + password) account —
    the same lightweight "opaque token in the browser" idea used
    everywhere else in this app (RoomMember, ClassroomMember), just
    for the platform-wide User table instead of a single room or
    classroom. A user can hold more than one (multiple devices).
    """

    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    token = Column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    user = relationship(
        "User",
        back_populates="sessions",
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


class LearningRoom(Base):
    """
    A collaborative "study room" that a group of learners share.
    Generated content (AMIVI visuals, an AMICO comic, a shared
    Quiz) is never duplicated here — this table only stores a
    pointer (project_id) to the existing Project row that the
    normal AMIVI/AMICO/Quiz generation flow already created.
    """

    __tablename__ = "learning_rooms"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)
    topic = Column(String(150), nullable=True)
    description = Column(Text, nullable=True)

    room_code = Column(
        String(12),
        unique=True,
        nullable=False,
        index=True,
    )

    # Learning material the group is discussing / generating
    # from. Free text — not a duplicate of any generated content.
    shared_material = Column(Text, nullable=True)

    created_by_name = Column(String(150), nullable=True)

    created_by_user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Pointers to existing Project rows produced by the normal
    # AMIVI / AMICO / Quiz generation endpoints — reused as-is,
    # never duplicated.
    amivi_project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
    )

    amico_project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
    )

    quiz_project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    members = relationship(
        "RoomMember",
        back_populates="room",
        cascade="all, delete-orphan",
    )

    messages = relationship(
        "RoomMessage",
        back_populates="room",
        cascade="all, delete-orphan",
    )


class RoomMember(Base):
    """
    One learner's membership in a LearningRoom. There is no
    authentication in this MVP, so a membership is identified by
    a random `token` handed back to the browser on join/create
    and kept client-side — it stands in for a session, not a
    password.
    """

    __tablename__ = "room_members"

    id = Column(Integer, primary_key=True, index=True)

    room_id = Column(
        Integer,
        ForeignKey("learning_rooms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    display_name = Column(String(150), nullable=False)

    token = Column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
    )

    is_host = Column(Boolean, nullable=False, default=False)

    # Latest shared-quiz result for this member (nullable until
    # they submit one).
    quiz_score = Column(Integer, nullable=True)
    quiz_total = Column(Integer, nullable=True)

    joined_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    room = relationship(
        "LearningRoom",
        back_populates="members",
    )


class RoomMessage(Base):
    """
    A single simple, non-real-time group-chat message inside a
    LearningRoom. sender_name is stored directly (not just a
    member_id FK) so chat history survives a member leaving.
    """

    __tablename__ = "room_messages"

    id = Column(Integer, primary_key=True, index=True)

    room_id = Column(
        Integer,
        ForeignKey("learning_rooms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    sender_name = Column(String(150), nullable=False)

    message = Column(Text, nullable=False)

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    room = relationship(
        "LearningRoom",
        back_populates="messages",
    )


class Classroom(Base):
    """
    A teacher-led classroom, separate from the peer-to-peer
    LearningRoom: one teacher, any number of students, joined by
    a class code. Generated content lives on Assignment as
    pointers into the existing Project table — never duplicated.
    """

    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(150), nullable=False)
    subject = Column(String(150), nullable=True)
    description = Column(Text, nullable=True)

    class_code = Column(
        String(12),
        unique=True,
        nullable=False,
        index=True,
    )

    # A private, separate code (never shown to students) that lets
    # the teacher log back into THIS classroom as teacher from any
    # device or browser — the class_code alone can't do that, since
    # it's the same code students use to join and only ever grants
    # the student role. Generated once at creation; the teacher can
    # view/regenerate it from inside the classroom if needed.
    teacher_code = Column(
        String(20),
        unique=True,
        nullable=True,
        index=True,
    )

    teacher_name = Column(String(150), nullable=True)

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    members = relationship(
        "ClassroomMember",
        back_populates="classroom",
        cascade="all, delete-orphan",
    )

    assignments = relationship(
        "Assignment",
        back_populates="classroom",
        cascade="all, delete-orphan",
    )


class ClassroomMember(Base):
    """
    One person's membership in a Classroom — either the teacher
    who created it, or a student who joined with the class code.
    Same lightweight token-based "session" as RoomMember: no
    passwords, the token in the browser is what says who you are.
    """

    __tablename__ = "classroom_members"

    id = Column(Integer, primary_key=True, index=True)

    classroom_id = Column(
        Integer,
        ForeignKey("classrooms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    display_name = Column(String(150), nullable=False)

    token = Column(
        String(64),
        unique=True,
        nullable=False,
        index=True,
    )

    # "teacher" | "student" — only the classroom's creator is
    # ever a teacher; everyone who joins via the class code is a
    # student.
    role = Column(String(20), nullable=False, default="student")

    # A separate, globally-unique code a student can generate for
    # themselves and hand to a parent. It grants read-only access
    # to just that student's assignments/scores/history in this
    # one classroom — no class code or password needed on the
    # parent's side. Null until the student generates one.
    parent_code = Column(
        String(20),
        unique=True,
        nullable=True,
        index=True,
    )

    # A private, globally-unique code issued to a student the
    # moment they register (join). Unlike parent_code (read-only,
    # for a third party), this one logs the STUDENT themselves
    # back into their own full membership — same power as the
    # original join — from a new device or browser where their
    # localStorage session was never saved.
    student_code = Column(
        String(20),
        unique=True,
        nullable=True,
        index=True,
    )

    joined_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    classroom = relationship(
        "Classroom",
        back_populates="members",
    )

    submissions = relationship(
        "AssignmentSubmission",
        back_populates="member",
        cascade="all, delete-orphan",
    )


class Assignment(Base):
    """
    A piece of homework a teacher assigns to a Classroom. Points
    at the existing Project rows already produced by the normal
    AMIVI / AMICO / Quiz generation flow — this table never
    stores generated content itself.
    """

    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)

    classroom_id = Column(
        Integer,
        ForeignKey("classrooms.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title = Column(String(255), nullable=False)
    instructions = Column(Text, nullable=True)

    quiz_project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
    )

    amivi_project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
    )

    amico_project_id = Column(
        Integer,
        ForeignKey("projects.id", ondelete="SET NULL"),
        nullable=True,
    )

    due_at = Column(DateTime, nullable=True)

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    classroom = relationship(
        "Classroom",
        back_populates="assignments",
    )

    submissions = relationship(
        "AssignmentSubmission",
        back_populates="assignment",
        cascade="all, delete-orphan",
    )


class AssignmentSubmission(Base):
    """
    One attempt by one student at one Assignment's quiz. Kept
    append-only (every retake adds a new row, nothing is
    overwritten) so this doubles as that student's learning
    history for the classroom.
    """

    __tablename__ = "assignment_submissions"

    id = Column(Integer, primary_key=True, index=True)

    assignment_id = Column(
        Integer,
        ForeignKey("assignments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    member_id = Column(
        Integer,
        ForeignKey("classroom_members.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    score = Column(Integer, nullable=False, default=0)
    total = Column(Integer, nullable=False, default=0)

    submitted_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    assignment = relationship(
        "Assignment",
        back_populates="submissions",
    )

    member = relationship(
        "ClassroomMember",
        back_populates="submissions",
    )


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