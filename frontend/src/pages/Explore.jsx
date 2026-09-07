import { Link } from 'react-router-dom';
import {
  LayoutGrid,
  Box,
  UserRound,
  GraduationCap,
  RotateCcw,
  HelpCircle,
  FileText,
  BookOpen,
  Users,
  Home,
  Trophy,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

// ============================================================
// EXPLORE — a browsable overview of every VLQ learning category.
// Built to match the approved "Explore Categories" mockup: an
// Ecosystems group (AMIVI + AMICO), a Quizzes group (quiz types +
// templates), a row of standalone category cards, and a wide
// Analytics banner. Routes that don't exist yet (Ecosystems,
// Gamification, Analytics) render as plain cards instead of links.
// ============================================================

const FIVE_STEPS = [
  { n: 1, title: 'See It', desc: 'Quick visuals grab your attention and spark curiosity.', image: '/vlq-step-see.jpg' },
  { n: 2, title: 'Understand It', desc: 'Clear visuals simplify complex ideas in seconds.', image: '/vlq-step-understand.jpg' },
  { n: 3, title: 'Remember It', desc: 'Visual patterns lock in knowledge for the long term.', image: '/vlq-step-remember.jpg' },
  { n: 4, title: 'Apply It', desc: 'Use what you learn with confidence in real life.', image: '/vlq-step-apply.jpg' },
  { n: 5, title: 'Master It', desc: 'Reinforce, revisit, and level up every day.', image: '/vlq-step-master.jpg' },
];

const QUIZ_TYPES = [
  { title: 'Teacher Generated', desc: 'Assign quizzes to your class', icon: UserRound, tint: '#ecfdf5', border: '#a7f3d0', dot: '#059669' },
  { title: 'Learner Generated', desc: 'Create quizzes to self-test', icon: GraduationCap, tint: '#f0fdfa', border: '#99f6e4', dot: '#0d9488' },
  { title: 'Retake Quizzes', desc: 'Practice what you missed', icon: RotateCcw, tint: '#fdf2f8', border: '#fbcfe8', dot: '#db2777' },
  { title: 'Other Quizzes', desc: 'Explore more quiz formats', icon: HelpCircle, tint: '#f5f3ff', border: '#ddd6fe', dot: '#7c3aed' },
];

const QUIZ_TEMPLATES = ['MCQ', 'True / False', 'Mix & Match', 'Maps (with markers)'];

const ROW_CATEGORIES = [
  {
    key: 'library',
    title: 'Library',
    description: 'Access learning resources and materials.',
    icon: BookOpen,
    tint: 'bg-blue-50',
    iconColor: 'text-blue-600',
    to: '/library',
    image: '/vlq-cat-library.jpg',
  },
  {
    key: 'collaborative-learning',
    title: 'Collaborative Learning',
    description: 'Learn and grow together.',
    icon: Users,
    tint: 'bg-violet-50',
    iconColor: 'text-violet-600',
    to: '/collaborative',
    image: '/vlq-cat-collaborative.jpg',
  },
  {
    key: 'homework',
    title: 'Homework',
    description: 'Practice, assign, and track homework.',
    icon: Home,
    tint: 'bg-amber-50',
    iconColor: 'text-amber-600',
    to: '/classroom',
    image: '/vlq-cat-homework.jpg',
  },
  {
    key: 'gamification',
    title: 'Gamification',
    description: 'Make learning fun with Visual Pursuit.',
    icon: Trophy,
    tint: 'bg-orange-50',
    iconColor: 'text-orange-600',
    image: '/vlq-cat-gamification-logo.png',
  },
];

function RowCategoryCard({ category }) {
  const Icon = category.icon;
  const Wrapper = category.to ? Link : 'div';
  const wrapperProps = category.to ? { to: category.to } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="group text-left bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center gap-3 mb-1.5">
        <div className={`w-10 h-10 rounded-xl ${category.tint} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${category.iconColor}`} />
        </div>
        <h3 className="font-bold text-slate-900 text-base leading-tight">{category.title}</h3>
      </div>
      <p className="text-sm font-medium text-slate-500 mb-4">{category.description}</p>
      <div className="mt-auto flex items-end justify-between gap-2">
        <img
          src={category.image}
          alt=""
          className="h-14 w-auto object-contain"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <span className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center flex-shrink-0 text-indigo-600 group-hover:bg-indigo-50 transition-colors">
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Wrapper>
  );
}

