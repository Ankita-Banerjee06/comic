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
          src="/heropic.png"
          alt="A teacher and students in a digital classroom, with a smart board showing lessons and live quiz results, and students following along on tablets"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 30%' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-10 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.28), transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14" style={{ minHeight: 'calc(100vh - 84px)' }} />
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
          FIVE STEPS TO SUCCESS — the VLQ method
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-10 bg-white">
        <div className="max-w-[100rem] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
              style={{ background: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff' }}>
              The VLQ Method
            </div>
            <h2 className="font-extrabold leading-tight" style={{ fontSize: 'clamp(28px,3.4vw,42px)', color: '#0f172a' }}>
              Five Steps to Success
            </h2>
            <p className="mt-3 text-lg font-semibold max-w-2xl mx-auto" style={{ color: '#1e293b' }}>
              Whether you're a student, a teacher, or learning something new for work — the same five steps help you see, understand, and master any subject.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { src: '/vlq-step-1-see.png', alt: 'Step 1: See it. Quick visuals grab your attention and spark curiosity.' },
              { src: '/vlq-step-2-understand.png', alt: 'Step 2: Understand it. Clear visuals simplify complex ideas in seconds.' },
              { src: '/vlq-step-3-remember.png', alt: 'Step 3: Remember it. Visual patterns lock in knowledge for the long term.' },
              { src: '/vlq-step-4-apply.png', alt: 'Step 4: Apply it. Use what you learn with confidence in real life.' },
              { src: '/vlq-step-5-master.png', alt: 'Step 5: Master it. Reinforce, revisit, and level up every day.' },
            ].map((step) => (
              <div key={step.src} className="rounded-2xl overflow-hidden shadow-md border border-slate-100 transition-transform hover:-translate-y-1 hover:shadow-lg">
                <img src={step.src} alt={step.alt} className="w-full h-auto block" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
            ))}
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
        <div className="max-w-5xl mx-auto rounded-2xl text-center text-white relative overflow-hidden" style={{ minHeight: 280, background: 'linear-gradient(135deg,#0f0a3d 0%,#4a1041 55%,#7a2a09 100%)' }}>
          <div aria-hidden className="absolute inset-0 opacity-15" style={{ background: 'radial-gradient(circle at 20% 30%, white 0%, transparent 35%), radial-gradient(circle at 80% 70%, white 0%, transparent 30%)' }} />
          <div className="relative z-10 p-10 sm:p-14 flex flex-col items-center justify-center h-full" style={{ minHeight: 280 }}>
            <h2 className="font-extrabold mb-7 leading-tight" style={{ fontSize: 'clamp(30px,3.8vw,46px)' }}>
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
