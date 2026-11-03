import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Plus,
  X,
  Trash2,
  FileText,
  Puzzle,
  ClipboardList,
  Users,
  LayoutGrid,
  Paperclip,
  Upload,
  Check,
  Pencil,
  BookOpen,
  Clock,
  Copy,
} from 'lucide-react';
import {
  getClassroom,
  getMyClassrooms,
  listMaterials,
  createMaterial,
  deleteMaterial,
  listManualQuizzes,
  createManualQuiz,
  updateManualQuiz,
  deleteManualQuiz,
  createAssignment,
  getClassroomStudents,
  uploadClassroomMedia,
  mediaUrl,
} from '../services/api';

// ============================================================
// Class Workspace — the per-class home inside Teacher Workspace.
// Opened from TeacherWorkspace's "My Classes" grid. Covers the
// four sections explicitly requested on top of "My Classes"
// (already live): Teaching Materials, Quiz Builder, Assignments,
// Students. A "Lessons" tab (from the original spec) isn't built
// yet — see TEACHER_WORKSPACE_PLAN.md.
//
// Every write here uses the existing classroom member_token +
// require_teacher auth pattern already used by Assign Homework on
// the old Classroom page — nothing new on the auth side.
// ============================================================

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-black font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-colors';

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-black mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-black/50 font-medium mt-1">{hint}</span>}
    </label>
  );
}

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <p className="font-bold text-black mb-1">{title}</p>
      {subtitle && <p className="text-sm text-black/60 font-medium mb-4">{subtitle}</p>}
      {action}
    </div>
  );
}

function AttachmentList({ attachments }) {
  if (!attachments || attachments.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {attachments.map((a, i) => (
        <a
          key={i}
          href={mediaUrl(`/api/media/${a.media_asset_id}`, { download: true })}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-100"
        >
          <Paperclip className="w-3 h-3" /> {a.filename || 'file'}
        </a>
      ))}
    </div>
  );
}

