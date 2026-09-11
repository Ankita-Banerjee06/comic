import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  CheckCircle2,
  Target,
  Flame,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Table2,
} from 'lucide-react';

// ============================================================
// ANALYTICS — a progress dashboard built on mock data. Real
// numbers will come once quiz results / activity are wired to an
// endpoint; the shape (stat tiles, score trend, time by category,
// topic strengths, weekly activity) is ready to receive it.
// Charts are hand-built inline SVG/CSS (no charting library is
// installed yet) and follow the site's existing brand colors.
// ============================================================

const STAT_TILES = [
  { label: 'Quizzes Taken', value: '47', delta: '+8 this month', deltaUp: true, icon: CheckCircle2, color: '#2563eb', tint: '#eff6ff' },
  { label: 'Average Score', value: '81%', delta: '+6% vs last month', deltaUp: true, icon: Target, color: '#0d9488', tint: '#f0fdfa' },
  { label: 'Study Streak', value: '12 days', delta: 'Personal best', deltaUp: true, icon: Flame, color: '#d97706', tint: '#fffbeb' },
  { label: 'Time This Week', value: '6.4 hrs', delta: '-1.2 hrs vs last week', deltaUp: false, icon: Clock, color: '#7c3aed', tint: '#f5f3ff' },
];

const SCORE_TREND = [
  { label: 'Wk 1', value: 62 },
  { label: 'Wk 2', value: 68 },
  { label: 'Wk 3', value: 65 },
  { label: 'Wk 4', value: 74 },
  { label: 'Wk 5', value: 78 },
  { label: 'Wk 6', value: 81 },
  { label: 'Wk 7', value: 79 },
  { label: 'Wk 8', value: 86 },
];

const CATEGORY_TIME = [
  { key: 'amivi', label: 'AMIVI', hours: 4.2, color: '#2563eb' },
  { key: 'amico', label: 'AMICO', hours: 3.1, color: '#db2777' },
  { key: 'quizzes', label: 'Quizzes', hours: 5.6, color: '#0d9488' },
  { key: 'library', label: 'Library', hours: 1.8, color: '#4f46e5' },
  { key: 'collab', label: 'Collab', hours: 2.4, color: '#7c3aed' },
  { key: 'homework', label: 'Homework', hours: 3.9, color: '#d97706' },
];

const TOPIC_STRENGTHS = [
  { topic: 'Photosynthesis', score: 92, status: 'good' },
  { topic: 'Algebra Basics', score: 84, status: 'good' },
  { topic: 'Grammar Rules', score: 79, status: 'warning' },
  { topic: 'World War II', score: 71, status: 'warning' },
  { topic: 'Chemical Bonding', score: 58, status: 'critical' },
];

const STATUS_STYLE = {
  good: { icon: CheckCircle2, color: '#0ca30c', label: 'Strong', bar: '#0ca30c' },
  warning: { icon: AlertTriangle, color: '#b45309', label: 'Needs practice', bar: '#d97706' },
  critical: { icon: AlertCircle, color: '#dc2626', label: 'Focus area', bar: '#dc2626' },
};

const WEEKLY_ACTIVITY = [
  { day: 'Mon', minutes: 35 },
  { day: 'Tue', minutes: 70 },
  { day: 'Wed', minutes: 15 },
  { day: 'Thu', minutes: 55 },
  { day: 'Fri', minutes: 80 },
  { day: 'Sat', minutes: 0 },
  { day: 'Sun', minutes: 40 },
];

const ACTIVITY_STEPS = ['#eef2ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#4f46e5'];
function activityStep(minutes) {
  if (minutes === 0) return 0;
  if (minutes < 20) return 1;
  if (minutes < 45) return 2;
  if (minutes < 65) return 3;
  return 4;
}

// --- Score trend line chart (inline SVG) ---
const CHART_W = 640;
const CHART_H = 220;
const PAD = { top: 16, right: 12, bottom: 28, left: 30 };
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;

function scoreToY(value) {
  return PAD.top + INNER_H - (value / 100) * INNER_H;
}

const SCORE_POINTS = SCORE_TREND.map((d, i) => ({
  ...d,
  x: PAD.left + (i / (SCORE_TREND.length - 1)) * INNER_W,
  y: scoreToY(d.value),
}));

