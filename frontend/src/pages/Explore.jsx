import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Eye,
  ArrowRight,
} from 'lucide-react';

// ============================================================
// EXPLORE — a browsable overview of every VLQ learning category.
// The Learning Resources and Additional Categories zones were
// folded into the VIEW dropdown below (same treatment the
// Quizzes zone got earlier) — everything saved/creatable now
// routes through one simplified VIEW navigator instead of four
// separate zones. No new backend feature — every destination
// already existed as its own zone/dropdown before this merge.
// ============================================================

const FIVE_STEPS = [
  { n: 1, title: 'See It', desc: 'Quick visuals grab your attention and spark curiosity.', image: '/vlq-step-see.jpg' },
  { n: 2, title: 'Understand It', desc: 'Clear visuals simplify complex ideas in seconds.', image: '/vlq-step-understand.jpg' },
  { n: 3, title: 'Remember It', desc: 'Visual patterns lock in knowledge for the long term.', image: '/vlq-step-remember.jpg' },
  { n: 4, title: 'Apply It', desc: 'Use what you learn with confidence in real life.', image: '/vlq-step-apply.jpg' },
  { n: 5, title: 'Master It', desc: 'Reinforce, revisit, and level up every day.', image: '/vlq-step-master.jpg' },
];

function ZoneHeader({ icon: Icon, iconColor, iconTint, title, subtitle, tagline, dark = false }) {
  const textColor = dark ? 'text-white' : 'text-black';
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconTint }}>
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>
        <div>
          <h2 className={`font-extrabold text-3xl leading-tight ${textColor}`}>{title}</h2>
          <p className={`text-lg font-semibold mt-1 ${textColor}`}>{subtitle}</p>
        </div>
      </div>
      <span className={`hidden sm:inline-flex items-center gap-1 text-base font-bold flex-shrink-0 mt-2 ${textColor}`}>
        {tagline} <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </div>
  );
}

export default function Explore() {
  const navigate = useNavigate();
  const [viewChoice, setViewChoice] = useState('');

  const handleViewChoice = (e) => {
    const to = e.target.value;
    setViewChoice(to);
    if (to) navigate(to);
  };

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-black mb-4">
          Explore
        </h1>
        <p className="text-2xl font-semibold text-black">
          Discover the VLQ learning journey — from visual understanding to lasting mastery.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {FIVE_STEPS.map((step) => (
          <div key={step.n} className="rounded-2xl overflow-hidden shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all aspect-square">
            <img
              src={step.image}
              alt={`Step ${step.n}: ${step.title} — ${step.desc}`}
              className="w-full h-full object-cover block"
              style={{ objectPosition: 'left center' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        ))}
      </div>

      <div className="space-y-6">

        {/* THE VLQ ENGINES */}
        <div className="rounded-xl p-6 md:p-9" style={{ background: 'linear-gradient(135deg,#eff6ff,#f0f9ff)' }}>
          <ZoneHeader
            icon={Box} iconColor="#1d4ed8" iconTint="#dbeafe"
            title="THE VLQ ENGINES" subtitle="Explore our AI-powered learning ecosystems."
            tagline="Two powerful ways to learn and grow"
          />
          <div className="grid grid-cols-1 gap-8 mt-6">
            <Link
              to="/amivi"
              className="group bg-white rounded-xl overflow-hidden shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all border border-slate-100"
            >
              <div className="aspect-[2171/724] bg-blue-50 overflow-hidden relative">
                <img
                  src="/vlq-amivi-overview.png"
                  alt="AMIVI"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="p-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-md font-bold text-sm mb-3 uppercase tracking-wider">AMIVI</div>
                <h3 className="font-black text-2xl sm:text-3xl text-black mb-2">Turn Complexity into Clarity.</h3>
                <p className="text-lg font-semibold text-black mb-6">Transforms complex information into clear, memorable visual learning.</p>
                <span className="inline-flex items-center gap-1.5 px-5 py-3 bg-blue-600 text-white rounded-xl text-lg font-bold group-hover:bg-blue-700 transition-colors">
                  Explore AMIVI <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </Link>

            <Link
              to="/amico"
              className="group bg-white rounded-xl overflow-hidden shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all border border-slate-100"
            >
              <div className="aspect-[2172/724] bg-purple-50 overflow-hidden relative">
                <img
                  src="/vlq-amico-overview.png"
                  alt="AMICO"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="p-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-md font-bold text-sm mb-3 uppercase tracking-wider">AMICO</div>
                <h3 className="font-black text-2xl sm:text-3xl text-black mb-2">Turn Learning into Creativity.</h3>
                <p className="text-lg font-semibold text-black mb-6">Transforms learning into visual stories learners create, explore and remember.</p>
                <span className="inline-flex items-center gap-1.5 px-5 py-3 bg-purple-600 text-white rounded-xl text-lg font-bold group-hover:bg-purple-700 transition-colors">
                  Explore AMICO <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* View — the single navigator for everything saved,
            created or offered across VLQ: the Digital Library,
            Collaborative Learning, Homework, Quizzes, Gamification
            and Analytics. Learning Resources and Additional
            Categories were removed as separate zones and folded in
            here (same treatment the Quizzes zone got earlier).
            Restyled to match the other zones — tinted background +
            the same ZoneHeader (icon, title, subtitle, tagline) —
            instead of a bold solid-colour block, so it reads as one
            of the same family of sections instead of a disconnected
            banner. No new backend feature — every option below
            routed to an existing page before this merge. */}
        <div className="rounded-xl p-6 md:p-9 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg,#5b21b6,#4c1d95)' }}>
          <ZoneHeader
            icon={Eye} iconColor="#6d28d9" iconTint="#ede9fe"
            title="VIEW" subtitle="Image Generations, Videos, Quizzes and more."
            tagline="Jump back into anything you've made"
            dark
          />
          <select
            value={viewChoice}
            onChange={handleViewChoice}
            className="w-full sm:w-auto px-6 py-4 rounded-xl border-2 border-white bg-white text-black font-extrabold text-xl cursor-pointer [&>option]:text-black [&>option]:font-extrabold"
          >
            <option value="" style={{ color: '#000', fontWeight: 800, fontSize: '1.15rem' }}>{'Choose what to view…'}</option>
            <option value="/library" style={{ color: '#000', fontWeight: 800, fontSize: '1.15rem' }}>Library (everything)</option>
            <option value="/collaborative" style={{ color: '#000', fontWeight: 800, fontSize: '1.15rem' }}>Collaborative Learning</option>
            <option value="/classroom" style={{ color: '#000', fontWeight: 800, fontSize: '1.15rem' }}>Homework</option>
            <option value="/quiz" style={{ color: '#000', fontWeight: 800, fontSize: '1.15rem' }}>Quizzes</option>
            <option value="/gamification" style={{ color: '#000', fontWeight: 800, fontSize: '1.15rem' }}>Gamification</option>
            <option value="/analytics" style={{ color: '#000', fontWeight: 800, fontSize: '1.15rem' }}>Analytics</option>
          </select>
        </div>

      </div>
    </div>
  );
}
