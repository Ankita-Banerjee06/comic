import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowDown,
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
    desc: 'Turn any learning material into clear diagrams and visual summaries instantly.',
    color: '#1d4ed8',
    tint: '#eff6ff',
    border: '#bfdbfe',
    to: '/amivi',
    cta: 'Create Visuals',
    image: '/vlq-see-tool.png',
  },
  {
    tag: 'AMICO',
    title: 'Understand it deeply.',
    desc: 'Transform concepts into multi-panel comic stories with scenes and dialogue.',
    color: '#be185d',
    tint: '#fdf2f8',
    border: '#f9a8d4',
    to: '/amico',
    cta: 'Create Comic',
    image: '/vlq-understand-tool.png',
  },
  {
    tag: 'QUIZ',
    title: 'Prove you’ve mastered it.',
    desc: 'Test your understanding with image-backed interactive quizzes and explanations.',
    color: '#7c3aed',
    tint: '#f5f3ff',
    border: '#c4b5fd',
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
          src="/vlq-hero-classroom.jpg"
          alt="A teacher and students in a digital classroom, with a smart board showing a Solar System lesson, fun facts and live quiz results, and students following along on tablets"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 25%' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-10 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.28), transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14" style={{ minHeight: 'calc(100vh - 84px)' }} />
      </section>

      {/* ════════════════════════════════════════════════════════════
          BUILT FOR EVERY LEARNER — audience trust strip
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(90deg, #dbeafe 0%, #dcfce7 33%, #fce7f3 66%, #ede9fe 100%)' }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <p className="text-center text-base sm:text-lg font-extrabold uppercase tracking-widest mb-8" style={{ color: '#000000' }}>
            Built for every kind of learner
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {audiences.map((a) => {
              const Icon = a.Icon;
              return (
                <div key={a.label}
                  className="flex flex-col items-center text-center gap-3 rounded-2xl p-4 sm:p-6 bg-white shadow-sm transition-transform hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-1" style={{ background: a.tint }}>
                    <Icon className="w-6 h-6" style={{ color: a.color }} strokeWidth={2.5} />
                  </div>
                  <div className="font-extrabold text-lg sm:text-xl" style={{ color: '#000000' }}>{a.label}</div>
                  <div className="text-base sm:text-lg font-bold" style={{ color: '#000000' }}>{a.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FEATURES — AMIVI / AMICO / QUIZ
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-[220px] h-[220px] sm:w-[420px] sm:h-[420px] rounded-full opacity-60" style={{ background: 'radial-gradient(circle,#dbeafe 0%,transparent 70%)' }} />
          <div className="absolute top-1/3 -right-24 w-[220px] h-[220px] sm:w-[420px] sm:h-[420px] rounded-full opacity-60" style={{ background: 'radial-gradient(circle,#fce7f3 0%,transparent 70%)' }} />
          <div className="absolute bottom-0 left-1/3 w-[220px] h-[220px] sm:w-[420px] sm:h-[420px] rounded-full opacity-50" style={{ background: 'radial-gradient(circle,#ede9fe 0%,transparent 70%)' }} />
        </div>
        <div className="relative max-w-7xl mx-auto">

          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-base sm:text-lg font-extrabold uppercase tracking-widest mb-6"
              style={{ background: '#eef2ff', color: '#000000', border: '2px solid #c7d2fe' }}>
              The VLQ Method
            </div>
            <h2 className="font-black leading-tight" style={{ fontSize: 'clamp(36px,5vw,56px)', color: '#000000' }}>
              Three tools. One learning journey.
            </h2>
            <p className="mt-5 text-xl sm:text-2xl font-bold max-w-4xl mx-auto" style={{ color: '#000000' }}>
              Whether you're a student, a teacher, or learning something new for work — the same method helps you see, understand, and master any subject.
            </p>
          </div>



          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((card) => (
              <div key={card.tag}
                className="rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-xl bg-white"
                style={{ border: `2px solid ${card.color}` }}>
                <div className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full font-black text-base sm:text-lg uppercase tracking-wider mb-6"
                  style={{ background: card.tint, color: '#000000' }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: card.color }} />
                  {card.tag}
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight" style={{ color: '#000000' }}>
                  {card.title}
                </h3>
                
                <p className="text-lg sm:text-xl font-bold mb-8 flex-1 leading-relaxed" style={{ color: '#000000' }}>
                  {card.desc}
                </p>
                
                <div className="rounded-2xl mb-8 overflow-hidden aspect-video sm:aspect-square border-2 shadow-inner" style={{ borderColor: card.border }}>
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover"
                    style={{ display: 'block' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                
                <Link to={card.to}
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-black transition-all hover:-translate-y-1 shadow-md"
                  style={{ background: card.color, color: '#000000', fontSize: '1.25rem' }}>
                  {card.cta} <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CTA BANNER
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl text-center relative overflow-hidden shadow-sm border border-slate-200" style={{ minHeight: 300, background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 55%, #cbd5e1 100%)' }}>
          <div aria-hidden className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(circle at 20% 30%, white 0%, transparent 35%), radial-gradient(circle at 80% 70%, white 0%, transparent 30%)' }} />
          <div className="relative z-10 p-8 sm:p-16 flex flex-col items-center justify-center h-full" style={{ minHeight: 300 }}>
            <h2 className="font-black mb-8 leading-tight tracking-tight" style={{ fontSize: 'clamp(36px,5vw,56px)', color: '#000000' }}>
              Ready to learn at the speed of sight?
            </h2>
            <Link to="/amivi"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{ background: '#000000', color: '#ffffff', fontSize: '1.25rem' }}>
              Start Your Journey <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