// A small shared "pick files, upload them one by one, collect
// attachment refs" widget used by both Teaching Materials and
// Assignments — avoids building the same upload flow twice.
function AttachmentPicker({ classCode, memberToken, attachments, setAttachments }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFiles = async (fileList) => {
    setUploading(true);
    setError(null);
    try {
      const uploaded = [];
      for (const file of Array.from(fileList)) {
        const res = await uploadClassroomMedia(classCode, { memberToken, file });
        uploaded.push({
          media_asset_id: res.media_asset_id,
          filename: res.filename,
          mime_type: res.mime_type,
        });
      }
      setAttachments([...attachments, ...uploaded]);
    } catch (err) {
      setError(err?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 text-sm font-bold text-black/70 hover:bg-slate-50 cursor-pointer transition-colors">
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? 'Uploading…' : 'Upload files (PDF, image, doc)'}
        <input
          type="file"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
        />
      </label>
      {error && <p className="text-xs font-bold text-red-600 mt-2">{error}</p>}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {attachments.map((a, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5"
            >
              <Paperclip className="w-3 h-3" /> {a.filename}
              <button
                type="button"
                onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                className="text-slate-400 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Teaching Materials
// ---------------------------------------------------------------

function MaterialForm({ classCode, memberToken, onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createMaterial(classCode, {
        memberToken,
        title: title.trim(),
        description: description.trim(),
        attachments,
      });
      onSaved();
    } catch (err) {
      setError(err?.message || 'Failed to save material.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-extrabold text-lg text-black">Add Teaching Material</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-black">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Title">
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder="e.g. Unit 3 Reference Sheet" />
          </Field>
          <Field label="Description">
            <textarea className={`${inputClass} resize-none`} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's in this material?" />
          </Field>
          <Field label="Files">
            <AttachmentPicker classCode={classCode} memberToken={memberToken} attachments={attachments} setAttachments={setAttachments} />
          </Field>
          {error && <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {submitting ? 'Saving…' : 'Save Material'}
          </button>
        </div>
      </form>
    </div>
  );
}

function MaterialsTab({ classCode, memberToken }) {
  const [materials, setMaterials] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setError(null);
    listMaterials(classCode, memberToken)
      .then((data) => setMaterials(data.materials || []))
      .catch((err) => setError(err?.message || 'Unable to load materials.'));
  }, [classCode, memberToken]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await deleteMaterial(classCode, id, memberToken);
      load();
    } catch (err) {
      setError(err?.message || 'Failed to delete.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-black text-lg flex items-center gap-2">
          <FileText className="w-5 h-5" /> Teaching Materials
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800"
        >
          <Plus className="w-4 h-4" /> Add material
        </button>
      </div>

      {error && <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">{error}</p>}

      {!error && materials === null && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-black animate-spin" />
        </div>
      )}

      {!error && materials && materials.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No teaching materials yet"
          subtitle="Upload reference sheets, slides, or notes for this class."
          action={
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors">
              <Plus className="w-4 h-4" /> Add material
            </button>
          }
        />
      )}

      {!error && materials && materials.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {materials.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold text-black leading-snug">{m.title}</h3>
                <button onClick={() => handleDelete(m.id)} className="shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-black/40 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {m.description && <p className="text-sm text-black/70 font-medium mt-1">{m.description}</p>}
              <AttachmentList attachments={m.attachments} />
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <MaterialForm
          classCode={classCode}
          memberToken={memberToken}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Manual Quiz Builder
// ---------------------------------------------------------------

function blankQuestion() {
  return { question: '', options: ['', ''], correct: 0, explanation: '', marks: 1 };
}

function QuizForm({ classCode, memberToken, existing, onClose, onSaved }) {
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [durationMinutes, setDurationMinutes] = useState(existing?.duration_minutes || '');
  const [status, setStatus] = useState(existing?.status || 'draft');
  const [questions, setQuestions] = useState(
    existing?.questions?.length
      ? existing.questions.map((q) => ({
          question: q.q || '',
          options: q.options?.length ? q.options : ['', ''],
          correct: q.correct ?? 0,
          explanation: q.explanation || '',
          marks: q.marks || 1,
        }))
      : [blankQuestion()]
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const updateQuestion = (idx, patch) => {
    setQuestions(questions.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuestions(
      questions.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.map((o, oi) => (oi === optIdx ? value : o)) } : q
      )
    );
  };

  const addOption = (qIdx) => {
    setQuestions(questions.map((q, i) => (i === qIdx ? { ...q, options: [...q.options, ''] } : q)));
  };

  const removeOption = (qIdx, optIdx) => {
    setQuestions(
      questions.map((q, i) => {
        if (i !== qIdx) return q;
        const options = q.options.filter((_, oi) => oi !== optIdx);
        const correct = q.correct >= options.length ? 0 : q.correct;
        return { ...q, options, correct };
      })
    );
  };

  const addQuestion = () => setQuestions([...questions, blankQuestion()]);
  const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));

  const handleSubmit = async (e, publish) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Quiz title is required.');
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const cleanOptions = q.options.map((o) => o.trim()).filter(Boolean);
      if (!q.question.trim() || cleanOptions.length < 2) {
        setError(`Question ${i + 1} needs text and at least 2 options.`);
        return;
      }
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        memberToken,
        title: title.trim(),
        description: description.trim(),
        durationMinutes: durationMinutes ? Number(durationMinutes) : null,
        status: publish ? 'published' : 'draft',
        questions: questions.map((q) => ({
          question: q.question.trim(),
          options: q.options.map((o) => o.trim()).filter(Boolean),
          correct: q.correct,
          explanation: q.explanation.trim(),
          marks: Number(q.marks) || 1,
        })),
      };
      if (existing?.project_id) {
        await updateManualQuiz(classCode, existing.project_id, payload);
      } else {
        await createManualQuiz(classCode, payload);
      }
      onSaved();
    } catch (err) {
      setError(err?.message || 'Failed to save quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={(e) => handleSubmit(e, status === 'published')}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="font-extrabold text-lg text-black">{existing ? 'Edit Quiz' : 'New Quiz'}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <Field label="Quiz Title">
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder="e.g. Chapter 3 Checkpoint" />
          </Field>
          <Field label="Description">
            <textarea className={`${inputClass} resize-none`} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Duration (minutes)" hint="Optional">
              <input type="number" min="1" className={inputClass} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} placeholder="e.g. 15" />
            </Field>
            <Field label="Status">
              <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
          </div>

          <div className="space-y-4">
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-extrabold text-teal-700 bg-teal-50 rounded-full px-2.5 py-1">Q{qIdx + 1}</span>
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(qIdx)} className="p-1 rounded-lg hover:bg-red-50 text-black/40 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input
                  className={inputClass}
                  placeholder="Question text"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                />
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={q.correct === optIdx}
                        onChange={() => updateQuestion(qIdx, { correct: optIdx })}
                        className="shrink-0 accent-teal-600"
                      />
                      <input
                        className={`${inputClass} flex-1`}
                        placeholder={`Option ${optIdx + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                      />
                      {q.options.length > 2 && (
                        <button type="button" onClick={() => removeOption(qIdx, optIdx)} className="shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-black/40 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {q.options.length < 6 && (
                    <button type="button" onClick={() => addOption(qIdx)} className="text-xs font-bold text-teal-700 hover:text-teal-800">
                      + Add option
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-[1fr,100px] gap-3">
                  <input
                    className={inputClass}
                    placeholder="Explanation (shown after answering)"
                    value={q.explanation}
                    onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value })}
                  />
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    placeholder="Marks"
                    value={q.marks}
                    onChange={(e) => updateQuestion(qIdx, { marks: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addQuestion} className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800">
            <Plus className="w-4 h-4" /> Add question
          </button>

          {error && <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white">
          <button
            type="button"
            disabled={submitting}
            onClick={(e) => handleSubmit(e, false)}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-black bg-slate-100 hover:bg-slate-200 disabled:opacity-60 transition-colors"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={(e) => handleSubmit(e, true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            Publish
          </button>
        </div>
      </form>
    </div>
  );
}

function QuizzesTab({ classCode, memberToken, onAssign }) {
  const [quizzes, setQuizzes] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    setError(null);
    listManualQuizzes(classCode, memberToken)
      .then((data) => setQuizzes(data.quizzes || []))
      .catch((err) => setError(err?.message || 'Unable to load quizzes.'));
  }, [classCode, memberToken]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this quiz? Any homework using it will keep the homework but lose the quiz.')) return;
    try {
      await deleteManualQuiz(classCode, projectId, memberToken);
      load();
    } catch (err) {
      setError(err?.message || 'Failed to delete.');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-black text-lg flex items-center gap-2">
          <Puzzle className="w-5 h-5" /> Quiz Builder
        </h2>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800">
          <Plus className="w-4 h-4" /> New quiz
        </button>
      </div>

      {error && <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">{error}</p>}

      {!error && quizzes === null && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-black animate-spin" />
        </div>
      )}

      {!error && quizzes && quizzes.length === 0 && (
        <EmptyState
          icon={Puzzle}
          title="No quizzes yet"
          subtitle="Build a quiz by hand — no AI generation needed — then assign it as homework."
          action={
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors">
              <Plus className="w-4 h-4" /> New quiz
            </button>
          }
        />
      )}

      {!error && quizzes && quizzes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quizzes.map((q) => (
            <div key={q.project_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-extrabold text-black leading-snug">{q.title}</h3>
                <span className={`shrink-0 text-xs font-bold rounded-full px-2.5 py-1 ${q.data?.status === 'published' ? 'text-teal-700 bg-teal-50 border border-teal-100' : 'text-amber-700 bg-amber-50 border border-amber-100'}`}>
                  {q.data?.status === 'published' ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-sm text-black/70 font-medium mb-3">
                {(q.data?.questions || []).length} question{(q.data?.questions || []).length === 1 ? '' : 's'}
                {q.data?.duration_minutes ? ` · ${q.data.duration_minutes} min` : ''}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEditing({ project_id: q.project_id, ...q.data }); setShowForm(true); }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-black/70 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-100"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => onAssign(q)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3 py-1.5 hover:bg-teal-100"
                >
                  <ClipboardList className="w-3 h-3" /> Assign as homework
                </button>
                <button onClick={() => handleDelete(q.project_id)} className="ml-auto p-1.5 rounded-lg hover:bg-red-50 text-black/40 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <QuizForm
          classCode={classCode}
          memberToken={memberToken}
          existing={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Assignments
// ---------------------------------------------------------------

function AssignmentForm({ classCode, memberToken, quizzes, prefillQuiz, onClose, onSaved }) {
  const [title, setTitle] = useState(prefillQuiz ? prefillQuiz.title : '');
  const [instructions, setInstructions] = useState('');
  const [quizProjectId, setQuizProjectId] = useState(prefillQuiz ? prefillQuiz.project_id : '');
  const [dueAt, setDueAt] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!quizProjectId && attachments.length === 0) {
      setError('Pick a quiz or attach at least one file.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createAssignment(classCode, {
        memberToken,
        title: title.trim(),
        instructions: instructions.trim(),
        quizProjectId: quizProjectId || null,
        attachments,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      });
      onSaved();
    } catch (err) {
      setError(err?.message || 'Failed to create assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-extrabold text-lg text-black">New Assignment</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-black">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Title">
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder="e.g. Homework 4" />
          </Field>
          <Field label="Instructions">
            <textarea className={`${inputClass} resize-none`} rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="What should students do?" />
          </Field>
          <Field label="Quiz (optional)" hint="Pick one of this class's manually-built quizzes">
            <select className={inputClass} value={quizProjectId} onChange={(e) => setQuizProjectId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">No quiz — files only</option>
              {quizzes.map((q) => (
                <option key={q.project_id} value={q.project_id}>{q.title}</option>
              ))}
            </select>
          </Field>
          <Field label="Attach files (optional)">
            <AttachmentPicker classCode={classCode} memberToken={memberToken} attachments={attachments} setAttachments={setAttachments} />
          </Field>
          <Field label="Due date (optional)">
            <input type="datetime-local" className={inputClass} value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </Field>
          {error && <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {submitting ? 'Creating…' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
}

function AssignmentsTab({ classCode, memberToken, assignments, studentCount, onRefresh, prefillQuiz, clearPrefillQuiz }) {
  const [quizzes, setQuizzes] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    listManualQuizzes(classCode, memberToken).then((data) => setQuizzes(data.quizzes || [])).catch(() => {});
  }, [classCode, memberToken]);

  useEffect(() => {
    if (prefillQuiz) setShowForm(true);
  }, [prefillQuiz]);

  const handleClose = () => {
    setShowForm(false);
    clearPrefillQuiz();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-black text-lg flex items-center gap-2">
          <ClipboardList className="w-5 h-5" /> Assignments
        </h2>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800">
          <Plus className="w-4 h-4" /> New assignment
        </button>
      </div>

      {(!assignments || assignments.length === 0) && (
        <EmptyState
          icon={ClipboardList}
          title="No assignments yet"
          subtitle="Assign a quiz you built, or attach files for students to work through."
          action={
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors">
              <Plus className="w-4 h-4" /> New assignment
            </button>
          }
        />
      )}

      {assignments && assignments.length > 0 && (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold text-black leading-snug">{a.title}</h3>
                <span className="shrink-0 text-xs font-bold text-black/60 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
                  {a.submitted_count}/{studentCount ?? a.student_count} submitted
                </span>
              </div>
              {a.instructions && <p className="text-sm text-black/70 font-medium mt-1">{a.instructions}</p>}
              <div className="flex items-center gap-3 mt-3 text-xs font-bold text-black/50">
                {a.due_at && (
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Due {new Date(a.due_at).toLocaleString()}</span>
                )}
                {a.quiz_project_id && <span className="inline-flex items-center gap-1"><Puzzle className="w-3 h-3" /> Quiz attached</span>}
              </div>
              <AttachmentList attachments={a.attachments} />
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AssignmentForm
          classCode={classCode}
          memberToken={memberToken}
          quizzes={quizzes}
          prefillQuiz={prefillQuiz}
          onClose={handleClose}
          onSaved={() => { handleClose(); onRefresh(); }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Students
// ---------------------------------------------------------------

function StudentsTab({ classCode, memberToken }) {
  const [students, setStudents] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getClassroomStudents(classCode, memberToken)
      .then((data) => setStudents(data.students || []))
      .catch((err) => setError(err?.message || 'Unable to load students.'));
  }, [classCode, memberToken]);

  return (
    <div>
      <h2 className="font-extrabold text-black text-lg flex items-center gap-2 mb-4">
        <Users className="w-5 h-5" /> Students
      </h2>

      {error && <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

      {!error && students === null && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-black animate-spin" />
        </div>
      )}

      {!error && students && students.length === 0 && (
        <EmptyState icon={Users} title="No students enrolled yet" subtitle="Share this class's joining code to get students in." />
      )}

      {!error && students && students.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-black/60 font-bold">
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Assignments</th>
                <th className="px-5 py-3">Quiz attempts</th>
                <th className="px-5 py-3">Avg. score</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-bold text-black">{s.display_name}</td>
                  <td className="px-5 py-3 text-black/80 font-medium">{s.assignments_completed}/{s.assignments_total}</td>
                  <td className="px-5 py-3 text-black/80 font-medium">{s.quiz_attempts}</td>
                  <td className="px-5 py-3 text-black/80 font-medium">{s.average_score_percent != null ? `${s.average_score_percent}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Overview
// ---------------------------------------------------------------

function OverviewTab({ classroom }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(classroom.class_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <p className="text-xs font-bold text-black/50 mb-1">Class details</p>
        <p className="font-extrabold text-black mb-1">{classroom.name}</p>
        <p className="text-sm text-black/70 font-medium">
          {[classroom.subject, classroom.grade_level, classroom.topic].filter(Boolean).join(' · ') || 'No details set'}
        </p>
        {classroom.description && <p className="text-sm text-black/60 font-medium mt-2">{classroom.description}</p>}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <p className="text-xs font-bold text-black/50 mb-2">Joining code</p>
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-[0.25em] text-black">{classroom.class_code}</span>
          <button onClick={copyCode} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-black">
            {copied ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-sm text-black/60 font-medium mt-3">
          {(classroom.members || []).filter((m) => m.role === 'student').length} student(s) enrolled ·{' '}
          {(classroom.assignments || []).length} assignment(s)
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid },
  { key: 'materials', label: 'Teaching Materials', icon: FileText },
  { key: 'quizzes', label: 'Quiz Builder', icon: Puzzle },
  { key: 'assignments', label: 'Assignments', icon: ClipboardList },
  { key: 'students', label: 'Students', icon: Users },
];

export default function ClassWorkspace() {
  const { classCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [memberToken, setMemberToken] = useState(location.state?.enterAs?.memberToken || null);
  const [classroom, setClassroom] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('overview');
  const [prefillQuiz, setPrefillQuiz] = useState(null);

  const loadClassroom = useCallback(() => {
    getClassroom(classCode).then(setClassroom).catch((err) => setError(err?.message || 'Unable to load this class.'));
  }, [classCode]);

  useEffect(() => {
    let active = true;

    async function init() {
      let token = location.state?.enterAs?.memberToken;

      if (!token) {
        try {
          const { classrooms } = await getMyClassrooms();
          const match = (classrooms || []).find((c) => c.class_code === classCode && c.role === 'teacher');
          if (!match) {
            if (active) setError("You're not the teacher of this class.");
            return;
          }
          token = match.member_token;
        } catch (err) {
          if (active) setError(err?.message || 'Unable to load this class.');
          return;
        }
      }

      if (active) setMemberToken(token);
    }

    init();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classCode]);

  useEffect(() => {
    if (memberToken) loadClassroom();
  }, [memberToken, loadClassroom]);

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="font-bold text-red-600 mb-4">{error}</p>
        <Link to="/teacher-workspace" className="font-bold text-teal-700 hover:text-teal-800">Back to Teacher Workspace</Link>
      </div>
    );
  }

  if (!memberToken || !classroom) {
    return (
      <div className="py-24 flex items-center justify-center text-black">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const studentCount = (classroom.members || []).filter((m) => m.role === 'student').length;

  return (
    <div className="space-y-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        onClick={() => navigate('/teacher-workspace')}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-black/60 hover:text-black"
      >
        <ArrowLeft className="w-4 h-4" /> Teacher Workspace
      </button>

      <div
        className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-5 sm:p-7 text-white"
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg, #1e293b 0%, #334155 60%, #0d9488 130%)' }} />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">{classroom.name}</h1>
              <p className="text-white/80 text-sm font-semibold">
                {[classroom.subject, classroom.grade_level].filter(Boolean).join(' · ') || 'Class Workspace'}
              </p>
            </div>
          </div>
          <span className="text-sm font-extrabold tracking-[0.2em] bg-white/15 border border-white/25 rounded-full px-4 py-1.5">
            {classroom.class_code}
          </span>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto border-b border-slate-200 pb-0.5">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl font-bold text-sm whitespace-nowrap transition-colors border-b-2 ${
                active ? 'text-teal-700 border-teal-600 bg-teal-50/50' : 'text-black/60 border-transparent hover:text-black'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      <div>
        {tab === 'overview' && <OverviewTab classroom={classroom} />}
        {tab === 'materials' && <MaterialsTab classCode={classCode} memberToken={memberToken} />}
        {tab === 'quizzes' && (
          <QuizzesTab
            classCode={classCode}
            memberToken={memberToken}
            onAssign={(quiz) => { setPrefillQuiz({ project_id: quiz.project_id, title: quiz.title }); setTab('assignments'); }}
          />
        )}
        {tab === 'assignments' && (
          <AssignmentsTab
            classCode={classCode}
            memberToken={memberToken}
            assignments={classroom.assignments}
            studentCount={studentCount}
            onRefresh={loadClassroom}
            prefillQuiz={prefillQuiz}
            clearPrefillQuiz={() => setPrefillQuiz(null)}
          />
        )}
        {tab === 'students' && <StudentsTab classCode={classCode} memberToken={memberToken} />}
      </div>
    </div>
  );
}
