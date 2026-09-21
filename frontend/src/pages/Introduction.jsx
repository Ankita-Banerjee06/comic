import { Link } from 'react-router-dom';
import {
  Info,
  Compass,
  Lightbulb,
  Calendar,
  ArrowRight,
} from 'lucide-react';

// ============================================================
// INTRODUCTION — the new landing point for "why VLQ": a wide
// Problem/Solution comparison banner, the intro-videos section,
// and "see it for yourself" next steps. THE PROBLEM, THE SOLUTION
// and The Impact of AI panels are the approved designed graphics,
// used here as image assets to match them exactly.
// ============================================================

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
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-5"
          style={{ background: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff' }}
        >
          <Info className="w-4 h-4" /> Introduction
        </div>
        <h1 className="font-extrabold leading-tight text-black" style={{ fontSize: 'clamp(40px,5vw,60px)' }}>
          Why VLQ?
        </h1>
        <p className="mt-4 text-2xl font-semibold text-black">
          From challenges to real solutions — see how VLQ makes learning faster, easier and more effective.
        </p>
      </div>

      {/* THE PROBLEM  ⟷  THE SOLUTION — wide comparison banner (spans the full content width) */}
      <div className="w-full rounded-3xl p-6 md:p-9" style={{ background: 'linear-gradient(135deg,#fef2f2,#f0fdf4)' }}>
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

      {/* See VLQ In Action */}
      <div className="w-full rounded-3xl p-6 md:p-9" style={{ background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)' }}>
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h2 className="font-extrabold text-4xl sm:text-5xl text-black mb-3">See VLQ In Action</h2>
          <p className="text-2xl font-semibold text-black">
            See how AI transforms teaching and learning.
          </p>
        </div>

        <div className="w-full flex justify-center">
          {/* The Impact of AI panel — decorative, not linked to tutorials */}
          <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden shadow-lg">
            <img
              src="/vlq-impact-of-ai-panel.png"
              alt="The Impact of AI: The Super-Boon of Digitalisation + AI. Why it transforms humanity and EdTech — instant learning, cost reduction, global access, and rapid growth."
              className="w-full h-auto block"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </div>
      </div>

      {/* See it for yourself */}
      <div className="w-full rounded-3xl p-6 md:p-9" style={{ background: 'linear-gradient(135deg,#faf5ff,#fdf4ff)' }}>
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h2 className="font-extrabold text-4xl sm:text-5xl text-black mb-3">See It For Yourself</h2>
          <p className="text-xl font-medium text-black">Explore everything VLQ has to offer</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {NEXT_STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.label}
                to={s.to}
                className="group relative bg-white rounded-2xl border border-t-4 shadow-sm p-6 flex flex-col overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
                style={{ borderColor: s.color + '33', borderTopColor: s.color, background: `linear-gradient(135deg, white 55%, ${s.tint})` }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform relative z-10 shadow-sm"
                  style={{ background: s.color }}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-extrabold text-3xl text-black mb-2 relative z-10">{s.label}</h3>
                <p className="text-black font-semibold text-xl leading-relaxed mb-4 flex-1 relative z-10">{s.desc}</p>
                <span className="inline-flex items-center gap-1.5 font-bold text-xl relative z-10" style={{ color: s.color }}>
                  {s.linkLabel} <ArrowRight className="w-6 h-6" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
