"""
End-to-end API tests for classroom homework, run through real HTTP
requests (FastAPI TestClient) against a throwaway in-memory SQLite
database, so they never touch the real Postgres database or OpenAI.

The story being tested: a teacher creates homework with their own
account, and a student logs in with their own account to do it.

Covers:
1. Quiz answers are saved after every answer, so a student who
   abandons the quiz after Q3 shows the teacher "incomplete, 3
   answered" (results list, per-question review, parent view).
2. Answering the last question submits the quiz automatically (the
   frontend sends completed=True with the same attempt id), turning
   that same attempt into a finished result.
3. A finished result can't be rewritten, and a student can't touch
   another student's attempt.
4. Class tallies (submitted count, roster) only count finished quizzes.
5. Old clients that send one final /submit still work.
6. A student can use the AMIVI lesson their teacher assigned as
   source material (Send to AMICO / Quiz), while an outsider can't
   and the student still can't edit the teacher's lesson.

Run with:
    pytest backend/test_classroom_homework.py -v
"""

import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import HTTPException  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import main  # noqa: E402
import models  # noqa: E402

QUESTION_COUNT = 5


# ------------------------------------------------------------
# Fixtures
# ------------------------------------------------------------


@pytest.fixture()
def env(monkeypatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    models.Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    monkeypatch.setattr(main, "SessionLocal", session_factory)

    # Every test registers a few accounts from the same "IP".
    monkeypatch.setattr(main.rate_limiter, "hit", lambda *a, **k: True)

    client = TestClient(main.app)

    def register(name, role):
        r = client.post(
            "/api/auth/register",
            json={
                "name": name,
                "email": f"{name.lower()}@example.com",
                "password": "Password123!",
                "role": role,
            },
        )
        assert r.status_code == 200, r.text
        body = r.json()
        return {
            "id": body["user"]["id"],
            "headers": {"Authorization": f"Bearer {body['token']}"},
        }

    teacher = register("Teacher", "teacher")
    student = register("Student", "student")
    other = register("Other", "student")

    # Teacher creates the class while signed in.
    r = client.post(
        "/api/classrooms",
        json={"name": "Class 5A", "display_name": "Ms Teacher"},
        headers=teacher["headers"],
    )
    assert r.status_code == 200, r.text
    body = r.json()
    class_code = body["classroom"]["class_code"]
    teacher_token = body["member"]["token"]

    # Generated content needs OpenAI, so the teacher's quiz and AMIVI
    # lesson are written straight into the database instead.
    db = session_factory()
    quiz = models.Project(
        project_type="quiz",
        title="Plants quiz",
        input_text="plants",
        language="English",
        user_id=teacher["id"],
        data={
            "questions": [
                {"q": f"Question {i + 1}", "options": ["A", "B", "C"], "correct": 0}
                for i in range(QUESTION_COUNT)
            ]
        },
    )
    lesson = models.Project(
        project_type="amivi",
        title="How plants grow",
        input_text="Plants need light, water and air.",
        language="English",
        user_id=teacher["id"],
        data={},
    )
    db.add_all([quiz, lesson])
    db.commit()
    quiz_id, lesson_id = quiz.id, lesson.id
    db.close()

    r = client.post(
        f"/api/classrooms/{class_code}/assignments",
        json={
            "member_token": teacher_token,
            "title": "Plants homework",
            "quiz_project_id": quiz_id,
            "amivi_project_id": lesson_id,
        },
    )
    assert r.status_code == 200, r.text
    assignment_id = r.json()["assignment"]["id"]

    # Student joins the class while signed in to their own account.
    def join(user, name):
        r = client.post(
            "/api/classrooms/join",
            json={"class_code": class_code, "display_name": name},
            headers=user["headers"] if user else {},
        )
        assert r.status_code == 200, r.text
        return r.json()["member"]

    student_member = join(student, "Asha")
    second_member = join(None, "Ben")

    return {
        "client": client,
        "SessionLocal": session_factory,
        "class_code": class_code,
        "assignment_id": assignment_id,
        "teacher_token": teacher_token,
        "teacher": teacher,
        "student": student,
        "other": other,
        "student_member": student_member,
        "second_member": second_member,
        "lesson_id": lesson_id,
    }


def answers(n, correct_upto=None):
    correct_upto = n if correct_upto is None else correct_upto
    return [
        {
            "question_index": i,
            "selected": 0 if i < correct_upto else 1,
            "correct": 0,
            "is_correct": i < correct_upto,
        }
        for i in range(n)
    ]


def submit(env, member, n, submission_id=None, completed=False, legacy=False, score=None):
    body = {
        "member_token": member["token"],
        "score": n if score is None else score,
        "total": QUESTION_COUNT,
        "answers": answers(n, score),
    }
    if not legacy:
        body["submission_id"] = submission_id
        body["completed"] = completed
    return env["client"].post(
        f"/api/classrooms/{env['class_code']}/assignments/{env['assignment_id']}/submit",
        json=body,
    )


def play_until(env, member, stop_after):
    """Answers Q1..stop_after one call at a time, like the quiz player."""
    sid = None
    for n in range(1, stop_after + 1):
        r = submit(env, member, n, sid)
        assert r.status_code == 200, r.text
        sid = r.json()["submission"]["id"]
    return sid


def teacher_results(env):
    r = env["client"].get(
        f"/api/classrooms/{env['class_code']}/assignments/{env['assignment_id']}/results",
        params={"member_token": env["teacher_token"]},
    )
    assert r.status_code == 200, r.text
    return {row["display_name"]: row for row in r.json()["results"]}


def submitted_count(env):
    r = env["client"].get(
        f"/api/classrooms/{env['class_code']}/assignments/{env['assignment_id']}",
        params={"member_token": env["teacher_token"]},
    )
    assert r.status_code == 200, r.text
    return r.json()["submitted_count"]


# ------------------------------------------------------------
# 1. Progress saved after every answer
# ------------------------------------------------------------


def test_every_answer_updates_one_attempt(env):
    member = env["student_member"]

    first = submit(env, member, 1).json()["submission"]
    assert first["status"] == "in_progress"
    assert first["answered"] == 1

    second = submit(env, member, 2, first["id"]).json()["submission"]
    assert second["id"] == first["id"], "later answers must update the same attempt"
    assert second["answered"] == 2

    assert teacher_results(env)["Asha"]["attempts"] == 1


def test_abandoned_after_q3_shows_incomplete_to_teacher(env):
    play_until(env, env["student_member"], 3)

    row = teacher_results(env)["Asha"]
    assert row["status"] == "in_progress"
    assert row["answered"] == 3
    assert row["score"] == 3

    # Ben never opened it.
    assert teacher_results(env)["Ben"]["status"] is None
    assert teacher_results(env)["Ben"]["attempts"] == 0

    # Not counted as handed in.
    assert submitted_count(env) == 0


def test_teacher_review_marks_unreached_questions(env):
    play_until(env, env["student_member"], 3)

    r = env["client"].get(
        f"/api/classrooms/{env['class_code']}/assignments/{env['assignment_id']}"
        f"/submissions/{env['student_member']['id']}",
        params={"member_token": env["teacher_token"]},
    )
    assert r.status_code == 200, r.text
    detail = r.json()
    assert detail["status"] == "in_progress"
    assert detail["answered"] == 3
    selected = [q["selected"] for q in detail["questions"]]
    assert selected[:3] == [0, 0, 0]
    assert selected[3:] == [None, None], "Q4 and Q5 were never reached"


def test_parent_view_shows_incomplete(env):
    member = env["student_member"]
    play_until(env, member, 3)

    r = env["client"].post(
        f"/api/classrooms/{env['class_code']}/parent-code",
        json={"member_token": member["token"]},
    )
    assert r.status_code == 200, r.text
    parent_code = r.json()["parent_code"]

    r = env["client"].get(f"/api/parents/{parent_code}")
    assert r.status_code == 200, r.text
    rows = [a for a in r.json()["assignments"] if a["id"] == env["assignment_id"]]
    assert rows and rows[0]["status"] == "incomplete"
    assert rows[0]["answered"] == 3


# ------------------------------------------------------------
# 2. Last answer submits automatically
# ------------------------------------------------------------


def test_last_answer_completes_the_same_attempt(env):
    member = env["student_member"]
    sid = play_until(env, member, QUESTION_COUNT - 1)

    # What the quiz player sends the moment the last answer is picked.
    r = submit(env, member, QUESTION_COUNT, sid, completed=True, score=4)
    assert r.status_code == 200, r.text
    final = r.json()["submission"]
    assert final["id"] == sid
    assert final["status"] == "completed"
    assert final["score"] == 4 and final["total"] == QUESTION_COUNT

    row = teacher_results(env)["Asha"]
    assert row["status"] == "completed"
    assert row["attempts"] == 1
    assert (row["score"], row["total"]) == (4, QUESTION_COUNT)
    assert submitted_count(env) == 1


def test_finished_result_cannot_be_rewritten(env):
    member = env["student_member"]
    sid = play_until(env, member, QUESTION_COUNT)
    assert submit(env, member, QUESTION_COUNT, sid, completed=True).status_code == 200

    r = submit(env, member, 1, sid, score=0)
    assert r.status_code == 409
    assert teacher_results(env)["Asha"]["score"] == QUESTION_COUNT


def test_student_cannot_update_someone_elses_attempt(env):
    sid = play_until(env, env["student_member"], 2)
    r = submit(env, env["second_member"], 5, sid, completed=True)
    assert r.status_code == 404
    assert teacher_results(env)["Asha"]["answered"] == 2


def test_score_is_capped_at_total(env):
    r = submit(env, env["student_member"], 1, completed=True, score=999)
    assert r.json()["submission"]["score"] == QUESTION_COUNT


def test_old_client_single_submit_still_completes(env):
    r = submit(env, env["second_member"], QUESTION_COUNT, legacy=True)
    assert r.status_code == 200, r.text
    assert r.json()["submission"]["status"] == "completed"
    assert submitted_count(env) == 1


def test_roster_counts_only_finished_homework(env):
    play_until(env, env["student_member"], 3)  # Asha abandons
    sid = play_until(env, env["second_member"], QUESTION_COUNT)
    submit(env, env["second_member"], QUESTION_COUNT, sid, completed=True)

    r = env["client"].get(
        f"/api/classrooms/{env['class_code']}/students",
        params={"member_token": env["teacher_token"]},
    )
    assert r.status_code == 200, r.text
    roster = {s["display_name"]: s for s in r.json()["students"]}
    assert roster["Asha"]["assignments_completed"] == 0
    assert roster["Asha"]["average_score_percent"] is None
    assert roster["Ben"]["assignments_completed"] == 1
    assert roster["Ben"]["average_score_percent"] == 100.0


# ------------------------------------------------------------
# 3. Student can use the teacher's assigned lesson as source
# ------------------------------------------------------------


class _User:
    def __init__(self, user_id):
        self.id = user_id


def test_student_can_use_assigned_lesson_as_source(env):
    lesson = main.require_project_source_access(env["lesson_id"], _User(env["student"]["id"]))
    assert lesson.title == "How plants grow"


def test_outsider_cannot_use_assigned_lesson(env):
    with pytest.raises(HTTPException) as exc:
        main.require_project_source_access(env["lesson_id"], _User(env["other"]["id"]))
    assert exc.value.status_code == 404


def test_student_still_cannot_edit_teachers_lesson(env):
    with pytest.raises(HTTPException) as exc:
        main.require_project_access(env["lesson_id"], _User(env["student"]["id"]))
    assert exc.value.status_code == 404


def test_learning_history_labels_abandoned_attempt(env):
    member = env["student_member"]
    play_until(env, member, 3)

    r = env["client"].get(
        f"/api/classrooms/{env['class_code']}/history",
        params={"member_token": member["token"]},
    )
    assert r.status_code == 200, r.text
    (entry,) = r.json()["history"]
    assert entry["status"] == "in_progress"
    assert entry["answered"] == 3
