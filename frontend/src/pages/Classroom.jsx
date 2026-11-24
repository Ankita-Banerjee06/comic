import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Copy,
  Check,
  LogOut,
  Plus,
  ArrowRight,
  Sparkles,
  Palette,
  BookOpen,
  Puzzle,
  ClipboardList,
  Clock,
  Loader2,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  X,
  History,
  Trophy,
  Heart,
  KeyRound,
  Trash2,
} from 'lucide-react';
import {
  createClassroom,
  joinClassroom,
  getClassroom,
  createAssignment,
  submitAssignment,
  getAssignmentResults,
  getSubmissionDetail,
  getClassroomHistory,
  leaveClassroom,
  getParentCode,
  getParentView,
  getTeacherCode,
  teacherLogin,
  getStudentCode,
  studentLogin,
  generateAmivi,
  generateAmico,
  generateQuiz,
  createManualQuiz,
  getAssignmentProject,
  getClassroomLibraryProjects,
  getClassroomSubmissionsLog,
  mediaUrl,
} from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import PresentLiveButton from '../components/live/PresentLiveButton';
import PresentLivePanel from '../components/live/PresentLivePanel';
import LiveJoinBanner from '../components/live/LiveJoinBanner';

const SESSION_KEY = 'vlq_classroom_session';

const INPUT_CLASS =
  'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition-all';

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

const PARENT_SESSION_KEY = 'vlq_classroom_parent_session';

