import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  ChartPie,
  Brain,
  ClipboardCheck,
  GraduationCap,
  Building2,
  Group,
  BriefcaseBusiness,
  Globe2,
  HeartPulse,
  Atom,
  BookOpenText,
  HelpCircle,
  Landmark,
  Puzzle,
  Sun,
  Droplets,
  Wind,
  Zap,
  Leaf,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   DATA
──────────────────────────────────────────────────────────────── */

const journeySteps = [
  { id: 'see', label: 'See', from: '#3b82f6', to: '#2563eb', Icon: Eye },
  { id: 'understand', label: 'Understand', from: '#22c55e', to: '#16a34a', Icon: ChartPie },
  { id: 'remember', label: 'Remember', from: '#a855f7', to: '#7c3aed', Icon: Brain },
  { id: 'apply', label: 'Apply', from: '#fb923c', to: '#ea580c', Icon: ClipboardCheck },
  { id: 'master', label: 'Master', from: '#ec4899', to: '#a21caf', Icon: GraduationCap, final: true },
];

const subjectChips = [
  { Icon: Atom, label: 'Science', color: '#7c3aed' },
  { Icon: HeartPulse, label: 'Biology', color: '#dc2626' },
  { Icon: Globe2, label: 'Geography', color: '#2563eb' },
  { Icon: BookOpenText, label: 'Literature', color: '#b45309' },
  { Icon: HelpCircle, label: 'General Knowledge', color: '#0d9488' },
];

const hologramIcons = [
  { Icon: Globe2, color: '#2563eb', tint: '#eff6ff', pos: 'top-0 left-[6%]', anim: 'animate-float' },
  { Icon: HeartPulse, color: '#dc2626', tint: '#fef2f2', pos: 'top-[-6%] left-[42%]', anim: 'animate-float-reverse' },
  { Icon: Atom, color: '#7c3aed', tint: '#f5f3ff', pos: 'top-0 right-[8%]', anim: 'animate-float-slow' },
  { Icon: Landmark, color: '#b45309', tint: '#fffbeb', pos: 'top-[38%] right-[-2%]', anim: 'animate-drift' },
  { Icon: Puzzle, color: '#0d9488', tint: '#f0fdfa', pos: 'top-[40%] left-[-2%]', anim: 'animate-bounce-y' },
];

const audiences = [
  { Icon: GraduationCap, label: 'Students', desc: 'K-12 & higher ed', color: '#2563eb', tint: '#eff6ff' },
  { Icon: Building2, label: 'Teachers & Schools', desc: 'Classroom-ready content', color: '#16a34a', tint: '#f0fdf4' },
  { Icon: Group, label: 'Parents & Families', desc: 'Learn together at home', color: '#db2777', tint: '#fdf2f8' },
  { Icon: BriefcaseBusiness, label: 'Professionals', desc: 'Upskilling & training', color: '#9333ea', tint: '#f5f3ff' },
];

