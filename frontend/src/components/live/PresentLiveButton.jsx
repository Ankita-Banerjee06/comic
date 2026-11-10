import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Radio, Loader2, X } from 'lucide-react';

import { getMyClassrooms, startLive } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

// "Present Live" for something the teacher has just generated (or opened).
//
// - Inside a class (classCode + memberToken given) it goes live straight away.
// - On the AMIVI / AMICO / Quiz pages it looks up the classes this account
//   teaches: one class → goes live in it, several → asks which one.
//
// Renders nothing for non-teachers or before the content has a project id.
export default function PresentLiveButton({ kind, projectId, classCode, memberToken, className = '', label }) {
  const { t } = useLanguage();
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState(null); // shown when there's a choice to make
  const [chosen, setChosen] = useState('');

  const inClass = Boolean(classCode && memberToken);
  if (!projectId) return null;
  if (!inClass && role !== 'teacher') return null;

  const goLive = async (code, token) => {
    setBusy(true);
    setError(null);
    try {
      await startLive(code, { memberToken: token, kind, projectId: Number(projectId) });
      navigate(`/classroom/live/${code}`, {
        state: { memberToken: token, role: 'teacher', from: location.pathname },
      });
    } catch (err) {
      setError(err?.message || t('Unable to start presenting.'));
      setBusy(false);
    }
  };

  const handleClick = async () => {
    if (inClass) return goLive(classCode, memberToken);

    setBusy(true);
    setError(null);
    try {
      const data = await getMyClassrooms();
      const teaching = (data.classrooms || []).filter((c) => c.role === 'teacher');
      if (teaching.length === 0) {
        setError(t('Create a class first, then you can present to it live.'));
        setBusy(false);
      } else if (teaching.length === 1) {
        await goLive(teaching[0].class_code, teaching[0].member_token);
      } else {
        setClasses(teaching);
        setChosen(teaching[0].class_code);
        setBusy(false);
      }
    } catch (err) {
      setError(err?.message || t('Unable to load your classrooms.'));
      setBusy(false);
    }
  };

  const confirmClass = () => {
    const c = classes?.find((x) => x.class_code === chosen);
    if (c) goLive(c.class_code, c.member_token);
  };

  return (
    <div className="inline-flex flex-col items-stretch gap-2">
      {classes ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 p-2">
          <select
            value={chosen}
            onChange={(e) => setChosen(e.target.value)}
            className="p-2 rounded-lg border border-slate-200 bg-white text-base font-semibold text-black"
          >
            {classes.map((c) => (
              <option key={c.class_code} value={c.class_code}>
                {c.name} ({c.class_code})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={confirmClass}
            disabled={busy}
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-base font-bold rounded-lg px-3 py-2"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
            {t('Go Live')}
          </button>
          <button
            type="button"
            onClick={() => setClasses(null)}
            className="p-2 text-black hover:bg-red-100 rounded-lg"
            title={t('Cancel')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={busy}
          className={
            className ||
            'inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl px-4 py-2.5'
          }
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
          {label || t('Present Live')}
        </button>
      )}
      {error && <p className="text-sm font-semibold text-red-600 max-w-xs">{error}</p>}
    </div>
  );
}
