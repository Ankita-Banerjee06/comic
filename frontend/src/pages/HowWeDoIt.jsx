import { Link } from 'react-router-dom';
import {
  Settings,
  Sparkles,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  ArrowRight,
  GraduationCap,
  Lightbulb,
} from 'lucide-react';

// ============================================================
// HOW WE DO IT — "How VLQ Works": the designed 5-panel process
// graphic showing the pipeline a piece of learning material goes
// through inside VLQ, followed by "6 Ways VLQ Delivers" — real
// photo cards for who VLQ serves and how.
// ============================================================

const WAYS = [
  {
    n: 1,
    label: 'Knowledge Base',
    desc: 'Essential visual learning for career growth.',
    image: '/vlq-way-knowledge-base.png',
    icon: GraduationCap,
    color: '#2563eb',
    tint: '#eff6ff',
    to: '/explore',
  },
  {
    n: 2,
    label: 'Teacher Platform',
    desc: 'Teach, assess and track every learner.',
    image: '/vlq-way-teacher-platform.png',
    icon: BarChart3,
    color: '#7c3aed',
    tint: '#f5f3ff',
    to: '/dashboard',
  },
  {
    n: 3,
    label: 'Global Workforce',
    desc: 'Certify skills for opportunities worldwide.',
    image: '/vlq-way-global-workforce.png',
    icon: TrendingUp,
    color: '#0891b2',
    tint: '#ecfeff',
    to: '/plans',
  },
  {
    n: 4,
    label: 'Blue to White Collar Aspirants',
    desc: 'Build skills. Earn credentials. Advance careers.',
    image: '/vlq-way-blue-to-white-collar.png',
    icon: TrendingUp,
    color: '#ea580c',
    tint: '#fff7ed',
    to: '/courses',
  },
  {
    n: 5,
    label: 'VLQ Quizzes',
    desc: 'Master essential knowledge through active recall.',
    image: '/vlq-way-quizzes.png',
    icon: CheckCircle2,
    color: '#db2777',
    tint: '#fdf2f8',
    to: '/quiz',
  },
  {
    n: 6,
    label: 'Family Learning',
    desc: 'Meaningful learning and play for every age.',
    image: '/vlq-way-family-learning.png',
    icon: Sparkles,
    color: '#16a34a',
    tint: '#f0fdf4',
    to: '/collaborative',
  },
];

export default function HowWeDoIt() {
  return (
    <div className="py-10 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 w-[95%] max-w-[100rem] mx-auto">

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-5"
          style={{ background: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff' }}
        >
          <Settings className="w-4 h-4" /> The Process
        </div>
        <h1 className="font-extrabold leading-tight text-black" style={{ fontSize: 'clamp(32px,4vw,48px)' }}>
          How VLQ Works
        </h1>
        <p className="mt-3 text-xl font-bold text-black">
          From learning material to lasting mastery — discover the journey behind every VLQ experience.
        </p>
      </div>

      {/* ======================================================
          HOW VLQ WORKS — designed 5-panel process graphic
      ======================================================= */}

      <div className="w-full max-w-[85rem] mx-auto rounded-[2.5rem] p-4 sm:p-8 md:p-12 shadow-xl" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 50%, #fce7f3 100%)' }}>
        <div className="w-full max-w-6xl mx-auto">
          <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/50">
            <img
              src="/vlq-how-we-do-it-graphic-v2.jpg"
              alt="THE VLQ PLATFORM: AMIVI, AMICO, Essential Learning, and Mastery"
              className="w-full h-auto block"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </div>
      </div>

      {/* ======================================================
          6 WAYS VLQ DELIVERS
      ======================================================= */}

      <div className="w-full">

        <div className="text-center max-w-3xl mx-auto mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-5"
            style={{ background: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff' }}
          >
            <Sparkles className="w-4 h-4" /> The Result
          </div>
          <h2 className="font-extrabold text-3xl md:text-4xl text-black mb-2">6 Ways VLQ Delivers</h2>
          <p className="text-xl font-bold text-black">
            A smarter, faster, and more engaging way to learn — for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {WAYS.map((way) => (
            <Link
              key={way.n}
              to={way.to}
              className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <img
                src={way.image}
                alt={`${way.label}: ${way.desc}`}
                className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-300"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </Link>
          ))}
        </div>

      </div>

      {/* CTA banner */}
      <div
        className="w-full rounded-2xl p-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-white"
        style={{ background: 'linear-gradient(120deg,#4338ca 0%,#a21caf 60%,#db2777 100%)' }}
      >
        <div>
          <h2 className="font-extrabold text-3xl md:text-4xl mb-2">Ready to put it to work?</h2>
          <p className="font-bold text-lg text-white/90">Start with any topic and watch VLQ take it from there.</p>
        </div>
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold text-lg hover:-translate-y-0.5 hover:shadow-lg transition-all whitespace-nowrap"
          >
            Explore VLQ <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="hidden sm:flex items-center -space-x-2">
            <GraduationCap className="w-10 h-10 text-white/90" />
            <Lightbulb className="w-8 h-8 text-yellow-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