function loadParentSession() {
  try {
    const raw = localStorage.getItem(PARENT_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveParentSession(parentSession) {
  try {
    localStorage.setItem(PARENT_SESSION_KEY, JSON.stringify(parentSession));
  } catch {
    // ignore
  }
}

function clearParentSession() {
  try {
    localStorage.removeItem(PARENT_SESSION_KEY);
  } catch {
    // ignore
  }
}

function formatDue(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function ClassroomPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const [session, setSession] = useState(() => loadSession());
  const [parentSession, setParentSession] = useState(() => loadParentSession());
  const [screen, setScreen] = useState(() => {
    if (loadSession()) return 'classroom';
    if (loadParentSession()) return 'parent-view';
    return 'hub';
  });

  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [parentData, setParentData] = useState(null);
  const [parentLoading, setParentLoading] = useState(false);
  const [parentError, setParentError] = useState(null);

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const [savedCode, setSavedCode] = useState(null); // { role, code, label } | null

  const load = useCallback((classCode) => {
    setLoading(true);
    setError(null);
    getClassroom(classCode)
      .then((data) => setClassroom(data))
      .catch((err) => setError(err?.message || t('Unable to load this classroom.')))
      .finally(() => setLoading(false));
  }, []);

  const loadParent = useCallback((parentCode) => {
    setParentLoading(true);
    setParentError(null);
    getParentView(parentCode)
      .then((data) => setParentData(data))
      .catch((err) => setParentError(err?.message || t("That parent code isn't recognized.")))
      .finally(() => setParentLoading(false));
  }, []);

  // Landing here from the Dashboard's "Your Classrooms" list — the
  // Dashboard already knows which classroom + membership to open
  // (via /api/me/classrooms), so drop straight into it instead of
  // making the user go through the join/login form again.
  useEffect(() => {
    const enterAs = location.state?.enterAs;
    if (!enterAs) return;

    const newSession = {
      classCode: enterAs.classCode,
      memberToken: enterAs.memberToken,
      memberId: enterAs.memberId,
      displayName: enterAs.displayName,
      role: enterAs.role,
    };
    saveSession(newSession);
    setSession(newSession);
    setScreen('classroom');

    // Clear the one-time nav state so a later refresh of this page
    // doesn't keep re-applying it (harmless, but unnecessary).
    navigate(location.pathname, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    if (screen === 'classroom' && session?.classCode) {
      load(session.classCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, session?.classCode]);

  useEffect(() => {
    if (screen === 'parent-view' && parentSession?.parentCode) {
      loadParent(parentSession.parentCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, parentSession?.parentCode]);

  const myMember = classroom?.members?.find((m) => m.id === session?.memberId) || null;
  const myRole = session?.role || myMember?.role || 'student';

  const handleCreated = (data) => {
    const newSession = {
      classCode: data.classroom.class_code,
      memberToken: data.member.token,
      memberId: data.member.id,
      displayName: data.member.display_name,
      role: 'teacher',
    };
    saveSession(newSession);
    setSession(newSession);
    setClassroom(data.classroom);
    setScreen('classroom');
    if (data.teacher_code) {
      setSavedCode({ role: 'teacher', code: data.teacher_code, label: t('teacher code') });
    }
  };

  const handleTeacherLoggedIn = (data, classCode) => {
    const newSession = {
      classCode,
      memberToken: data.member.token,
      memberId: data.member.id,
      displayName: data.member.display_name,
      role: 'teacher',
    };
    saveSession(newSession);
    setSession(newSession);
    setScreen('classroom');
  };

  const handleJoined = (data, classCode) => {
    const newSession = {
      classCode,
      memberToken: data.member.token,
      memberId: data.member.id,
      displayName: data.member.display_name,
      role: 'student',
    };
    saveSession(newSession);
    setSession(newSession);
    setScreen('classroom');
    if (data.student_code) {
      setSavedCode({ role: 'student', code: data.student_code, label: t('login code') });
    }
  };

  const handleStudentLoggedIn = (data, classCode) => {
    const newSession = {
      classCode,
      memberToken: data.member.token,
      memberId: data.member.id,
      displayName: data.member.display_name,
      role: 'student',
    };
    saveSession(newSession);
    setSession(newSession);
    setScreen('classroom');
  };

  const handleLeave = async () => {
    if (!session) return;
    setLeaving(true);
    try {
      await leaveClassroom(session.classCode, { memberToken: session.memberToken });
    } catch {
      // forget the session locally even if the network call fails
    } finally {
      clearSession();
      setSession(null);
      setClassroom(null);
      setError(null);
      setLeaving(false);
      setShowLeaveConfirm(false);
      setScreen('hub');
    }
  };

  const backToHub = () => {
    clearSession();
    setSession(null);
    setClassroom(null);
    setError(null);
    setScreen('hub');
  };

  const handleParentLoggedIn = (parentCode, data) => {
    const newParentSession = { parentCode };
    saveParentSession(newParentSession);
    setParentSession(newParentSession);
    setParentData(data);
    setScreen('parent-view');
  };

  const handleParentLogout = () => {
    clearParentSession();
    setParentSession(null);
    setParentData(null);
    setParentError(null);
    setScreen('hub');
  };

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Header
        screen={screen}
        classroom={classroom}
        role={myRole}
        onLeaveClick={() => setShowLeaveConfirm(true)}
        parentData={parentData}
        onParentLogout={handleParentLogout}
        onRefresh={
          screen === 'classroom'
            ? () => load(session.classCode)
            : screen === 'parent-view'
            ? () => loadParent(parentSession.parentCode)
            : undefined
        }
        refreshing={screen === 'classroom' ? loading : screen === 'parent-view' ? parentLoading : false}
      />

      {screen === 'hub' && (
        <ClassroomHub
          onGoTeacher={() => setScreen('teacher')}
          onGoStudent={() => setScreen('student')}
          onGoParent={() => setScreen('parent-login')}
        />
      )}

      {screen === 'teacher' && (
        <TeacherSection
          onCancel={() => setScreen('hub')}
          onCreated={handleCreated}
          onLoggedIn={handleTeacherLoggedIn}
        />
      )}

      {screen === 'student' && (
        <StudentSection
          onCancel={() => setScreen('hub')}
          onJoined={handleJoined}
          onLoggedIn={handleStudentLoggedIn}
        />
      )}

      {screen === 'parent-login' && (
        <ParentLoginForm onCancel={() => setScreen('hub')} onLoggedIn={handleParentLoggedIn} />
      )}

      {screen === 'parent-view' && (
        <ParentView
          data={parentData}
          loading={parentLoading}
          error={parentError}
          onRetry={() => loadParent(parentSession.parentCode)}
          onLogout={handleParentLogout}
        />
      )}

      {screen === 'classroom' && session && (
        <ClassroomView
          session={session}
          classroom={classroom}
          myMember={myMember}
          role={myRole}
          loading={loading}
          error={error}
          onRetry={() => load(session.classCode)}
          onUpdate={setClassroom}
          onBackToHub={backToHub}
          navigate={navigate}
        />
      )}

      {showLeaveConfirm && (
        <ConfirmModal
          title={t('Leave this classroom?')}
          body={
            myRole === 'teacher'
              ? t('You can log back in any time with the class code and your teacher code.')
              : t('You can log back in later with the class code and your login code. Your homework history stays saved.')
          }
          confirmLabel={leaving ? t('Leaving…') : t('Leave Classroom')}
          busy={leaving}
          onCancel={() => setShowLeaveConfirm(false)}
          onConfirm={handleLeave}
        />
      )}

      {savedCode && (
        <CodeSavedModal
          role={savedCode.role}
          code={savedCode.code}
          label={savedCode.label}
          onContinue={() => setSavedCode(null)}
        />
      )}
    </div>
  );
}

// ============================================================
// HEADER
// ============================================================

function Header({ screen, classroom, role, onLeaveClick, parentData, onParentLogout, onRefresh, refreshing }) {
  const { t } = useLanguage();
  const isParent = screen === 'parent-view';

  const title = isParent
    ? parentData
      ? `${parentData.student.display_name} — ${t('Classroom')}`
      : t('Parent View')
    : screen === 'classroom' && classroom
    ? classroom.name
    : t('Homework, made simple');

  const subtitle = isParent
    ? parentData
      ? parentData.classroom.subject || parentData.classroom.name
      : t("See your child's assignments, scores and progress — read-only.")
    : screen === 'classroom' && classroom
    ? classroom.subject || t('Assignments, quiz results and learning history for this class.')
    : t('Teachers create a classroom and assign homework built from AMIVI, AMICO and Quiz. Students join, complete it, and track their progress.');

  const showBadge = (screen === 'classroom' && classroom) || (isParent && parentData);

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-5 sm:p-8 text-white"
      style={{ minHeight: 180, background: '#0f2e2a' }}
    >
      <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg, #0f2e2a 0%, #0e4f45 60%, #0d9488 130%)' }} />
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-xs font-bold mb-4">
            <GraduationCap className="w-3.5 h-3.5" /> {t('Classroom')}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">{title}</h1>
          <p className="text-white/90 font-medium max-w-lg">{subtitle}</p>
        </div>

        {showBadge && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/15 border border-white/25">
              {isParent ? `👪 ${t('Parent')}` : role === 'teacher' ? `👩‍🏫 ${t('Teacher')}` : `🎓 ${t('Student')}`}
            </span>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                title={t('Refresh to see the latest roster, submissions and scores')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/25 text-white rounded-xl font-bold text-sm hover:bg-white/20 disabled:opacity-60 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> {t('Refresh')}
              </button>
            )}
            <button
              onClick={isParent ? onParentLogout : onLeaveClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/25 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-colors"
            >
              <LogOut className="w-4 h-4" /> {isParent ? t('Log Out') : t('Leave')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// HUB
// ============================================================

function ClassroomHub({ onGoTeacher, onGoStudent, onGoParent }) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <button
        onClick={onGoTeacher}
        className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8 hover:shadow-md hover:-translate-y-0.5 transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
          <Plus className="w-6 h-6 text-teal-600" />
        </div>
        <h2 className="text-xl font-bold text-black mb-1.5">{t("I'm a teacher")}</h2>
        <p className="text-black font-medium text-sm mb-4">
          {t('Register a new classroom and get a class code, or log back into one you already run.')}
        </p>
        <span className="inline-flex items-center gap-1.5 text-teal-600 font-bold text-sm">
          {t('Register or log in')} <ArrowRight className="w-4 h-4" />
        </span>
      </button>

      <button
        onClick={onGoStudent}
        className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8 hover:shadow-md hover:-translate-y-0.5 transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
          <GraduationCap className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-black mb-1.5">{t("I'm a student")}</h2>
        <p className="text-black font-medium text-sm mb-4">
          {t('Register with a class code from your teacher, or log back in to your own homework.')}
        </p>
        <span className="inline-flex items-center gap-1.5 text-indigo-600 font-bold text-sm">
          {t('Register or log in')} <ArrowRight className="w-4 h-4" />
        </span>
      </button>

      <button
        onClick={onGoParent}
        className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8 hover:shadow-md hover:-translate-y-0.5 transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
          <Heart className="w-6 h-6 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-black mb-1.5">{t("I'm a parent")}</h2>
        <p className="text-black font-medium text-sm mb-4">
          {t('Got a parent code from your student? View their assignments and scores — read-only.')}
        </p>
        <span className="inline-flex items-center gap-1.5 text-rose-500 font-bold text-sm">
          {t('View progress')} <ArrowRight className="w-4 h-4" />
        </span>
      </button>
    </div>
  );
}

// ============================================================
// TEACHER / STUDENT SECTIONS (Register + Log In tabs)
// ============================================================

function AuthTabs({ mode, onChange, activeTextClass }) {
  const { t } = useLanguage();
  return (
    <div className="max-w-xl mx-auto flex items-center gap-1 bg-slate-100 rounded-xl p-1">
      <button
        type="button"
        onClick={() => onChange('register')}
        className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors ${
          mode === 'register' ? `bg-white ${activeTextClass} shadow-sm` : 'text-black hover:text-black'
        }`}
      >
        {t('Register')}
      </button>
      <button
        type="button"
        onClick={() => onChange('login')}
        className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors ${
          mode === 'login' ? `bg-white ${activeTextClass} shadow-sm` : 'text-black hover:text-black'
        }`}
      >
        {t('Log In')}
      </button>
    </div>
  );
}

function TeacherSection({ onCancel, onCreated, onLoggedIn }) {
  const [mode, setMode] = useState('register');

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <AuthTabs mode={mode} onChange={setMode} activeTextClass="text-teal-600" />
      {mode === 'register' ? (
        <CreateClassroomForm onCancel={onCancel} onCreated={onCreated} />
      ) : (
        <TeacherLoginForm onCancel={onCancel} onLoggedIn={onLoggedIn} />
      )}
    </div>
  );
}

function StudentSection({ onCancel, onJoined, onLoggedIn }) {
  const [mode, setMode] = useState('register');

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <AuthTabs mode={mode} onChange={setMode} activeTextClass="text-indigo-600" />
      {mode === 'register' ? (
        <JoinClassroomForm onCancel={onCancel} onJoined={onJoined} />
      ) : (
        <StudentLoginForm onCancel={onCancel} onLoggedIn={onLoggedIn} />
      )}
    </div>
  );
}

// ============================================================
// CREATE / JOIN / LOGIN FORMS
// ============================================================

function CreateClassroomForm({ onCancel, onCreated }) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !displayName.trim()) {
      setError(t('Classroom name and your name are both required.'));
      return;
    }

    setSubmitting(true);
    try {
      const data = await createClassroom({
        name: name.trim(),
        subject: subject.trim(),
        description: description.trim(),
        displayName: displayName.trim(),
      });
      onCreated(data);
    } catch (err) {
      setError(err?.message || t('Failed to create classroom.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8 space-y-5">
      <h2 className="text-xl font-bold text-black">{t('Create a classroom')}</h2>

      <Field label={t('Classroom name')}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('e.g. 7th Grade Biology')} className={INPUT_CLASS} />
      </Field>

      <Field label={t('Subject (optional)')}>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t('e.g. Biology')} className={INPUT_CLASS} />
      </Field>

      <Field label={t('Description (optional)')}>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("What's this class about?")} rows={3} className={`${INPUT_CLASS} resize-none`} />
      </Field>

      <Field label={t('Your name')}>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t('Your name, as students will see it')} className={INPUT_CLASS} />
      </Field>

      {error && <p className="text-red-500 font-bold text-sm text-center whitespace-pre-wrap">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-sm text-black bg-slate-100 hover:bg-slate-200 transition-colors">
          {t('Cancel')}
        </button>
        <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? t('Creating…') : t('Create Classroom')}
        </button>
      </div>
    </form>
  );
}

function TeacherLoginForm({ onCancel, onLoggedIn }) {
  const { t } = useLanguage();
  const [classCode, setClassCode] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!classCode.trim() || !teacherCode.trim()) {
      setError(t('Class code and teacher code are both required.'));
      return;
    }

    const code = classCode.trim().toUpperCase();

    setSubmitting(true);
    try {
      const data = await teacherLogin(code, { teacherCode: teacherCode.trim().toUpperCase() });
      onLoggedIn(data, code);
    } catch (err) {
      setError(err?.message || t("That class code or teacher code isn't recognized."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8 space-y-5">
      <h2 className="text-xl font-bold text-black">{t('Teacher log in')}</h2>
      <p className="text-sm text-black font-medium -mt-3">
        {t('Use the class code and the private teacher code you saved when you created this classroom.')}
      </p>

      <Field label={t('Class code')}>
        <input
          value={classCode}
          onChange={(e) => setClassCode(e.target.value.toUpperCase())}
          placeholder={t('e.g. K7P2QX')}
          className={`${INPUT_CLASS} tracking-[0.3em] text-center font-bold uppercase`}
          maxLength={12}
        />
      </Field>

      <Field label={t('Teacher code')}>
        <input
          value={teacherCode}
          onChange={(e) => setTeacherCode(e.target.value.toUpperCase())}
          placeholder={t('e.g. K7P2QXA9RT')}
          className={`${INPUT_CLASS} tracking-[0.2em] text-center font-bold uppercase`}
          maxLength={20}
        />
      </Field>

      {error && <p className="text-red-500 font-bold text-sm text-center whitespace-pre-wrap">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-sm text-black bg-slate-100 hover:bg-slate-200 transition-colors">
          {t('Cancel')}
        </button>
        <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? t('Logging in…') : t('Log In')}
        </button>
      </div>
    </form>
  );
}

function JoinClassroomForm({ onCancel, onJoined }) {
  const { t } = useLanguage();
  const [classCode, setClassCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!classCode.trim() || !displayName.trim()) {
      setError(t('Class code and your name are both required.'));
      return;
    }

    const code = classCode.trim().toUpperCase();

    setSubmitting(true);
    try {
      const data = await joinClassroom({ classCode: code, displayName: displayName.trim() });
      onJoined(data, code);
    } catch (err) {
      setError(err?.message || t('Failed to join classroom.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8 space-y-5">
      <h2 className="text-xl font-bold text-black">{t('Join a classroom')}</h2>

      <Field label={t('Class code')}>
        <input
          value={classCode}
          onChange={(e) => setClassCode(e.target.value.toUpperCase())}
          placeholder={t('e.g. K7P2QX')}
          className={`${INPUT_CLASS} tracking-[0.3em] text-center font-bold uppercase`}
          maxLength={12}
        />
      </Field>

      <Field label={t('Your name')}>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={t('How your teacher will see you')} className={INPUT_CLASS} />
      </Field>

      {error && <p className="text-red-500 font-bold text-sm text-center whitespace-pre-wrap">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-sm text-black bg-slate-100 hover:bg-slate-200 transition-colors">
          {t('Cancel')}
        </button>
        <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? t('Joining…') : t('Join Classroom')}
        </button>
      </div>
    </form>
  );
}

function StudentLoginForm({ onCancel, onLoggedIn }) {
  const { t } = useLanguage();
  const [classCode, setClassCode] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!classCode.trim() || !studentCode.trim()) {
      setError(t('Class code and login code are both required.'));
      return;
    }

    const code = classCode.trim().toUpperCase();

    setSubmitting(true);
    try {
      const data = await studentLogin(code, { studentCode: studentCode.trim().toUpperCase() });
      onLoggedIn(data, code);
    } catch (err) {
      setError(err?.message || t("That class code or login code isn't recognized."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8 space-y-5">
      <h2 className="text-xl font-bold text-black">{t('Student log in')}</h2>
      <p className="text-sm text-black font-medium -mt-3">
        {t('Use the class code and the private login code you saved when you registered.')}
      </p>

      <Field label={t('Class code')}>
        <input
          value={classCode}
          onChange={(e) => setClassCode(e.target.value.toUpperCase())}
          placeholder={t('e.g. K7P2QX')}
          className={`${INPUT_CLASS} tracking-[0.3em] text-center font-bold uppercase`}
          maxLength={12}
        />
      </Field>

      <Field label={t('Login code')}>
        <input
          value={studentCode}
          onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
          placeholder={t('e.g. K7P2QXA9RT')}
          className={`${INPUT_CLASS} tracking-[0.2em] text-center font-bold uppercase`}
          maxLength={20}
        />
      </Field>

      {error && <p className="text-red-500 font-bold text-sm text-center whitespace-pre-wrap">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-sm text-black bg-slate-100 hover:bg-slate-200 transition-colors">
          {t('Cancel')}
        </button>
        <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? t('Logging in…') : t('Log In')}
        </button>
      </div>
    </form>
  );
}

function ParentLoginForm({ onCancel, onLoggedIn }) {
  const { t } = useLanguage();
  const [parentCode, setParentCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!parentCode.trim()) {
      setError(t('Parent code is required.'));
      return;
    }

    const code = parentCode.trim().toUpperCase();

    setSubmitting(true);
    try {
      const data = await getParentView(code);
      onLoggedIn(code, data);
    } catch (err) {
      setError(err?.message || t("That parent code isn't recognized."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8 space-y-5">
      <h2 className="text-xl font-bold text-black">{t('Parent access')}</h2>
      <p className="text-sm text-black font-medium -mt-3">
        {t('Enter the code your student gave you to see their assignments and scores.')}
      </p>

      <Field label={t('Parent code')}>
        <input
          value={parentCode}
          onChange={(e) => setParentCode(e.target.value.toUpperCase())}
          placeholder={t('e.g. K7P2QXA9RT')}
          className={`${INPUT_CLASS} tracking-[0.2em] text-center font-bold uppercase`}
          maxLength={20}
        />
      </Field>

      {error && <p className="text-red-500 font-bold text-sm text-center whitespace-pre-wrap">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-sm text-black bg-slate-100 hover:bg-slate-200 transition-colors">
          {t('Cancel')}
        </button>
        <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? t('Checking…') : t('View Progress')}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-black uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// ============================================================
// CLASSROOM VIEW
// ============================================================

function ClassroomView({ session, classroom, myMember, role, loading, error, onRetry, onUpdate, onBackToHub, navigate }) {
  const { t } = useLanguage();
  // Teacher-only: "Assignments" (create + manage homework) vs.
  // "Submissions" (a flat, dated log of who's turned in what, across
  // every assignment at once — see SubmissionsLogPanel). Students
  // only ever see their own assignments list, so this stays
  // teacher-only.
  const [teacherTab, setTeacherTab] = useState('assignments');
  if (loading && !classroom) return <ClassroomSkeleton />;

  if (error && !classroom) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-black font-bold text-lg mb-1">{t("Couldn't load this classroom.")}</p>
        <p className="text-black font-medium text-sm mb-5">{error}</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={onRetry} className="inline-flex items-center gap-2 bg-teal-600 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-teal-700 transition-colors text-sm">
            <RefreshCw className="w-4 h-4" /> {t('Try Again')}
          </button>
          <button onClick={onBackToHub} className="inline-flex items-center gap-2 bg-slate-100 text-black font-bold py-2.5 px-5 rounded-xl hover:bg-slate-200 transition-colors text-sm">
            {t('Back to Start')}
          </button>
        </div>
      </div>
    );
  }

  if (!classroom) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {role === 'student' && (
          <LiveJoinBanner classCode={classroom.class_code} memberToken={session.memberToken} />
        )}

        <ClassCodeCard classroom={classroom} />

        {role === 'teacher' ? (
          <>
            <PresentLivePanel classCode={classroom.class_code} memberToken={session.memberToken} />
            <CreateAssignmentPanel session={session} classroom={classroom} onUpdate={onUpdate} />
          </>
        ) : null}

        {role === 'teacher' && (
          <div className="flex items-center gap-2 border-b-2 border-slate-100">
            <button
              type="button"
              onClick={() => setTeacherTab('assignments')}
              className={`px-4 py-2.5 text-base font-bold rounded-t-xl transition-colors ${
                teacherTab === 'assignments'
                  ? 'text-teal-700 border-b-2 border-teal-600 -mb-0.5'
                  : 'text-black hover:text-teal-700'
              }`}
            >
              {t('Assignments')}
            </button>
            <button
              type="button"
              onClick={() => setTeacherTab('submissions')}
              className={`px-4 py-2.5 text-base font-bold rounded-t-xl transition-colors ${
                teacherTab === 'submissions'
                  ? 'text-teal-700 border-b-2 border-teal-600 -mb-0.5'
                  : 'text-black hover:text-teal-700'
              }`}
            >
              {t('Submissions')}
            </button>
          </div>
        )}

        {role === 'teacher' && teacherTab === 'submissions' ? (
          <SubmissionsLogPanel session={session} classroom={classroom} />
        ) : (
          <AssignmentsPanel session={session} classroom={classroom} role={role} onUpdate={onUpdate} navigate={navigate} />
        )}

        {role === 'student' && <HistoryPanel session={session} />}
      </div>

      <div className="space-y-6">
        <RosterPanel classroom={classroom} myMember={myMember} />
        <MyLoginCodeCard session={session} role={role} />
        {role === 'student' && <ParentAccessCard session={session} />}
      </div>
    </div>
  );
}

function ClassroomSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
      <div className="lg:col-span-2 space-y-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200" />
        ))}
      </div>
      <div className="space-y-6">
        <div className="h-64 bg-white rounded-2xl border border-slate-200" />
      </div>
    </div>
  );
}

// ============================================================
// CLASS CODE CARD
// ============================================================

function ClassCodeCard({ classroom }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(classroom.class_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold text-black uppercase tracking-wide mb-1">{t('Class code')}</p>
        <p className="text-xl sm:text-2xl font-extrabold text-black tracking-[0.15em] sm:tracking-[0.2em] break-all">{classroom.class_code}</p>
        {classroom.description && <p className="text-sm text-black font-medium mt-2 max-w-md">{classroom.description}</p>}
      </div>
      <button onClick={handleCopy} className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors shrink-0">
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        {copied ? t('Copied') : t('Copy Code')}
      </button>
    </div>
  );
}

// ============================================================
// ROSTER PANEL
// ============================================================

function RosterPanel({ classroom, myMember }) {
  const { t } = useLanguage();
  const teacher = classroom.members.find((m) => m.role === 'teacher');
  const students = classroom.members.filter((m) => m.role === 'student');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-bold text-black flex items-center gap-2 mb-4">
        <Users className="w-4.5 h-4.5 text-black" /> {t('Roster')}
      </h2>

      {teacher && (
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-teal-600">{teacher.display_name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-black truncate">{teacher.display_name}</p>
            <p className="text-xs text-teal-600 font-semibold">{t('Teacher')}{teacher.id === myMember?.id ? ` · ${t('You')}` : ''}</p>
          </div>
        </div>
      )}

      {students.length === 0 ? (
        <p className="text-sm text-black font-medium">{t('No students have joined yet.')}</p>
      ) : (
        <div className="space-y-3">
          {students.map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-indigo-600">{s.display_name.charAt(0).toUpperCase()}</span>
              </div>
              <p className="text-sm font-bold text-black truncate flex items-center gap-1.5">
                {s.display_name}
                {s.id === myMember?.id && (
                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full">{t('You')}</span>
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// MY LOGIN CODE CARD (teacher or student — view/regenerate)
// ============================================================

function MyLoginCodeCard({ session, role }) {
  const { t } = useLanguage();
  const isTeacher = role === 'teacher';

  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  const fetchCode = useCallback(
    (regenerate) => {
      setLoading(true);
      setError(null);
      const fetcher = isTeacher ? getTeacherCode : getStudentCode;
      fetcher(session.classCode, { memberToken: session.memberToken, regenerate })
        .then((data) => setCode(isTeacher ? data.teacher_code : data.student_code))
        .catch((err) => setError(err?.message || t('Failed to load your login code.')))
        .finally(() => {
          setLoading(false);
          setConfirmRegenerate(false);
        });
    },
    [session.classCode, session.memberToken, isTeacher]
  );

  useEffect(() => {
    fetchCode(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.classCode, session.memberToken, isTeacher]);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-bold text-black flex items-center gap-2 mb-1.5">
        <KeyRound className="w-4.5 h-4.5 text-black" /> {isTeacher ? t('Teacher login code') : t('Your login code')}
      </h2>
      <p className="text-sm text-black font-medium mb-4">
        {isTeacher
          ? t('Private — pair this with the class code to log back in as teacher from another device. Never share it with students.')
          : t('Private — pair this with the class code to log back into your own homework and history from another device.')}
      </p>

      {loading && !code ? (
        <p className="text-sm text-black font-medium">{t('Loading…')}</p>
      ) : code ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <span className="text-base font-extrabold text-black tracking-[0.12em] truncate">{code}</span>
            <button onClick={handleCopy} className="inline-flex items-center gap-1.5 text-xs font-bold text-black hover:text-black transition-colors shrink-0">
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t('Copied') : t('Copy')}
            </button>
          </div>

          {confirmRegenerate ? (
            <div className="flex items-center gap-2">
              <p className="text-xs text-black font-medium flex-1">{t('This disables the old code.')}</p>
              <button onClick={() => setConfirmRegenerate(false)} className="text-xs font-bold text-black hover:text-black transition-colors">
                {t('Cancel')}
              </button>
              <button onClick={() => fetchCode(true)} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">
                {t('Confirm')}
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmRegenerate(true)} className="text-xs font-bold text-black hover:text-black transition-colors">
              {t('Generate a new code')}
            </button>
          )}
        </div>
      ) : null}

      {error && <p className="text-red-500 font-bold text-xs mt-3">{error}</p>}
    </div>
  );
}

// ============================================================
// PARENT ACCESS CARD (student's own membership — generate a code)
// ============================================================

function ParentAccessCard({ session }) {
  const { t } = useLanguage();
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);

  const fetchCode = async (regenerate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getParentCode(session.classCode, { memberToken: session.memberToken, regenerate });
      setCode(data.parent_code);
    } catch (err) {
      setError(err?.message || t('Failed to generate a parent code.'));
    } finally {
      setLoading(false);
      setConfirmRegenerate(false);
    }
  };

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-bold text-black flex items-center gap-2 mb-1.5">
        <KeyRound className="w-4.5 h-4.5 text-black" /> {t('Parent access')}
      </h2>
      <p className="text-sm text-black font-medium mb-4">
        {t('Share this code with a parent or guardian so they can see your assignments and scores — read-only, no password needed.')}
      </p>

      {!code ? (
        <button
          onClick={() => fetchCode(false)}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? t('Generating…') : t('Get a parent code')}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <span className="text-base font-extrabold text-black tracking-[0.12em] truncate">{code}</span>
            <button onClick={handleCopy} className="inline-flex items-center gap-1.5 text-xs font-bold text-black hover:text-black transition-colors shrink-0">
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t('Copied') : t('Copy')}
            </button>
          </div>

          {confirmRegenerate ? (
            <div className="flex items-center gap-2">
              <p className="text-xs text-black font-medium flex-1">{t('This disables the old code.')}</p>
              <button onClick={() => setConfirmRegenerate(false)} className="text-xs font-bold text-black hover:text-black transition-colors">
                {t('Cancel')}
              </button>
              <button onClick={() => fetchCode(true)} disabled={loading} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">
                {t('Confirm')}
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmRegenerate(true)} className="text-xs font-bold text-black hover:text-black transition-colors">
              {t('Generate a new code')}
            </button>
          )}
        </div>
      )}

      {error && <p className="text-red-500 font-bold text-xs mt-3">{error}</p>}
    </div>
  );
}

