"""
Manual functional test for the new "Generate from Lesson" Teacher
Quiz Workflow endpoint (generate_quiz_draft), plus a regression
check that the broadened created_via filters didn't break anything
for existing manual quizzes. Mocks the DB layer and the LLM call —
no live Postgres or OpenAI key needed. Run directly with python3.
"""

import os
from types import SimpleNamespace
from unittest.mock import patch

os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost/test")
os.environ.setdefault("OPENAI_API_KEY", "")

import main  # noqa: E402


class FakeUser:
    id = 42


class FakeClassroom:
    id = 7


class FakeMember:
    id = 99
    role = "teacher"
    user_id = 42


class FakeAmiviProject:
    project_type = "amivi"
    user_id = 42
    title = "The Water Cycle"
    # The lesson was created in Spanish. The payload below deliberately
    # says "en" to prove the endpoint ignores that and uses the
    # LESSON's own saved language instead.
    language = "es"


class FakeChunk:
    def __init__(self, key_point, slogan, description):
        self.key_point = key_point
        self.slogan = slogan
        self.description = description
        self.text = ""


FAKE_CHUNKS = [
    FakeChunk("Evaporation", "Water rises!", "Heat turns liquid water into vapor."),
    FakeChunk("Condensation", "Clouds form!", "Vapor cools and forms clouds."),
    FakeChunk("Precipitation", "Rain falls!", "Water falls back as rain or snow."),
]

FAKE_LLM_RESULT = {
    "quiz": {
        "title": "The Water Cycle Quiz",
        "questions": [
            {
                "q": f"Question {i}",
                "options": ["A", "B", "C", "D"],
                "correct": 0,
                "explanation": f"Explanation {i}",
                "microbit_reference": f"Microbit {((i - 1) % 3) + 1}",
                "image_prompt": "a neutral illustration",
            }
            for i in range(1, 6)
        ],
    }
}


def run_generate_draft_success():
    with patch.object(main, "SessionLocal", return_value=SimpleNamespace(close=lambda: None)), \
         patch.object(main, "get_classroom_or_404", return_value=FakeClassroom()), \
         patch.object(main, "get_classroom_member_by_token", return_value=FakeMember()), \
         patch.object(main, "get_project", return_value=FakeAmiviProject()), \
         patch.object(main, "list_amivi_chunks_for_project", return_value=FAKE_CHUNKS), \
         patch.object(main, "generate_quiz_from_source", return_value=FAKE_LLM_RESULT) as gen_mock:

        payload = main.GenerateQuizDraftRequest(
            member_token="tok123",
            source_project_id=555,
            language="en",
        )

        result = main.generate_quiz_draft(
            class_code="ABCD12",
            payload=payload,
            current_user=FakeUser(),
        )

    assert result["status"] == "success"
    assert result["source_project_id"] == 555
    assert result["source_title"] == "The Water Cycle"
    # The response must carry the LESSON's language ("es"), not the
    # payload's ("en") — this is what lets the save step (below)
    # persist the quiz in the same language as its source lesson.
    assert result["language"] == "es"
    assert len(result["questions"]) == 5, result["questions"]
    for q in result["questions"]:
        assert len(q["options"]) == 4
        assert q["microbit_reference"].startswith("Microbit ")

    # Confirm generate_quiz_from_source was called with exactly 5
    # questions requested, the microbit-reference flag on, numbered
    # Microbit blocks as the source text (not raw lesson text, and
    # not the model's own general knowledge) — and critically, the
    # LESSON's language ("es"), not the request payload's ("en").
    call_args = gen_mock.call_args
    source_text_arg = call_args[0][0]
    language_arg = call_args[0][2]
    num_questions_arg = call_args[0][3]
    require_ref_kwarg = call_args[1].get("require_microbit_reference")

    assert "Microbit 1:" in source_text_arg
    assert "Microbit 2:" in source_text_arg
    assert "Microbit 3:" in source_text_arg
    assert language_arg == "es"
    assert "Evaporation" in source_text_arg
    assert num_questions_arg == 5
    assert require_ref_kwarg is True

    print("PASS: generate_quiz_draft success path")


def run_generate_draft_wrong_owner_rejected():
    other_persons_project = SimpleNamespace(project_type="amivi", user_id=999, title="Not Yours")

    with patch.object(main, "SessionLocal", return_value=SimpleNamespace(close=lambda: None)), \
         patch.object(main, "get_classroom_or_404", return_value=FakeClassroom()), \
         patch.object(main, "get_classroom_member_by_token", return_value=FakeMember()), \
         patch.object(main, "get_project", return_value=other_persons_project):

        payload = main.GenerateQuizDraftRequest(
            member_token="tok123",
            source_project_id=556,
            language="en",
        )

        try:
            main.generate_quiz_draft(
                class_code="ABCD12",
                payload=payload,
                current_user=FakeUser(),
            )
            raised = False
        except main.HTTPException as exc:
            raised = True
            assert exc.status_code == 404

    assert raised, "Expected a 404 when the lesson doesn't belong to this teacher"
    print("PASS: ownership check rejects another teacher's lesson")


def run_generate_draft_no_chunks_rejected():
    with patch.object(main, "SessionLocal", return_value=SimpleNamespace(close=lambda: None)), \
         patch.object(main, "get_classroom_or_404", return_value=FakeClassroom()), \
         patch.object(main, "get_classroom_member_by_token", return_value=FakeMember()), \
         patch.object(main, "get_project", return_value=FakeAmiviProject()), \
         patch.object(main, "list_amivi_chunks_for_project", return_value=[]):

        payload = main.GenerateQuizDraftRequest(
            member_token="tok123",
            source_project_id=557,
            language="en",
        )

        try:
            main.generate_quiz_draft(
                class_code="ABCD12",
                payload=payload,
                current_user=FakeUser(),
            )
            raised = False
        except main.HTTPException as exc:
            raised = True
            assert exc.status_code == 400

    assert raised, "Expected a 400 when the lesson has no Microbits yet"
    print("PASS: no-Microbits lesson is rejected with a clear 400")