const LINE_PATH = SCORE_POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
const AREA_PATH = `${LINE_PATH} L ${SCORE_POINTS[SCORE_POINTS.length - 1].x.toFixed(1)} ${(PAD.top + INNER_H).toFixed(1)} L ${SCORE_POINTS[0].x.toFixed(1)} ${(PAD.top + INNER_H).toFixed(1)} Z`;

function ScoreTrendChart() {
  const [hoverIdx, setHoverIdx] = useState(null);
  const hovered = hoverIdx !== null ? SCORE_POINTS[hoverIdx] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full h-auto block" role="img" aria-label="Average quiz score by week, trending from 62% to 86%">
        {[0, 50, 100].map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={CHART_W - PAD.right}
              y1={scoreToY(tick)}
              y2={scoreToY(tick)}
              stroke="#e1e0d9"
              strokeWidth="1"
            />
            <text x={PAD.left - 8} y={scoreToY(tick) + 3} textAnchor="end" fontSize="10" fill="#898781" fontWeight="600">
              {tick}
            </text>
          </g>
        ))}

        <path d={AREA_PATH} fill="#2563eb" opacity="0.08" />
        <path d={LINE_PATH} fill="none" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {SCORE_POINTS.map((p, i) => (
          <g key={p.label}>
            <circle
              cx={p.x}
              cy={p.y}
              r="12"
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{ cursor: 'pointer' }}
            />
            <circle
              cx={p.x}
              cy={p.y}
              r={i === SCORE_POINTS.length - 1 ? 5 : 4}
              fill="#2563eb"
              stroke="#fff"
              strokeWidth="2"
              pointerEvents="none"
            />
          </g>
        ))}

        <text
          x={SCORE_POINTS[SCORE_POINTS.length - 1].x}
          y={SCORE_POINTS[SCORE_POINTS.length - 1].y - 12}
          textAnchor="end"
          fontSize="12"
          fontWeight="800"
          fill="#0b0b0b"
        >
          {SCORE_TREND[SCORE_TREND.length - 1].value}%
        </text>

        {SCORE_POINTS.map((p) => (
          <text key={`x-${p.label}`} x={p.x} y={CHART_H - 6} textAnchor="middle" fontSize="10" fontWeight="600" fill="#898781">
            {p.label}
          </text>
        ))}
      </svg>

      {hovered && (
        <div
          className="absolute pointer-events-none bg-slate-900 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 shadow-lg whitespace-nowrap"
          style={{
            left: `${(hovered.x / CHART_W) * 100}%`,
            top: `${(hovered.y / CHART_H) * 100}%`,
            transform: 'translate(-50%, -140%)',
          }}
        >
          {hovered.label}: {hovered.value}%
        </div>
      )}
    </div>
  );
}