const features = [
  {
    tag: 'AMIVI',
    title: 'See it clearly.',
    desc: 'Paste or upload any learning material and AMIVI’s AI engine turns it into clear visual explanations — diagrams, infographics and narrated cards.',
    color: '#1d4ed8',
    tint: '#eff6ff',
    border: '#dbeafe',
    to: '/amivi',
    cta: 'Create Visuals',
    image: '/vlq-see-card.jpg',
  },
  {
    tag: 'AMICO',
    title: 'Understand it deeply.',
    desc: 'Turn any concept into a multi-panel visual story — characters, dialogue and a scene for every idea, so it sticks.',
    color: '#be185d',
    tint: '#fdf2f8',
    border: '#fbcfe8',
    to: '/amico',
    cta: 'Create Comic',
    image: '/vlq-comic-card.jpg',
  },
  {
    tag: 'QUIZ',
    title: 'Prove you’ve mastered it.',
    desc: 'Test understanding with interactive, image-backed quizzes, get instant explanations, and retake anything missed — anytime later.',
    color: '#7c3aed',
    tint: '#f5f3ff',
    border: '#ddd6fe',
    to: '/quiz',
    cta: 'Start Quiz',
    image: '/vlq-quiz-card.jpg',
  },
];

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE COMPONENT
──────────────────────────────────────────────────────────────── */
export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">

      {/* ════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg,#f5f8ff 0%,#ffffff 60%)' }}>

        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[440px] h-[440px] rounded-full opacity-50" style={{ background: 'radial-gradient(circle,#dbeafe 0%,transparent 70%)' }} />
          <div className="absolute top-40 -left-40 w-[380px] h-[380px] rounded-full opacity-40" style={{ background: 'radial-gradient(circle,#fce7f3 0%,transparent 70%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-14">

          {/* ── top row: brand + headline (left) / journey stepper (right) ── */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 mb-14">

            {/* BRAND + HEADLINE */}
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-7">
                <img src="/vlq-logo-clean.png" alt="VLQ" className="h-11 w-auto object-contain flex-shrink-0" />
                <div>
                  <div className="font-extrabold text-xl tracking-tight leading-none" style={{ color: '#0f172a' }}>VLQ</div>
                  <div className="text-[11px] font-bold uppercase tracking-widest mt-1" style={{ color: '#64748b' }}>
                    Learn at the Speed of Sight
                  </div>
                </div>
              </div>

              <h1 className="font-extrabold leading-[1.08] mb-5" style={{ fontSize: 'clamp(32px,4vw,50px)', color: '#0f172a', letterSpacing: '-0.01em' }}>
                A visual learning platform for every learner
              </h1>

              <p className="text-base font-medium mb-8 leading-relaxed" style={{ color: '#475569' }}>
                From classroom students to working professionals — turn any material into clear visuals, story-driven explanations, and quizzes that help ideas stick.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link to="/amivi"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: '#1d4ed8' }}>
                  Start Learning <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/quiz"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all hover:-translate-y-0.5"
                  style={{ background: 'white', color: '#0f172a', border: '1.5px solid #e2e8f0' }}>
                  Take a Quiz
                </Link>
              </div>
            </div>

            {/* JOURNEY STEPPER: See → Understand → Remember → Apply → Master */}
            <div className="flex items-center overflow-x-auto lg:overflow-visible pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:pt-1">
              {journeySteps.map((step, i) => {
                const Icon = step.Icon;
                return (
                  <div key={step.id} className="flex items-center shrink-0">
                    <div className="flex flex-col items-center w-[70px] sm:w-20">
                      <div
                        className="relative w-14 h-14 sm:w-[68px] sm:h-[68px] rounded-2xl flex items-center justify-center transition-transform hover:scale-105 hover:-translate-y-0.5"
                        style={{
                          background: `linear-gradient(135deg, ${step.from}, ${step.to})`,
                          boxShadow: step.final
                            ? `0 10px 20px -6px ${step.to}aa, 0 0 0 4px ${step.to}26`
                            : `0 10px 20px -6px ${step.to}88`,
                        }}
                      >
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.25} />
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white text-[8px] sm:text-[9px] font-black uppercase tracking-wide shadow-sm whitespace-nowrap"
                          style={{ color: step.to }}>
                          {step.label}
                        </div>
                      </div>
                    </div>
                    {i < journeySteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 mx-0.5 sm:mx-1 shrink-0" style={{ color: '#cbd5e1' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── HERO VISUAL: a "smart screen" turning a subject into a diagram, with floating subject holograms ── */}
          <div className="relative max-w-2xl mx-auto pt-16 sm:pt-20 pb-2">
            <div aria-hidden className="absolute inset-0 -z-10 pointer-events-none">
              <div className="absolute inset-0 rounded-[3rem] opacity-90" style={{ background: 'radial-gradient(55% 55% at 50% 40%, #c7e2ff 0%, #eef2ff 50%, transparent 78%)' }} />
            </div>

            {/* floating subject holograms */}
            {hologramIcons.map(({ Icon, color, tint, pos, anim }, i) => (
              <div key={i} className={`hidden sm:flex absolute ${pos} w-14 h-14 rounded-2xl items-center justify-center shadow-lg border border-white ${anim}`}
                style={{ background: tint }}>
                <Icon className="w-6 h-6" style={{ color }} strokeWidth={2} />
              </div>
            ))}

            {/* the screen */}
            <div className="relative max-w-sm mx-auto">
              <div className="rounded-2xl p-2.5 shadow-2xl" style={{ background: '#0f172a' }}>
                <div className="rounded-xl overflow-hidden aspect-[4/3] relative flex items-center justify-center"
                  style={{ background: 'linear-gradient(160deg,#ecfdf5 0%,#eff6ff 100%)' }}>
                  {/* mini photosynthesis-style diagram */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="absolute rounded-full opacity-60" style={{ width: 130, height: 130, background: 'radial-gradient(circle,#bbf7d0 0%,transparent 70%)' }} />
                    <Leaf className="w-16 h-16 relative z-10" style={{ color: '#16a34a' }} strokeWidth={1.75} />

                    <MiniLabel icon={Sun} label="Sunlight" color="#d97706" tint="#fffbeb" className="top-3 left-3" />
                    <MiniLabel icon={Droplets} label="H2O" color="#2563eb" tint="#eff6ff" className="bottom-3 left-3" />
                    <MiniLabel icon={Wind} label="CO2" color="#64748b" tint="#f8fafc" className="top-3 right-3" />
                    <MiniLabel icon={Zap} label="Sugar" color="#ea580c" tint="#fff7ed" className="bottom-3 right-3" />
                  </div>
                </div>
              </div>
              {/* stand + glow */}
              <div className="w-16 h-2.5 mx-auto rounded-b-md" style={{ background: '#1e293b' }} />
              <div className="w-40 h-5 mx-auto rounded-full mt-1 opacity-70" style={{ background: 'radial-gradient(ellipse,#93c5fd 0%,transparent 75%)', filter: 'blur(6px)' }} />
            </div>

            {/* caption */}
            <div className="flex justify-center mt-2 mb-6 relative">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wide text-white shadow-md"
                style={{ background: '#0f172a' }}>
                See → Understand → Master
              </div>
            </div>

            {/* subject strip */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {subjectChips.map((s) => {
                const Icon = s.Icon;
                return (
                  <div key={s.label}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white"
                    style={{ border: '1px solid #e2e8f0' }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: s.color }} strokeWidth={2.2} />
                    <span className="text-[11px] font-bold" style={{ color: '#475569' }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          BUILT FOR EVERY LEARNER — audience trust strip
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-y border-slate-100" style={{ background: '#f8fafc' }}>
        <div aria-hidden className="absolute inset-0 pointer-events-none opacity-70" style={{ background: 'linear-gradient(90deg, #eff6ff 0%, #f0fdf4 33%, #fdf2f8 66%, #f5f3ff 100%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-center text-xs font-bold uppercase tracking-widest mb-7" style={{ color: '#94a3b8' }}>
            Built for every kind of learner
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {audiences.map((a) => {
              const Icon = a.Icon;
              return (
                <div key={a.label} className="flex flex-col items-center text-center gap-2.5">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: a.tint }}>
                    <Icon className="w-5 h-5" style={{ color: a.color }} strokeWidth={2} />
                  </div>
                  <div className="font-bold text-sm" style={{ color: '#0f172a' }}>{a.label}</div>
                  <div className="text-xs font-medium" style={{ color: '#94a3b8' }}>{a.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FEATURES — AMIVI / AMICO / QUIZ
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-50" style={{ background: 'radial-gradient(50% 50% at 50% 0%, #eef2ff 0%, transparent 70%)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto">

          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
              style={{ background: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff' }}>
              The VLQ Method
            </div>
            <h2 className="font-extrabold leading-tight" style={{ fontSize: 'clamp(26px,3.2vw,40px)', color: '#0f172a' }}>
              Three tools. One learning journey.
            </h2>
            <p className="mt-3 text-base font-medium max-w-2xl mx-auto" style={{ color: '#64748b' }}>
              Whether you're a student, a teacher, or learning something new for work — the same method helps you see, understand, and master any subject.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {features.map((card) => (
              <div key={card.tag}
                className="rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{ border: `1.5px solid ${card.border}`, background: card.tint }}>
                <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full font-bold text-[11px] uppercase tracking-wide mb-4"
                  style={{ background: 'white', color: card.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: card.color }} />
                  {card.tag}
                </div>
                <div className="rounded-xl mb-5 overflow-hidden h-48 border" style={{ borderColor: card.border }}>
                  <img
                    src={card.image}
                    alt={`${card.tag} preview`}
                    className="w-full h-full object-cover"
                    style={{ display: 'block' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <h3 className="font-extrabold text-xl mb-2" style={{ color: '#0f172a' }}>{card.title}</h3>
                <p className="text-sm font-medium mb-6 flex-1 leading-relaxed" style={{ color: '#64748b' }}>{card.desc}</p>
                <Link to={card.to}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-white transition-all hover:-translate-y-0.5"
                  style={{ background: card.color }}>
                  {card.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-2xl text-center text-white relative overflow-hidden" style={{ minHeight: 280, background: 'linear-gradient(135deg,#1d1467 0%,#7c1d6f 55%,#c2410c 100%)' }}>
          <div aria-hidden className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 20% 30%, white 0%, transparent 35%), radial-gradient(circle at 80% 70%, white 0%, transparent 30%)' }} />
          <div className="relative z-10 p-10 sm:p-14 flex flex-col items-center justify-center h-full" style={{ minHeight: 280 }}>
            <h2 className="font-extrabold mb-7 leading-tight" style={{ fontSize: 'clamp(24px,3vw,38px)' }}>
              Ready to learn at the speed of sight?
            </h2>
            <Link to="/amivi"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base transition-all hover:-translate-y-0.5 hover:shadow-xl"
              style={{ background: 'white', color: '#1e293b' }}>
              Start Your Journey <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

function MiniLabel({ icon: Icon, label, color, tint, className }) {
  return (
    <div className={`absolute flex items-center gap-1 px-1.5 py-1 rounded-lg shadow-sm ${className}`} style={{ background: tint }}>
      <Icon className="w-3 h-3" style={{ color }} strokeWidth={2.25} />
      <span className="text-[8px] font-black" style={{ color }}>{label}</span>
    </div>
  );
}
