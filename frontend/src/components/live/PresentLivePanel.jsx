import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Radio, Loader2, Square, Play, Sparkles, FolderOpen } from 'lucide-react';

import {
  generateAmico,
  generateAmivi,
  generateQuiz,
  getClassroomLibraryProjects,
  getLiveState,
  startLive,
  stopLive,
} from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

const KINDS = [
  { key: 'amivi', label: 'AMIVI lesson' },
  { key: 'amico', label: 'AMICO comic' },
  { key: 'quiz', label: 'Quiz' },
];

// Teacher-only: pick something from the Library and present it live
// to every student in this class.
export default function PresentLivePanel({ classCode, memberToken }) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [kind, setKind] = useState('amivi');
  const [projects, setProjects] = useState(null);
  const [projectId, setProjectId] = useState('');
  const [live, setLive] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('library'); // 'library' | 'create'
  const [material, setMaterial] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    getLiveState(classCode, memberToken).then(setLive).catch(() => setLive(null));
  }, [classCode, memberToken]);

  // Bumped whenever something new may have been generated, so freshly
  // made lessons/comics/quizzes show up without reloading the page.
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    const bump = () => setRefreshKey((k) => k + 1);
    window.addEventListener('vlq-library-changed', bump);
    window.addEventListener('focus', bump);
    return () => {
      window.removeEventListener('vlq-library-changed', bump);
      window.removeEventListener('focus', bump);
    };
  }, []);

  useEffect(() => {
    setProjects(null);
    setProjectId('');
  }, [kind]);

  useEffect(() => {
    let cancelled = false;
    getClassroomLibraryProjects(classCode, memberToken, kind)
      .then((data) => {
        if (cancelled) return;
        const list = data.projects || [];
        setProjects(list);
        // Keep the current pick if it still exists.
        setProjectId((cur) => (cur && list.some((p) => String(p.id) === String(cur)) ? cur : ''));
      })
      .catch((err) => {
        if (cancelled) return;
        setProjects([]);
        setError(err?.message || t('Unable to load your Library.'));
      });
    return () => { cancelled = true; };
  }, [classCode, memberToken, kind, refreshKey, t]);

  const openPresenter = () => {
    navigate(`/classroom/live/${classCode}`, {
      state: { memberToken, role: 'teacher', from: location.pathname },
    });
  };

  // Generate a brand-new lesson/comic/quiz right here, then select it
  // so the teacher can Go Live with it straight away.
  const generateHere = async () => {
    if (!material.trim()) {
      setError(t('Type a topic or paste some learning material first.'));
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      let id;
      let title;
      if (kind === 'quiz') {
        const data = await generateQuiz({ mode: 'material', materialText: material, language, numQuestions: 5, generateImages: true, generateVideos: false });
        id = data.project_id;
        title = data.quiz?.title;
      } else if (kind === 'amivi') {
        const data = await generateAmivi(material, language, false, '');
        id = data.project_id;
        title = data.title;
      } else {
        const data = await generateAmico({ homeworkPrompt: material, language });
        id = data.project_id;
        title = data.title;
      }
      if (!id) throw new Error(t('Generation finished but nothing was saved. Please try again.'));
      const label = title || material.trim().slice(0, 60);
      setProjects((list) => [{ id, title: label }, ...(list || []).filter((p) => p.id !== id)]);
      setProjectId(String(id));
      setSource('library');
      setMaterial('');
    } catch (err) {
      setError(err?.message || t('Failed to generate. Please try again.'));
    } finally {
      setGenerating(false);
    }
  };

  const goLive = async () => {
    if (!projectId) return;
    setBusy(true);
    setError(null);
    try {
      await startLive(classCode, { memberToken, kind, projectId: Number(projectId) });
      openPresenter();
    } catch (err) {
      setError(err?.message || t('Unable to start presenting.'));
    } finally {
      setBusy(false);
    }
  };

  const endLive = async () => {
    setBusy(true);
    try {
      setLive(await stopLive(classCode, { memberToken }));
    } catch (err) {
      setError(err?.message || t('Unable to end the presentation.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-rose-50 via-white to-orange-50 rounded-2xl border-2 border-rose-200 border-l-8 border-l-red-500 shadow-sm p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-md">
          <Radio className="w-6 h-6" />
        </div>
        <h3 className="text-2xl font-extrabold text-black">{t('Present Live')}</h3>
      </div>
      <p className="text-base font-semibold text-black mb-4">
        {t('Show a lesson, comic or quiz on every student’s screen. When you click Next, their screen moves too.')}
      </p>

      {live?.is_live && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <span className="text-base font-bold text-red-700 flex-1">{t('You are presenting live right now.')}</span>
          <button
            onClick={openPresenter}
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-base font-bold rounded-lg px-3 py-2"
          >
            <Play className="w-4 h-4" /> {t('Resume')}
          </button>
          <button
            onClick={endLive}
            disabled={busy}
            className="inline-flex items-center gap-1.5 bg-white border border-red-200 text-red-700 text-base font-bold rounded-lg px-3 py-2 disabled:opacity-50"
          >
            <Square className="w-4 h-4" /> {t('End Live')}
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {KINDS.map((k) => (
          <button
            key={k.key}
            type="button"
            onClick={() => setKind(k.key)}
            disabled={generating}
            className={`px-3 py-1.5 rounded-lg text-base font-bold border-2 transition-colors ${
              kind === k.key ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-black hover:border-slate-300'
            }`}
          >
            {t(k.label)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={() => setSource('library')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
            source === 'library' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-black hover:bg-slate-200'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" /> {t('Choose from Library')}
        </button>
        <button
          type="button"
          onClick={() => setSource('create')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
            source === 'create' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-black hover:bg-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> {t('Create new here')}
        </button>
      </div>

      {source === 'create' ? (
        <div className="space-y-2">
          <textarea
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            rows={4}
            disabled={generating}
            placeholder={t('Type a topic or paste the learning material…')}
            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-base font-semibold text-black resize-none disabled:opacity-60"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={generateHere}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-bold rounded-xl px-5 py-2.5"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating
                ? t('Generating…')
                : `${t('Generate')} ${t(KINDS.find((k) => k.key === kind)?.label || '')}`}
            </button>
            {generating && (
              <span className="text-sm font-semibold text-black">
                {t('This can take a minute. It will be ready to Go Live when done.')}
              </span>
            )}
          </div>
        </div>
      ) : (
      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          disabled={!projects || projects.length === 0}
          className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-white text-base font-semibold text-black disabled:opacity-60"
        >
          <option value="" disabled>
            {projects === null
              ? t('Loading your Library…')
              : projects.length === 0
              ? t('Nothing saved in your Library yet')
              : t('Choose what to present…')}
          </option>
          {(projects || []).map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <button
          onClick={goLive}
          disabled={!projectId || busy}
          className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl px-5 py-2.5"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
          {t('Go Live')}
        </button>
      </div>
      )}

      {error && <p className="mt-3 text-base font-semibold text-red-600">{error}</p>}
    </div>
  );
}
