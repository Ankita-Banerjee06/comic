import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import {
  createClassroom,
  joinClassroom,
  getClassroom,
  createAssignment,
  submitAssignment,
  getAssignmentResults,
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
  getLibraryProject,
  mediaUrl,
} from '../services/api';

const SESSION_KEY = 'vlq_classroom_session';

const INPUT_CLASS =
  'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-300 transition-all';

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
      .catch((err) => setError(err?.message || 'Unable to load this classroom.'))
      .finally(() => setLoading(false));
  }, []);

  const loadParent = useCallback((parentCode) => {
    setParentLoading(true);
    setParentError(null);
    getParentView(parentCode)
      .then((data) => setParentData(data))
      .catch((err) => setParentError(err?.message || "That parent code isn't recognized."))
      .finally(() => setParentLoading(false));
  }, []);

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
      setSavedCode({ role: 'teacher', code: data.teacher_code, label: 'teacher code' });
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
      setSavedCode({ role: 'student', code: data.student_code, label: 'login code' });
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
          title="Leave this classroom?"
          body={
            myRole === 'teacher'
              ? 'You can log back in any time with the class code and your teacher code.'
              : 'You can log back in later with the class code and your login code. Your homework history stays saved.'
          }
          confirmLabel={leaving ? 'Leaving…' : 'Leave Classroom'}
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