// ============================================================
// CREATE ASSIGNMENT (teacher)
// ============================================================

function CreateAssignmentPanel({ session, classroom, onUpdate }) {
  const { t, language } = useLanguage();
  const [material, setMaterial] = useState('');
  const [generated, setGenerated] = useState({ quiz: null, amivi: null, amico: null });
  const [busy, setBusy] = useState(null); // 'quiz' | 'amivi' | 'amico' | null
  const [genErrors, setGenErrors] = useState({});

  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [showManualQuizForm, setShowManualQuizForm] = useState(false);
  const [amicoStudentMode, setAmicoStudentMode] = useState(false);

  const runGenerate = async (kind) => {
    if (!material.trim()) {
      setGenErrors((e) => ({ ...e, [kind]: t('Add some learning material first.') }));
      return;
    }

    setBusy(kind);
    setGenErrors((e) => ({ ...e, [kind]: null }));

    try {
      let projectId, projTitle;

      // Generate in whatever language the teacher is currently working
      // in (the same `language` the whole app's chrome is translated
      // into), rather than always English — this is what lets a
      // Spanish-speaking teacher assign Spanish homework straight from
      // this panel. See the matching fix in generate_quiz_draft on the
      // backend for the "Generate from Lesson" path in ClassWorkspace.
      if (kind === 'quiz') {
        const data = await generateQuiz({ mode: 'material', materialText: material, language, numQuestions: 5, generateImages: true, generateVideos: false });
        projectId = data.project_id;
        projTitle = data.quiz?.title;
      } else if (kind === 'amivi') {
        const data = await generateAmivi(material, language, false, '');
        projectId = data.project_id;
        projTitle = t('AMIVI Visuals');
      } else {
        const data = await generateAmico({ homeworkPrompt: material, language });
        projectId = data.project_id;
        projTitle = data.title || t('AMICO Comic');
      }

      setGenerated((g) => ({ ...g, [kind]: { projectId, title: projTitle } }));
      window.dispatchEvent(new Event('vlq-library-changed'));
      if (kind === 'quiz' && !title) setTitle(projTitle || '');
    } catch (err) {
      const kindLabel = kind === 'amivi' ? t('AMIVI') : kind === 'amico' ? t('AMICO') : t('Quiz');
      setGenErrors((e) => ({ ...e, [kind]: err?.message || `${t('Failed to generate')} ${kindLabel}.` }));
    } finally {
      setBusy(null);
    }
  };

  // A project picked from the teacher's own Library (LibraryPicker
  // below) slots into the exact same `generated` shape runGenerate
  // produces, so handleAssign and the rest of this form can't tell
  // the difference — no AI call happens here at all.
  const applyLibraryPick = (kind, project) => {
    setGenerated((g) => ({ ...g, [kind]: { projectId: project.id, title: project.title } }));
    setGenErrors((e) => ({ ...e, [kind]: null }));
    if (kind === 'quiz' && !title) setTitle(project.title || '');
  };

  // A quiz the teacher just typed by hand (ManualQuizForm) — already
  // saved to the backend by the time this fires, so this just slots
  // it into the same `generated.quiz` shape as the other two paths.
  const applyManualQuiz = ({ projectId, title: quizTitle }) => {
    setGenerated((g) => ({ ...g, quiz: { projectId, title: quizTitle } }));
    setGenErrors((e) => ({ ...e, quiz: null }));
    if (!title) setTitle(quizTitle || '');
    setShowManualQuizForm(false);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignError(null);

    if (!generated.quiz && !generated.amivi && !generated.amico && !amicoStudentMode) {
      setAssignError(t('Add at least a Quiz, Visuals, or a Comic before assigning homework.'));
      return;
    }

    if (!title.trim()) {
      setAssignError(t('Give this homework a title.'));
      return;
    }

    setAssigning(true);
    try {
      const data = await createAssignment(classroom.class_code, {
        memberToken: session.memberToken,
        title: title.trim(),
        instructions: instructions.trim(),
        quizProjectId: generated.quiz?.projectId || null,
        amiviProjectId: generated.amivi?.projectId || null,
        amicoProjectId: amicoStudentMode ? null : generated.amico?.projectId || null,
        amicoMode: amicoStudentMode ? 'student' : null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      });

      onUpdate({ ...classroom, assignments: [data.assignment, ...classroom.assignments] });

      // reset the form for the next assignment
      setMaterial('');
      setGenerated({ quiz: null, amivi: null, amico: null });
      setTitle('');
      setInstructions('');
      setDueAt('');
      setAmicoStudentMode(false);
      setExpanded(false);
    } catch (err) {
      setAssignError(err?.message || t('Failed to assign homework.'));
    } finally {
      setAssigning(false);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full bg-white rounded-2xl border-2 border-dashed border-slate-200 shadow-sm p-6 flex items-center justify-center gap-2 font-bold text-teal-600 hover:border-teal-300 hover:bg-teal-50/40 transition-colors"
      >
        <Plus className="w-5 h-5" /> {t('Assign new homework')}
      </button>
    );
  }

  return (
    <>
    <form onSubmit={handleAssign} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-black">{t('Assign homework')}</h2>
        <button type="button" onClick={() => setExpanded(false)} className="text-black hover:text-black transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <Field label={t('Learning material')}>
        <textarea
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          placeholder={t('Paste the topic or material this homework is based on...')}
          rows={5}
          className={`${INPUT_CLASS} resize-none`}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <GenerateChip
            label={t('Quiz')}
            icon={Puzzle}
            color="text-purple-600"
            done={!!generated.quiz}
            busy={busy === 'quiz'}
            error={genErrors.quiz}
            onClick={() => runGenerate('quiz')}
          />
          <LibraryPicker
            classroom={classroom}
            session={session}
            kind="quiz"
            onPick={(project) => applyLibraryPick('quiz', project)}
          />
          <div className="mt-1.5 text-center">
            <button
              type="button"
              onClick={() => setShowManualQuizForm(true)}
              className="text-[11px] font-bold text-teal-600 hover:text-teal-700 underline"
            >
              {t('Or create my own quiz')}
            </button>
          </div>
          {generated.quiz && (
            <div className="mt-2 flex justify-center">
              <PresentLiveButton
                kind="quiz"
                projectId={generated.quiz.projectId}
                classCode={classroom.class_code}
                memberToken={session.memberToken}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg px-3 py-1.5"
              />
            </div>
          )}
        </div>
        <div>
          <GenerateChip
            label={t('AMIVI Visuals')}
            icon={Palette}
            color="text-orange-500"
            done={!!generated.amivi}
            busy={busy === 'amivi'}
            error={genErrors.amivi}
            onClick={() => runGenerate('amivi')}
          />
          <LibraryPicker
            classroom={classroom}
            session={session}
            kind="amivi"
            onPick={(project) => applyLibraryPick('amivi', project)}
          />
          {generated.amivi && (
            <div className="mt-2 flex justify-center">
              <PresentLiveButton
                kind="amivi"
                projectId={generated.amivi.projectId}
                classCode={classroom.class_code}
                memberToken={session.memberToken}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg px-3 py-1.5"
              />
            </div>
          )}
        </div>
        <div>
          {!amicoStudentMode && (
            <>
              <GenerateChip
                label={t('AMICO Comic')}
                icon={BookOpen}
                color="text-pink-500"
                done={!!generated.amico}
                busy={busy === 'amico'}
                error={genErrors.amico}
                onClick={() => runGenerate('amico')}
              />
              <LibraryPicker
                classroom={classroom}
                session={session}
                kind="amico"
                onPick={(project) => applyLibraryPick('amico', project)}
              />
              {generated.amico && (
                <div className="mt-2 flex justify-center">
                  <PresentLiveButton
                    kind="amico"
                    projectId={generated.amico.projectId}
                    classCode={classroom.class_code}
                    memberToken={session.memberToken}
                    className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg px-3 py-1.5"
                  />
                </div>
              )}
            </>
          )}
          <label className="mt-1.5 flex items-start gap-1.5 text-[11px] font-bold text-black text-left cursor-pointer">
            <input
              type="checkbox"
              checked={amicoStudentMode}
              onChange={(e) => {
                setAmicoStudentMode(e.target.checked);
                if (e.target.checked) {
                  setGenerated((g) => ({ ...g, amico: null }));
                  setGenErrors((err) => ({ ...err, amico: null }));
                }
              }}
              className="mt-0.5 accent-pink-600"
            />
            {t('Or let each student create their own comic instead')}
          </label>
        </div>
      </div>
      <p className="text-xs text-black -mt-1">
        {t('Already have a lesson saved? Use')} "{t('Or use something I already saved')}" {t('under any of the three above instead of generating new — your existing images, slogans and descriptions are reused as-is, nothing is regenerated.')}
      </p>

      {(generated.quiz || generated.amivi || generated.amico || amicoStudentMode) && (
        <>
          <Field label={t('Homework title')}>
            <input value={title} onChange={(e) => { setTitle(e.target.value); if (assignError) setAssignError(null); }} placeholder={t('e.g. Chapter 3 Quiz')} className={INPUT_CLASS} />
          </Field>

          <Field label={t('Instructions (optional)')}>
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2} className={`${INPUT_CLASS} resize-none`} />
          </Field>

          <Field label={t('Due date (optional)')}>
            <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className={INPUT_CLASS} />
          </Field>
        </>
      )}

      {!generated.quiz && !generated.amivi && !generated.amico && !amicoStudentMode && (
        <p className="text-amber-600 font-bold text-xs text-center">
          {t('Add at least a Quiz, Visuals, or a Comic above before you can assign this homework. A Quiz is optional — add one only if you want it auto-graded.')}
        </p>
      )}

      {assignError && <p className="text-red-500 font-bold text-sm text-center">{assignError}</p>}

      <button
        type="submit"
        disabled={assigning || (!generated.quiz && !generated.amivi && !generated.amico && !amicoStudentMode)}
        className="w-full py-3 rounded-xl font-bold text-sm text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
      >
        {assigning && <Loader2 className="w-4 h-4 animate-spin" />}
        {assigning ? t('Assigning…') : t('Assign Homework')}
      </button>
    </form>
    {showManualQuizForm && (
      <ManualQuizForm
        classroom={classroom}
        session={session}
        onClose={() => setShowManualQuizForm(false)}
        onSaved={applyManualQuiz}
      />
    )}
    </>
  );
}