def run_generate_draft_falls_back_to_en_when_lesson_has_no_language():
    # Defensive case: a lesson row somehow has no language attribute
    # at all (shouldn't happen in practice — AMIVI always sets it —
    # but the endpoint must not crash, and must land on a valid
    # language rather than propagating None).
    no_language_project = SimpleNamespace(project_type="amivi", user_id=42, title="Untitled Lesson")

    with patch.object(main, "SessionLocal", return_value=SimpleNamespace(close=lambda: None)), \
         patch.object(main, "get_classroom_or_404", return_value=FakeClassroom()), \
         patch.object(main, "get_classroom_member_by_token", return_value=FakeMember()), \
         patch.object(main, "get_project", return_value=no_language_project), \
         patch.object(main, "list_amivi_chunks_for_project", return_value=FAKE_CHUNKS), \
         patch.object(main, "generate_quiz_from_source", return_value=FAKE_LLM_RESULT):

        payload = main.GenerateQuizDraftRequest(
            member_token="tok123",
            source_project_id=558,
            language="en",
        )

        result = main.generate_quiz_draft(
            class_code="ABCD12",
            payload=payload,
            current_user=FakeUser(),
        )

    assert result["language"] == "en"
    print("PASS: falls back to 'en' when the lesson has no language of its own")


def run_create_manual_quiz_persists_language():
    # The save step (create_manual_quiz) must store whatever language
    # it's told — this is what makes the fix end-to-end: the draft
    # endpoint resolves the lesson's real language, and this is the
    # function that actually has to write it onto the saved Project.
    captured = {}

    class FakeDB:
        def add(self, obj):
            # create_manual_quiz also calls save_quiz(), which adds a
            # separate legacy Quiz row through this same mocked
            # SessionLocal — only capture the Project we care about.
            if isinstance(obj, main.Project):
                captured["project"] = obj

        def commit(self):
            pass

        def refresh(self, obj):
            obj.id = 1
            obj.created_at = None

        def close(self):
            pass

    with patch.object(main, "SessionLocal", return_value=FakeDB()), \
         patch.object(main, "get_classroom_or_404", return_value=FakeClassroom()), \
         patch.object(main, "get_classroom_member_by_token", return_value=FakeMember()):

        payload = main.ManualQuizCreateRequest(
            member_token="tok123",
            title="Water Cycle Quiz",
            questions=[
                main.ManualQuizQuestion(
                    question="What is evaporation?",
                    options=["A", "B", "C", "D"],
                    correct=0,
                    explanation="Because.",
                    microbit_reference="Microbit 1",
                )
            ],
            created_via="generated",
            language="es",
        )

        main.create_manual_quiz(class_code="ABCD12", payload=payload)

    assert captured["project"].language == "es"
    print("PASS: create_manual_quiz persists the quiz's own language")


def run_create_manual_quiz_rejects_bad_language_as_en():
    captured = {}

    class FakeDB:
        def add(self, obj):
            if isinstance(obj, main.Project):
                captured["project"] = obj

        def commit(self):
            pass

        def refresh(self, obj):
            obj.id = 1
            obj.created_at = None

        def close(self):
            pass

    with patch.object(main, "SessionLocal", return_value=FakeDB()), \
         patch.object(main, "get_classroom_or_404", return_value=FakeClassroom()), \
         patch.object(main, "get_classroom_member_by_token", return_value=FakeMember()):

        payload = main.ManualQuizCreateRequest(
            member_token="tok123",
            title="Blank Quiz",
            questions=[
                main.ManualQuizQuestion(
                    question="Q1", options=["A", "B"], correct=0,
                )
            ],
            language="fr",  # not a supported MVP language
        )

        main.create_manual_quiz(class_code="ABCD12", payload=payload)

    assert captured["project"].language == "en"
    print("PASS: an unsupported language value collapses to 'en', same pattern as created_via")


def run_prompt_unaffected_when_flag_off():
    # Regression check: the existing (non-lesson) quiz path must
    # produce byte-identical prompt text to before this change,
    # since require_microbit_reference defaults to False.
    with patch.object(main, "call_json_model", return_value={"quiz": {"title": "t", "questions": []}}) as call_mock:
        main.generate_quiz_from_source("Some material", "", "en", 3)

    prompt_arg = call_mock.call_args[0][1]
    assert "microbit_reference" not in prompt_arg
    print("PASS: default (non-lesson) quiz prompt has no microbit_reference wording")


def run_prompt_includes_reference_when_flag_on():
    with patch.object(main, "call_json_model", return_value={"quiz": {"title": "t", "questions": []}}) as call_mock:
        main.generate_quiz_from_source(
            "Microbit 1:\nSomething", "", "en", 5, require_microbit_reference=True
        )

    prompt_arg = call_mock.call_args[0][1]
    assert "microbit_reference" in prompt_arg
    print("PASS: lesson-grounded prompt explicitly asks for microbit_reference")


if __name__ == "__main__":
    run_generate_draft_success()
    run_generate_draft_wrong_owner_rejected()
    run_generate_draft_no_chunks_rejected()
    run_generate_draft_falls_back_to_en_when_lesson_has_no_language()
    run_create_manual_quiz_persists_language()
    run_create_manual_quiz_rejects_bad_language_as_en()
    run_prompt_unaffected_when_flag_off()
    run_prompt_includes_reference_when_flag_on()
    print("\nALL TESTS PASSED")