function Header({ screen, classroom, role, onLeaveClick, parentData, onParentLogout }) {
  const isParent = screen === 'parent-view';

  const title = isParent
    ? parentData
      ? `${parentData.student.display_name}'s Classroom`
      : 'Parent View'
    : screen === 'classroom' && classroom
    ? classroom.name
    : 'Homework, made simple';

  const subtitle = isParent
    ? parentData
      ? parentData.classroom.subject || parentData.classroom.name
      : "See your child's assignments, scores and progress — read-only."
    : screen === 'classroom' && classroom
    ? classroom.subject || 'Assignments, quiz results and learning history for this class.'
    : 'Teachers create a classroom and assign homework built from AMIVI, AMICO and Quiz. Students join, complete it, and track their progress.';

  const showBadge = (screen === 'classroom' && classroom) || (isParent && parentData);

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-8 text-white"
      style={{ minHeight: 180, background: '#0f2e2a' }}
    >
      <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg, #0f2e2a 0%, #0e4f45 60%, #0d9488 130%)' }} />
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-xs font-bold mb-4">
            <GraduationCap className="w-3.5 h-3.5" /> Classroom
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">{title}</h1>
          <p className="text-white/90 font-medium max-w-lg">{subtitle}</p>
        </div>

        {showBadge && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/15 border border-white/25">
              {isParent ? '👪 Parent' : role === 'teacher' ? '👩‍🏫 Teacher' : '🎓 Student'}
            </span>
            <button
              onClick={isParent ? onParentLogout : onLeaveClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/25 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-colors"
            >
              <LogOut className="w-4 h-4" /> {isParent ? 'Log Out' : 'Leave'}
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <button
        onClick={onGoTeacher}
        className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-8 hover:shadow-md hover:-translate-y-0.5 transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
          <Plus className="w-6 h-6 text-teal-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-1.5">I'm a teacher</h2>
        <p className="text-slate-500 font-medium text-sm mb-4">
          Register a new classroom and get a class code, or log back into one you already run.
        </p>
        <span className="inline-flex items-center gap-1.5 text-teal-600 font-bold text-sm">
          Register or log in <ArrowRight className="w-4 h-4" />
        </span>
      </button>

      <button
        onClick={onGoStudent}
        className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-8 hover:shadow-md hover:-translate-y-0.5 transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
          <GraduationCap className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-1.5">I'm a student</h2>
        <p className="text-slate-500 font-medium text-sm mb-4">
          Register with a class code from your teacher, or log back in to your own homework.
        </p>
        <span className="inline-flex items-center gap-1.5 text-indigo-600 font-bold text-sm">
          Register or log in <ArrowRight className="w-4 h-4" />
        </span>
      </button>

      <button
        onClick={onGoParent}
        className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-8 hover:shadow-md hover:-translate-y-0.5 transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
          <Heart className="w-6 h-6 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-1.5">I'm a parent</h2>
        <p className="text-slate-500 font-medium text-sm mb-4">
          Got a parent code from your student? View their assignments and scores — read-only.
        </p>
        <span className="inline-flex items-center gap-1.5 text-rose-500 font-bold text-sm">
          View progress <ArrowRight className="w-4 h-4" />
        </span>
      </button>
    </div>
  );
}

// ============================================================
// TEACHER / STUDENT SECTIONS (Register + Log In tabs)
// ============================================================

function AuthTabs({ mode, onChange, activeTextClass }) {
  return (
    <div className="max-w-xl mx-auto flex items-center gap-1 bg-slate-100 rounded-xl p-1">
      <button
        type="button"
        onClick={() => onChange('register')}
        className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors ${
          mode === 'register' ? `bg-white ${activeTextClass} shadow-sm` : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Register
      </button>
      <button
        type="button"
        onClick={() => onChange('login')}
        className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-colors ${
          mode === 'login' ? `bg-white ${activeTextClass} shadow-sm` : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Log In
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
      setError('Classroom name and your name are both required.');
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
      setError(err?.message || 'Failed to create classroom.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5">
      <h2 className="text-xl font-bold text-slate-800">Create a classroom</h2>

      <Field label="Classroom name">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 7th Grade Biology" className={INPUT_CLASS} />
      </Field>

      <Field label="Subject (optional)">
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Biology" className={INPUT_CLASS} />
      </Field>

      <Field label="Description (optional)">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this class about?" rows={3} className={`${INPUT_CLASS} resize-none`} />
      </Field>

      <Field label="Your name">
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name, as students will see it" className={INPUT_CLASS} />
      </Field>

      {error && <p className="text-red-500 font-bold text-sm text-center whitespace-pre-wrap">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Creating…' : 'Create Classroom'}
        </button>
      </div>
    </form>
  );
}

function TeacherLoginForm({ onCancel, onLoggedIn }) {
  const [classCode, setClassCode] = useState('');
  const [teacherCode, setTeacherCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!classCode.trim() || !teacherCode.trim()) {
      setError('Class code and teacher code are both required.');
      return;
    }

    const code = classCode.trim().toUpperCase();

    setSubmitting(true);
    try {
      const data = await teacherLogin(code, { teacherCode: teacherCode.trim().toUpperCase() });
      onLoggedIn(data, code);
    } catch (err) {
      setError(err?.message || "That class code or teacher code isn't recognized.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5">
      <h2 className="text-xl font-bold text-slate-800">Teacher log in</h2>
      <p className="text-sm text-slate-500 font-medium -mt-3">
        Use the class code and the private teacher code you saved when you created this classroom.
      </p>

      <Field label="Class code">
        <input
          value={classCode}
          onChange={(e) => setClassCode(e.target.value.toUpperCase())}
          placeholder="e.g. K7P2QX"
          className={`${INPUT_CLASS} tracking-[0.3em] text-center font-bold uppercase`}
          maxLength={12}
        />
      </Field>

      <Field label="Teacher code">
        <input
          value={teacherCode}
          onChange={(e) => setTeacherCode(e.target.value.toUpperCase())}
          placeholder="e.g. K7P2QXA9RT"
          className={`${INPUT_CLASS} tracking-[0.2em] text-center font-bold uppercase`}
          maxLength={20}
        />
      </Field>

      {error && <p className="text-red-500 font-bold text-sm text-center whitespace-pre-wrap">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Logging in…' : 'Log In'}
        </button>
      </div>
    </form>
  );
}

function JoinClassroomForm({ onCancel, onJoined }) {
  const [classCode, setClassCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!classCode.trim() || !displayName.trim()) {
      setError('Class code and your name are both required.');
      return;
    }

    const code = classCode.trim().toUpperCase();

    setSubmitting(true);
    try {
      const data = await joinClassroom({ classCode: code, displayName: displayName.trim() });
      onJoined(data, code);
    } catch (err) {
      setError(err?.message || 'Failed to join classroom.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5">
      <h2 className="text-xl font-bold text-slate-800">Join a classroom</h2>

      <Field label="Class code">
        <input
          value={classCode}
          onChange={(e) => setClassCode(e.target.value.toUpperCase())}
          placeholder="e.g. K7P2QX"
          className={`${INPUT_CLASS} tracking-[0.3em] text-center font-bold uppercase`}
          maxLength={12}
        />
      </Field>

      <Field label="Your name">
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="How your teacher will see you" className={INPUT_CLASS} />
      </Field>

      {error && <p className="text-red-500 font-bold text-sm text-center whitespace-pre-wrap">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Joining…' : 'Join Classroom'}
        </button>
      </div>
    </form>
  );
}

function StudentLoginForm({ onCancel, onLoggedIn }) {
  const [classCode, setClassCode] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!classCode.trim() || !studentCode.trim()) {
      setError('Class code and login code are both required.');
      return;
    }

    const code = classCode.trim().toUpperCase();

    setSubmitting(true);
    try {
      const data = await studentLogin(code, { studentCode: studentCode.trim().toUpperCase() });
      onLoggedIn(data, code);
    } catch (err) {
      setError(err?.message || "That class code or login code isn't recognized.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5">
      <h2 className="text-xl font-bold text-slate-800">Student log in</h2>
      <p className="text-sm text-slate-500 font-medium -mt-3">
        Use the class code and the private login code you saved when you registered.
      </p>

      <Field label="Class code">
        <input
          value={classCode}
          onChange={(e) => setClassCode(e.target.value.toUpperCase())}
          placeholder="e.g. K7P2QX"
          className={`${INPUT_CLASS} tracking-[0.3em] text-center font-bold uppercase`}
          maxLength={12}
        />
      </Field>

      <Field label="Login code">
        <input
          value={studentCode}
          onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
          placeholder="e.g. K7P2QXA9RT"
          className={`${INPUT_CLASS} tracking-[0.2em] text-center font-bold uppercase`}
          maxLength={20}
        />
      </Field>

      {error && <p className="text-red-500 font-bold text-sm text-center whitespace-pre-wrap">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Logging in…' : 'Log In'}
        </button>
      </div>
    </form>
  );
}

function ParentLoginForm({ onCancel, onLoggedIn }) {
  const [parentCode, setParentCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!parentCode.trim()) {
      setError('Parent code is required.');
      return;
    }

    const code = parentCode.trim().toUpperCase();

    setSubmitting(true);
    try {
      const data = await getParentView(code);
      onLoggedIn(code, data);
    } catch (err) {
      setError(err?.message || "That parent code isn't recognized.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5">
      <h2 className="text-xl font-bold text-slate-800">Parent access</h2>
      <p className="text-sm text-slate-500 font-medium -mt-3">
        Enter the code your student gave you to see their assignments and scores.
      </p>

      <Field label="Parent code">
        <input
          value={parentCode}
          onChange={(e) => setParentCode(e.target.value.toUpperCase())}
          placeholder="e.g. K7P2QXA9RT"
          className={`${INPUT_CLASS} tracking-[0.2em] text-center font-bold uppercase`}
          maxLength={20}
        />
      </Field>

      {error && <p className="text-red-500 font-bold text-sm text-center whitespace-pre-wrap">{error}</p>}

      <div className="flex items-center gap-3 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-60 transition-colors inline-flex items-center justify-center gap-2">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Checking…' : 'View Progress'}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// ============================================================
// CLASSROOM VIEW
// ============================================================

function ClassroomView({ session, classroom, myMember, role, loading, error, onRetry, onUpdate, onBackToHub, navigate }) {
  if (loading && !classroom) return <ClassroomSkeleton />;

  if (error && !classroom) {
    return (
      <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-slate-700 font-bold text-lg mb-1">Couldn't load this classroom.</p>
        <p className="text-slate-400 font-medium text-sm mb-5">{error}</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={onRetry} className="inline-flex items-center gap-2 bg-teal-600 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-teal-700 transition-colors text-sm">
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <button onClick={onBackToHub} className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 font-bold py-2.5 px-5 rounded-xl hover:bg-slate-200 transition-colors text-sm">
            Back to Start
          </button>
        </div>
      </div>
    );
  }

  if (!classroom) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <ClassCodeCard classroom={classroom} />

        {role === 'teacher' ? (
          <CreateAssignmentPanel session={session} classroom={classroom} onUpdate={onUpdate} />
        ) : null}

        <AssignmentsPanel session={session} classroom={classroom} role={role} onUpdate={onUpdate} navigate={navigate} />

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
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Class code</p>
        <p className="text-2xl font-extrabold text-slate-900 tracking-[0.2em]">{classroom.class_code}</p>
        {classroom.description && <p className="text-sm text-slate-500 font-medium mt-2 max-w-md">{classroom.description}</p>}
      </div>
      <button onClick={handleCopy} className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-colors shrink-0">
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied' : 'Copy Code'}
      </button>
    </div>
  );
}

// ============================================================
// ROSTER PANEL
// ============================================================

function RosterPanel({ classroom, myMember }) {
  const teacher = classroom.members.find((m) => m.role === 'teacher');
  const students = classroom.members.filter((m) => m.role === 'student');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
        <Users className="w-4.5 h-4.5 text-slate-400" /> Roster
      </h2>

      {teacher && (
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-teal-600">{teacher.display_name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{teacher.display_name}</p>
            <p className="text-xs text-teal-600 font-semibold">Teacher{teacher.id === myMember?.id ? ' · You' : ''}</p>
          </div>
        </div>
      )}

      {students.length === 0 ? (
        <p className="text-sm text-slate-400 font-medium">No students have joined yet.</p>
      ) : (
        <div className="space-y-3">
          {students.map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-indigo-600">{s.display_name.charAt(0).toUpperCase()}</span>
              </div>
              <p className="text-sm font-bold text-slate-800 truncate flex items-center gap-1.5">
                {s.display_name}
                {s.id === myMember?.id && (
                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full">You</span>
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
        .catch((err) => setError(err?.message || 'Failed to load your login code.'))
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
      <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-1.5">
        <KeyRound className="w-4.5 h-4.5 text-slate-400" /> {isTeacher ? 'Teacher login code' : 'Your login code'}
      </h2>
      <p className="text-sm text-slate-500 font-medium mb-4">
        {isTeacher
          ? 'Private — pair this with the class code to log back in as teacher from another device. Never share it with students.'
          : 'Private — pair this with the class code to log back into your own homework and history from another device.'}
      </p>

      {loading && !code ? (
        <p className="text-sm text-slate-400 font-medium">Loading…</p>
      ) : code ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <span className="text-base font-extrabold text-slate-900 tracking-[0.12em] truncate">{code}</span>
            <button onClick={handleCopy} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors shrink-0">
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {confirmRegenerate ? (
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-500 font-medium flex-1">This disables the old code.</p>
              <button onClick={() => setConfirmRegenerate(false)} className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
                Cancel
              </button>
              <button onClick={() => fetchCode(true)} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">
                Confirm
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmRegenerate(true)} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
              Generate a new code
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
      setError(err?.message || 'Failed to generate a parent code.');
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
      <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-1.5">
        <KeyRound className="w-4.5 h-4.5 text-slate-400" /> Parent access
      </h2>
      <p className="text-sm text-slate-500 font-medium mb-4">
        Share this code with a parent or guardian so they can see your assignments and scores — read-only, no password needed.
      </p>

      {!code ? (
        <button
          onClick={() => fetchCode(false)}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Generating…' : 'Get a parent code'}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <span className="text-base font-extrabold text-slate-900 tracking-[0.12em] truncate">{code}</span>
            <button onClick={handleCopy} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors shrink-0">
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {confirmRegenerate ? (
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-500 font-medium flex-1">This disables the old code.</p>
              <button onClick={() => setConfirmRegenerate(false)} className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors">
                Cancel
              </button>
              <button onClick={() => fetchCode(true)} disabled={loading} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">
                Confirm
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmRegenerate(true)} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
              Generate a new code
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

  const runGenerate = async (kind) => {
    if (!material.trim()) {
      setGenErrors((e) => ({ ...e, [kind]: 'Add some learning material first.' }));
      return;
    }

    setBusy(kind);
    setGenErrors((e) => ({ ...e, [kind]: null }));

    try {
      let projectId, projTitle;

      if (kind === 'quiz') {
        const data = await generateQuiz({ mode: 'material', materialText: material, language: 'en', numQuestions: 5, generateImages: true, generateVideos: false });
        projectId = data.project_id;
        projTitle = data.quiz?.title;
      } else if (kind === 'amivi') {
        const data = await generateAmivi(material, 'en', false, '');
        projectId = data.project_id;
        projTitle = 'AMIVI Visuals';
      } else {
        const data = await generateAmico({ homeworkPrompt: material, language: 'en' });
        projectId = data.project_id;
        projTitle = data.title || 'AMICO Comic';
      }

      setGenerated((g) => ({ ...g, [kind]: { projectId, title: projTitle } }));
      if (kind === 'quiz' && !title) setTitle(projTitle || '');
    } catch (err) {
      setGenErrors((e) => ({ ...e, [kind]: err?.message || `Failed to generate ${kind}.` }));
    } finally {
      setBusy(null);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssignError(null);

    if (!generated.quiz) {
      setAssignError('Generate a quiz from the material first — homework needs a quiz to grade.');
      return;
    }

    if (!title.trim()) {
      setAssignError('Give this homework a title.');
      return;
    }

    setAssigning(true);
    try {
      const data = await createAssignment(classroom.class_code, {
        memberToken: session.memberToken,
        title: title.trim(),
        instructions: instructions.trim(),
        quizProjectId: generated.quiz.projectId,
        amiviProjectId: generated.amivi?.projectId || null,
        amicoProjectId: generated.amico?.projectId || null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      });

      onUpdate({ ...classroom, assignments: [data.assignment, ...classroom.assignments] });

      // reset the form for the next assignment
      setMaterial('');
      setGenerated({ quiz: null, amivi: null, amico: null });
      setTitle('');
      setInstructions('');
      setDueAt('');
      setExpanded(false);
    } catch (err) {
      setAssignError(err?.message || 'Failed to assign homework.');
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
        <Plus className="w-5 h-5" /> Assign new homework
      </button>
    );
  }

  return (
    <form onSubmit={handleAssign} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-900">Assign homework</h2>
        <button type="button" onClick={() => setExpanded(false)} className="text-slate-300 hover:text-slate-500 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <Field label="Learning material">
        <textarea
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          placeholder="Paste the topic or material this homework is based on..."
          rows={5}
          className={`${INPUT_CLASS} resize-none`}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <GenerateChip
          label="Quiz"
          required
          icon={Puzzle}
          color="text-purple-600"
          done={!!generated.quiz}
          busy={busy === 'quiz'}
          error={genErrors.quiz}
          onClick={() => runGenerate('quiz')}
        />
        <GenerateChip
          label="AMIVI Visuals"
          icon={Palette}
          color="text-orange-500"
          done={!!generated.amivi}
          busy={busy === 'amivi'}
          error={genErrors.amivi}
          onClick={() => runGenerate('amivi')}
        />
        <GenerateChip
          label="AMICO Comic"
          icon={BookOpen}
          color="text-pink-500"
          done={!!generated.amico}
          busy={busy === 'amico'}
          error={genErrors.amico}
          onClick={() => runGenerate('amico')}
        />
      </div>

      {generated.quiz && (
        <>
          <Field label="Homework title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter 3 Quiz" className={INPUT_CLASS} />
          </Field>

          <Field label="Instructions (optional)">
            <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2} className={`${INPUT_CLASS} resize-none`} />
          </Field>

          <Field label="Due date (optional)">
            <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className={INPUT_CLASS} />
          </Field>
        </>
      )}

      {assignError && <p className="text-red-500 font-bold text-sm text-center">{assignError}</p>}

      <button
        type="submit"
        disabled={assigning || !generated.quiz}
        className="w-full py-3 rounded-xl font-bold text-sm text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
      >
        {assigning && <Loader2 className="w-4 h-4 animate-spin" />}
        {assigning ? 'Assigning…' : 'Assign Homework'}
      </button>
    </form>
  );
}

function GenerateChip({ label, required, icon: Icon, color, done, busy, error, onClick }) {
  return (
    <div className="border border-slate-200 rounded-xl p-3 flex flex-col items-center text-center gap-2">
      <Icon className={`w-5 h-5 ${color}`} />
      <p className="text-xs font-bold text-slate-700">
        {label}
        {required && <span className="text-red-400"> *</span>}
      </p>
      {error && <p className="text-[10px] text-red-500 font-semibold">{error}</p>}
      {done ? (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-600">
          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
        </span>
      ) : (
        <button
          type="button"
          onClick={onClick}
          disabled={busy}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-teal-600 disabled:opacity-50 transition-colors"
        >
          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {busy ? 'Generating…' : 'Generate'}
        </button>
      )}
    </div>
  );
}

// ============================================================
// ASSIGNMENTS LIST
// ============================================================

function AssignmentsPanel({ session, classroom, role, onUpdate, navigate }) {
  const assignments = classroom.assignments || [];
  const [resultsFor, setResultsFor] = useState(null);
  const [playFor, setPlayFor] = useState(null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
        <ClipboardList className="w-4.5 h-4.5 text-slate-400" /> {role === 'teacher' ? 'Assigned homework' : 'My homework'}
      </h2>

      {assignments.length === 0 ? (
        <p className="text-sm text-slate-400 font-medium py-6 text-center">
          {role === 'teacher' ? 'No homework assigned yet — use the form above to create one.' : 'No homework yet — check back once your teacher assigns some.'}
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
              navigate={navigate}
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

function AssignmentRow({ assignment, role, onViewResults, onPlay, navigate }) {
  const due = formatDue(assignment.due_at);

  return (
    <div className="border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 truncate">{assignment.title}</p>
        {assignment.instructions && <p className="text-xs text-slate-400 font-medium mt-0.5 line-clamp-1">{assignment.instructions}</p>}
        <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold text-slate-400">
          {due && (
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Due {due}
            </span>
          )}
          {assignment.amivi_project_id && (
            <button onClick={() => navigate(`/amivi/${assignment.amivi_project_id}`)} className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-600">
              <Palette className="w-3.5 h-3.5" /> Visuals
            </button>
          )}
          {assignment.amico_project_id && (
            <button onClick={() => navigate(`/amico/${assignment.amico_project_id}`)} className="inline-flex items-center gap-1 text-pink-500 hover:text-pink-600">
              <BookOpen className="w-3.5 h-3.5" /> Comic
            </button>
          )}
        </div>
      </div>

      {role === 'teacher' ? (
        <button
          onClick={onViewResults}
          className="shrink-0 inline-flex items-center gap-1.5 py-2 px-4 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors"
        >
          Results ({assignment.submitted_count}/{assignment.student_count})
        </button>
      ) : (
        <button
          onClick={onPlay}
          className="shrink-0 inline-flex items-center gap-1.5 py-2 px-4 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors"
        >
          <Puzzle className="w-3.5 h-3.5" /> {assignment.submitted_count > 0 ? 'Retake' : 'Start'}
        </button>
      )}
    </div>
  );
}

// ============================================================
// RESULTS MODAL (teacher)
// ============================================================

function ResultsModal({ session, classroom, assignment, onClose }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAssignmentResults(classroom.class_code, assignment.id, session.memberToken)
      .then((data) => setResults(data.results || []))
      .catch((err) => setError(err?.message || 'Unable to load results.'))
      .finally(() => setLoading(false));
  }, [classroom.class_code, assignment.id, session.memberToken]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-extrabold text-slate-900">{assignment.title} — Results</h3>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
            </div>
          )}

          {!loading && error && <p className="text-red-500 font-bold text-sm text-center py-8">{error}</p>}

          {!loading && !error && results?.length === 0 && (
            <p className="text-slate-400 font-medium text-sm text-center py-8">No students have joined this classroom yet.</p>
          )}

          {!loading && !error && results?.length > 0 && (
            <div className="space-y-2">
              {results.map((r) => (
                <div key={r.member_id} className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-2.5">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{r.display_name}</p>
                    <p className="text-xs text-slate-400 font-semibold">
                      {r.attempts > 0 ? `${r.attempts} attempt${r.attempts === 1 ? '' : 's'}` : 'Not started'}
                    </p>
                  </div>
                  {r.total ? (
                    <span className="font-extrabold text-slate-900">{r.score}/{r.total}</span>
                  ) : (
                    <span className="text-xs font-bold text-slate-300">—</span>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null); // { questions, idx, selected, score }
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getLibraryProject(assignment.quiz_project_id)
      .then((project) => {
        const questions = project?.data?.questions || [];
        if (!questions.length) throw new Error('This homework has no questions to show.');
        setPlayer({ questions, idx: 0, selected: null, score: 0 });
      })
      .catch((err) => setError(err?.message || 'Unable to load this homework.'))
      .finally(() => setLoading(false));
  }, [assignment.quiz_project_id]);

  const handleSelect = (i) => {
    if (player.selected !== null) return;
    setPlayer((p) => ({ ...p, selected: i, score: i === p.questions[p.idx].correct ? p.score + 1 : p.score }));
  };

  const handleNext = async () => {
    const isLast = player.idx === player.questions.length - 1;

    if (!isLast) {
      setPlayer((p) => ({ ...p, idx: p.idx + 1, selected: null }));
      return;
    }

    try {
      const data = await submitAssignment(classroom.class_code, assignment.id, {
        memberToken: session.memberToken,
        score: player.score,
        total: player.questions.length,
      });
      onSubmitted(assignment.id, { submitted_count: assignment.submitted_count + 1 });
      setFinished(true);
    } catch (err) {
      setError(err?.message || 'Failed to submit your answers.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="font-extrabold text-slate-900 truncate">{assignment.title}</h3>
          <button onClick={onClose} className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
            </div>
          )}

          {!loading && error && !finished && <p className="text-red-500 font-bold text-sm text-center py-8">{error}</p>}

          {!loading && !error && finished && player && (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">
                {player.score / player.questions.length >= 0.8 ? '🏆' : player.score / player.questions.length >= 0.5 ? '⭐' : '💪'}
              </div>
              <h4 className="font-bold text-slate-900 text-xl mb-1">You scored {player.score}/{player.questions.length}</h4>
              <p className="text-sm text-slate-500 font-medium">Your teacher can see this result, and it's saved to your learning history.</p>
            </div>
          )}

          {!loading && !error && !finished && player && (
            <>
              <span className="inline-block text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full mb-4">
                Question {player.idx + 1}/{player.questions.length}
              </span>

              {(() => {
                const q = player.questions[player.idx];
                return (
                  <>
                    <p className="font-bold text-slate-800 mb-4">{q.q}</p>

                    {q.image_url && (
                      <img src={mediaUrl(q.image_url)} alt={q.q} className="w-full max-h-52 object-contain rounded-xl border border-slate-100 mb-4" />
                    )}

                    <div className="space-y-2 mb-4">
                      {(q.options || []).map((opt, idx) => {
                        let cls = 'bg-slate-50 border border-slate-200 text-slate-700 hover:border-purple-300';
                        if (player.selected !== null) {
                          if (idx === q.correct) cls = 'bg-green-50 border border-green-300 text-green-700';
                          else if (idx === player.selected) cls = 'bg-red-50 border border-red-300 text-red-600';
                          else cls = 'bg-slate-50 border border-slate-100 text-slate-400';
                        }
                        return (
                          <button
                            key={idx}
                            disabled={player.selected !== null}
                            onClick={() => handleSelect(idx)}
                            className={`w-full text-left px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center justify-between ${cls}`}
                          >
                            {opt}
                            {player.selected !== null && idx === q.correct && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                            {player.selected !== null && idx === player.selected && idx !== q.correct && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {player.selected !== null && (
                      <button onClick={handleNext} className="w-full py-2.5 rounded-xl font-bold text-sm text-white bg-purple-600 hover:bg-purple-700 transition-colors">
                        {player.idx === player.questions.length - 1 ? 'Submit' : 'Next →'}
                      </button>
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
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getClassroomHistory(session.classCode, session.memberToken)
      .then((data) => setHistory(data.history || []))
      .catch((err) => setError(err?.message || 'Unable to load your learning history.'))
      .finally(() => setLoading(false));
  }, [session.classCode, session.memberToken]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
        <History className="w-4.5 h-4.5 text-slate-400" /> My learning history
      </h2>

      {loading && (
        <div className="py-8 flex justify-center">
          <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
        </div>
      )}

      {!loading && error && <p className="text-red-400 font-semibold text-sm text-center py-6">{error}</p>}

      {!loading && !error && history?.length === 0 && (
        <p className="text-slate-400 font-medium text-sm text-center py-6">No attempts yet — complete some homework to see your history here.</p>
      )}

      {!loading && !error && history?.length > 0 && (
        <div className="space-y-2">
          {history.map((h) => (
            <div key={h.submission_id} className="flex items-center justify-between border border-slate-100 rounded-xl px-4 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{h.assignment_title}</p>
                <p className="text-xs text-slate-400 font-semibold">{formatDue(h.submitted_at)}</p>
              </div>
              <span className="font-extrabold text-slate-900 shrink-0 ml-3 inline-flex items-center gap-1">
                {h.score / h.total >= 0.8 && <Trophy className="w-3.5 h-3.5 text-amber-500" />}
                {h.score}/{h.total}
              </span>
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
        <p className="text-slate-700 font-bold text-lg mb-1">Couldn't load this view.</p>
        <p className="text-slate-400 font-medium text-sm mb-5">{error}</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={onRetry} className="inline-flex items-center gap-2 bg-rose-500 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-rose-600 transition-colors text-sm">
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <button onClick={onLogout} className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 font-bold py-2.5 px-5 rounded-xl hover:bg-slate-200 transition-colors text-sm">
            Use a Different Code
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
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Classroom</p>
          <p className="text-xl font-extrabold text-slate-900">{data.classroom.name}</p>
          {data.classroom.subject && <p className="text-sm text-slate-500 font-semibold mt-1">{data.classroom.subject}</p>}
          {data.classroom.description && <p className="text-sm text-slate-500 font-medium mt-2">{data.classroom.description}</p>}
          {data.classroom.teacher_name && (
            <p className="text-xs text-slate-400 font-semibold mt-3">Teacher: {data.classroom.teacher_name}</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
            <ClipboardList className="w-4.5 h-4.5 text-slate-400" /> Assignments
          </h2>

          {data.assignments.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium">No homework has been assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {data.assignments.map((a) => (
                <div key={a.id} className="border border-slate-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{a.title}</p>
                      {a.due_at && (
                        <p className="text-xs text-slate-400 font-semibold flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> Due {formatDue(a.due_at)}
                        </p>
                      )}
                    </div>
                    {a.status === 'submitted' ? (
                      <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {a.score}/{a.total}
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" /> Not started
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
          <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
            <History className="w-4.5 h-4.5 text-slate-400" /> Learning history
          </h2>

          {data.history.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium">No completed homework yet.</p>
          ) : (
            <div className="space-y-3">
              {data.history.map((h) => (
                <div key={h.submission_id} className="flex items-center justify-between gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{h.assignment_title}</p>
                    <p className="text-xs text-slate-400 font-semibold">{formatDue(h.submitted_at) || ''}</p>
                  </div>
                  <span className="shrink-0 text-sm font-extrabold text-slate-700">
                    {h.score}/{h.total}
                  </span>
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={() => (!busy ? onCancel() : null)} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
          <LogOut className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-900 mb-1.5">{title}</h3>
        <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">{body}</p>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} disabled={busy} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50">
            Cancel
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
        <h3 className="text-lg font-extrabold text-slate-900 mb-1.5">Save your {label}</h3>
        <p className="text-sm text-slate-500 font-medium mb-4 leading-relaxed">
          {isTeacher
            ? "This is private — never share it with students. It's the only way to log back into this classroom as teacher from another device."
            : "This is private. It's how you log back into your homework and history here from another device — your teacher won't see it."}
        </p>
        <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-5">
          <span className="text-base font-extrabold text-slate-900 tracking-[0.12em] truncate">{code}</span>
          <button onClick={handleCopy} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors shrink-0">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <button
          onClick={onContinue}
          className={`w-full py-2.5 rounded-xl font-bold text-sm text-white transition-colors ${
            isTeacher ? 'bg-teal-600 hover:bg-teal-700' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          I've saved it — Continue
        </button>
      </div>
    </div>
  );
}
