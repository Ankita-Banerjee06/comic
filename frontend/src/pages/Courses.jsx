import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowLeft, BookOpen, ChevronRight, Loader2, Sparkles,
  Atom, Calculator, Landmark, Languages, Palette, Cpu, FolderOpen,
  Image as ImageIcon, Plus, Users, Share2, BarChart3, Trophy,
} from 'lucide-react';
import {
  getChapterSubjects, getSubjectChapters, getChapterHub,
  generateAmivi, generateAmico, generateQuiz, mediaUrl,
} from '../services/api';

const SUBJECT_ICON = {
  Science: Atom,
  Math: Calculator,
  History: Landmark,
  Language: Languages,
  Arts: Palette,
  Technology: Cpu,
  Other: BookOpen,
  Unsorted: FolderOpen,
};

// Vivid-but-readable per-subject palette: a strong accent `color` for
// icons/text/border, a pastel `soft` for the icon tile, and a light
// `tint` the card's background gradient fades into.
const SUBJECT_STYLE = {
  Science: { color: '#16a34a', soft: '#bbf7d0', tint: '#f0fdf4' },
  Math: { color: '#9333ea', soft: '#e9d5ff', tint: '#faf5ff' },
  History: { color: '#ea580c', soft: '#fed7aa', tint: '#fff7ed' },
  Language: { color: '#2563eb', soft: '#bfdbfe', tint: '#eff6ff' },
  Arts: { color: '#ca8a04', soft: '#fef08a', tint: '#fefce8' },
  Technology: { color: '#db2777', soft: '#fbcfe8', tint: '#fdf2f8' },
  Other: { color: '#475569', soft: '#e2e8f0', tint: '#f8fafc' },
  Unsorted: { color: '#0d9488', soft: '#99f6e4', tint: '#f0fdfa' },
};

// Optional display-name overrides per subject key (keyed by the raw
// subject string the backend returns). Empty — subjects show as-is.
const SUBJECT_DISPLAY_NAME = {};

const CONTENT_META = {
  amivi: { label: 'AMIVI', sub: 'Visual summary', tint: 'bg-blue-50', color: 'text-blue-600', border: 'border-blue-200' },
  amico: { label: 'AMICO', sub: 'Comic story', tint: 'bg-pink-50', color: 'text-pink-600', border: 'border-pink-200' },
  quiz: { label: 'Quiz', sub: 'Test yourself', tint: 'bg-purple-50', color: 'text-purple-600', border: 'border-purple-200' },
};

