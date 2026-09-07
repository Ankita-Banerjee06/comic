import { Link } from 'react-router-dom';
import {
  Info,
  Compass,
  Lightbulb,
  Calendar,
  ArrowRight,
  XCircle,
  CheckCircle2,
  PlayCircle,
  Globe2,
  Brain,
  Rocket,
  BookOpen,
  Laptop,
  BarChart3,
} from 'lucide-react';

// ============================================================
// INTRODUCTION — the new landing point for "why VLQ": why
// traditional learning is failing, VLQ's objective, the intro
// videos, and why the platform succeeds. Built natively with the
// site's own card/icon patterns to match the approved page design.
// ============================================================

const FAILING_POINTS = [
  'Slow live updates, slower to reach every learner',
  'Passive learning leads to boredom and low retention',
  'Not built for how today’s students actually learn',
];

const SUCCEEDS_POINTS = [
  'Fast, affordable, and always up to date',
  'Active learning drives engagement and retention',
  'Built for the future of education, not the past',
];

const INTRO_VIDEOS = [
  { title: 'The Problem', duration: '23s' },
  { title: 'Enters VLQ', duration: '27s' },
  { title: 'Benefits to Teachers', duration: '27s' },
  { title: 'Benefits to Learners', duration: '45s' },
  { title: 'VLQ Proprietary Ecosystems (AMIVI & AMICO)', duration: '20s' },
];

const AI_STEPS = [
  { icon: Globe2, label: 'A connected world', color: '#60a5fa', tint: 'rgba(96,165,250,0.2)' },
  { icon: Brain, label: 'Powered by AI', color: '#c084fc', tint: 'rgba(192,132,252,0.2)' },
  { icon: Rocket, label: 'Ready for the future', color: '#fb7185', tint: 'rgba(251,113,133,0.2)' },
];

const NEXT_STEPS = [
  { label: 'Explore', desc: 'Browse every VLQ category', linkLabel: 'Explore Now', to: '/explore', icon: Compass, color: '#2563eb', tint: '#eff6ff' },
  { label: 'How We Do It', desc: 'See the complete solution', linkLabel: 'Learn More', to: '/how-we-do-it', icon: Lightbulb, color: '#16a34a', tint: '#f0fdf4' },
  { label: 'Plans', desc: 'Find the right plan for you', linkLabel: 'View Plans', to: '/plans', icon: Calendar, color: '#db2777', tint: '#fdf2f8' },
];

export default function Introduction() {
  return (
    <div className="py-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
          style={{ background: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff' }}
        >
          <Info className="w-3.5 h-3.5" /> Introduction
        </div>
        <h1 className="font-extrabold leading-tight text-slate-900" style={{ fontSize: 'clamp(28px,3.4vw,42px)' }}>
          Why VLQ?
        </h1>
        <p className="mt-3 text-lg font-semibold text-slate-600">
          Traditional learning is slow, expensive, and outdated. VLQ introduces visuals to the learning
          methodology — with the aid of digitalization and AI assistants — to fix that.
        </p>
      </div>

      {/* Why traditional learning is failing vs why VLQ succeeds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-7 overflow-hidden">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-4.5 h-4.5 text-white" />
            </div>
            <h2 className="font-extrabold text-lg text-red-600">Why Traditional Learning is Failing</h2>
          </div>
          <p className="text-sm font-medium text-slate-500 mb-5">
            The old education model is slow, expensive, outdated, and not built for today's world.
          </p>
          <ul className="space-y-3 relative z-10">
            {FAILING_POINTS.map((text) => (
              <li key={text} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-600">{text}</span>
              </li>
            ))}
          </ul>
          <div
            className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full flex items-center justify-center pointer-events-none"
            style={{ background: '#fecaca', opacity: 0.5 }}
          >
            <BookOpen className="w-10 h-10 -rotate-6" style={{ color: '#2563eb' }} />
          </div>
        </div>

        <div className="relative bg-white rounded-2xl border border-slate-200 shadow-sm p-7 overflow-hidden">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5 text-white" />
            </div>
            <h2 className="font-extrabold text-lg text-emerald-600">Why The VLQ Platform Succeeds</h2>
          </div>
          <p className="text-sm font-medium text-slate-500 mb-5">
            Our platform is fast, affordable, up to date, and built for the future.
          </p>
          <ul className="space-y-3 relative z-10">
            {SUCCEEDS_POINTS.map((text) => (
              <li key={text} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm font-medium text-slate-600">{text}</span>
              </li>
            ))}
          </ul>
          <div
            className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full flex items-center justify-center pointer-events-none"
            style={{ background: '#bfdbfe', opacity: 0.5 }}
          >
            <Laptop className="w-10 h-10" style={{ color: '#2563eb' }} />
          </div>
          <div className="absolute bottom-14 right-4 w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-amber-400" />
          </div>
          <div className="absolute bottom-6 right-16 w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Objective */}
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-extrabold text-xl text-slate-900 mb-2">The Objective</h2>
        <p className="text-base font-medium text-slate-600 leading-relaxed">
          The main objective of VLQ is to address the existing problems in the education system. How?
          By introducing <span className="font-bold text-indigo-700">visuals</span> to the learning
          methodology, with the aid of <span className="font-bold text-indigo-700">digitalization</span> and{' '}
          <span className="font-bold text-indigo-700">AI assistants</span>.
        </p>
      </div>

      {/* Hero photo + Watch intro videos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto items-stretch">
        <div className="rounded-2xl overflow-hidden shadow-md border border-slate-100">
          <img
            src="/vlq-intro-hero-photo.jpg"
            alt="A student learning with VLQ on their laptop, surrounded by icons for video, ideas, and documents"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-extrabold text-slate-900">Watch Intro Videos</h2>
          </div>
          <ul className="divide-y divide-slate-100 flex-1">
            {INTRO_VIDEOS.map((v, i) => (
              <li key={v.title} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center font-bold text-indigo-700 text-sm flex-shrink-0">
                  {i + 1}
                </div>
                <PlayCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <span className="flex-1 font-semibold text-slate-700 text-sm">{v.title}</span>
                <span className="text-xs font-bold text-slate-400">{v.duration}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Digitalization + AI banner */}
      <div
        className="max-w-5xl mx-auto rounded-2xl text-center text-white p-10"
        style={{ background: 'linear-gradient(120deg, #1e1b4b 0%, #4c1d95 55%, #9d174d 100%)' }}
      >
        <h2 className="font-extrabold text-2xl md:text-3xl mb-2">The Super-Boon of Digitalisation + AI</h2>
        <p className="font-medium text-white/70 max-w-xl mx-auto mb-8">Why it transforms humanity & EdTech.</p>
        <div className="flex items-center justify-center gap-4 max-w-lg mx-auto">
          {AI_STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-4 flex-1">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: s.tint }}
                  >
                    <Icon className="w-6 h-6" style={{ color: s.color }} />
                  </div>
                  <span className="text-xs font-semibold text-white/80 text-center">{s.label}</span>
                </div>
                {i < AI_STEPS.length - 1 && <ArrowRight className="w-5 h-5 text-white/30 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next steps */}
      <div className="max-w-4xl mx-auto">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">
          See it for yourself
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {NEXT_STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.label}
                to={s.to}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"
                  style={{ background: s.tint }}
                >
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <h3 className="font-bold text-slate-800 mb-1.5">{s.label}</h3>
                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-4 flex-1">{s.desc}</p>
                <span className="inline-flex items-center gap-1.5 font-bold text-sm text-indigo-600">
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
