import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Radio,
  Loader2,
  Eye,
  EyeOff,
  Square,
  CheckCircle2,
  Maximize,
  Minimize,
} from 'lucide-react';

import {
  getLiveState,
  getLiveProject,
  updateLive,
  stopLive,
  mediaUrl,
} from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import DesignCanvas from '../components/designer/DesignCanvas';

const SESSION_KEY = 'vlq_classroom_session';

// Who am I in this class? Route state wins (set when the teacher
// clicks Go Live / a student clicks Join); otherwise fall back to the
// saved classroom session so a page refresh keeps working.
function resolveMember(classCode, state) {
  if (state?.memberToken) {
    return { memberToken: state.memberToken, role: state.role || 'student' };
  }
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (saved?.memberToken && saved.classCode?.toUpperCase() === classCode.toUpperCase()) {
      return { memberToken: saved.memberToken, role: saved.role || 'student' };
    }
  } catch {
    // ignore
  }
  return null;
}

// Quiz images can be bundled deck pictures (/quiz-decks/...) served
// by the website itself; everything else comes from the API.
function imageSrc(path) {
  if (!path) return '';
  return path.startsWith('/api/') || path.startsWith('http') ? mediaUrl(path) : path;
}

// Turns any presentable project into one flat list of slides, so the
// stage, the controls and the sync logic don't care what kind it is.
function buildSlides(project) {
  if (!project) return [];
  const data = project.data || {};

  if (project.type === 'amivi') {
    return (data.chunks || []).map((c, i) => ({
      image: c.image_url,
      title: c.key_point || c.text || `Microbit ${i + 1}`,
      subtitle: c.slogan,
      body: c.description,
    }));
  }

  if (project.type === 'amico') {
    if (data.pages?.length) {
      return data.pages.map((p, i) => ({
        image: p.comic_image_url || p.image_url,
        title: `Page ${p.page_number || i + 1}`,
        wide: true,
      }));
    }
    return (data.panels || []).map((p, i) => ({
      image: p.image_url,
      title: p.title || `Panel ${i + 1}`,
      body: p.dialogue,
    }));
  }

  if (project.type === 'design') {
    return [{ design: data }];
  }

  if (project.type === 'quiz') {
    return (data.questions || []).map((q) => ({
      question: q.q || q.question,
      options: q.options || [],
      correct: q.correct,
      explanation: q.explanation,
      image: q.image_url,
    }));
  }

  return [];
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function Stage({ slide, reveal }) {
  const { t } = useLanguage();

  if (!slide) return null;

  if (slide.design) {
    // Capped by height so the whole board — all five cards — is
    // always on screen, whatever the screen shape.
    return (
      <div className="w-full">
        <DesignCanvas design={slide.design} maxHeight="(100vh - 210px)" />
      </div>
    );
  }

  if (slide.question !== undefined) {
    return (
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {slide.image && (
          <img
            src={imageSrc(slide.image)}
            alt=""
            className="w-full max-h-[60vh] object-contain rounded-2xl bg-white/5"
          />
        )}
        <div className={slide.image ? '' : 'lg:col-span-2'}>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-6">{slide.question}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {slide.options.map((opt, idx) => {
              const isCorrect = reveal && idx === slide.correct;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 px-4 py-4 rounded-2xl border-2 text-lg sm:text-xl font-bold transition-colors ${
                    isCorrect
                      ? 'bg-green-500/20 border-green-400 text-white'
                      : reveal
                      ? 'bg-white/5 border-white/10 text-white/50'
                      : 'bg-white/10 border-white/20 text-white'
                  }`}
                >
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? 'bg-green-500 text-white' : 'bg-white/20'}`}>
                    {OPTION_LETTERS[idx] || idx + 1}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {isCorrect && <CheckCircle2 className="w-6 h-6 text-green-400 shrink-0" />}
                </div>
              );
            })}
          </div>
          {reveal && slide.explanation && (
            <div className="mt-5 p-4 rounded-2xl bg-white/10 border border-white/15">
              <p className="text-green-300 font-bold mb-1">💡 {t('Explanation')}</p>
              <p className="text-white text-lg leading-relaxed">{slide.explanation}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full mx-auto flex flex-col items-center gap-5 ${slide.wide ? 'max-w-6xl' : 'max-w-4xl'}`}>
      {slide.image && (
        <img
          src={imageSrc(slide.image)}
          alt={slide.title}
          className={`w-full object-contain rounded-2xl bg-white/5 ${slide.wide ? 'max-h-[75vh]' : 'max-h-[58vh]'}`}
        />
      )}
      {!slide.wide && (
        <div className="text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white">{slide.title}</h2>
          {slide.subtitle && (
            <p className="mt-2 text-xl sm:text-2xl font-bold text-amber-300 uppercase tracking-wide">{slide.subtitle}</p>
          )}
          {slide.body && <p className="mt-3 text-lg sm:text-xl text-white/85 max-w-3xl mx-auto leading-relaxed">{slide.body}</p>}
        </div>
      )}
    </div>
  );
}

export default function LivePresent() {
  const { classCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const member = useMemo(() => resolveMember(classCode, location.state), [classCode, location.state]);
  const isTeacher = member?.role === 'teacher';

  const [live, setLive] = useState(null);
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const versionRef = useRef(null);
  const projectIdRef = useRef(null);

  const slides = useMemo(() => buildSlides(project), [project]);
  const position = Math.min(live?.position || 0, Math.max(slides.length - 1, 0));
  const slide = slides[position];

  const backToClass = useCallback(() => {
    navigate(isTeacher && location.state?.from ? location.state.from : '/classroom');
  }, [navigate, isTeacher, location.state]);

  // Follow the live state: one long-poll after another. The teacher
  // runs this too, so a second teacher tab/device stays in sync.
  useEffect(() => {
    if (!member) return undefined;

    const controller = new AbortController();
    let stopped = false;

    async function loop() {
      while (!stopped) {
        try {
          const state = await getLiveState(classCode, member.memberToken, versionRef.current, controller.signal);
          if (stopped) return;
          setError(null);

          // Ignore stale answers older than what we already show
          // (e.g. the teacher's own optimistic update).
          if (versionRef.current === null || state.version >= versionRef.current) {
            versionRef.current = state.version;
            setLive(state);
          }

          if (!state.is_live) return;
        } catch (err) {
          if (stopped || err?.name === 'AbortError') return;
          setError(err?.message || t('Connection lost — reconnecting…'));
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }

    loop();
    return () => {
      stopped = true;
      controller.abort();
    };
  }, [classCode, member, t]);

  // Load the presented lesson whenever the teacher switches to a
  // different one.
  useEffect(() => {
    if (!member || !live?.is_live || !live.project_id) return;
    if (projectIdRef.current === live.project_id) return;

    projectIdRef.current = live.project_id;
    getLiveProject(classCode, member.memberToken)
      .then(setProject)
      .catch((err) => setError(err?.message || t('Unable to load the presentation.')));
  }, [classCode, member, live?.is_live, live?.project_id, t]);

  const pushState = useCallback(
    async (nextPosition, nextReveal) => {
      if (!isTeacher || !live) return;
      // Move the teacher's own screen immediately; students follow
      // as soon as the server confirms.
      setLive((prev) => ({ ...prev, position: nextPosition, reveal: nextReveal }));
      try {
        const state = await updateLive(classCode, {
          memberToken: member.memberToken,
          position: nextPosition,
          reveal: nextReveal,
        });
        versionRef.current = state.version;
        setLive(state);
      } catch (err) {
        setError(err?.message || t('Unable to update the live slide.'));
      }
    },
    [isTeacher, live, classCode, member, t]
  );

  const goTo = useCallback(
    (index) => {
      if (!slides.length) return;
      const clamped = Math.max(0, Math.min(index, slides.length - 1));
      if (clamped !== position) pushState(clamped, false);
    },
    [slides.length, position, pushState]
  );

  const endLive = async () => {
    try {
      await stopLive(classCode, { memberToken: member.memberToken });
    } catch {
      // fall through — leave the page either way
    }
    backToClass();
  };

  // Keyboard control for the teacher: arrows to move, R to reveal.
  useEffect(() => {
    if (!isTeacher) return undefined;
    const onKey = (e) => {
      if (e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') goTo(position + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') goTo(position - 1);
      else if ((e.key === 'r' || e.key === 'R') && slide?.question !== undefined) pushState(position, !live?.reveal);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isTeacher, goTo, position, slide, live?.reveal, pushState]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.();
  };

  if (!member) {
    return (
      <div className="py-24 text-center">
        <p className="font-bold text-black mb-4">{t('Join the class first to watch the live presentation.')}</p>
        <button onClick={() => navigate('/classroom')} className="font-bold text-teal-700 hover:text-teal-800">
          {t('Go to Classroom')}
        </button>
      </div>
    );
  }

  const ended = live && !live.is_live;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          {live?.is_live ? (
            <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-extrabold uppercase tracking-widest rounded-full px-3 py-1 animate-pulse">
              <Radio className="w-3.5 h-3.5" /> {t('Live')}
            </span>
          ) : null}
          <p className="text-white font-bold truncate">
            {project?.title || t('Live presentation')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {slides.length > 0 && live?.is_live && (
            <span className={`text-white/70 text-sm font-bold ${slides.length === 1 ? 'hidden' : ''}`}>
              {position + 1} / {slides.length}
            </span>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
            title={t('Full screen')}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
          {isTeacher && live?.is_live ? (
            <button
              onClick={endLive}
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg px-3 py-2"
            >
              <Square className="w-4 h-4" /> {t('End Live')}
            </button>
          ) : (
            <button
              onClick={backToClass}
              className="text-white/80 hover:text-white text-sm font-bold rounded-lg px-3 py-2 hover:bg-white/10"
            >
              {t('Leave')}
            </button>
          )}
        </div>
      </div>

      {/* Stage */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-4 sm:p-8">
        {ended ? (
          <div className="text-center">
            <p className="text-white text-2xl font-extrabold mb-2">{t('The presentation has ended.')}</p>
            <button onClick={backToClass} className="mt-4 bg-white text-black font-bold rounded-xl px-5 py-2.5">
              {t('Back to class')}
            </button>
          </div>
        ) : !live || !project ? (
          <div className="flex flex-col items-center gap-3 text-white/80">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="font-semibold">{t('Connecting to the live presentation…')}</p>
          </div>
        ) : slides.length === 0 ? (
          <p className="text-white/80 font-semibold">{t('This lesson has nothing to present yet.')}</p>
        ) : (
          <Stage slide={slide} reveal={live.reveal} />
        )}
      </div>

      {error && (
        <p className="text-center text-amber-300 text-sm font-semibold pb-2">{error}</p>
      )}

      {/* Teacher controls / student status */}
      {live?.is_live && slides.length > 0 && (
        <div className="border-t border-white/10 px-4 sm:px-6 py-3 flex items-center justify-center gap-3">
          {isTeacher ? (
            <>
              {slides.length > 1 && (
              <button
                onClick={() => goTo(position - 1)}
                disabled={position === 0}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white font-bold rounded-xl px-5 py-3"
              >
                <ArrowLeft className="w-5 h-5" /> {t('Previous')}
              </button>
              )}
              {slide?.question !== undefined && (
                <button
                  onClick={() => pushState(position, !live.reveal)}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl px-5 py-3"
                >
                  {live.reveal ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  {live.reveal ? t('Hide Answer') : t('Reveal Answer')}
                </button>
              )}
              {slides.length > 1 && (
              <button
                onClick={() => goTo(position + 1)}
                disabled={position >= slides.length - 1}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 text-white font-bold rounded-xl px-5 py-3"
              >
                {t('Next')} <ArrowRight className="w-5 h-5" />
              </button>
              )}
              {slides.length === 1 && (
                <p className="text-white/80 text-base font-semibold">{t('Every student is seeing this board now.')}</p>
              )}
            </>
          ) : (
            <p className="text-white/70 text-sm font-semibold">
              {t('Your teacher controls this presentation — it moves when they do.')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