function CategoryTimeChart() {
  const maxHours = Math.max(...CATEGORY_TIME.map((c) => c.hours));
  return (
    <div className="flex items-end justify-between gap-3 h-44 pt-6">
      {CATEGORY_TIME.map((c) => (
        <div key={c.key} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
          <span className="text-xs font-bold text-slate-600">{c.hours}h</span>
          <div
            className="w-full max-w-[28px] rounded-t-md transition-all hover:opacity-80"
            style={{ height: `${(c.hours / maxHours) * 100}%`, background: c.color, minHeight: 4 }}
          />
          <span className="text-[11px] font-bold text-slate-500 text-center leading-tight">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 max-w-5xl mx-auto items-center">
        <div className="text-center lg:text-left">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ background: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff' }}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Analytics
          </div>
          <h1 className="font-extrabold leading-tight text-slate-900" style={{ fontSize: 'clamp(28px,3.4vw,42px)' }}>
            Track Your Progress
          </h1>
          <p className="mt-3 text-lg font-semibold text-slate-600">
            A clear look at how you're learning — scores over time, where your hours go, and what to
            focus on next.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden">
          <img
            src="/vlq-analytics-hero.jpg"
            alt="A student learning with VLQ — small steps, big progress"
            className="w-full h-auto block"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {STAT_TILES.map((tile) => {
          const Icon = tile.icon;
          const DeltaIcon = tile.deltaUp ? TrendingUp : TrendingDown;
          return (
            <div key={tile.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: tile.tint }}>
                <Icon className="w-5 h-5" style={{ color: tile.color }} />
              </div>
              <p className="text-2xl font-extrabold text-slate-900 leading-none mb-1.5">{tile.value}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{tile.label}</p>
              <span
                className="inline-flex items-center gap-1 text-xs font-bold"
                style={{ color: tile.deltaUp ? '#0ca30c' : '#dc2626' }}
              >
                <DeltaIcon className="w-3.5 h-3.5" /> {tile.delta}
              </span>
            </div>
          );
        })}
      </div>

      {/* Score trend + category time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto items-start">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-extrabold text-slate-900 mb-0.5">Score Over Time</h2>
          <p className="text-sm font-medium text-slate-500 mb-4">Average quiz score, last 8 weeks</p>
          <ScoreTrendChart />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-extrabold text-slate-900 mb-0.5">Time by Category</h2>
          <p className="text-sm font-medium text-slate-500 mb-1">Hours spent this month</p>
          <CategoryTimeChart />
        </div>
      </div>

      <div className="max-w-5xl mx-auto -mt-4">
        <button
          onClick={() => setShowTable((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
        >
          <Table2 className="w-3.5 h-3.5" /> {showTable ? 'Hide data table' : 'View as table'}
        </button>
        {showTable && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <table className="w-full text-sm bg-white rounded-xl border border-slate-200 overflow-hidden">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
                <tr><th className="text-left px-3 py-2">Week</th><th className="text-right px-3 py-2">Score</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SCORE_TREND.map((d) => (
                  <tr key={d.label}><td className="px-3 py-1.5 font-medium text-slate-700">{d.label}</td><td className="px-3 py-1.5 text-right font-bold text-slate-800">{d.value}%</td></tr>
                ))}
              </tbody>
            </table>
            <table className="w-full text-sm bg-white rounded-xl border border-slate-200 overflow-hidden">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
                <tr><th className="text-left px-3 py-2">Category</th><th className="text-right px-3 py-2">Hours</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CATEGORY_TIME.map((c) => (
                  <tr key={c.key}><td className="px-3 py-1.5 font-medium text-slate-700">{c.label}</td><td className="px-3 py-1.5 text-right font-bold text-slate-800">{c.hours}h</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Topic strengths + weekly activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto items-start">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-extrabold text-slate-900 mb-0.5">Topic Strengths</h2>
          <p className="text-sm font-medium text-slate-500 mb-4">Where you're doing well, and what needs another pass</p>
          <div className="space-y-4">
            {TOPIC_STRENGTHS.map((t) => {
              const s = STATUS_STYLE[t.status];
              const StatusIcon = s.icon;
              return (
                <div key={t.topic}>
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <span className="text-sm font-bold text-slate-800">{t.topic}</span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold flex-shrink-0" style={{ color: s.color }}>
                      <StatusIcon className="w-3.5 h-3.5" /> {t.score}% · {s.label}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${t.score}%`, background: s.bar }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="font-extrabold text-slate-900 mb-0.5">This Week's Activity</h2>
          <p className="text-sm font-medium text-slate-500 mb-5">Minutes spent learning each day</p>
          <div className="flex items-end justify-between gap-2">
            {WEEKLY_ACTIVITY.map((d) => {
              const step = activityStep(d.minutes);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div
                    className="w-full aspect-square rounded-lg border border-slate-100"
                    style={{ background: ACTIVITY_STEPS[step] }}
                    title={`${d.day}: ${d.minutes} min`}
                  />
                  <span className="text-[11px] font-bold text-slate-500">{d.day}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-4">
            <span className="text-[11px] font-medium text-slate-400">Less</span>
            {ACTIVITY_STEPS.map((c) => (
              <span key={c} className="w-3 h-3 rounded-sm border border-slate-100" style={{ background: c }} />
            ))}
            <span className="text-[11px] font-medium text-slate-400">More</span>
          </div>
        </div>
      </div>

      {/* CTA banner */}
      <div
        className="max-w-5xl mx-auto rounded-2xl p-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-white"
        style={{ background: 'linear-gradient(120deg,#4338ca 0%,#a21caf 60%,#db2777 100%)' }}
      >
        <div>
          <h2 className="font-extrabold text-2xl md:text-3xl mb-2">Ready to raise that average?</h2>
          <p className="font-medium text-white/80">Retake a quiz you missed, or start a new topic in AMIVI.</p>
        </div>
        <Link
          to="/quiz"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold hover:-translate-y-0.5 hover:shadow-lg transition-all whitespace-nowrap flex-shrink-0"
        >
          Go to Quizzes <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
