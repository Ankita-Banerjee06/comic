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
  LogOut,
  Palette,
  Sparkles,
  BookMarked,
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
  generateQuizDraftFromLesson,
  getLibrary,
  createAssignment,
  getClassroomStudents,
  uploadClassroomMedia,
  leaveClassroom,
  mediaUrl,
} from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import PresentLivePanel from '../components/live/PresentLivePanel';
import ClassroomDesigner from '../components/designer/ClassroomDesigner';

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
      <span className="block text-base font-bold text-black mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-sm text-black font-medium mt-1">{hint}</span>}
    </label>
  );
}

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-black" />
      </div>
      <p className="font-bold text-black mb-1">{title}</p>
      {subtitle && <p className="text-base text-black font-medium mb-4">{subtitle}</p>}
      {action}
    </div>
  );
}

// A teacher leaving a class here just removes THEIR OWN membership
// row (the same /api/classrooms/{code}/leave endpoint the old
// Classroom page's "Leave" button already uses) — the class itself,
// its students, materials, and assignments are untouched, so another
// teacher with access (or this teacher rejoining with the class code)
// still finds everything exactly as it was.
function LeaveClassConfirmModal({ className, busy, onCancel, onConfirm }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={() => (!busy ? onCancel() : null)} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
          <LogOut className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="text-xl font-extrabold text-black mb-1.5">{t('Leave')} {className || t('this classroom')}?</h3>
        <p className="text-base text-black font-medium mb-6 leading-relaxed">
          {t("You'll lose teacher access to this class from Teacher Workspace. Nothing about the class itself — students, materials, or assignments — is deleted, and you can rejoin anytime with the class code.")}
        </p>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} disabled={busy} className="flex-1 py-2.5 rounded-xl font-bold text-base text-black bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50">
            {t('Cancel')}
          </button>
          <button onClick={onConfirm} disabled={busy} className="flex-1 py-2.5 rounded-xl font-bold text-base text-white bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-60">
            {busy ? t('Leaving…') : t('Leave Classroom')}
          </button>
        </div>
      </div>
    </div>
  );
}

function AttachmentList({ attachments }) {
  const { t } = useLanguage();
  if (!attachments || attachments.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {attachments.map((a, i) => (
        <a
          key={i}
          href={mediaUrl(`/api/media/${a.media_asset_id}`, { download: true })}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-black bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-100"
        >
          <Paperclip className="w-3 h-3" /> {a.filename || t('file')}
        </a>
      ))}
    </div>
  );
}