export default function Explore() {
  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
          Explore
        </h1>
        <p className="text-slate-500 font-medium">
          Discover everything VLQ has to offer — from visual learning ecosystems to interactive
          quizzes, homework, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {FIVE_STEPS.map((step) => (
          <div key={step.n} className="rounded-2xl overflow-hidden shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
            <img
              src={step.image}
              alt={`Step ${step.n}: ${step.title} — ${step.desc}`}
              className="w-full h-auto block"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <LayoutGrid className="w-6 h-6 text-indigo-600" />
          <h2 className="font-extrabold text-2xl text-slate-900">Explore Categories</h2>
        </div>

        {/* Ecosystems + Quizzes groups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Ecosystems */}
          <div>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Box className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Ecosystems</h3>
                <p className="text-base font-medium text-slate-500">Discover our visual learning ecosystems.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-[calc(100%-3.5rem)]">
              <Link
                to="/amivi"
                className="rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all"
                style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)' }}
              >
                <img
                  src="/vlq-cat-amivi.jpg"
                  alt="AMIVI"
                  className="w-20 h-20 object-contain flex-shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div>
                  <h4 className="font-extrabold text-lg text-blue-700 mb-0.5">AMIVI</h4>
                  <p className="text-sm font-medium text-slate-500 mb-2.5">Interactive Visual Learning</p>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg text-sm font-bold text-blue-600 shadow-sm">
                    Learn More <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
              <Link
                to="/amico"
                className="rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all"
                style={{ background: 'linear-gradient(135deg,#faf5ff,#f3e8ff)' }}
              >
                <img
                  src="/vlq-cat-amico.jpg"
                  alt="AMICO"
                  className="w-20 h-20 object-contain flex-shrink-0"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div>
                  <h4 className="font-extrabold text-lg text-purple-700 mb-0.5">AMICO</h4>
                  <p className="text-sm font-medium text-slate-500 mb-2.5">AI Learning Companion</p>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg text-sm font-bold text-purple-600 shadow-sm">
                    Learn More <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Quizzes */}
          <div>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4.5 h-4.5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Quizzes</h3>
                <p className="text-base font-medium text-slate-500">Interactive quizzes for teachers and learners.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {QUIZ_TYPES.map((q) => {
                const Icon = q.icon;
                return (
                  <Link
                    key={q.title}
                    to="/quiz"
                    className="group rounded-2xl p-4 flex flex-col gap-2.5 border hover:-translate-y-0.5 hover:shadow-md transition-all"
                    style={{ background: q.tint, borderColor: q.border }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                      style={{ background: q.dot }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-extrabold text-slate-900 leading-tight mb-1">{q.title}</h4>
                      <p className="text-xs font-medium text-slate-500 leading-snug">{q.desc}</p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1 text-sm font-bold group-hover:gap-1.5 transition-all"
                      style={{ color: q.dot }}
                    >
                      Start <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
            <Link
              to="/quiz"
              className="group rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 flex items-center justify-between gap-3 hover:shadow-md hover:border-indigo-200 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-base mb-1.5">Quiz Templates</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {QUIZ_TEMPLATES.map((tpl) => (
                      <span
                        key={tpl}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white border border-blue-100 text-xs font-bold text-blue-600 whitespace-nowrap"
                      >
                        {tpl}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <span className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center flex-shrink-0 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>

        {/* Standalone category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {ROW_CATEGORIES.map((category) => (
            <RowCategoryCard key={category.key} category={category} />
          ))}
        </div>

        {/* Analytics banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-between gap-4 max-w-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Analytics</h3>
              <p className="text-sm font-medium text-slate-500">Track progress and gain insights.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <img
              src="/vlq-cat-analytics.jpg"
              alt=""
              className="h-14 w-auto object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-indigo-600">
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
