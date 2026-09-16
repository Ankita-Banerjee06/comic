import { Link } from 'react-router-dom';
import {
  Info,
  Compass,
  Lightbulb,
  Calendar,
  ArrowRight,
  PlayCircle,
} from 'lucide-react';

// ============================================================
// INTRODUCTION — the new landing point for "why VLQ": a wide
// Problem/Solution comparison banner, the intro-videos section,
// and "see it for yourself" next steps. THE PROBLEM, THE SOLUTION
// and The Impact of AI panels are the approved designed graphics,
// used here as image assets to match them exactly.
// ============================================================

const INTRO_VIDEOS = [
  { title: 'The Problem', duration: '2:38' },
  { title: 'Enters VLQ', duration: '2:17' },
  { title: 'Benefits to Teachers', duration: '2:45' },
  { title: 'Benefits to Learners', duration: '4:54' },
  { title: 'VLQ Proprietary Ecosystems (AMIVI & AMICO)', duration: '2:04' },
];

const NEXT_STEPS = [
  { label: 'Explore', desc: 'Browse every VLQ category', linkLabel: 'Explore Now', to: '/explore', icon: Compass, color: '#2563eb', tint: '#eff6ff' },
  { label: 'How We Do It', desc: 'See the complete solution', linkLabel: 'Learn More', to: '/how-we-do-it', icon: Lightbulb, color: '#16a34a', tint: '#f0fdf4' },
  { label: 'Plans', desc: 'Find the right plan for you', linkLabel: 'View Plans', to: '/plans', icon: Calendar, color: '#db2777', tint: '#fdf2f8' },
];

export default function Introduction() {
  return (
    <div className="py-10 space-y-14 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
          style={{ background: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff' }}
        >
          <Info className="w-3.5 h-3.5" /> Introduction
        </div>
        <h1 className="font-extrabold leading-tight text-black" style={{ fontSize: 'clamp(32px,4vw,48px)' }}>
          Why VLQ?
        </h1>
        <p className="mt-3 text-lg font-semibold text-black">
          From challenges to real solutions — see how VLQ makes learning faster, easier and more effective.
        </p>
      </div>

      {/* THE PROBLEM  ⟷  THE SOLUTION — wide comparison banner (spans the full content width) */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* THE PROBLEM */}
          <div className="rounded-3xl overflow-hidden shadow-lg">
            <img
              src="/vlq-the-problem-panel.png"
              alt="THE PROBLEM: Why traditional learning is failing — long courses, high costs, heavy textbooks, low engagement, slow learning speed, one-size-fits-all teaching, poor retention, and taking notes lead to a skills gap and an unready future."
              className="w-full h-auto"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          {/* THE SOLUTION */}
          <div className="rounded-3xl overflow-hidden shadow-lg">
            <img
              src="/vlq-the-solution-panel.png"
              alt="THE SOLUTION: Why the VLQ platform succeeds — micro-learning courses, low accessibility costs, interactive learning, gamification of learning, accelerated learning speed, personalized teaching, visual learning ecosystems, and digital notes lead to a modern, ready future."
              className="w-full h-auto"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

        </div>
      </div>

      {/* Learn How VLQ Works */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="font-extrabold text-3xl sm:text-4xl text-black mb-2">Learn How VLQ Works</h2>
        <p className="text-lg font-semibold text-black">
          Watch our short videos to understand the problem, our solution, and the benefits for teachers and learners.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-stretch">
        {/* The Impact of AI video card */}
        <Link
          to="/tutorials"
          className="group relative rounded-3xl overflow-hidden shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all"
        >
          <img
            src="/vlq-impact-of-ai-panel.png"
            alt="The Impact of AI: The Super-Boon of Digitalisation + AI. Why it transforms humanity and EdTech — instant learning, cost reduction, global access, and rapid growth."
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <PlayCircle className="w-9 h-9 text-indigo-600" />
            </div>
          </div>
        </Link>

        {/* Intro videos list */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-xl text-black">Intro Videos</h2>
            <Link to="/tutorials" className="inline-flex items-center gap-1 text-base font-bold text-black hover:gap-1.5 transition-all">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-slate-100 flex-1">
            {INTRO_VIDEOS.map((v, i) => (
              <li key={v.title} className="flex items-center gap-4 px-6 py-4">
                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-black text-base flex-shrink-0">
                  {i + 1}
                </div>
                <PlayCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <span className="flex-1 font-semibold text-black text-base">{v.title}</span>
                <span className="text-sm font-bold text-black">{v.duration}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* See it for yourself */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h2 className="font-extrabold text-3xl sm:text-4xl text-black mb-2">See It For Yourself</h2>
          <p className="text-lg font-semibold text-black">Explore everything VLQ has to offer</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {NEXT_STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.label}
                to={s.to}
                className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
                style={{ background: `linear-gradient(135deg, white 55%, ${s.tint})` }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform relative z-10"
                  style={{ background: s.tint }}
                >
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <h3 className="font-extrabold text-xl text-black mb-1.5 relative z-10">{s.label}</h3>
                <p className="text-black font-semibold text-base leading-relaxed mb-4 flex-1 relative z-10">{s.desc}</p>
                <span className="inline-flex items-center gap-1.5 font-bold text-base text-black relative z-10">
                  {s.linkLabel} <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