// A small shared "pick files, upload them one by one, collect
// attachment refs" widget used by both Teaching Materials and
// Assignments — avoids building the same upload flow twice.
function AttachmentPicker({ classCode, memberToken, attachments, setAttachments }) {
  const { t } = useLanguage();
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
      setError(err?.message || t('Upload failed.'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 text-base font-bold text-black hover:bg-slate-50 cursor-pointer transition-colors">
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {uploading ? t('Uploading…') : t('Upload files (PDF, image, doc)')}
        <input
          type="file"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
        />
      </label>
      {error && <p className="text-sm font-bold text-red-600 mt-2">{error}</p>}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {attachments.map((a, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-black bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5"
            >
              <Paperclip className="w-3 h-3" /> {a.filename}
              <button
                type="button"
                onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                className="text-black hover:text-red-500"
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
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(t('Title is required.'));
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
      setError(err?.message || t('Failed to save material.'));
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
          <h2 className="font-extrabold text-xl text-black">{t('Add Teaching Material')}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-black">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <Field label={t('Title')}>
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder={t('e.g. Unit 3 Reference Sheet')} />
          </Field>
          <Field label={t('Description')}>
            <textarea className={`${inputClass} resize-none`} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("What's in this material?")} />
          </Field>
          <Field label={t('Files')}>
            <AttachmentPicker classCode={classCode} memberToken={memberToken} attachments={attachments} setAttachments={setAttachments} />
          </Field>
          {error && <p className="text-base font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {submitting ? t('Saving…') : t('Save Material')}
          </button>
        </div>
      </form>
    </div>
  );
}

function MaterialsTab({ classCode, memberToken }) {
  const { t } = useLanguage();
  const [materials, setMaterials] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setError(null);
    listMaterials(classCode, memberToken)
      .then((data) => setMaterials(data.materials || []))
      .catch((err) => setError(err?.message || t('Unable to load materials.')));
  }, [classCode, memberToken]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm(t('Delete this material?'))) return;
    try {
      await deleteMaterial(classCode, id, memberToken);
      load();
    } catch (err) {
      setError(err?.message || t('Failed to delete.'));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-black text-xl flex items-center gap-2">
          <FileText className="w-5 h-5" /> {t('Teaching Materials')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 text-base font-bold text-teal-700 hover:text-teal-800"
        >
          <Plus className="w-4 h-4" /> {t('Add material')}
        </button>
      </div>

      {error && <p className="text-base font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">{error}</p>}

      {!error && materials === null && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-black animate-spin" />
        </div>
      )}

      {!error && materials && materials.length === 0 && (
        <EmptyState
          icon={FileText}
          title={t('No teaching materials yet')}
          subtitle={t('Upload reference sheets, slides, or notes for this class.')}
          action={
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors">
              <Plus className="w-4 h-4" /> {t('Add material')}
            </button>
          }
        />
      )}

      {!error && materials && materials.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {materials.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl border-2 border-blue-100 border-l-8 border-l-blue-500 shadow-sm p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold text-black leading-snug">{m.title}</h3>
                <button onClick={() => handleDelete(m.id)} className="shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-black hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {m.description && <p className="text-base text-black font-medium mt-1">{m.description}</p>}
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
  return { question: '', options: ['', ''], correct: 0, explanation: '', marks: 1, microbit_reference: null };
}

// `existing` (edit an already-saved quiz) and `initialDraft` (review
// an unsaved "Generate from Lesson" result, before it's ever been
// saved) are mutually exclusive — `existing` always wins if somehow
// both were passed. Both pre-fill the exact same form; the only
// real difference is which save call handleSubmit makes, and that a
// draft's questions carry a microbit_reference to show the teacher.
function QuizForm({ classCode, memberToken, existing, initialDraft, onClose, onSaved }) {
  const isReviewingDraft = !existing && !!initialDraft;
  // A brand-new quiz's content language: a "Generate from Lesson"
  // draft already carries the source lesson's own language (see
  // generateQuizDraftFromLesson); a Start Blank quiz has no lesson
  // to inherit from, so it saves in whichever language the teacher
  // is currently working in. Editing an existing quiz never changes
  // its language — that's fixed at creation, same as an AMIVI
  // lesson's language never changes after it's generated.
  const { language: currentUiLanguage, t } = useLanguage();
  const quizLanguage = initialDraft?.language || currentUiLanguage || 'en';

  const [title, setTitle] = useState(existing?.title || initialDraft?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [durationMinutes, setDurationMinutes] = useState(existing?.duration_minutes || '');
  const [status, setStatus] = useState(existing?.status || 'draft');
  const [questions, setQuestions] = useState(() => {
    if (existing?.questions?.length) {
      return existing.questions.map((q) => ({
        question: q.q || '',
        options: q.options?.length ? q.options : ['', ''],
        correct: q.correct ?? 0,
        explanation: q.explanation || '',
        marks: q.marks || 1,
        microbit_reference: q.microbit_reference || null,
      }));
    }
    if (initialDraft?.questions?.length) {
      return initialDraft.questions.map((q) => ({
        question: q.question || '',
        options: q.options?.length ? q.options : ['', ''],
        correct: q.correct ?? 0,
        explanation: q.explanation || '',
        marks: q.marks || 1,
        microbit_reference: q.microbit_reference || null,
      }));
    }
    return [blankQuestion()];
  });
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
      setError(t('Quiz title is required.'));
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const cleanOptions = q.options.map((o) => o.trim()).filter(Boolean);
      if (!q.question.trim() || cleanOptions.length < 2) {
        setError(`${t('Question')} ${i + 1} ${t('needs text and at least 2 options.')}`);
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
          microbit_reference: q.microbit_reference || null,
        })),
      };
      if (existing?.project_id) {
        await updateManualQuiz(classCode, existing.project_id, payload);
      } else {
        // Only a quiz that started as a "Generate from Lesson" draft
        // (and has gone through this same review screen) is tagged
        // generated — a brand new Start Blank quiz, or one with no
        // draft behind it at all, saves as manual exactly as before.
        await createManualQuiz(classCode, {
          ...payload,
          createdVia: isReviewingDraft ? 'generated' : 'manual',
          language: quizLanguage,
        });
      }
      onSaved();
    } catch (err) {
      setError(err?.message || t('Failed to save quiz.'));
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
          <h2 className="font-extrabold text-xl text-black">
            {existing ? t('Edit Quiz') : isReviewingDraft ? t('Review Generated Quiz') : t('New Quiz')}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isReviewingDraft && (
          <div className="mx-6 mt-4 px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl text-base font-semibold text-purple-900">
            {t('Generated from')} <span className="font-extrabold">{initialDraft.source_title}</span> —{' '}
            {t("each question below is tagged with the Microbit it came from. Review the answers and explanations, edit or remove anything that's off, add more if you want, then save.")}
          </div>
        )}

        <div className="p-6 space-y-5">
          <Field label={t('Quiz Title')}>
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder={t('e.g. Chapter 3 Checkpoint')} />
          </Field>
          <Field label={t('Description')}>
            <textarea className={`${inputClass} resize-none`} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('Duration (minutes)')} hint={t('Optional')}>
              <input type="number" min="1" className={inputClass} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} placeholder={t('e.g. 15')} />
            </Field>
            <Field label={t('Status')}>
              <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="draft">{t('Draft')}</option>
                <option value="published">{t('Published')}</option>
              </select>
            </Field>
          </div>

          <div className="space-y-4">
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-extrabold text-teal-700 bg-teal-50 rounded-full px-2.5 py-1">Q{qIdx + 1}</span>
                    {q.microbit_reference && (
                      <span className="text-sm font-bold text-purple-700 bg-purple-50 border border-purple-100 rounded-full px-2.5 py-1">
                        📍 {q.microbit_reference}
                      </span>
                    )}
                  </div>
                  {questions.length > 1 && (
                    <button type="button" onClick={() => removeQuestion(qIdx)} className="p-1 rounded-lg hover:bg-red-50 text-black hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input
                  className={inputClass}
                  placeholder={t('Question text')}
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
                        placeholder={`${t('Option')} ${optIdx + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                      />
                      {q.options.length > 2 && (
                        <button type="button" onClick={() => removeOption(qIdx, optIdx)} className="shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-black hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {q.options.length < 6 && (
                    <button type="button" onClick={() => addOption(qIdx)} className="text-sm font-bold text-teal-700 hover:text-teal-800">
                      + {t('Add option')}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-[1fr,100px] gap-3">
                  <input
                    className={inputClass}
                    placeholder={t('Explanation (shown after answering)')}
                    value={q.explanation}
                    onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value })}
                  />
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    placeholder={t('Marks')}
                    value={q.marks}
                    onChange={(e) => updateQuestion(qIdx, { marks: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addQuestion} className="inline-flex items-center gap-1.5 text-base font-bold text-teal-700 hover:text-teal-800">
            <Plus className="w-4 h-4" /> {t('Add question')}
          </button>

          {error && <p className="text-base font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white">
          <button
            type="button"
            disabled={submitting}
            onClick={(e) => handleSubmit(e, false)}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-black bg-slate-100 hover:bg-slate-200 disabled:opacity-60 transition-colors"
          >
            {t('Save as Draft')}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={(e) => handleSubmit(e, true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            {t('Publish')}
          </button>
        </div>
      </form>
    </div>
  );
}

// The lesson-picker for "Generate from Lesson" — lists this
// teacher's own saved AMIVI lessons (from their personal Library,
// same one Library.jsx's own "Create Quiz" reads from) so they can
// pick which one's Microbits to ground the quiz in, then calls the
// draft endpoint and hands the unsaved result up to QuizzesTab to
// open in QuizForm for review.
function GenerateQuizModal({ classCode, memberToken, onClose, onGenerated }) {
  const { t } = useLanguage();
  const [lessons, setLessons] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [selectedId, setSelectedId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getLibrary()
      .then((res) => {
        if (cancelled) return;
        setLessons((res.projects || []).filter((p) => p.type === 'amivi'));
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(t('Unable to load your AMIVI lessons.'));
      });
    return () => { cancelled = true; };
  }, [t]);

  const handleGenerate = async () => {
    if (!selectedId) return;
    setGenerating(true);
    setGenError(null);
    try {
      // The backend always grounds this in the lesson's OWN saved
      // language regardless of what's sent here — this is just a
      // best-effort fallback for the rare case it can't resolve one.
      const selectedLesson = (lessons || []).find((l) => String(l.id) === String(selectedId));
      const draft = await generateQuizDraftFromLesson(classCode, {
        memberToken,
        sourceProjectId: Number(selectedId),
        language: selectedLesson?.language || 'en',
      });
      onGenerated(draft);
    } catch (err) {
      setGenError(err?.message || t('Failed to generate a quiz from that lesson.'));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-extrabold text-xl text-black flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" /> {t('Generate from Lesson')}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-base text-black font-medium">
            {t("Pick a saved AMIVI lesson. Five questions get generated strictly from that lesson's own Microbits — nothing it didn't actually teach — for you to review before saving.")}
          </p>

          {loadError && <p className="text-base font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{loadError}</p>}

          {!loadError && lessons === null && (
            <div className="py-8 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-black animate-spin" />
            </div>
          )}

          {!loadError && lessons && lessons.length === 0 && (
            <p className="text-base text-black font-medium bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              {t('No AMIVI lessons in your Library yet — create one in AMIVI first, then come back here.')}
            </p>
          )}

          {!loadError && lessons && lessons.length > 0 && (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {lessons.map((lesson) => (
                <label
                  key={lesson.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-colors ${
                    String(selectedId) === String(lesson.id)
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="lesson"
                    checked={String(selectedId) === String(lesson.id)}
                    onChange={() => setSelectedId(lesson.id)}
                    className="shrink-0 accent-purple-600"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-black text-base truncate">{lesson.title}</p>
                    {lesson.language && <p className="text-sm text-black font-semibold uppercase">{lesson.language}</p>}
                  </div>
                </label>
              ))}
            </div>
          )}

          {genError && <p className="text-base font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{genError}</p>}
        </div>

        <div className="px-6 py-4 border-t border-slate-100">
          <button
            type="button"
            disabled={!selectedId || generating}
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60 transition-colors"
          >
            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {generating ? t('Generating…') : t('Generate Quiz')}
          </button>
        </div>
      </div>
    </div>
  );
}

function QuizzesTab({ classCode, memberToken, onAssign }) {
  const { t } = useLanguage();
  const [quizzes, setQuizzes] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [draft, setDraft] = useState(null);

  const load = useCallback(() => {
    setError(null);
    listManualQuizzes(classCode, memberToken)
      .then((data) => setQuizzes(data.quizzes || []))
      .catch((err) => setError(err?.message || t('Unable to load quizzes.')));
  }, [classCode, memberToken]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (projectId) => {
    if (!window.confirm(t('Delete this quiz? Any homework using it will keep the homework but lose the quiz.'))) return;
    try {
      await deleteManualQuiz(classCode, projectId, memberToken);
      load();
    } catch (err) {
      setError(err?.message || t('Failed to delete.'));
    }
  };

  const startBlank = () => { setEditing(null); setDraft(null); setShowForm(true); };

  const handleGenerated = (generatedDraft) => {
    setEditing(null);
    setDraft(generatedDraft);
    setShowGenerateModal(false);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-extrabold text-black text-xl flex items-center gap-2">
          <Puzzle className="w-5 h-5" /> {t('Quiz Builder')}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowGenerateModal(true)} className="inline-flex items-center gap-1.5 text-base font-bold text-purple-700 hover:text-purple-800">
            <Sparkles className="w-4 h-4" /> {t('Generate from Lesson')}
          </button>
          <span className="text-black/20">|</span>
          <button onClick={startBlank} className="inline-flex items-center gap-1.5 text-base font-bold text-teal-700 hover:text-teal-800">
            <Plus className="w-4 h-4" /> {t('Start Blank')}
          </button>
        </div>
      </div>

      {error && <p className="text-base font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">{error}</p>}

      {!error && quizzes === null && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-black animate-spin" />
        </div>
      )}

      {!error && quizzes && quizzes.length === 0 && (
        <EmptyState
          icon={Puzzle}
          title={t('No quizzes yet')}
          subtitle={t('Generate one from a saved AMIVI lesson, or build one by hand — then assign it as homework.')}
          action={
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button onClick={() => setShowGenerateModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors">
                <Sparkles className="w-4 h-4" /> {t('Generate from Lesson')}
              </button>
              <button onClick={startBlank} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors">
                <Plus className="w-4 h-4" /> {t('Start Blank')}
              </button>
            </div>
          }
        />
      )}

      {!error && quizzes && quizzes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quizzes.map((q) => (
            <div key={q.project_id} className="bg-white rounded-2xl border-2 border-purple-100 border-l-8 border-l-purple-500 shadow-sm p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-extrabold text-black leading-snug">{q.title}</h3>
                <span className={`shrink-0 text-sm font-bold rounded-full px-2.5 py-1 ${q.data?.status === 'published' ? 'text-teal-700 bg-teal-50 border border-teal-100' : 'text-amber-700 bg-amber-50 border border-amber-100'}`}>
                  {q.data?.status === 'published' ? t('Published') : t('Draft')}
                </span>
              </div>
              <p className="text-base text-black font-medium mb-3 flex items-center gap-2 flex-wrap">
                <span>
                  {(q.data?.questions || []).length} {t((q.data?.questions || []).length === 1 ? 'question' : 'questions')}
                  {q.data?.duration_minutes ? ` · ${q.data.duration_minutes} min` : ''}
                </span>
                {q.created_via === 'generated' && (
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-purple-700 bg-purple-50 border border-purple-100 rounded-full px-2 py-0.5">
                    <Sparkles className="w-3 h-3" /> {t('Generated')}
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setDraft(null); setEditing({ project_id: q.project_id, ...q.data }); setShowForm(true); }}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-black bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-100"
                >
                  <Pencil className="w-3 h-3" /> {t('Edit')}
                </button>
                <button
                  onClick={() => onAssign(q)}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3 py-1.5 hover:bg-teal-100"
                >
                  <ClipboardList className="w-3 h-3" /> {t('Assign as homework')}
                </button>
                <button onClick={() => handleDelete(q.project_id)} className="ml-auto p-1.5 rounded-lg hover:bg-red-50 text-black hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showGenerateModal && (
        <GenerateQuizModal
          classCode={classCode}
          memberToken={memberToken}
          onClose={() => setShowGenerateModal(false)}
          onGenerated={handleGenerated}
        />
      )}

      {showForm && (
        <QuizForm
          classCode={classCode}
          memberToken={memberToken}
          existing={editing}
          initialDraft={draft}
          onClose={() => { setShowForm(false); setDraft(null); }}
          onSaved={() => { setShowForm(false); setDraft(null); load(); }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// Assignments
// ---------------------------------------------------------------

function AssignmentForm({ classCode, memberToken, quizzes, prefillQuiz, onClose, onSaved }) {
  const { t } = useLanguage();
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
      setError(t('Title is required.'));
      return;
    }
    if (!quizProjectId && attachments.length === 0) {
      setError(t('Pick a quiz or attach at least one file.'));
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
      setError(err?.message || t('Failed to create assignment.'));
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
          <h2 className="font-extrabold text-xl text-black">{t('New Assignment')}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-black">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <Field label={t('Title')}>
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder={t('e.g. Homework 4')} />
          </Field>
          <Field label={t('Instructions')}>
            <textarea className={`${inputClass} resize-none`} rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder={t('What should students do?')} />
          </Field>
          <Field label={t('Quiz (optional)')} hint={t("Pick one of this class's manually-built quizzes")}>
            <select className={inputClass} value={quizProjectId} onChange={(e) => setQuizProjectId(e.target.value ? Number(e.target.value) : '')}>
              <option value="">{t('No quiz — files only')}</option>
              {quizzes.map((q) => (
                <option key={q.project_id} value={q.project_id}>{q.title}</option>
              ))}
            </select>
          </Field>
          <Field label={t('Attach files (optional)')}>
            <AttachmentPicker classCode={classCode} memberToken={memberToken} attachments={attachments} setAttachments={setAttachments} />
          </Field>
          <Field label={t('Due date (optional)')}>
            <input type="datetime-local" className={inputClass} value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </Field>
          {error && <p className="text-base font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
        </div>
        <div className="px-6 py-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {submitting ? t('Creating…') : t('Create Assignment')}
          </button>
        </div>
      </form>
    </div>
  );
}

function AssignmentsTab({ classCode, memberToken, assignments, studentCount, onRefresh, prefillQuiz, clearPrefillQuiz }) {
  const { t } = useLanguage();
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
        <h2 className="font-extrabold text-black text-xl flex items-center gap-2">
          <ClipboardList className="w-5 h-5" /> {t('Assignments')}
        </h2>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-1.5 text-base font-bold text-teal-700 hover:text-teal-800">
          <Plus className="w-4 h-4" /> {t('New assignment')}
        </button>
      </div>

      {(!assignments || assignments.length === 0) && (
        <EmptyState
          icon={ClipboardList}
          title={t('No assignments yet')}
          subtitle={t('Assign a quiz you built, or attach files for students to work through.')}
          action={
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors">
              <Plus className="w-4 h-4" /> {t('New assignment')}
            </button>
          }
        />
      )}

      {assignments && assignments.length > 0 && (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border-2 border-amber-100 border-l-8 border-l-amber-500 shadow-sm p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold text-black leading-snug">{a.title}</h3>
                <span className="shrink-0 text-sm font-bold text-black bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
                  {a.submitted_count}/{studentCount ?? a.student_count} {t('submitted')}
                </span>
              </div>
              {a.instructions && <p className="text-base text-black font-medium mt-1">{a.instructions}</p>}
              <div className="flex items-center gap-3 mt-3 text-sm font-bold text-black">
                {a.due_at && (
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {t('Due')} {new Date(a.due_at).toLocaleString()}</span>
                )}
                {a.quiz_project_id && <span className="inline-flex items-center gap-1"><Puzzle className="w-3 h-3" /> {t('Quiz attached')}</span>}
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
  const { t } = useLanguage();
  const [students, setStudents] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getClassroomStudents(classCode, memberToken)
      .then((data) => setStudents(data.students || []))
      .catch((err) => setError(err?.message || t('Unable to load students.')));
  }, [classCode, memberToken, t]);

  return (
    <div>
      <h2 className="font-extrabold text-black text-xl flex items-center gap-2 mb-4">
        <Users className="w-5 h-5" /> {t('Students')}
      </h2>

      {error && <p className="text-base font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

      {!error && students === null && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-black animate-spin" />
        </div>
      )}

      {!error && students && students.length === 0 && (
        <EmptyState icon={Users} title={t('No students enrolled yet')} subtitle={t("Share this class's joining code to get students in.")} />
      )}

      {!error && students && students.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-pink-200 border-t-8 border-t-pink-500 shadow-sm overflow-hidden">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-slate-50 text-left text-black font-bold">
                <th className="px-5 py-3">{t('Student')}</th>
                <th className="px-5 py-3">{t('Assignments')}</th>
                <th className="px-5 py-3">{t('Quiz attempts')}</th>
                <th className="px-5 py-3">{t('Avg. score')}</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-bold text-black">{s.display_name}</td>
                  <td className="px-5 py-3 text-black font-medium">{s.assignments_completed}/{s.assignments_total}</td>
                  <td className="px-5 py-3 text-black font-medium">{s.quiz_attempts}</td>
                  <td className="px-5 py-3 text-black font-medium">{s.average_score_percent != null ? `${s.average_score_percent}%` : '—'}</td>
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
  const { t } = useLanguage();
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
      <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border-2 border-indigo-200 border-l-8 border-l-indigo-500 shadow-sm p-5">
        <p className="text-sm font-extrabold uppercase tracking-wide text-indigo-700 mb-1">{t('Class details')}</p>
        <p className="text-xl font-extrabold text-black mb-1">{classroom.name}</p>
        <p className="text-base text-black font-medium">
          {[classroom.subject, classroom.grade_level, classroom.topic].filter(Boolean).join(' · ') || t('No details set')}
        </p>
        {classroom.description && <p className="text-base text-black font-medium mt-2">{classroom.description}</p>}
      </div>
      <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl border-2 border-teal-200 border-l-8 border-l-teal-500 shadow-sm p-5">
        <p className="text-sm font-extrabold uppercase tracking-wide text-teal-700 mb-2">{t('Joining code')}</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-[0.25em] text-black">{classroom.class_code}</span>
          <button onClick={copyCode} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-black">
            {copied ? <Check className="w-4 h-4 text-teal-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-base text-black font-medium mt-3">
          {(classroom.members || []).filter((m) => m.role === 'student').length} {t('student(s) enrolled')} ·{' '}
          {(classroom.assignments || []).length} {t('assignment(s)')}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------

// Labels are translation keys, looked up with t() at render time (see
// the TABS.map below) rather than translated here, since this array
// is built once at module load — before any component, and its t(),
// exists.
const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutGrid, active: 'bg-teal-500 border-teal-500 text-white', iconColor: 'text-teal-600' },
  { key: 'designer', label: 'Classroom Designer', icon: Palette, active: 'bg-fuchsia-500 border-fuchsia-500 text-white', iconColor: 'text-fuchsia-600' },
  { key: 'materials', label: 'Teaching Materials', icon: FileText, active: 'bg-blue-500 border-blue-500 text-white', iconColor: 'text-blue-600' },
  { key: 'quizzes', label: 'Quiz Builder', icon: Puzzle, active: 'bg-purple-500 border-purple-500 text-white', iconColor: 'text-purple-600' },
  { key: 'assignments', label: 'Assignments', icon: ClipboardList, active: 'bg-amber-500 border-amber-500 text-white', iconColor: 'text-amber-600' },
  { key: 'students', label: 'Students', icon: Users, active: 'bg-pink-500 border-pink-500 text-white', iconColor: 'text-pink-600' },
];

export default function ClassWorkspace() {
  const { classCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [memberToken, setMemberToken] = useState(location.state?.enterAs?.memberToken || null);
  const [classroom, setClassroom] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('overview');
  const [prefillQuiz, setPrefillQuiz] = useState(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const loadClassroom = useCallback(() => {
    getClassroom(classCode).then(setClassroom).catch((err) => setError(err?.message || t('Unable to load this class.')));
  }, [classCode, t]);

  useEffect(() => {
    let active = true;

    async function init() {
      let token = location.state?.enterAs?.memberToken;

      if (!token) {
        try {
          const { classrooms } = await getMyClassrooms();
          const match = (classrooms || []).find((c) => c.class_code === classCode && c.role === 'teacher');
          if (!match) {
            if (active) setError(t("You're not the teacher of this class."));
            return;
          }
          token = match.member_token;
        } catch (err) {
          if (active) setError(err?.message || t('Unable to load this class.'));
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

  const handleLeave = async () => {
    if (!memberToken) return;
    setLeaving(true);
    try {
      await leaveClassroom(classCode, { memberToken });
    } catch {
      // still send them back to Teacher Workspace even if the
      // network call failed — nothing left to do with this class
      // workspace session either way.
    } finally {
      setLeaving(false);
      setShowLeaveConfirm(false);
      navigate('/teacher-workspace');
    }
  };

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="font-bold text-red-600 mb-4">{error}</p>
        <Link to="/teacher-workspace" className="font-bold text-teal-700 hover:text-teal-800">{t('Back to Teacher Workspace')}</Link>
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
        className="inline-flex items-center gap-1.5 text-base font-bold text-black hover:text-black"
      >
        <ArrowLeft className="w-4 h-4" /> {t('Teacher Workspace')}
      </button>

      <div
        className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-5 sm:p-7 text-white"
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg, #4f46e5 0%, #7c3aed 45%, #db2777 80%, #f59e0b 130%)' }} />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{classroom.name}</h1>
              <p className="text-white text-lg font-semibold">
                {[classroom.subject, classroom.grade_level].filter(Boolean).join(' · ') || t('Class Workspace')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-[0.2em] bg-white/15 border border-white/25 rounded-full px-4 py-1.5">
              {classroom.class_code}
            </span>
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="inline-flex items-center gap-1.5 text-base font-bold bg-white/10 hover:bg-white/20 border border-white/25 rounded-full px-4 py-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4" /> {t('Leave Classroom')}
            </button>
          </div>
        </div>
      </div>

      {showLeaveConfirm && (
        <LeaveClassConfirmModal
          className={classroom.name}
          busy={leaving}
          onCancel={() => setShowLeaveConfirm(false)}
          onConfirm={handleLeave}
        />
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tabDef) => {
          const Icon = tabDef.icon;
          const active = tab === tabDef.key;
          return (
            <button
              key={tabDef.key}
              onClick={() => setTab(tabDef.key)}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-lg whitespace-nowrap transition-colors border-2 shadow-sm ${
                active ? tabDef.active : 'bg-white border-slate-200 text-black hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-white' : tabDef.iconColor}`} /> {t(tabDef.label)}
            </button>
          );
        })}
      </div>

      <div>
        {tab === 'overview' && (
          <div className="space-y-6">
            <PresentLivePanel classCode={classCode} memberToken={memberToken} />
            <OverviewTab classroom={classroom} />
          </div>
        )}
        {tab === 'designer' && <ClassroomDesigner classCode={classCode} memberToken={memberToken} />}
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
