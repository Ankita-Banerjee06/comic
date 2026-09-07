import { Link } from 'react-router-dom';
import {
  Settings,
  UploadCloud,
  FileText,
  Cpu,
  Sparkles,
  Image as ImageIcon,
  MessageCircle,
  ListChecks,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Clock,
  Users,
  Target,
  Trophy,
  GraduationCap,
  Lightbulb,
  Quote,
} from 'lucide-react';

// ============================================================
// HOW WE DO IT — "How VLQ Works": the actual pipeline a piece of
// learning material goes through inside VLQ, shown as a connected
// step timeline next to the hero illustration. Deliberately a
// different shape from the Introduction page (which makes the
// *case* for VLQ) — this page shows the *mechanism*.
// ============================================================

const STEPS = [
  {
    n: 1,
    title: 'Feed It In',
    desc: 'Upload any text, video, PDF, or just a topic — VLQ takes whatever you already have.',
    icon: FileText,
    badgeIcon: UploadCloud,
    color: '#2563eb',
    tint: '#eff6ff',
  },
  {
    n: 2,
    title: 'AI Structures It',
    desc: 'Digitalization and AI assistants break the material down into clear, teachable chunks.',
    icon: Cpu,
    badgeIcon: Sparkles,
    color: '#7c3aed',
    tint: '#f5f3ff',
  },
  {
    n: 3,
    title: 'Visualize It',
    desc: 'AMIVI turns it into clear visual explanations, and AMICO into an engaging comic story.',
    icon: ImageIcon,
    badgeIcon: MessageCircle,
    color: '#db2777',
    tint: '#fdf2f8',
    to: '/amivi',
    linkLabel: 'Try AMIVI',
  },
  {
    n: 4,
    title: 'Practice It',
    desc: 'Interactive, image-backed quizzes test understanding and lock in what was learned.',
    icon: ListChecks,
    badgeIcon: CheckCircle2,
    color: '#16a34a',
    tint: '#f0fdf4',
    to: '/quiz',
    linkLabel: 'Try a Quiz',
  },
  {
    n: 5,
    title: 'Track It',
    desc: 'Progress, retakes, and results feed back so every learner keeps moving forward.',
    icon: BarChart3,
    badgeIcon: TrendingUp,
    color: '#ea580c',
    tint: '#fff7ed',
  },
];

const RESULTS = [
  { label: 'Better Understanding', desc: 'Visuals make complex topics simple.', icon: BarChart3, color: '#16a34a', tint: '#f0fdf4' },
  { label: 'Faster Learning', desc: 'Grasp concepts in less time.', icon: Clock, color: '#7c3aed', tint: '#f5f3ff' },
  { label: 'More Engagement', desc: 'Interactive and visual experiences.', icon: Users, color: '#ea580c', tint: '#fff7ed' },
  { label: 'Greater Accessibility', desc: 'Learn anytime, anywhere.', icon: Target, color: '#db2777', tint: '#fdf2f8' },
  { label: 'Real Outcomes', desc: 'Build skills for school, work, and life.', icon: Trophy, color: '#2563eb', tint: '#eff6ff' },
];

export default function HowWeDoIt() {
  return (
    <div className="py-10 space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
          style={{ background: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff' }}
        >
          <Settings className="w-3.5 h-3.5" /> The Process
        </div>
        <h1 className="font-extrabold leading-tight text-slate-900" style={{ fontSize: 'clamp(28px,3.4vw,42px)' }}>
          How VLQ Works
        </h1>
        <p className="mt-3 text-lg font-semibold text-slate-600">
          From any learning material to real mastery — here's the pipeline behind every VLQ session.
        </p>
      </div>

      {/* Hero illustration + step timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 max-w-6xl mx-auto items-start">
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="rounded-2xl overflow-hidden">
            <img
              src="/vlq-how-it-works-hero.jpg"
              alt="A student learning with VLQ — watch, learn, understand, and practice, all in one place"
              className="w-full h-auto block"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <Quote className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-sm font-semibold text-slate-600 leading-relaxed">
              "Every step, from upload to mastery, happens inside one connected pipeline — no
              switching tools, no losing track of progress."
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600"
            >
              See it in action <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-slate-200" aria-hidden="true" />
          <div className="space-y-6">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const BadgeIcon = step.badgeIcon;
              return (
                <div key={step.n} className="relative pl-[4.5rem]">
                  <div
                    className="absolute left-0 top-0 w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-white shadow-md flex-shrink-0"
                    style={{ background: step.color }}
                  >
                    {step.n}
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: step.tint }}
                        >
                          <Icon className="w-4 h-4" style={{ color: step.color }} />
                        </div>
                        <h3 className="font-extrabold text-slate-900">{step.title}</h3>
                      </div>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed mb-1">{step.desc}</p>
                      {step.to && (
                        <Link
                          to={step.to}
                          className="inline-flex items-center gap-1 text-xs font-bold mt-1"
                          style={{ color: step.color }}
                        >
                          {step.linkLabel} <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                    <div
                      className="hidden sm:flex relative w-16 h-16 rounded-2xl items-center justify-center flex-shrink-0"
                      style={{ background: step.tint }}
                    >
                      <Icon className="w-7 h-7" style={{ color: step.color }} />
                      <div
                        className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center"
                      >
                        <BadgeIcon className="w-3.5 h-3.5" style={{ color: step.color }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* The Result */}
      <div className="max-w-5xl mx-auto text-center">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
          style={{ background: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff' }}
        >
          <Sparkles className="w-3.5 h-3.5" /> The Result
        </div>
        <h2 className="font-extrabold text-2xl md:text-3xl text-slate-900 mb-2">Real Learning. Real Impact.</h2>
        <p className="text-base font-medium text-slate-500 mb-8">
          A smarter, faster, and more engaging way to learn.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {RESULTS.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.label} className="flex flex-col items-center text-center gap-2">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: r.tint }}>
                  <Icon className="w-5 h-5" style={{ color: r.color }} />
                </div>
                <span className="font-bold text-sm text-slate-800">{r.label}</span>
                <span className="text-xs font-medium text-slate-500 leading-snug">{r.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA banner */}
      <div
        className="max-w-6xl mx-auto rounded-2xl p-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-white"
        style={{ background: 'linear-gradient(120deg,#4338ca 0%,#a21caf 60%,#db2777 100%)' }}
      >
        <div>
          <h2 className="font-extrabold text-2xl md:text-3xl mb-2">Ready to put it to work?</h2>
          <p className="font-medium text-white/80">Start with any topic and watch VLQ take it from there.</p>
        </div>
        <div className="flex items-center gap-6 flex-shrink-0">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold hover:-translate-y-0.5 hover:shadow-lg transition-all whitespace-nowrap"
          >
            Explore VLQ <ArrowRight className="w-4 h-4" />
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
