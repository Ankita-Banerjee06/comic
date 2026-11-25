// ============================================================
// CREATIVE LEARNING — a top-level nav page where a teacher shares a
// link to material outside the normal syllabus (e.g. "Royal Bengal
// Tiger vs. Siberian Tiger", "Eurasian Red Squirrel overview") and
// students browse those links as a bento-style grid of image cards
// in a few different shapes/sizes, so the page itself feels like
// something worth exploring rather than a plain list.
//
// Content is created per classroom (same member_token + teacher-only
// pattern as Teaching Materials), but this page sits outside any one
// classroom's tabs — it aggregates across every classroom the signed-
// in user belongs to via GET /api/me/creative-learning, the same way
// Dashboard.jsx aggregates getMyClassrooms().
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { Palette, Plus, X, Loader2, Trash2, ExternalLink, Upload, Link as LinkIcon, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  getMyCreativeLearning,
  createCreativeLearningItem,
  deleteCreativeLearningItem,
  uploadClassroomMedia,
} from '../services/api';

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-black font-medium focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40 focus:border-fuchsia-500 transition-colors';

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-base font-bold text-black mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-sm text-black font-medium mt-1">{hint}</span>}
    </label>
  );
}

// Example topics shown only when nobody has added real content yet —
// gives teachers a concrete sense of what belongs here (material the
// syllabus doesn't cover) rather than an empty page with no context.
const EXAMPLE_TOPICS = [
  { title: 'Royal Bengal Tiger vs. Siberian Tiger', blurb: 'A side-by-side comparison of the two great tiger subspecies.', shape: 'wide', art: 'tiger' },
  { title: 'The Eurasian Red Squirrel', blurb: "An overview of one of Europe's most recognisable woodland animals.", shape: 'square', art: 'squirrel' },
  { title: 'How Volcanoes Shape Islands', blurb: 'A closer look at the islands volcanic activity builds over time.', shape: 'tall', art: 'volcano' },
  { title: 'The Science of Auroras', blurb: 'Why the night sky glows green and purple near the poles.', shape: 'circle', art: 'aurora' },
];

// Small, fully self-contained vector illustrations for the example
// cards — drawn inline as SVG rather than pulled from an external image
// host, so they always render (no network request that can fail, get
// blocked, or 404) and always match each topic at a glance.
function TigerArt({ className }) {
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="tigerSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#tigerSky)" />
      <path d="M0 40 Q40 20 80 40 T160 40" stroke="#431407" strokeWidth="10" fill="none" opacity="0.35" />
      <path d="M260 20 Q300 0 340 20 T400 15" stroke="#431407" strokeWidth="10" fill="none" opacity="0.35" />
      <path d="M0 210 Q60 190 120 210 T240 205" stroke="#431407" strokeWidth="10" fill="none" opacity="0.3" />
      {/* face */}
      <polygon points="150,55 185,20 195,70" fill="#431407" />
      <polygon points="250,55 215,20 205,70" fill="#431407" />
      <ellipse cx="200" cy="130" rx="95" ry="85" fill="#fb923c" stroke="#431407" strokeWidth="6" />
      <path d="M115 90 Q140 70 165 90" stroke="#431407" strokeWidth="9" fill="none" />
      <path d="M285 90 Q260 70 235 90" stroke="#431407" strokeWidth="9" fill="none" />
      <path d="M108 125 Q140 110 168 128" stroke="#431407" strokeWidth="9" fill="none" />
      <path d="M292 125 Q260 110 232 128" stroke="#431407" strokeWidth="9" fill="none" />
      <ellipse cx="200" cy="150" rx="55" ry="45" fill="#fff7ed" />
      <circle cx="165" cy="110" r="11" fill="#1c1917" />
      <circle cx="235" cy="110" r="11" fill="#1c1917" />
      <circle cx="168" cy="106" r="3" fill="#fff" />
      <circle cx="238" cy="106" r="3" fill="#fff" />
      <polygon points="190,150 210,150 200,165" fill="#1c1917" />
      <path d="M200 165 Q200 175 200 180" stroke="#1c1917" strokeWidth="4" />
      <path d="M160 175 Q180 185 198 180" stroke="#1c1917" strokeWidth="4" fill="none" />
      <path d="M240 175 Q220 185 202 180" stroke="#1c1917" strokeWidth="4" fill="none" />
    </svg>
  );
}

