import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Radio, X } from 'lucide-react';

import { getLiveState, getMyClassrooms } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const SESSION_KEY = 'vlq_classroom_session';
const MAX_WATCHED = 3;

function readStudentSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (s?.classCode && s?.memberToken && s.role === 'student') {
      return { classCode: s.classCode, memberToken: s.memberToken, name: '' };
    }
  } catch {
    // ignore
  }
  return null;
}

// Waits (long-poll) for one class to go live and shows its banner.
function ClassWatcher({ classCode, memberToken, name }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [live, setLive] = useState(false);
  const [dismissedVersion, setDismissedVersion] = useState(null);
  const [version, setVersion] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let stopped = false;
    let since = null;

    async function loop() {
      while (!stopped) {
        try {
          const state = await getLiveState(classCode, memberToken, since, controller.signal);
          if (stopped) return;
          since = state.version;
          setVersion(state.version);
          setLive(Boolean(state.is_live));
        } catch (err) {
          if (stopped || err?.name === 'AbortError') return;
          // Not a member any more / network trouble: back off quietly.
          await new Promise((r) => setTimeout(r, 15000));
        }
      }
    }

    loop();
    return () => {
      stopped = true;
      controller.abort();
    };
  }, [classCode, memberToken]);

  if (!live || dismissedVersion === version) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-white shadow-md px-4 py-3">
      <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-sm font-extrabold uppercase tracking-widest rounded-full px-3 py-1 animate-pulse">
        <Radio className="w-4 h-4" /> {t('Live')}
      </span>
      <p className="flex-1 min-w-[180px] text-lg font-bold text-black">
        {t('Your teacher is presenting right now.')}
        {name ? <span className="ml-1 text-black">({name})</span> : null}
      </p>
      <button
        onClick={() => navigate(`/classroom/live/${classCode}`, { state: { memberToken, role: 'student' } })}
        className="bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded-xl px-5 py-2.5"
      >
        {t('Join Live')}
      </button>
      <button
        onClick={() => setDismissedVersion(version)}
        title={t('Hide')}
        className="p-2 rounded-lg text-black hover:bg-red-100"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

// Shown on every page for students: the moment a teacher of any class
// they've joined goes live, a Join Live banner appears wherever they are.
export default function GlobalLiveBanner() {
  const { pathname } = useLocation();
  const { role, isAuthenticated } = useAuth();
  const [accountClasses, setAccountClasses] = useState([]);

  // Classes joined through a student account (not just this browser).
  useEffect(() => {
    if (!isAuthenticated || role === 'teacher') {
      setAccountClasses([]);
      return;
    }
    getMyClassrooms()
      .then((d) =>
        setAccountClasses(
          (d.classrooms || [])
            .filter((c) => c.role === 'student')
            .map((c) => ({ classCode: c.class_code, memberToken: c.member_token, name: c.name }))
        )
      )
      .catch(() => setAccountClasses([]));
  }, [isAuthenticated, role]);

  // Re-read on every page change so joining/leaving a class is picked up.
  const session = useMemo(() => readStudentSession(), [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const watched = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const c of [...(session ? [session] : []), ...accountClasses]) {
      const key = c.classCode.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      list.push(c);
    }
    return list.slice(0, MAX_WATCHED);
  }, [session, accountClasses]);

  // The Classroom page has its own banner, and the live page is the
  // presentation itself.
  if (role === 'teacher' || pathname.startsWith('/classroom') || watched.length === 0) return null;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-[96rem] mx-auto">
        {watched.map((c) => (
          <ClassWatcher key={c.classCode} {...c} />
        ))}
      </div>
    </div>
  );
}
