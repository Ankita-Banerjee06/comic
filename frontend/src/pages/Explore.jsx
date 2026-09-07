import { Link } from 'react-router-dom';
import {
  Compass,
  Leaf,
  Image as ImageIcon,
  BookOpen,
  Puzzle,
  Library as LibraryIcon,
  Users,
  ClipboardList,
  Trophy,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

// ============================================================
// EXPLORE — a browsable overview of every VLQ learning category,
// each card linking straight into the real feature behind it.
// Three categories (Ecosystems, Gamification, Analytics) don't have
// a feature built yet, so their cards are shown as "Coming soon"
// instead of linking anywhere.
// ============================================================

const FIVE_STEPS = [
  { n: 1, title: 'See It', desc: 'Quick visuals grab your attention and spark curiosity.', image: '/vlq-step-see.jpg' },
  { n: 2, title: 'Understand It', desc: 'Clear visuals simplify complex ideas in seconds.', image: '/vlq-step-understand.jpg' },
  { n: 3, title: 'Remember It', desc: 'Visual patterns lock in knowledge for the long term.', image: '/vlq-step-remember.jpg' },
  { n: 4, title: 'Apply It', desc: 'Use what you learn with confidence in real life.', image: '/vlq-step-apply.jpg' },
  { n: 5, title: 'Master It', desc: 'Reinforce, revisit, and level up every day.', image: '/vlq-step-master.jpg' },
];

const CATEGORIES = [
  {
    key: 'ecosystems',
    title: 'Ecosystems',
    description: 'Explore the natural world with visual content.',
    icon: Leaf,
    tint: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    comingSoon: true,
  },
  {
    key: 'amivi',
    title: 'AMIVI',
    description: 'Turn any text or topic into clear visual learning chunks.',
    icon: ImageIcon,
    tint: 'bg-blue-50',
    iconColor: 'text-blue-600',
    to: '/amivi',
    image: '/dashboard-amivi.png',
  },
  {
    key: 'amico',
    title: 'AMICO',
    description: 'Create engaging comics for better understanding.',
    icon: BookOpen,
    tint: 'bg-pink-50',
    iconColor: 'text-pink-600',
    to: '/amico',
    image: '/dashboard-comics.png',
  },
  {
    key: 'quizzes',
    title: 'Quizzes',
    description: 'Multiple quiz types and practice modes.',
    icon: Puzzle,
    tint: 'bg-purple-50',
    iconColor: 'text-purple-600',
    to: '/quiz',
    image: '/dashboard-quiz.png',
    details: [
      'Teacher generated → Homework',
      'Learner generated → Self learn',
      'Retake → practice questions you missed',
      'Templates → MCQ, True/False, Mix & Match, Maps (with markers) & more',
    ],
  },
  {
    key: 'library',
    title: 'Library',
    description: 'Access and manage everything you’ve saved.',
    icon: LibraryIcon,
    tint: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    to: '/library',
    image: '/dashboard-library.png',
  },
  {
    key: 'collaborative-learning',
    title: 'Collaborative Learning',
    description: 'Learn together and share ideas in real time.',
    icon: Users,
    tint: 'bg-teal-50',
    iconColor: 'text-teal-600',
    to: '/collaborative',
    image: '/dashboard-collaboration.png',
  },
  {
    key: 'homework',
    title: 'Homework',
    description: 'Assign and complete homework with ease.',
    icon: ClipboardList,
    tint: 'bg-amber-50',
    iconColor: 'text-amber-600',
    to: '/classroom',
    image: '/dashboard-homework.png',
  },
  {
    key: 'gamification',
    title: 'Gamification',
    description: 'Earn rewards and stay motivated.',
    icon: Trophy,
    tint: 'bg-orange-50',
    iconColor: 'text-orange-600',
    comingSoon: true,
    details: ['Visual Pursuit → points, badges, and leaderboards'],
  },
  {
    key: 'analytics',
    title: 'Analytics',
    description: 'Track progress with detailed insights.',
    icon: BarChart3,
    tint: 'bg-violet-50',
    iconColor: 'text-violet-600',
    comingSoon: true,
  },
];

function ExploreCard({ category }) {
  const Icon = category.icon;

  const body = (
    <div className="p-6 flex flex-col flex-1">
      <div className={`w-11 h-11 rounded-xl ${category.tint} flex items-center justify-center mb-4 ${!category.comingSoon ? 'group-hover:scale-105' : ''} transition-transform`}>
        <Icon className={`w-5 h-5 ${category.iconColor}`} />
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <h3 className="font-bold text-slate-800">{category.title}</h3>
        {category.comingSoon && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-400">
            Coming soon
          </span>
        )}
      </div>
      <p className="text-slate-500 font-medium text-sm leading-relaxed mb-3">{category.description}</p>
      {category.details && (
        <ul className="mb-4 flex-1 space-y-1">
          {category.details.map((line) => (
            <li key={line} className="flex items-start gap-1.5 text-xs font-medium text-slate-500">
              <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${category.iconColor.replace('text-', 'bg-')}`} />
              {line}
            </li>
          ))}
        </ul>
      )}
      {!category.details && <div className="flex-1" />}
      {!category.comingSoon && (
        <span className={`inline-flex items-center gap-1.5 font-bold text-sm ${category.iconColor}`}>
          Open <ArrowRight className="w-4 h-4" />
        </span>
      )}
    </div>
  );

  const image = category.image && (
    <div className="aspect-[16/10] overflow-hidden border-b border-slate-100 bg-slate-50">
      <img
        src={category.image}
        alt=""
        className={`w-full h-full object-cover object-top ${!category.comingSoon ? 'group-hover:scale-105' : ''} transition-transform duration-300`}
        onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
      />
    </div>
  );

  if (category.comingSoon) {
    return (
      <div className="text-left bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col opacity-70 cursor-default">
        {image}
        {body}
      </div>
    );
  }

  return (
    <Link
      to={category.to}
      className="group text-left bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col"
    >
      {image}
      {body}
    </Link>
  );
}

export default function Explore() {
  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div
        className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-8"
        style={{ minHeight: 140, background: 'linear-gradient(120deg, #eef2ff 0%, #f5f3ff 100%)' }}
      >
        <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-200 rounded-full px-4 py-1.5 text-xs font-bold mb-4 text-indigo-700">
          <Compass className="w-3.5 h-3.5" /> Explore
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight text-slate-900">
          Discover powerful tools for visual learning
        </h1>
        <p className="text-slate-500 font-medium max-w-lg">
          Every VLQ category in one place — jump straight into the one you need.
        </p>
      </div>

      <div>
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 bg-indigo-50 text-indigo-700 border border-indigo-100">
            The VLQ Method
          </div>
          <h2 className="font-extrabold text-2xl md:text-3xl text-slate-900 mb-2">Five Steps to Success</h2>
          <p className="text-sm md:text-base font-medium text-slate-500">
            Whether you're a student, a teacher, or learning something new for work — the same five
            steps help you see, understand, and master any subject.
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {CATEGORIES.map((category) => (
          <ExploreCard key={category.key} category={category} />
        ))}
      </div>
    </div>
  );
}