function GenerateChip({ label, required, icon: Icon, color, done, busy, error, onClick }) {
  const { t } = useLanguage();
  return (
    <div className="border border-slate-200 rounded-xl p-3 flex flex-col items-center text-center gap-2">
      <Icon className={`w-5 h-5 ${color}`} />
      <p className="text-xs font-bold text-black">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </p>
      {error && <p className="text-[10px] text-red-500 font-semibold">{error}</p>}
      {done ? (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600">
          <CheckCircle2 className="w-3.5 h-3.5" /> {t('Ready')}
        </span>
      ) : (
        <button
          type="button"
          onClick={onClick}
          disabled={busy}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-black hover:text-teal-600 disabled:opacity-50 transition-colors"
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {busy ? t('Generating…') : t('Generate')}
        </button>
      )}
    </div>
  );
}

// Lets a teacher attach an AMIVI/AMICO/quiz they already saved to
// their Library, instead of pasting material and generating a new
// one. Loads the list lazily (only once the teacher actually opens
// it) and only for the one kind it's asked for.
function LibraryPicker({ classroom, session, kind, onPick }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState(null); // null = not loaded yet
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const kindLabel = kind === 'amivi' ? t('AMIVI lesson') : kind === 'amico' ? t('AMICO comic') : t('quiz');

  const toggle = () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (!willOpen || projects !== null || loading) return;

    setLoading(true);
    setError(null);
    getClassroomLibraryProjects(classroom.class_code, session.memberToken, kind)
      .then((data) => setProjects(data.projects || []))
      .catch((err) => setError(err?.message || t('Unable to load your Library.')))
      .finally(() => setLoading(false));
  };

  return (
    <div className="mt-1.5 text-center">
      <button
        type="button"
        onClick={toggle}
        className="text-[11px] font-bold text-teal-600 hover:text-teal-700 underline"
      >
        {open ? t('Hide saved Library') : t('Or use something I already saved')}
      </button>
      {open && (
        <div className="mt-1.5">
          {loading && <p className="text-[11px] text-black">{t('Loading your Library…')}</p>}
          {error && <p className="text-[11px] text-red-500 font-semibold">{error}</p>}
          {projects && projects.length === 0 && !loading && (
            <p className="text-[11px] text-black">{t('No saved')} {kindLabel}s {t('in your Library yet.')}</p>
          )}
          {projects && projects.length > 0 && (
            <select
              defaultValue=""
              onChange={(e) => {
                const picked = projects.find((p) => String(p.id) === e.target.value);
                if (picked) onPick(picked);
              }}
              className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white font-semibold"
            >
              <option value="" disabled>
                {t('Pick a saved')} {kindLabel}…
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}

function blankManualQuestion() {
  return { question: '', options: ['', ''], correct: 0 };
}

// Lets a teacher type their own quiz by hand right here — no AI
// involved — instead of generating one from the Learning material
// above. Saves through the same createManualQuiz endpoint the full
// Quiz Builder in Teacher Workspace uses, in the exact data shape
// the AI quiz pipeline produces, so it plays back for students with
// no changes anywhere else (Quiz.jsx, grading, etc.).
function ManualQuizForm({ classroom, session, onClose, onSaved }) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([blankManualQuestion()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const updateQuestion = (idx, patch) => {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qIdx ? { ...q, options: q.options.map((o, oi) => (oi === optIdx ? value : o)) } : q
      )
    );
  };

  const addOption = (qIdx) => {
    setQuestions((qs) => qs.map((q, i) => (i === qIdx ? { ...q, options: [...q.options, ''] } : q)));
  };

  const removeOption = (qIdx, optIdx) => {
    setQuestions((qs) =>
      qs.map((q, i) => {
        if (i !== qIdx) return q;
        const options = q.options.filter((_, oi) => oi !== optIdx);
        const correct = q.correct >= options.length ? 0 : q.correct;
        return { ...q, options, correct };
      })
    );
  };

  const addQuestion = () => setQuestions((qs) => [...qs, blankManualQuestion()]);
  const removeQuestion = (idx) => setQuestions((qs) => qs.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError(t('Give this quiz a title.'));
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
      const data = await createManualQuiz(classroom.class_code, {
        memberToken: session.memberToken,
        title: title.trim(),
        status: 'published',
        questions: questions.map((q) => ({
          question: q.question.trim(),
          options: q.options.map((o) => o.trim()).filter(Boolean),
          correct: q.correct,
        })),
      });
      window.dispatchEvent(new Event('vlq-library-changed'));
      onSaved({ projectId: data.project_id, title: data.quiz?.title || title.trim() });
    } catch (err) {
      setError(err?.message || t('Failed to save that quiz.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="font-extrabold text-lg text-black">{t('Create your own quiz')}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <Field label={t('Quiz title')}>
            <input className={INPUT_CLASS} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder={t('e.g. Chapter 3 Checkpoint')} />
          </Field>

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
                  className={INPUT_CLASS}
                  placeholder={t('Question text')}
                  value={q.question}
                  onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                />
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`manual-quiz-correct-${qIdx}`}
                        checked={q.correct === optIdx}
                        onChange={() => updateQuestion(qIdx, { correct: optIdx })}
                        className="shrink-0 accent-teal-600"
                        title={t('Mark as the correct answer')}
                      />
                      <input
                        className={`${INPUT_CLASS} flex-1`}
                        placeholder={`${t('Option')} ${optIdx + 1}`}
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
                      + {t('Add option')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addQuestion} className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800">
            <Plus className="w-4 h-4" /> {t('Add question')}
          </button>

          {error && <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
            {t('Save Quiz')}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================
// SUBMISSIONS LOG — a flat, dated table of who's turned in what
// across every assignment in the class (teacher-only), instead of
// opening each assignment one at a time to see "Submitted: [names]".
// ============================================================

function SubmissionsLogPanel({ session, classroom }) {
  const { t } = useLanguage();
  const [rows, setRows] = useState(null); // null = loading
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    getClassroomSubmissionsLog(classroom.class_code, session.memberToken)
      .then((data) => setRows(data.rows || []))
      .catch((err) => setError(err.message || t('Unable to load the submissions log.')));
  }, [classroom.class_code, session.memberToken, t]);

  useEffect(() => {
    load();
  }, [load]);

  const Tick = () => <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-black">{t('Submissions')}</h3>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:text-teal-800"
        >
          <RefreshCw className="w-4 h-4" /> {t('Refresh')}
        </button>
      </div>

      {error ? (
        <div className="p-6 text-center">
          <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <p className="text-black font-semibold text-sm">{error}</p>
        </div>
      ) : rows === null ? (
        <div className="p-10 flex justify-center">
          <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <p className="p-6 text-center text-black font-semibold text-sm">
          {t('No homework has been submitted yet.')}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-black text-amber-300">
                <th className="px-3 py-3 text-left font-extrabold whitespace-nowrap">{t('No')}</th>
                <th className="px-3 py-3 text-left font-extrabold whitespace-nowrap">{t('Date')}</th>
                <th className="px-3 py-3 text-left font-extrabold whitespace-nowrap">{t('Class')}</th>
                <th className="px-3 py-3 text-left font-extrabold whitespace-nowrap">{t('Student Name')}</th>
                <th className="px-3 py-3 text-center font-extrabold whitespace-nowrap">{t('Quiz')}</th>
                <th className="px-3 py-3 text-center font-extrabold whitespace-nowrap">{t('Story')}</th>
                <th className="px-3 py-3 text-center font-extrabold whitespace-nowrap">{t('Other')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={`${row.assignment_id}-${row.member_id}`}
                  className={idx % 2 === 0 ? 'bg-slate-100' : 'bg-white'}
                >
                  <td className="px-3 py-3 text-black font-semibold">{row.no}</td>
                  <td className="px-3 py-3 text-black font-semibold whitespace-nowrap">{formatDue(row.date) || '—'}</td>
                  <td className="px-3 py-3 text-black font-semibold">{row.class_name}</td>
                  <td className="px-3 py-3 text-black font-bold">{row.student_name}</td>
                  <td className="px-3 py-3 text-center">{row.quiz ? <Tick /> : null}</td>
                  <td className="px-3 py-3 text-center">{row.story ? <Tick /> : null}</td>
                  <td className="px-3 py-3 text-center">{row.other ? <Tick /> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ASSIGNMENTS LIST
// ============================================================

function AssignmentsPanel({ session, classroom, role, onUpdate, navigate }) {
  const { t } = useLanguage();
  const assignments = classroom.assignments || [];
  const [resultsFor, setResultsFor] = useState(null);
  const [playFor, setPlayFor] = useState(null);
  const [comicSubmissionsFor, setComicSubmissionsFor] = useState(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-bold text-black flex items-center gap-2 mb-4">
        <ClipboardList className="w-4.5 h-4.5 text-black" /> {role === 'teacher' ? t('Assigned homework') : t('My homework')}
      </h2>

      {assignments.length === 0 ? (
        <p className="text-sm text-black font-medium py-6 text-center">
          {role === 'teacher' ? t('No homework assigned yet — use the form above to create one.') : t('No homework yet — check back once your teacher assigns some.')}
        </p>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <AssignmentRow
              key={a.id}
              assignment={a}
              role={role}
              onViewResults={() => setResultsFor(a)}
              onPlay={() => setPlayFor(a)}
              onViewComicSubmissions={() => setComicSubmissionsFor(a)}
              onCreateComic={() =>
                navigate('/amico', {
                  state: {
                    classroomView: {
                      classCode: classroom.class_code,
                      assignmentId: a.id,
                      memberToken: session.memberToken,
                      kind: 'amico',
                      submitMode: true,
                      // Pre-fills AMICO's topic box so the student isn't
                      // stuck re-typing what the teacher already wrote.
                      topic: a.instructions?.trim() || a.title,
                    },
                  },
                })
              }
              navigate={navigate}
              classCode={classroom.class_code}
              memberToken={session.memberToken}
            />
          ))}
        </div>
      )}

      {resultsFor && (
        <ResultsModal
          session={session}
          classroom={classroom}
          assignment={resultsFor}
          onClose={() => setResultsFor(null)}
        />
      )}

      {comicSubmissionsFor && (
        <ComicSubmissionsModal
          session={session}
          classroom={classroom}
          assignment={comicSubmissionsFor}
          navigate={navigate}
          onClose={() => setComicSubmissionsFor(null)}
        />
      )}

      {playFor && (
        <AssignmentPlayerModal
          session={session}
          classroom={classroom}
          assignment={playFor}
          onClose={() => setPlayFor(null)}
          onSubmitted={(assignmentId, updatedRow) => {
            onUpdate({
              ...classroom,
              assignments: classroom.assignments.map((a) => (a.id === assignmentId ? { ...a, ...updatedRow } : a)),
            });
          }}
        />
      )}
    </div>
  );
}

function AssignmentRow({ assignment, role, onViewResults, onPlay, onCreateComic, onViewComicSubmissions, navigate, classCode, memberToken }) {
  const { t } = useLanguage();
  const due = formatDue(assignment.due_at);
  const studentCreatesComic = assignment.amico_mode === 'student';

  // Student/teacher view of the AMIVI/AMICO attached to this assignment:
  // navigate to the normal page, but carry along classroom-view context
  // (class code + this member's own token + which assignment) so the
  // destination page can fetch via the classroom-scoped endpoint instead
  // of the main, owner-only Library endpoint — a student viewing their
  // teacher's material never owns that project, so the normal fetch
  // would otherwise 404 for them.
  const classroomView = { classCode, assignmentId: assignment.id, memberToken };

  // Teacher view only — who has actually submitted this homework's
  // quiz and/or comic, shown right on the row itself rather than
  // making the teacher open Results just to see names. One shared
  // fetch covers both, since getAssignmentResults already returns
  // both a quiz score and a comic_project_id per student.
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (role !== 'teacher' || (!assignment.quiz_project_id && !studentCreatesComic)) return;
    let cancelled = false;
    getAssignmentResults(classCode, assignment.id, memberToken)
      .then((data) => {
        if (!cancelled) setResults(data.results || []);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      });
    return () => { cancelled = true; };
  }, [role, assignment.quiz_project_id, studentCreatesComic, assignment.submitted_count, classCode, assignment.id, memberToken]);

  const submittedQuizNames = results
    ? results.filter((r) => r.attempts > 0 && r.status !== 'in_progress').map((r) => r.display_name)
    : null;

  const submittedComicCount = results ? results.filter((r) => r.comic_project_id).length : 0;
  const submittedComicNames = results ? results.filter((r) => r.comic_project_id).map((r) => r.display_name) : null;

  return (
    <div className="border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-black truncate">{assignment.title}</p>
        {assignment.instructions && <p className="text-xs text-black font-medium mt-0.5 line-clamp-1">{assignment.instructions}</p>}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs font-semibold text-black">
          {due && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {t('Due')} {due}
            </span>
          )}
          {assignment.amivi_project_id && (
            <button
              onClick={() => navigate(`/amivi/${assignment.amivi_project_id}`, { state: { classroomView: { ...classroomView, kind: 'amivi' } } })}
              className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-600"
            >
              <Palette className="w-3.5 h-3.5" /> {t('Visuals')}
            </button>
          )}
          {assignment.amico_project_id && (
            <button
              onClick={() => navigate(`/amico/${assignment.amico_project_id}`, { state: { classroomView: { ...classroomView, kind: 'amico' } } })}
              className="inline-flex items-center gap-1 text-pink-500 hover:text-pink-600"
            >
              <BookOpen className="w-3.5 h-3.5" /> {t('Comic')}
            </button>
          )}
        </div>
        {role === 'teacher' && assignment.quiz_project_id && submittedQuizNames !== null && (
          <p className="text-xs text-black font-semibold mt-1.5">
            {submittedQuizNames.length > 0
              ? `${t('Submitted')}: ${submittedQuizNames.join(', ')}`
              : t('No one has submitted yet.')}
          </p>
        )}
        {role === 'teacher' && studentCreatesComic && submittedComicNames !== null && (
          <p className="text-xs text-black font-semibold mt-1.5">
            {submittedComicNames.length > 0
              ? `${t('Comics in')}: ${submittedComicNames.join(', ')}`
              : t('No one has submitted a comic yet.')}
          </p>
        )}
      </div>

      <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-2">
        {/* Quiz: Start/Submitted (student) or Results (teacher) — this
            homework may have been assigned with only Visuals and/or a
            Comic and no quiz at all, in which case there's nothing to
            grade or take here beyond the links above. */}
        {assignment.quiz_project_id ? (
          role === 'teacher' ? (
            <button
              onClick={onViewResults}
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              {t('Results')} ({assignment.submitted_count}/{assignment.student_count})
            </button>
          ) : assignment.submitted_count > 0 ? (
            // Submitted — no retakes. Just a plain, non-clickable badge.
            <span className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl font-bold text-sm text-emerald-700 bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t('Submitted')}
            </span>
          ) : (
            <button
              onClick={onPlay}
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              <Puzzle className="w-3.5 h-3.5" /> {t('Start')}
            </button>
          )
        ) : !studentCreatesComic ? (
          <span className="text-xs font-semibold text-black italic px-1">
            {t('No quiz on this one')}
          </span>
        ) : null}

        {/* "Create your own comic" homework — each student makes and
            submits their own AMICO comic instead of viewing one the
            teacher made. */}
        {studentCreatesComic && (
          role === 'teacher' ? (
            <button
              onClick={onViewComicSubmissions}
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl font-bold text-sm text-white bg-pink-600 hover:bg-pink-700 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" /> {t('Comics')} ({submittedComicCount}/{assignment.student_count})
            </button>
          ) : assignment.submitted_count > 0 ? (
            <span className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl font-bold text-sm text-emerald-700 bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> {t('Submitted')}
            </span>
          ) : (
            <button
              onClick={onCreateComic}
              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl font-bold text-sm text-white bg-pink-600 hover:bg-pink-700 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" /> {t('Create & submit my comic')}
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ============================================================
// RESULTS MODAL (teacher)
// ============================================================

function ResultsModal({ session, classroom, assignment, onClose }) {
  const { t } = useLanguage();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailMember, setDetailMember] = useState(null); // { member_id, display_name } | null

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAssignmentResults(classroom.class_code, assignment.id, session.memberToken)
      .then((data) => setResults(data.results || []))
      .catch((err) => setError(err?.message || t('Unable to load results.')))
      .finally(() => setLoading(false));
  }, [classroom.class_code, assignment.id, session.memberToken]);

  if (detailMember) {
    return (
      <SubmissionDetailModal
        session={session}
        classroom={classroom}
        assignment={assignment}
        member={detailMember}
        onBack={() => setDetailMember(null)}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-extrabold text-black">{assignment.title} — {t('Results')}</h3>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-black hover:bg-slate-100 transition-colors">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 text-black animate-spin" />
            </div>
          )}

          {!loading && error && <p className="text-red-500 font-bold text-sm text-center py-8">{error}</p>}

          {!loading && !error && results?.length === 0 && (
            <p className="text-black font-medium text-sm text-center py-8">{t('No students have joined this classroom yet.')}</p>
          )}

          {!loading && !error && results?.length > 0 && (
            <div className="space-y-2">
              {results.map((r) => {
                const canReview = r.attempts > 0;
                const incomplete = r.status === 'in_progress';
                const Row = canReview ? 'button' : 'div';
                return (
                  <Row
                    key={r.member_id}
                    onClick={canReview ? () => setDetailMember(r) : undefined}
                    className={`w-full flex items-center justify-between border border-slate-100 rounded-xl px-4 py-2.5 text-left ${
                      canReview ? 'hover:border-teal-200 hover:bg-teal-50/40 transition-colors cursor-pointer' : ''
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-black">{r.display_name}</p>
                      {incomplete && (
                        <p className="text-xs font-bold text-amber-600">
                          {r.answered > 0
                            ? `${t('Incomplete')} — ${t('stopped after')} Q${r.answered}`
                            : t('Incomplete')}
                        </p>
                      )}
                      <p className="text-xs text-black font-semibold">
                        {canReview
                          ? `${r.attempts} ${r.attempts === 1 ? t('attempt') : t('attempts')} — ${t('tap to review answers')}`
                          : t('Not started')}
                      </p>
                    </div>
                    {incomplete ? (
                      <span className="shrink-0 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                        {r.score}/{r.answered} {t('so far')}
                      </span>
                    ) : r.total ? (
                      <span className="font-extrabold text-black">{r.score}/{r.total}</span>
                    ) : (
                      <span className="text-xs font-bold text-black">—</span>
                    )}
                  </Row>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMIC SUBMISSIONS MODAL (teacher — "Create your own comic"
// homework: who has submitted, with a link straight to each one's
// comic)
// ============================================================

function ComicSubmissionsModal({ session, classroom, assignment, navigate, onClose }) {
  const { t } = useLanguage();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAssignmentResults(classroom.class_code, assignment.id, session.memberToken)
      .then((data) => setResults(data.results || []))
      .catch((err) => setError(err?.message || t('Unable to load results.')))
      .finally(() => setLoading(false));
  }, [classroom.class_code, assignment.id, session.memberToken]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-extrabold text-black">{assignment.title} — {t('Comics')}</h3>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-black hover:bg-slate-100 transition-colors">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 text-black animate-spin" />
            </div>
          )}

          {!loading && error && <p className="text-red-500 font-bold text-sm text-center py-8">{error}</p>}

          {!loading && !error && results?.length === 0 && (
            <p className="text-black font-medium text-sm text-center py-8">{t('No students have joined this classroom yet.')}</p>
          )}

          {!loading && !error && results?.length > 0 && (
            <div className="space-y-2">
              {results.map((r) => {
                const canView = !!r.comic_project_id;
                const Row = canView ? 'button' : 'div';
                return (
                  <Row
                    key={r.member_id}
                    onClick={
                      canView
                        ? () =>
                            navigate(`/amico/${r.comic_project_id}`, {
                              state: {
                                classroomView: {
                                  classCode: classroom.class_code,
                                  assignmentId: assignment.id,
                                  memberToken: session.memberToken,
                                  kind: 'amico',
                                  viewMemberId: r.member_id,
                                  // Lets AMICO show a "Viewing: <name>"
                                  // dropdown so the teacher can jump
                                  // straight to the next student's comic
                                  // instead of coming back here each time.
                                  submissions: results
                                    .filter((x) => x.comic_project_id)
                                    .map((x) => ({ member_id: x.member_id, display_name: x.display_name, comic_project_id: x.comic_project_id })),
                                },
                              },
                            })
                        : undefined
                    }
                    className={`w-full flex items-center justify-between border border-slate-100 rounded-xl px-4 py-2.5 text-left ${
                      canView ? 'hover:border-pink-200 hover:bg-pink-50/40 transition-colors cursor-pointer' : ''
                    }`}
                  >
                    <p className="text-sm font-bold text-black">{r.display_name}</p>
                    {canView ? (
                      <span className="shrink-0 text-xs font-bold text-pink-600">{t('View comic')} →</span>
                    ) : (
                      <span className="shrink-0 text-xs font-bold text-black">{t('Not submitted')}</span>
                    )}
                  </Row>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUBMISSION DETAIL MODAL (teacher — per-question review of one
// student's latest attempt)
// ============================================================

function SubmissionDetailModal({ session, classroom, assignment, member, onBack, onClose }) {
  const { t } = useLanguage();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getSubmissionDetail(classroom.class_code, assignment.id, member.member_id, session.memberToken)
      .then((data) => setDetail(data))
      .catch((err) => setError(err?.message || t("Unable to load this student's answers.")))
      .finally(() => setLoading(false));
  }, [classroom.class_code, assignment.id, member.member_id, session.memberToken]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 shrink-0">
          <button onClick={onBack} className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 text-black hover:bg-slate-100 transition-colors">
            <ArrowRight className="w-4.5 h-4.5 rotate-180" />
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-black truncate">{member.display_name}</h3>
            <p className="text-xs text-black font-semibold truncate">{assignment.title}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 text-black hover:bg-slate-100 transition-colors">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 text-black animate-spin" />
            </div>
          )}

          {!loading && error && <p className="text-red-500 font-bold text-sm text-center py-8">{error}</p>}

          {!loading && !error && detail && !detail.submitted && (
            <p className="text-black font-medium text-sm text-center py-8">{t("This student hasn't submitted this homework yet.")}</p>
          )}

          {!loading && !error && detail?.submitted && (
            <div className="space-y-5">
              {detail.status === 'in_progress' && (
                <p className="text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  {detail.answered > 0
                    ? `${t('Incomplete')} — ${t('stopped after')} Q${detail.answered} ${t('of')} ${detail.total}`
                    : t('Incomplete')}
                </p>
              )}

              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                <span className="text-sm font-bold text-black">
                  {detail.status === 'in_progress' ? t('Score so far') : t('Score')}
                </span>
                <span className="font-extrabold text-black">
                  {detail.status === 'in_progress' ? `${detail.score}/${detail.answered}` : `${detail.score}/${detail.total}`}
                </span>
              </div>

              {detail.questions.length === 0 && (
                <p className="text-black font-medium text-sm text-center py-6">
                  {t("This homework's quiz is no longer available, so its questions can't be shown — the score above is still accurate.")}
                </p>
              )}

              {detail.questions.map((q) => (
                <div key={q.question_index} className="border border-slate-100 rounded-xl p-4">
                  <p className="font-bold text-black text-sm mb-3">
                    {q.question_index + 1}. {q.question}
                  </p>

                  {q.image_url && (
                    <img loading="lazy" src={mediaUrl(q.image_url)} alt={q.question} className="w-full max-h-40 object-contain rounded-lg border border-slate-100 mb-3" />
                  )}

                  <div className="space-y-1.5">
                    {(q.options || []).map((opt, idx) => {
                      let cls = 'bg-slate-50 border border-slate-100 text-black';
                      if (idx === q.correct) cls = 'bg-green-50 border border-green-300 text-green-700';
                      else if (idx === q.selected) cls = 'bg-red-50 border border-red-300 text-red-600';
                      return (
                        <div key={idx} className={`px-3 py-2 rounded-lg font-semibold text-sm flex items-center justify-between ${cls}`}>
                          <span>{opt}</span>
                          {idx === q.correct && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                          {idx === q.selected && idx !== q.correct && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.selected === null && (
                    <p className="text-xs font-semibold text-amber-600 mt-2">
                      {detail.status === 'in_progress' && q.question_index >= detail.answered
                        ? t('Not reached — the student stopped before this question.')
                        : t('Skipped — no answer selected.')}
                    </p>
                  )}

                  {q.explanation && (
                    <p className="text-xs text-black font-medium mt-3 leading-relaxed">{q.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ASSIGNMENT PLAYER (student)
// ============================================================

function AssignmentPlayerModal({ session, classroom, assignment, onClose, onSubmitted }) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null); // { questions, idx, selected, score, answers }
  const [finished, setFinished] = useState(false);

  // Every answer is saved to the teacher's results straight away, so a
  // quiz abandoned after Q3 shows up as "Incomplete after Q3". The first
  // save creates the attempt and returns its id; later saves update that
  // same attempt. Saves are chained so they reach the server in order.
  const submissionIdRef = useRef(null);
  const saveChainRef = useRef(Promise.resolve());

  const saveAttempt = (snapshot, completed) => {
    const run = saveChainRef.current.then(async () => {
      const data = await submitAssignment(classroom.class_code, assignment.id, {
        memberToken: session.memberToken,
        score: snapshot.score,
        total: snapshot.questions.length,
        answers: snapshot.answers,
        submissionId: submissionIdRef.current,
        completed,
      });
      if (data?.submission?.id) submissionIdRef.current = data.submission.id;
      return data;
    });
    // A failed progress save must not block the next one.
    saveChainRef.current = run.catch(() => {});
    return run;
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Same reasoning as the AMIVI/AMICO "Visuals"/"Comic" links: a
    // student only has a classroom member_token, not an account that
    // owns the teacher's quiz project, so the plain getLibraryProject
    // call 404s for them. Fetch through the classroom-scoped endpoint
    // instead, authorized by this student's own membership.
    getAssignmentProject(classroom.class_code, assignment.id, 'quiz', session.memberToken)
      .then((project) => {
        const questions = project?.data?.questions || [];
        if (!questions.length) throw new Error(t('This homework has no questions to show.'));
        setPlayer({ questions, idx: 0, selected: null, score: 0, answers: [] });
      })
      .catch((err) => setError(err?.message || t('Unable to load this homework.')))
      .finally(() => setLoading(false));
  }, [assignment.quiz_project_id, classroom.class_code, assignment.id, session.memberToken]);

  const handleSelect = (i) => {
    if (player.selected !== null) return;
    const q = player.questions[player.idx];
    const isCorrect = i === q.correct;
    const next = {
      ...player,
      selected: i,
      score: isCorrect ? player.score + 1 : player.score,
      // Record every question's answer as it's picked — the
      // teacher's per-question review reads this back, so it
      // has to survive moving on to the next question, unlike
      // `selected` which resets each time.
      answers: [
        ...player.answers,
        { question_index: player.idx, selected: i, correct: q.correct, is_correct: isCorrect },
      ],
    };
    setPlayer(next);

    if (player.idx === player.questions.length - 1) {
      // Last question answered: the homework hands itself in, with no
      // Submit button to click.
      submitFinal(next);
    } else {
      // Save progress in the background; the student never waits on it.
      saveAttempt(next, false).catch(() => {});
    }
  };

  // 'idle' | 'saving' | 'error'. Once the final save succeeds, the
  // score screen appears on its own after a short pause, so the student
  // still sees whether their last answer was right.
  const [submitState, setSubmitState] = useState('idle');
  const [submitError, setSubmitError] = useState(null);

  const submitFinal = async (snapshot) => {
    setSubmitState('saving');
    setSubmitError(null);
    try {
      await saveAttempt(snapshot, true);
      onSubmitted(assignment.id, { submitted_count: assignment.submitted_count + 1 });
      setTimeout(() => setFinished(true), 1200);
    } catch (err) {
      setSubmitState('error');
      setSubmitError(err?.message || t('Failed to submit your answers.'));
    }
  };

  const handleNext = () => {
    setPlayer((p) => ({ ...p, idx: p.idx + 1, selected: null }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
      {/* Sized to match the full Quiz page's "real quiz" feel (big
          question text, big image, big touch-friendly options)
          instead of the cramped small-modal look it had before. */}
      <div className="relative bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 sm:px-8 py-4 sm:py-5 border-b border-slate-100 shrink-0">
          <h3 className="font-extrabold text-black text-xl sm:text-2xl truncate">{assignment.title}</h3>
          <button onClick={onClose} className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 text-black hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8">
          {loading && (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-black animate-spin" />
            </div>
          )}

          {!loading && error && !finished && <p className="text-red-500 font-bold text-base text-center py-8">{error}</p>}

          {!loading && !error && finished && player && (
            <div className="text-center py-8">
              <div className="text-7xl mb-4">
                {player.score / player.questions.length >= 0.8 ? '🏆' : player.score / player.questions.length >= 0.5 ? '⭐' : '💪'}
              </div>
              <h4 className="font-bold text-black text-2xl sm:text-3xl mb-2">{t('You scored')} {player.score}/{player.questions.length}</h4>
              <p className="text-base text-black font-semibold">{t("Your teacher can see this result, and it's saved to your learning history.")}</p>
            </div>
          )}

          {!loading && !error && !finished && player && (
            <>
              <span className="inline-block text-base font-bold text-purple-600 bg-purple-100 px-4 py-1.5 rounded-full mb-5">
                {t('Question')} {player.idx + 1}/{player.questions.length}
              </span>

              {(() => {
                const q = player.questions[player.idx];
                return (
                  <>
                    <p className="font-bold text-black text-2xl sm:text-3xl leading-tight mb-5">{q.q}</p>

                    {q.image_url && (
                      <img loading="lazy" src={mediaUrl(q.image_url)} alt={q.q} className="w-full max-h-80 object-contain rounded-2xl border-2 border-purple-50 mb-5" />
                    )}

                    <div className="space-y-3 mb-6">
                      {(q.options || []).map((opt, idx) => {
                        let cls = 'bg-white border-2 border-gray-200 text-black hover:border-purple-400 hover:bg-purple-50';
                        if (player.selected !== null) {
                          if (idx === q.correct) cls = 'bg-green-50 border-2 border-green-400 text-green-700';
                          else if (idx === player.selected) cls = 'bg-red-50 border-2 border-red-400 text-red-600';
                          else cls = 'bg-gray-50 border-2 border-gray-200 text-black opacity-60';
                        }
                        return (
                          <button
                            key={idx}
                            disabled={player.selected !== null}
                            onClick={() => handleSelect(idx)}
                            className={`w-full text-left px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl transition-all flex items-center justify-between gap-3 shadow-sm hover:shadow-md ${cls}`}
                          >
                            {opt}
                            {player.selected !== null && idx === q.correct && <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />}
                            {player.selected !== null && idx === player.selected && idx !== q.correct && <XCircle className="w-6 h-6 text-red-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {player.selected !== null && player.idx < player.questions.length - 1 && (
                      <button
                        onClick={handleNext}
                        className="w-full py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:scale-[1.01] transition-transform shadow-lg"
                      >
                        {`${t('Next')} →`}
                      </button>
                    )}

                    {/* Last question: submitted automatically, no button. */}
                    {player.selected !== null && player.idx === player.questions.length - 1 && (
                      submitState === 'error' ? (
                        <div className="text-center space-y-3">
                          <p className="text-red-500 font-bold text-base">{submitError}</p>
                          <button
                            onClick={() => submitFinal(player)}
                            className="w-full py-3.5 sm:py-4 rounded-2xl font-bold text-lg sm:text-xl text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:scale-[1.01] transition-transform shadow-lg"
                          >
                            {t('Try again')}
                          </button>
                        </div>
                      ) : (
                        <p className="flex items-center justify-center gap-2 text-base font-bold text-purple-600 py-3">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {t('All done! Submitting your answers…')}
                        </p>
                      )
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HISTORY PANEL (student)
// ============================================================

function HistoryPanel({ session }) {
  const { t } = useLanguage();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getClassroomHistory(session.classCode, session.memberToken)
      .then((data) => setHistory(data.history || []))
      .catch((err) => setError(err?.message || t('Unable to load your learning history.')))
      .finally(() => setLoading(false));
  }, [session.classCode, session.memberToken]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-bold text-black flex items-center gap-2 mb-4">
        <History className="w-4.5 h-4.5 text-black" /> {t('My learning history')}
      </h2>

      {loading && (
        <div className="py-8 flex justify-center">
          <Loader2 className="w-5 h-5 text-black animate-spin" />
        </div>
      )}

      {!loading && error && <p className="text-red-400 font-semibold text-sm text-center py-6">{error}</p>}

      {!loading && !error && history?.length === 0 && (
        <p className="text-black font-medium text-sm text-center py-6">{t('No attempts yet — complete some homework to see your history here.')}</p>
      )}

      {!loading && !error && history?.length > 0 && (
        <div className="space-y-2">
          {history.map((h) => (
            <div key={h.submission_id} className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-bold text-black truncate">{h.assignment_title}</p>
                <p className="text-xs text-black font-semibold">{formatDue(h.submitted_at)}</p>
              </div>
              {h.status === 'in_progress' ? (
                <span className="shrink-0 ml-3 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                  {h.answered > 0 ? `${t('Incomplete after')} Q${h.answered}` : t('Incomplete')}
                </span>
              ) : (
                <span className="font-extrabold text-black shrink-0 ml-3 inline-flex items-center gap-1">
                  {h.score / h.total >= 0.8 && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                  {h.score}/{h.total}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// PARENT VIEW (read-only)
// ============================================================

function ParentView({ data, loading, error, onRetry, onLogout }) {
  const { t } = useLanguage();
  if (loading && !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
        <div className="lg:col-span-2 space-y-6">
          {[0, 1].map((i) => (
            <div key={i} className="h-40 bg-white rounded-2xl border border-slate-200" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-2xl border border-slate-200" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-black font-bold text-lg mb-1">{t("Couldn't load this view.")}</p>
        <p className="text-black font-medium text-sm mb-5">{error}</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={onRetry} className="inline-flex items-center gap-2 bg-rose-500 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-rose-600 transition-colors text-sm">
            <RefreshCw className="w-4 h-4" /> {t('Try Again')}
          </button>
          <button onClick={onLogout} className="inline-flex items-center gap-2 bg-slate-100 text-black font-bold py-2.5 px-5 rounded-xl hover:bg-slate-200 transition-colors text-sm">
            {t('Use a Different Code')}
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <p className="text-xs font-bold text-black uppercase tracking-wide mb-1">{t('Classroom')}</p>
          <p className="text-xl font-extrabold text-black">{data.classroom.name}</p>
          {data.classroom.subject && <p className="text-sm text-black font-semibold mt-1">{data.classroom.subject}</p>}
          {data.classroom.description && <p className="text-sm text-black font-medium mt-2">{data.classroom.description}</p>}
          {data.classroom.teacher_name && (
            <p className="text-xs text-black font-semibold mt-3">{t('Teacher')}: {data.classroom.teacher_name}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-black flex items-center gap-2 mb-4">
            <ClipboardList className="w-4.5 h-4.5 text-black" /> {t('Assignments')}
          </h2>

          {data.assignments.length === 0 ? (
            <p className="text-sm text-black font-medium">{t('No homework has been assigned yet.')}</p>
          ) : (
            <div className="space-y-3">
              {data.assignments.map((a) => (
                <div key={a.id} className="border border-slate-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-black truncate">{a.title}</p>
                      {a.due_at && (
                        <p className="text-xs text-black font-semibold flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {t('Due')} {formatDue(a.due_at)}
                        </p>
                      )}
                    </div>
                    {a.status === 'submitted' ? (
                      <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {a.score}/{a.total}
                      </span>
                    ) : a.status === 'incomplete' ? (
                      <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" /> {a.answered > 0 ? `${t('Incomplete after')} Q${a.answered}` : t('Incomplete')}
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" /> {t('Not started')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-black flex items-center gap-2 mb-4">
            <History className="w-4.5 h-4.5 text-black" /> {t('Learning history')}
          </h2>

          {data.history.length === 0 ? (
            <p className="text-sm text-black font-medium">{t('No completed homework yet.')}</p>
          ) : (
            <div className="space-y-3">
              {data.history.map((h) => (
                <div key={h.submission_id} className="flex items-center justify-between gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-black truncate">{h.assignment_title}</p>
                    <p className="text-xs text-black font-semibold">{formatDue(h.submitted_at) || ''}</p>
                  </div>
                  {h.status === 'in_progress' ? (
                    <span className="shrink-0 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                      {h.answered > 0 ? `${t('Incomplete after')} Q${h.answered}` : t('Incomplete')}
                    </span>
                  ) : (
                    <span className="shrink-0 text-sm font-extrabold text-black">
                      {h.score}/{h.total}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CONFIRM MODAL
// ============================================================

function ConfirmModal({ title, body, confirmLabel, busy, onCancel, onConfirm }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={() => (!busy ? onCancel() : null)} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
          <LogOut className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="text-lg font-extrabold text-black mb-1.5">{title}</h3>
        <p className="text-sm text-black font-medium mb-6 leading-relaxed">{body}</p>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} disabled={busy} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-black bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50">
            {t('Cancel')}
          </button>
          <button onClick={onConfirm} disabled={busy} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-60">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CODE SAVED MODAL (shown once, right after registering)
// ============================================================

function CodeSavedModal({ role, code, label, onContinue }) {
  const { t } = useLanguage();
  const isTeacher = role === 'teacher';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable — ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" />
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isTeacher ? 'bg-teal-50' : 'bg-indigo-50'}`}>
          <KeyRound className={`w-6 h-6 ${isTeacher ? 'text-teal-600' : 'text-indigo-600'}`} />
        </div>
        <h3 className="text-lg font-extrabold text-black mb-1.5">{t('Save your')} {label}</h3>
        <p className="text-sm text-black font-medium mb-4 leading-relaxed">
          {isTeacher
            ? t("This is private — never share it with students. It's the only way to log back into this classroom as teacher from another device.")
            : t("This is private. It's how you log back into your homework and history here from another device — your teacher won't see it.")}
        </p>
        <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-5">
          <span className="text-base font-extrabold text-black tracking-[0.12em] truncate">{code}</span>
          <button onClick={handleCopy} className="inline-flex items-center gap-1.5 text-xs font-bold text-black hover:text-black transition-colors shrink-0">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t('Copied') : t('Copy')}
          </button>
        </div>
        <button
          onClick={onContinue}
          className={`w-full py-2.5 rounded-xl font-bold text-sm text-white transition-colors ${
            isTeacher ? 'bg-teal-600 hover:bg-teal-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {t("I've saved it — Continue")}
        </button>
      </div>
    </div>
  );
}