function SquirrelArt({ className }) {
  return (
    <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="squirrelBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill="url(#squirrelBg)" />
      <circle cx="80" cy="60" r="34" fill="#166534" opacity="0.4" />
      <circle cx="240" cy="230" r="46" fill="#166534" opacity="0.4" />
      {/* bushy tail */}
      <path d="M205 230 C150 230 140 130 190 90 C230 60 265 95 250 135 C238 165 200 160 205 195 C208 215 220 220 235 225 Z" fill="#c2410c" stroke="#7c2d12" strokeWidth="4" />
      <path d="M195 110 C210 140 200 175 215 195" stroke="#fed7aa" strokeWidth="6" fill="none" opacity="0.6" />
      {/* body */}
      <ellipse cx="130" cy="205" rx="55" ry="48" fill="#ea580c" stroke="#7c2d12" strokeWidth="4" />
      <ellipse cx="118" cy="218" rx="30" ry="24" fill="#fed7aa" />
      {/* head */}
      <circle cx="95" cy="140" r="38" fill="#ea580c" stroke="#7c2d12" strokeWidth="4" />
      <polygon points="70,112 62,80 90,105" fill="#ea580c" stroke="#7c2d12" strokeWidth="4" />
      <polygon points="112,108 128,78 122,112" fill="#ea580c" stroke="#7c2d12" strokeWidth="4" />
      <circle cx="84" cy="138" r="6" fill="#1c1917" />
      <circle cx="86" cy="136" r="2" fill="#fff" />
      <ellipse cx="68" cy="150" rx="12" ry="9" fill="#fed7aa" />
      <circle cx="62" cy="148" r="3" fill="#431407" />
    </svg>
  );
}

function VolcanoArt({ className }) {
  return (
    <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="volcanoSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="55%" stopColor="#be185d" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#volcanoSky)" />
      <circle cx="150" cy="130" r="95" fill="#fb923c" opacity="0.55" />
      <ellipse cx="90" cy="60" rx="45" ry="18" fill="#e5e7eb" opacity="0.5" />
      <ellipse cx="150" cy="40" rx="60" ry="20" fill="#e5e7eb" opacity="0.4" />
      <path d="M150 90 L95 95 Q130 60 150 40 Q170 60 205 95 Z" fill="#dc2626" />
      <polygon points="150,95 240,330 60,330" fill="#3f3f46" />
      <polygon points="150,95 185,170 115,170" fill="#ef4444" />
      <path d="M150 110 L120 220" stroke="#f97316" strokeWidth="7" opacity="0.85" />
      <path d="M150 110 L180 235" stroke="#f97316" strokeWidth="7" opacity="0.85" />
      <path d="M150 110 L150 260" stroke="#fbbf24" strokeWidth="6" opacity="0.8" />
      <rect y="330" width="300" height="70" fill="#0ea5e9" />
      <path d="M0 335 Q20 328 40 335 T80 335 T120 335 T160 335 T200 335 T240 335 T280 335" stroke="#bae6fd" strokeWidth="4" fill="none" opacity="0.7" />
      <ellipse cx="235" cy="350" rx="32" ry="12" fill="#3f3f46" />
      <ellipse cx="235" cy="344" rx="14" ry="10" fill="#22c55e" />
    </svg>
  );
}

function AuroraArt({ className }) {
  return (
    <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="auroraSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
        <linearGradient id="auroraBand1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
          <stop offset="50%" stopColor="#34d399" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="auroraBand2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0" />
          <stop offset="50%" stopColor="#f472b6" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#auroraSky)" />
      <circle cx="40" cy="35" r="1.6" fill="#fff" opacity="0.9" />
      <circle cx="150" cy="25" r="1.3" fill="#fff" opacity="0.8" />
      <circle cx="170" cy="60" r="1.8" fill="#fff" opacity="0.9" />
      <circle cx="60" cy="20" r="1.2" fill="#fff" opacity="0.7" />
      <circle cx="120" cy="45" r="1.1" fill="#fff" opacity="0.6" />
      <path d="M0 70 Q50 40 100 65 T200 55" stroke="url(#auroraBand1)" strokeWidth="22" fill="none" />
      <path d="M0 95 Q60 130 110 95 T200 100" stroke="url(#auroraBand2)" strokeWidth="18" fill="none" />
      <path d="M0 150 Q50 135 100 150 T200 145 L200 200 L0 200 Z" fill="#1e1b4b" opacity="0.9" />
    </svg>
  );
}

const EXAMPLE_ART = { tiger: TigerArt, squirrel: SquirrelArt, volcano: VolcanoArt, aurora: AuroraArt };

const SHAPE_OPTIONS = [
  { value: 'square', label: 'Square' },
  { value: 'wide', label: 'Wide' },
  { value: 'tall', label: 'Tall' },
  { value: 'circle', label: 'Circle' },
];

// Grid placement + image treatment per shape — this is what makes the
// page read as "boxes of different shapes and sizes" instead of a
// uniform list.
const SHAPE_CELL = {
  square: 'col-span-1 row-span-1',
  wide: 'col-span-2 row-span-1',
  tall: 'col-span-1 row-span-2',
  circle: 'col-span-1 row-span-1',
};

// A fixed 190px row height for the bento grid used to be set with the
// Tailwind arbitrary-value class `auto-rows-[190px]`, but that class
// silently failed to generate in this build — grid rows then auto-sized
// to content, and since every non-circle card positions its text with
// `absolute inset-0` (zero intrinsic height), their cells collapsed to
// almost nothing. Setting it as a plain inline style sidesteps that —
// it can't be dropped by any build-time class scan. ROW_H is also used
// below as a per-card minHeight safety net.
const ROW_H = 190;
const ROW_GAP = 20; // matches gap-5

// Each card shape gets its own vivid color identity instead of one
// muted fuchsia tone reused everywhere, so the grid reads as colourful
// even before any real images are added.
const COLOR_BY_SHAPE = {
  square: { grad: 'from-amber-300 via-orange-400 to-rose-400', icon: 'text-white', ring: 'ring-amber-200', chipBg: 'bg-amber-50', chipText: 'text-amber-700', dash: 'border-amber-300', soft: 'from-amber-100 to-orange-100' },
  wide: { grad: 'from-sky-400 via-blue-500 to-indigo-500', icon: 'text-white', ring: 'ring-sky-200', chipBg: 'bg-sky-50', chipText: 'text-sky-700', dash: 'border-sky-300', soft: 'from-sky-100 to-indigo-100' },
  tall: { grad: 'from-emerald-400 via-teal-500 to-cyan-500', icon: 'text-white', ring: 'ring-emerald-200', chipBg: 'bg-emerald-50', chipText: 'text-emerald-700', dash: 'border-emerald-300', soft: 'from-emerald-100 to-teal-100' },
  circle: { grad: 'from-fuchsia-400 via-pink-500 to-rose-400', icon: 'text-white', ring: 'ring-fuchsia-200', chipBg: 'bg-fuchsia-50', chipText: 'text-fuchsia-700', dash: 'border-fuchsia-300', soft: 'from-fuchsia-100 to-pink-100' },
};

function TopicImage({ shape, imageUrl, title }) {
  const commonImgClass = 'w-full h-full object-cover';
  const colors = COLOR_BY_SHAPE[shape] || COLOR_BY_SHAPE.square;

  if (shape === 'circle') {
    return (
      <div className="flex-1 flex items-center justify-center pt-5">
        <div className={`w-24 h-24 rounded-full overflow-hidden ring-4 ${colors.ring} bg-gradient-to-br ${colors.grad} flex items-center justify-center shrink-0`}>
          {imageUrl ? (
            <img src={imageUrl} alt={title} className={commonImgClass} />
          ) : (
            <Sparkles className={`w-8 h-8 ${colors.icon}`} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {imageUrl ? (
        <img src={imageUrl} alt={title} className={commonImgClass} />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${colors.grad} flex items-center justify-center`}>
          <Sparkles className="w-8 h-8 text-white drop-shadow" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
    </div>
  );
}

function CreativeLearningCard({ item, canManage, onDelete }) {
  const shape = SHAPE_OPTIONS.some((s) => s.value === item.card_shape) ? item.card_shape : 'square';
  const isCircle = shape === 'circle';

  const openLink = () => window.open(item.url, '_blank', 'noopener,noreferrer');
  // Belt-and-suspenders: the grid container also sets an explicit row
  // height via inline style, but giving each card its own minHeight too
  // means it still renders at a sane size even if the grid's sizing is
  // ever overridden somewhere else.
  const minHeight = shape === 'tall' ? ROW_H * 2 + ROW_GAP : ROW_H;

  return (
    <div
      className={`group relative rounded-2xl border border-slate-200 shadow-sm overflow-hidden cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-lg ${SHAPE_CELL[shape]} ${isCircle ? 'bg-white flex flex-col' : 'bg-slate-900'}`}
      style={{ minHeight }}
      onClick={openLink}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') openLink(); }}
    >
      <TopicImage shape={shape} imageUrl={item.image_url} title={item.title} />

      <div className={isCircle ? 'px-4 pb-4 pt-3 text-center' : 'absolute inset-x-0 bottom-0 p-4'}>
        {item.classroom_name && (
          <span className={`inline-block text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-1.5 ${isCircle ? 'bg-fuchsia-50 text-fuchsia-700' : 'bg-white/20 text-white'}`}>
            {item.classroom_name}
          </span>
        )}
        <h3 className={`font-extrabold leading-snug ${isCircle ? 'text-black text-base' : 'text-white text-lg'}`}>
          {item.title}
        </h3>
        {item.blurb && (
          <p className={`text-sm font-medium mt-1 line-clamp-2 ${isCircle ? 'text-slate-600' : 'text-white/85'}`}>
            {item.blurb}
          </p>
        )}
        <span className={`inline-flex items-center gap-1 text-xs font-bold mt-2 ${isCircle ? 'text-fuchsia-700' : 'text-white/90'}`}>
          <ExternalLink className="w-3 h-3" /> Open link
        </span>
      </div>

      {canManage && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(item); }}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function AddCreativeLearningForm({ teacherClassrooms, onClose, onSaved }) {
  const { t } = useLanguage();
  const [classCode, setClassCode] = useState(teacherClassrooms[0]?.class_code || '');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [blurb, setBlurb] = useState('');
  const [shape, setShape] = useState('square');
  const [imageMediaId, setImageMediaId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const selectedClassroom = teacherClassrooms.find((c) => c.class_code === classCode);

  const handleImage = async (file) => {
    if (!selectedClassroom) return;
    setUploading(true);
    setError(null);
    try {
      const res = await uploadClassroomMedia(classCode, { memberToken: selectedClassroom.member_token, file });
      setImageMediaId(res.media_asset_id);
      setImagePreview(res.url);
    } catch (err) {
      setError(err?.message || t('Image upload failed.'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassroom) {
      setError(t('Choose a class first.'));
      return;
    }
    if (!title.trim()) {
      setError(t('Title is required.'));
      return;
    }
    if (!/^https?:\/\//i.test(url.trim())) {
      setError(t('Link must start with http:// or https://'));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createCreativeLearningItem(classCode, {
        memberToken: selectedClassroom.member_token,
        title: title.trim(),
        url: url.trim(),
        blurb: blurb.trim(),
        imageMediaId,
        cardShape: shape,
      });
      onSaved();
    } catch (err) {
      setError(err?.message || t('Failed to save that link.'));
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
          <h2 className="font-extrabold text-xl text-black flex items-center gap-2">
            <Palette className="w-5 h-5 text-fuchsia-600" /> {t('Add Creative Learning link')}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <Field label={t('Class')}>
            <select className={inputClass} value={classCode} onChange={(e) => setClassCode(e.target.value)}>
              {teacherClassrooms.map((c) => (
                <option key={c.class_code} value={c.class_code}>{c.classroom_name}</option>
              ))}
            </select>
          </Field>

          <Field label={t('Title')}>
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder={t('e.g. Royal Bengal Tiger vs. Siberian Tiger')} />
          </Field>

          <Field label={t('Link')} hint={t('Where this topic actually lives — an article, video, or page.')}>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input className={`${inputClass} pl-9`} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </div>
          </Field>

          <Field label={t('Short blurb')}>
            <textarea className={`${inputClass} resize-none`} rows={2} value={blurb} onChange={(e) => setBlurb(e.target.value)} placeholder={t('One line that makes students curious.')} />
          </Field>

          <Field label={t('Card shape')}>
            <div className="flex gap-2 flex-wrap">
              {SHAPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setShape(opt.value)}
                  className={`px-3 py-2 rounded-xl border-2 font-bold text-sm transition-colors ${
                    shape === opt.value ? 'bg-fuchsia-600 border-fuchsia-600 text-white' : 'border-slate-200 text-black hover:bg-slate-50'
                  }`}
                >
                  {t(opt.label)}
                </button>
              ))}
            </div>
          </Field>

          <Field label={t('Cover image (optional)')}>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 text-base font-bold text-black hover:bg-slate-50 cursor-pointer transition-colors">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? t('Uploading…') : t('Upload an image')}
              <input type="file" accept="image/*" className="hidden" disabled={uploading || !selectedClassroom} onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])} />
            </label>
            {imagePreview && (
              <img src={imagePreview} alt="" className="w-20 h-20 object-cover rounded-xl mt-3 border border-slate-200" />
            )}
          </Field>

          {error && <p className="text-base font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={submitting || !selectedClassroom}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {submitting ? t('Saving…') : t('Add to Creative Learning')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CreativeLearning() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(() => {
    setError(null);
    getMyCreativeLearning()
      .then((res) => setData(res.classrooms || []))
      .catch((err) => setError(err?.message || t('Unable to load Creative Learning.')));
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const teacherClassrooms = (data || []).filter((c) => c.role === 'teacher');

  const allItems = (data || []).flatMap((c) =>
    (c.items || []).map((item) => ({
      ...item,
      classroom_name: c.classroom_name,
      class_code: c.class_code,
      member_token: c.member_token,
      canManage: c.role === 'teacher',
    }))
  );

  const handleDelete = async (item) => {
    if (!window.confirm(t('Remove this from Creative Learning?'))) return;
    try {
      await deleteCreativeLearningItem(item.class_code, item.id, item.member_token);
      load();
    } catch (err) {
      setError(err?.message || t('Failed to delete.'));
    }
  };

  return (
    <div className="py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-[95%] max-w-[100rem] mx-auto">

      {/* Banner */}
      <img
        src="/vlq-creative-learning-banner.webp"
        alt="Creative Learning — spark your creative talent"
        className="w-full h-auto rounded-2xl shadow-md"
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-base font-bold uppercase tracking-widest mb-5"
          style={{ background: '#fdf2fb', color: '#000000', border: '1px solid #f5d0f0' }}
        >
          <Palette className="w-4 h-4" /> {t('Creative Learning')}
        </div>
        <h1 className="font-extrabold leading-snug text-black" style={{ fontSize: 'clamp(28px,4vw,46px)' }}>
          {t('Beyond the syllabus.')}
        </h1>
        <p className="mt-3 text-xl font-bold text-black">
          {t("Your teacher picks a topic worth exploring, hands you the link, and you take it from there.")}
        </p>
      </div>

      {error && <p className="text-base font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 max-w-3xl mx-auto">{error}</p>}

      {teacherClassrooms.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-fuchsia-600 hover:bg-fuchsia-700 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" /> {t('Add Creative Learning link')}
          </button>
        </div>
      )}

      {!error && data === null && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-black animate-spin" />
        </div>
      )}

      {!error && data !== null && allItems.length === 0 && (
        <div className="space-y-5">
          <p className="text-center text-base font-semibold text-slate-500">
            {t('Nothing shared yet — here’s the kind of thing that belongs here:')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5" style={{ gridAutoFlow: 'dense', gridAutoRows: ROW_H }}>
            {EXAMPLE_TOPICS.map((ex) => {
              const colors = COLOR_BY_SHAPE[ex.shape] || COLOR_BY_SHAPE.square;
              const minHeight = ex.shape === 'tall' ? ROW_H * 2 + ROW_GAP : ROW_H;
              const Art = EXAMPLE_ART[ex.art];
              return (
                <div
                  key={ex.title}
                  className={`relative rounded-2xl border-2 border-dashed ${colors.dash} overflow-hidden ${SHAPE_CELL[ex.shape]} ${ex.shape === 'circle' ? 'bg-white flex flex-col items-center justify-center text-center p-4' : 'bg-slate-900'}`}
                  style={{ minHeight }}
                >
                  {ex.shape === 'circle' ? (
                    <>
                      <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center mb-2 shadow-sm">
                        {Art ? <Art className="w-full h-full" /> : <Sparkles className="w-6 h-6 text-fuchsia-500" />}
                      </div>
                      <p className="font-bold text-black text-sm">{ex.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{ex.blurb}</p>
                    </>
                  ) : (
                    <>
                      {Art && <Art className="absolute inset-0 w-full h-full" />}
                      <div className="absolute inset-0 p-4 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/15 to-transparent">
                        <p className="font-extrabold text-white text-base leading-snug drop-shadow">{ex.title}</p>
                        <p className="text-sm text-white/90 mt-1 line-clamp-2 drop-shadow">{ex.blurb}</p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!error && allItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5" style={{ gridAutoFlow: 'dense', gridAutoRows: ROW_H }}>
          {allItems.map((item) => (
            <CreativeLearningCard key={item.id} item={item} canManage={item.canManage} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showForm && (
        <AddCreativeLearningForm
          teacherClassrooms={teacherClassrooms}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}