// The six-step loop a study group runs to turn individual Essential
// Learning into a shared, peer-reviewed quiz — the explainer card
// shown at the top of the Subjects view.
const ESSENTIAL_LEARNING_FLOW = [
  { label: 'Identify', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { label: 'Understand', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { label: 'Apply', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { label: 'Retain', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
];

const QUIZ_SYSTEM_STEPS = [
  {
    title: 'Group Formation',
    caption: 'Four or five learners form a small study group.',
    icon: Users,
    image: '/vlq-essential-learning-step1-group-formation.jpg',
    tint: 'bg-indigo-50',
    border: 'border-indigo-200',
    iconColor: 'text-indigo-600',
  },
  {
    title: 'Visual Sharing',
    caption: 'They share what each of them learned through AMIVI visuals.',
    icon: Share2,
    image: '/vlq-essential-learning-step2-visual-sharing.jpg',
    tint: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-600',
  },
  {
    title: 'Quiz Generation',
    caption: 'The group leader generates a quiz from everything the group has covered.',
    icon: Sparkles,
    image: '/vlq-essential-learning-step3-quiz-generation.jpg',
    tint: 'bg-purple-50',
    border: 'border-purple-200',
    iconColor: 'text-purple-600',
  },
  {
    title: 'Essential Quiz Production',
    caption: 'VLQ turns that material into a focused Essential Learning quiz.',
    icon: Cpu,
    image: '/vlq-essential-learning-step4-quiz-production.jpg',
    tint: 'bg-teal-50',
    border: 'border-teal-200',
    iconColor: 'text-teal-600',
  },
  {
    title: 'Assessment & Feedback',
    caption: "The group sees what's been mastered and what still needs reinforcing.",
    icon: BarChart3,
    image: '/vlq-essential-learning-step5-assessment-feedback.jpg',
    tint: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
  },
  {
    title: 'Action & Mastery',
    caption: 'Share it. Discuss it. Reinforce it. Master it.',
    icon: Trophy,
    image: '/vlq-essential-learning-step6-action-mastery.jpg',
    tint: 'bg-pink-50',
    border: 'border-pink-200',
    iconColor: 'text-pink-600',
  },
];

export default function Courses() {
  const navigate = useNavigate();

  // view: 'subjects' | 'chapters' | 'hub'
  const [view, setView] = useState('subjects');
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeChapterKey, setActiveChapterKey] = useState(null);
  const [activeChapterLabel, setActiveChapterLabel] = useState('');

  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [hub, setHub] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(null); // 'amivi' | 'amico' | 'quiz' | null

  const loadSubjects = useCallback(() => {
    setLoading(true);
    setError('');
    getChapterSubjects()
      .then(res => setSubjects(res.subjects || []))
      .catch(() => setError('Unable to load Essential Learning.'))
      .finally(() => setLoading(false));
  }, []);

  const loadChapters = useCallback((subject) => {
    setLoading(true);
    setError('');
    getSubjectChapters(subject)
      .then(res => setChapters(res.chapters || []))
      .catch(() => setError('Unable to load chapters for this subject.'))
      .finally(() => setLoading(false));
  }, []);

  const loadHub = useCallback((subject, chapterKey) => {
    setLoading(true);
    setError('');
    getChapterHub(subject, chapterKey)
      .then(res => setHub(res))
      .catch(() => setError('Unable to load this chapter.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  function openSubject(subject) {
    setActiveSubject(subject);
    setView('chapters');
    loadChapters(subject);
  }

  function openChapter(chapter) {
    setActiveChapterKey(chapter.chapter_key);
    setActiveChapterLabel(chapter.chapter);
    setView('hub');
    loadHub(activeSubject, chapter.chapter_key);
  }

  function backToSubjects() {
    setView('subjects');
    setActiveSubject(null);
    loadSubjects();
  }

  function backToChapters() {
    setView('chapters');
    loadChapters(activeSubject);
  }

  async function handleGenerate(missingType) {
    if (!hub) return;

    const sibling = hub.amivi || hub.amico || hub.quiz;
    if (!sibling) return;

    setGenerating(missingType);
    setError('');

    try {
      let result;

      if (missingType === 'amivi') {
        result = await generateAmivi('', 'en', false, '', sibling.id);
      } else if (missingType === 'amico') {
        result = await generateAmico({ sourceProjectId: sibling.id });
      } else {
        result = await generateQuiz({ sourceProjectId: sibling.id });
      }

      if (result?.project_id) {
        navigate(`/${missingType}/${result.project_id}`);
      }
    } catch (err) {
      setError(err.message || `Failed to generate ${missingType}.`);
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-5 sm:p-8" style={{ minHeight: 180, background: '#ecfdf5' }}>
        <img
          src="/vlq-classroom-hero.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0" style={{ background: 'rgba(6,78,59,0.62)' }} />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-xs font-bold mb-4 text-white">
            <img src="/vlq-badge-essential-learning-icon.png" alt="" className="w-4 h-4 rounded-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            Essential Learning
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight text-white">
            Essential Learning
          </h1>
          <p className="text-white/90 font-medium max-w-lg">
            Every AMIVI, AMICO and Quiz you've generated, organized by subject and chapter.
          </p>
        </div>
      </div>

      {/* ======================================================
          What Essential Learning means — badge, description, and
          the Identify → Understand → Apply → Retain flow.
      ======================================================= */}

      {view === 'subjects' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src="/vlq-badge-essential-learning.png"
              alt=""
              className="w-20 h-20 object-contain flex-shrink-0"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-black mb-2">Essential Learning</h2>
              <ul className="space-y-1 text-black font-semibold text-sm sm:text-base">
                <li>Focuses learning on what is genuinely important.</li>
                <li>Key ideas, relationships and understanding replace unnecessary trivia.</li>
                <li>Learners concentrate on knowledge worth remembering.</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-center flex-wrap gap-2 mt-6 pt-6 border-t border-slate-100">
            {ESSENTIAL_LEARNING_FLOW.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <span className={`px-4 py-2 rounded-xl border font-extrabold text-sm sm:text-base ${step.color}`}>
                  {step.label}
                </span>
                {i < ESSENTIAL_LEARNING_FLOW.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-black flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================
          VLQ Essential Learning Quiz System — the six-step loop a
          study group runs together, from forming the group through
          mastering what the quiz showed still needed work.
      ======================================================= */}

      {view === 'subjects' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="text-center mb-8">
            <p className="text-black font-semibold text-sm sm:text-base max-w-2xl mx-auto mb-4">
              A structured peer-review loop that turns Essential Learning into lasting mastery —
              identify what's been learned and what still needs reinforcing, then check and reinforce it together.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-extrabold text-sm sm:text-base shadow-sm">
              <img
                src="/vlq-logo-clean.png"
                alt=""
                className="h-5 w-auto object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              Essential Learning Quiz System
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {QUIZ_SYSTEM_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className={`rounded-2xl border overflow-hidden ${step.tint} ${step.border}`}
                >
                  <div className="aspect-[16/10] overflow-hidden bg-white border-b border-black/5">
                    <img
                      src={step.image}
                      alt=""
                      className={`w-full h-full object-cover ${step.imageFit || ''}`}
                      onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-11 h-11 rounded-xl bg-white border ${step.border} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <Icon className={`w-5 h-5 ${step.iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-extrabold ${step.iconColor}`}>STEP {i + 1}</p>
                        <h3 className="font-extrabold text-black leading-tight">{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-black font-medium text-sm">{step.caption}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 flex-wrap bg-emerald-50/60 border border-emerald-100 rounded-xl px-4 py-2.5 w-fit">
        <button
          onClick={backToSubjects}
          className={view === 'subjects' ? 'text-slate-800' : 'hover:text-green-700'}
        >
          Subjects
        </button>
        {view !== 'subjects' && (
          <>
            <ChevronRight className="w-4 h-4" />
            <button
              onClick={backToChapters}
              className={view === 'chapters' ? 'text-slate-800' : 'hover:text-green-700'}
            >
              {SUBJECT_DISPLAY_NAME[activeSubject] || activeSubject}
            </button>
          </>
        )}
        {view === 'hub' && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-800">{hub?.chapter || activeChapterLabel}</span>
          </>
        )}
      </div>

      {view !== 'subjects' && (
        <button
          onClick={view === 'hub' ? backToChapters : backToSubjects}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-green-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin" />
          <p className="font-semibold text-sm">Loading...</p>
        </div>
      ) : view === 'subjects' ? (
        <SubjectsGrid subjects={subjects} onOpen={openSubject} />
      ) : view === 'chapters' ? (
        <ChaptersGrid
          chapters={chapters}
          onOpen={openChapter}
          onBack={backToSubjects}
        />
      ) : (
        <ChapterHub
          hub={hub}
          generating={generating}
          onGenerate={handleGenerate}
          onOpenProject={(type, id) => navigate(`/${type}/${id}`)}
          onBack={backToChapters}
        />
      )}
    </div>
  );
}

function SubjectsGrid({ subjects, onOpen }) {
  if (!subjects.length) {
    return (
      <EmptyState
        title="Nothing generated yet"
        desc="Create your first AMIVI visual, AMICO comic or Quiz — it will show up here automatically, grouped by subject."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {subjects.map(s => {
        const Icon = SUBJECT_ICON[s.subject] || BookOpen;
        const style = SUBJECT_STYLE[s.subject] || SUBJECT_STYLE.Other;
        const displayName = SUBJECT_DISPLAY_NAME[s.subject] || s.subject;
        return (
          <button
            key={s.subject}
            onClick={() => onOpen(s.subject)}
            className="text-left rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group p-8 flex flex-col gap-5"
            style={{
              minHeight: 240,
              border: `3px solid ${style.color}`,
              background: `linear-gradient(160deg, ${style.soft} 0%, ${style.tint} 55%, #ffffff 100%)`,
              boxShadow: `0 14px 32px -16px ${style.color}66`,
            }}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: style.soft, border: `2px solid ${style.color}` }}
            >
              <Icon className="w-10 h-10" style={{ color: style.color }} strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-2xl text-slate-900 leading-tight mb-1.5">{displayName}</h3>
              <p className="text-base font-bold" style={{ color: style.color }}>
                {s.chapter_count} {s.chapter_count === 1 ? 'chapter' : 'chapters'}
              </p>
            </div>
            <div
              className="inline-flex items-center gap-2 text-sm font-extrabold self-start px-4 py-2 rounded-xl transition-transform group-hover:translate-x-1"
              style={{ background: style.soft, color: style.color, border: `2px solid ${style.color}` }}
            >
              Explore <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ChaptersGrid({ chapters, onOpen, onBack }) {
  if (!chapters.length) {
    return (
      <EmptyState
        title="No chapters here yet"
        desc="Nothing has been generated in this subject yet."
        onBack={onBack}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {chapters.map(c => {
        const previewUrl =
          c.amivi?.thumbnail_url ||
          c.amico?.thumbnail_url ||
          c.quiz?.thumbnail_url ||
          null;

        return (
          <button
            key={c.chapter_key}
            onClick={() => onOpen(c)}
            className="text-left bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col"
          >
            <div className="h-36 bg-slate-100 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img
                  src={mediaUrl(previewUrl)}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-300" />
              )}
            </div>
            <div className="p-6 flex flex-col gap-4">
              <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-green-700 transition-colors">
                {c.chapter}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {['amivi', 'amico', 'quiz'].map(type => {
                  const meta = CONTENT_META[type];
                  const present = Boolean(c[type]);
                  return (
                    <span
                      key={type}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        present
                          ? `${meta.tint} ${meta.color} ${meta.border}`
                          : 'bg-slate-50 text-slate-300 border-slate-100'
                      }`}
                    >
                      {meta.label}
                    </span>
                  );
                })}
              </div>
              <div className="flex items-center justify-end text-slate-300 group-hover:text-green-600 transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ChapterHub({ hub, generating, onGenerate, onOpenProject, onBack }) {
  if (!hub) return null;

  const types = ['amivi', 'amico', 'quiz'];
  const hasAny = types.some(t => hub[t]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-slate-800">{hub.chapter}</h2>

      {!hasAny ? (
        <EmptyState title="Nothing here yet" desc="This chapter has no content." onBack={onBack} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {types.map(type => {
            const meta = CONTENT_META[type];
            const item = hub[type];
            const isGenerating = generating === type;

            return (
              <div
                key={type}
                className={`bg-white rounded-2xl overflow-hidden border shadow-sm flex flex-col ${item ? meta.border : 'border-dashed border-slate-200'}`}
              >
                <div className={`h-32 ${meta.tint} flex items-center justify-center relative overflow-hidden`}>
                  {item?.thumbnail_url ? (
                    <img
                      src={mediaUrl(item.thumbnail_url)}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <ImageIcon className={`w-8 h-8 ${meta.color} opacity-40`} />
                  )}
                  <div className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-white/90 ${meta.color}`}>
                    {meta.label}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight">{item?.title || meta.label}</h4>
                    <p className="text-xs text-slate-400 font-semibold">{meta.sub}</p>
                  </div>
                  <div className="flex-1" />
                  {item ? (
                    <button
                      onClick={() => onOpenProject(type, item.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      Open <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onGenerate(type)}
                      disabled={generating !== null}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-60"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Generate {meta.label}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState({ title, desc, onBack }) {
  return (
    <div
      className="col-span-full py-16 text-center rounded-2xl border-2 border-dashed border-emerald-200"
      style={{ background: 'linear-gradient(160deg, #ecfdf5 0%, #ffffff 60%)' }}
    >
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-8 h-8 text-emerald-600" />
      </div>
      <p className="text-slate-800 font-extrabold text-lg mb-1">{title}</p>
      <p className="text-slate-500 font-semibold text-sm mb-4 max-w-sm mx-auto">{desc}</p>
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-extrabold text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft className="w-4 h-4" /> Go back
        </button>
      )}
    </div>
  );
}
