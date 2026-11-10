import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio } from 'lucide-react';

import { getLiveState } from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

// Student-only: waits (via long-poll) for the teacher to go live and
// shows a Join button the moment they do.
export default function LiveJoinBanner({ classCode, memberToken }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [live, setLive] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let stopped = false;
    let version = null;

    async function loop() {
      while (!stopped) {
        try {
          const state = await getLiveState(classCode, memberToken, version, controller.signal);
          if (stopped) return;
          version = state.version;
          setLive(state);
        } catch (err) {
          if (stopped || err?.name === 'AbortError') return;
          await new Promise((r) => setTimeout(r, 5000));
        }
      }
    }

    loop();
    return () => {
      stopped = true;
      controller.abort();
    };
  }, [classCode, memberToken]);

  if (!live?.is_live) return null;

  return (
    <div className="rounded-2xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-white shadow-sm p-4 sm:p-5 flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-extrabold uppercase tracking-widest rounded-full px-3 py-1 animate-pulse">
        <Radio className="w-3.5 h-3.5" /> {t('Live')}
      </span>
      <p className="flex-1 font-bold text-black">{t('Your teacher is presenting right now.')}</p>
      <button
        onClick={() => navigate(`/classroom/live/${classCode}`, { state: { memberToken, role: 'student' } })}
        className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl px-5 py-2.5"
      >
        {t('Join Live')}
      </button>
    </div>
  );
}
