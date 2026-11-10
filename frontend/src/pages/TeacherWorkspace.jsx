import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Plus,
  School,
  Users,
  Puzzle,
  ClipboardList,
  Loader2,
  X,
  ArrowRight,
  Check,
  Copy,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getMyClassrooms,
  getTeacherWorkspaceSummary,
  createClassroom,
} from '../services/api';

// ============================================================
// Teacher Workspace — the independent "build my own class content"
// home for a teacher account, separate from (and not touching) the
// AI generation modules (AMIVI/AMICO/Quiz Generator) or the
// existing Classroom page. This is the dashboard (summary cards, +
// Create New Class, My Classes). Opening a class goes to its own
// tabbed Class Workspace (see pages/ClassWorkspace.jsx) with
// Teaching Materials, Quiz Builder, Assignments, and Students — a
// Lessons tab from the original spec isn't built yet; see
// TEACHER_WORKSPACE_PLAN.md in the repo root.
// ============================================================

function SummaryCard({ icon: Icon, label, value, tint, iconColor, loading }) {
  return (
    <div className={`rounded-2xl border-2 shadow-sm p-5 flex items-center gap-4 ${tint}`}>
      <div className={`w-14 h-14 rounded-2xl ${iconColor} flex items-center justify-center shrink-0 shadow-md`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        <p className="text-3xl font-extrabold text-black leading-tight">
          {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-300" /> : value}
        </p>
        <p className="text-base font-semibold text-black">{label}</p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-base font-bold text-black mb-1.5">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-black font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-colors';

function CreateClassModal({ displayName, onClose, onCreated }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null); // { name, class_code } | null
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('Class name is required.'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const data = await createClassroom({
        name: name.trim(),
        subject: subject.trim(),
        description: description.trim(),
        gradeLevel: gradeLevel.trim(),
        topic: topic.trim(),
        displayName: displayName || 'Teacher',
      });
      setCreated(data.classroom);
      onCreated();
    } catch (err) {
      setError(err?.message || t('Failed to create the class.'));
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = async () => {
    if (!created?.class_code) return;
    try {
      await navigator.clipboard.writeText(created.class_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore — clipboard access can fail silently in some contexts
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-extrabold text-xl text-black">
            {created ? t('Class created') : t('Create New Class')}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        {created ? (
          <div className="p-6 space-y-5">
            <p className="text-black font-medium">
              <span className="font-extrabold">{created.name}</span>{' '}
              {t('is ready. Share this code with your students so they can join:')}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center">
                <span className="text-2xl font-extrabold tracking-[0.3em] text-black">
                  {created.class_code}
                </span>
              </div>
              <button
                onClick={copyCode}
                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-black shrink-0"
                aria-label={t('Copy class code')}
              >
                {copied ? <Check className="w-5 h-5 text-teal-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-full px-4 py-3 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              {t('Done')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <Field label={t('Class Name')}>
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('e.g. Grade 5 Science')}
                autoFocus
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t('Subject')}>
                <input
                  className={inputClass}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('e.g. Science')}
                />
              </Field>
              <Field label={t('Grade / Standard')}>
                <input
                  className={inputClass}
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  placeholder={t('e.g. Grade 5')}
                />
              </Field>
            </div>
            <Field label={t('Chapter or Topic')}>
              <input
                className={inputClass}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t('e.g. Photosynthesis')}
              />
            </Field>
            <Field label={t('Class Description')}>
              <textarea
                className={`${inputClass} resize-none`}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('What is this class about?')}
              />
            </Field>
            <p className="text-sm text-black font-medium">
              {t('A unique joining code is generated automatically once the class is created — your students use it to enroll.')}
            </p>
            {error && (
              <p className="text-base font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 transition-colors"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              {submitting ? t('Creating…') : t('Create Class')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const CLASS_COLORS = [
  { card: 'from-teal-50 border-teal-300', badge: 'bg-teal-500', link: 'text-teal-700' },
  { card: 'from-indigo-50 border-indigo-300', badge: 'bg-indigo-500', link: 'text-indigo-700' },
  { card: 'from-pink-50 border-pink-300', badge: 'bg-pink-500', link: 'text-pink-700' },
  { card: 'from-amber-50 border-amber-300', badge: 'bg-amber-500', link: 'text-amber-700' },
  { card: 'from-purple-50 border-purple-300', badge: 'bg-purple-500', link: 'text-purple-700' },
  { card: 'from-sky-50 border-sky-300', badge: 'bg-sky-500', link: 'text-sky-700' },
];

function ClassCard({ classroom, onOpen, index = 0 }) {
  const { t } = useLanguage();
  const color = CLASS_COLORS[index % CLASS_COLORS.length];
  return (
    <button
      onClick={() => onOpen(classroom)}
      className={`text-left bg-gradient-to-br ${color.card} to-white rounded-2xl border-2 border-t-8 shadow-sm p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all group`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-xl font-extrabold text-black leading-snug">{classroom.name}</h3>
        <span className={`shrink-0 text-sm font-bold text-white ${color.badge} rounded-full px-3 py-1`}>
          {classroom.class_code}
        </span>
      </div>
      <p className="text-base font-semibold text-black mb-4">
        {[classroom.subject, classroom.grade_level, classroom.topic].filter(Boolean).join(' · ') ||
          t('No details set')}
      </p>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-black">
          {classroom.student_count ?? 0} {t(classroom.student_count === 1 ? 'student' : 'students')} ·{' '}
          {classroom.assignment_count} {t(classroom.assignment_count === 1 ? 'assignment' : 'assignments')}
        </p>
        <span className={`inline-flex items-center gap-1 text-base font-bold ${color.link}`}>
          {t('Open')} <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
}

export default function TeacherWorkspace() {
  const { user, role, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [classrooms, setClassrooms] = useState(null);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = () => {
    setError(null);
    Promise.all([getTeacherWorkspaceSummary(), getMyClassrooms()])
      .then(([summaryData, classroomsData]) => {
        setSummary(summaryData);
        setClassrooms((classroomsData.classrooms || []).filter((c) => c.role === 'teacher'));
      })
      .catch((err) => setError(err?.message || t('Unable to load your Teacher Workspace.')));
  };

  useEffect(() => {
    if (role === 'teacher') load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const openClassroom = (c) => {
    navigate(`/teacher-workspace/class/${c.class_code}`, {
      state: {
        enterAs: {
          classCode: c.class_code,
          memberToken: c.member_token,
          memberId: c.member_id,
          displayName: c.display_name,
          role: c.role,
        },
      },
    });
  };

  if (authLoading) {
    return (
      <div className="py-24 flex items-center justify-center text-black">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (role !== 'teacher') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div
        className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-5 sm:p-8 text-white"
        style={{ minHeight: 140 }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(120deg, #4f46e5 0%, #7c3aed 45%, #db2777 80%, #f59e0b 130%)' }}
        />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm font-bold mb-4">
              👩‍🏫 {t('Teacher Workspace')}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight">
              {t('Your classes, your content')}
            </h1>
            <p className="text-white text-lg font-semibold max-w-lg">
              {t('Build classes, lessons, quizzes, and assignments yourself — no AI generation needed.')}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-slate-900 bg-white hover:bg-white/90 transition-colors shrink-0"
          >
            <Plus className="w-5 h-5" /> {t('Create New Class')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={School}
          label={t('Total Classes')}
          value={summary?.total_classes ?? 0}
          tint="bg-gradient-to-br from-teal-50 to-emerald-100 border-teal-200"
          iconColor="bg-teal-500"
          loading={!summary && !error}
        />
        <SummaryCard
          icon={Users}
          label={t('Total Students')}
          value={summary?.total_students ?? 0}
          tint="bg-gradient-to-br from-sky-50 to-blue-100 border-blue-200"
          iconColor="bg-blue-500"
          loading={!summary && !error}
        />
        <SummaryCard
          icon={Puzzle}
          label={t('Total Quizzes')}
          value={summary?.total_quizzes ?? 0}
          tint="bg-gradient-to-br from-violet-50 to-purple-100 border-purple-200"
          iconColor="bg-purple-500"
          loading={!summary && !error}
        />
        <SummaryCard
          icon={ClipboardList}
          label={t('Pending Assignments')}
          value={summary?.pending_assignments ?? 0}
          tint="bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200"
          iconColor="bg-amber-500"
          loading={!summary && !error}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-black text-2xl flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center"><School className="w-5 h-5" /></span> {t('My Classes')}
          </h2>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1.5 text-base font-bold text-teal-700 hover:text-teal-800"
          >
            <Plus className="w-4 h-4" /> {t('New class')}
          </button>
        </div>

        {error && (
          <p className="text-base font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {!error && classrooms === null && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-black animate-spin" />
          </div>
        )}

        {!error && classrooms && classrooms.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <p className="font-bold text-black mb-1">{t('No classes yet')}</p>
            <p className="text-base text-black font-medium mb-4">
              {t('Create your first class to start building lessons, quizzes, and assignments.')}
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> {t('Create New Class')}
            </button>
          </div>
        )}

        {!error && classrooms && classrooms.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classrooms.map((c, i) => (
              <ClassCard key={c.classroom_id} classroom={c} index={i} onOpen={openClassroom} />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateClassModal
          displayName={user?.name}
          onClose={() => setShowCreate(false)}
          onCreated={load}
        />
      )}
    </div>
  );
}
