import { Link } from 'react-router-dom';
import {
  ArrowRight,
  GraduationCap,
  Building2,
  Group,
  BriefcaseBusiness,
  Globe2,
  HeartPulse,
  Atom,
  BookOpenText,
  HelpCircle,
  Puzzle,
  Sparkles,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   DATA
──────────────────────────────────────────────────────────────── */

const subjectChips = [
  { Icon: Atom, label: 'Science', color: '#7c3aed' },
  { Icon: HeartPulse, label: 'Biology', color: '#dc2626' },
  { Icon: Globe2, label: 'Geography', color: '#2563eb' },
  { Icon: BookOpenText, label: 'Literature', color: '#b45309' },
  { Icon: HelpCircle, label: 'General Knowledge', color: '#0d9488' },
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
    image: '/vlq-see-tool.png',
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
    image: '/vlq-understand-tool.png',
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
    image: '/vlq-quiz-tool.png',
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
      <section className="relative overflow-hidden">

        <img
          src="/vlq-hero.png"
          alt="A teacher and students in a digital classroom, with a smart board showing lessons and live quiz results, and students following along on tablets"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 30%' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-10 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.28), transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-14" style={{ minHeight: 'calc(100vh - 84px)' }}>

          {/* ── brand + headline ── */}
          <div className="mb-14">
            <div className="max-w-xl rounded-3xl p-6 sm:p-7 border border-white/60 shadow-xl" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)' }}>
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

              <div className="flex flex-wrap gap-3 mb-6">
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

              {/* platform badges */}
              <div className="flex flex-wrap items-center gap-2 pt-5 mb-3" style={{ borderTop: '1px solid #e2e8f0' }}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: '#eff6ff' }}>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: '#2563eb' }} />
                  <span className="text-[11px] font-black uppercase tracking-wide" style={{ color: '#1d4ed8' }}>AI-Powered Visuals</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: '#f5f3ff' }}>
                  <Puzzle className="w-3.5 h-3.5" style={{ color: '#7c3aed' }} />
                  <span className="text-[11px] font-black uppercase tracking-wide" style={{ color: '#6d28d9' }}>Practice Quizzes</span>
                </div>
              </div>

              {/* subject strip */}
              <div className="flex flex-wrap items-center gap-2">
                {subjectChips.map((s) => {
                  const Icon = s.Icon;
                  return (
                    <div key={s.label}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white"
                      style={{ border: '1px solid #e2e8f0' }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: s.color }} strokeWidth={2.2} />
                      <span className="text-[11px] font-bold" style={{ color: '#475569' }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          BUILT FOR EVERY LEARNER — audience trust strip
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(90deg, #dbeafe 0%, #dcfce7 33%, #fce7f3 66%, #ede9fe 100%)' }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-xs font-bold uppercase tracking-widest mb-7" style={{ color: '#475569' }}>
            Built for every kind of learner
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {audiences.map((a) => {
              const Icon = a.Icon;
              return (
                <div key={a.label}
                  className="flex flex-col items-center text-center gap-2.5 rounded-2xl p-5 bg-white shadow-sm transition-transform hover:-translate-y-0.5">
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
          <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full opacity-60" style={{ background: 'radial-gradient(circle,#dbeafe 0%,transparent 70%)' }} />
          <div className="absolute top-1/3 -right-24 w-[420px] h-[420px] rounded-full opacity-60" style={{ background: 'radial-gradient(circle,#fce7f3 0%,transparent 70%)' }} />
          <div className="absolute bottom-0 left-1/3 w-[420px] h-[420px] rounded-full opacity-50" style={{ background: 'radial-gradient(circle,#ede9fe 0%,transparent 70%)' }} />
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
                <div className="rounded-xl mb-5 overflow-hidden aspect-square border" style={{ borderColor: card.border }}>
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover"
                    style={{ display: 'block' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
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
