import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Box,
  UserRound,
  GraduationCap,
  RotateCcw,
  HelpCircle,
  ClipboardList,
  FileText,
  BookOpen,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';

// ============================================================
// EXPLORE — a browsable overview of every VLQ learning category.
// Built to match the approved "Explore Categories" mockup: four
// full-width tinted zones (Ecosystems, Quizzes, Learning Resources,
// Additional Categories), each with a big header and large, bold,
// dark-text cards so every group reads clearly at a glance.
// ============================================================

const FIVE_STEPS = [
  { n: 1, title: 'See It', desc: 'Quick visuals grab your attention and spark curiosity.', image: '/vlq-step-see.jpg' },
  { n: 2, title: 'Understand It', desc: 'Clear visuals simplify complex ideas in seconds.', image: '/vlq-step-understand.jpg' },
  { n: 3, title: 'Remember It', desc: 'Visual patterns lock in knowledge for the long term.', image: '/vlq-step-remember.jpg' },
  { n: 4, title: 'Apply It', desc: 'Use what you learn with confidence in real life.', image: '/vlq-step-apply.jpg' },
  { n: 5, title: 'Master It', desc: 'Reinforce, revisit, and level up every day.', image: '/vlq-step-master.jpg' },
];

const QUIZ_CARDS = [
  { title: 'Teacher Generated', desc: 'Assign quizzes to your class.', icon: UserRound, tint: '#ecfdf5', border: '#a7f3d0', dot: '#059669', action: 'Start' },
  { title: 'Learner Generated', desc: 'Create quizzes to self-test.', icon: GraduationCap, tint: '#f0fdfa', border: '#99f6e4', dot: '#0d9488', action: 'Start' },
  { title: 'Retake Quizzes', desc: 'Practice what you missed.', icon: RotateCcw, tint: '#fdf2f8', border: '#fbcfe8', dot: '#db2777', action: 'Start' },
  { title: 'Other Quizzes', desc: 'Explore more quiz formats.', icon: HelpCircle, tint: '#f5f3ff', border: '#ddd6fe', dot: '#7c3aed', action: 'Start' },
  { title: 'Quiz Templates', desc: 'MCQ, True/False, Mix & Match, Maps.', icon: ClipboardList, tint: '#eff6ff', border: '#bfdbfe', dot: '#2563eb', action: 'Explore' },
];

const LEARNING_RESOURCES = [
  { key: 'library', title: 'Library', description: 'Access learning resources and materials.', color: '#2563eb', tint: '#dbeafe', to: '/library', image: '/vlq-badge-digital-library.png' },
  { key: 'collaborative-learning', title: 'Collaborative Learning', description: 'Learn and grow together.', color: '#7c3aed', tint: '#ede9fe', to: '/collaborative', image: '/vlq-badge-collaborative-learning.png' },
  { key: 'homework', title: 'Homework', description: 'Practice, assign, and track homework.', color: '#d97706', tint: '#fef3c7', to: '/classroom', image: '/vlq-badge-homework-quiz.png' },
];

const ADDITIONAL_CATEGORIES = [
  { key: 'gamification', title: 'Gamification', description: 'Make learning fun with Visual Pursuit.', color: '#d97706', tint: '#fef3c7', to: '/gamification', image: '/vlq-gamification-hero.jpg' },
  { key: 'analytics', title: 'Analytics', description: 'Track progress and gain insights.', color: '#2563eb', tint: '#dbeafe', to: '/analytics', image: '/vlq-cat-analytics.jpg' },
];

function ZoneHeader({ icon: Icon, iconColor, iconTint, title, subtitle, tagline }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconTint }}>
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>
        <div>
          <h2 className="font-extrabold text-3xl text-black leading-tight">{title}</h2>
          <p className="text-lg font-semibold text-black mt-1">{subtitle}</p>
        </div>
      </div>
      <span className="hidden sm:inline-flex items-center gap-1 text-base font-bold text-black flex-shrink-0 mt-2">
        {tagline} <ArrowRight className="w-3.5 h-3.5" />
      </span>
    </div>
  );
}

export default function Explore() {
  const navigate = useNavigate();
  const [resourceChoice, setResourceChoice] = useState('');
  const [quizChoice, setQuizChoice] = useState('');
  const [categoryChoice, setCategoryChoice] = useState('');

  const handleResourceChoice = (e) => {
    const to = e.target.value;
    setResourceChoice(to);
    if (to) navigate(to);
  };

  const handleQuizChoice = (e) => {
    const title = e.target.value;
    setQuizChoice(title);
    if (title) navigate('/quiz');
  };

  const handleCategoryChoice = (e) => {
    const to = e.target.value;
    setCategoryChoice(to);
    if (to) navigate(to);
  };

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-black mb-4">
          Explore
        </h1>
        <p className="text-2xl font-semibold text-black">
          Discover the VLQ learning journey — from visual understanding to lasting mastery.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {FIVE_STEPS.map((step) => (
          <div key={step.n} className="rounded-2xl overflow-hidden shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all aspect-square">
            <img
              src={step.image}
              alt={`Step ${step.n}: ${step.title} — ${step.desc}`}
              className="w-full h-full object-cover block"
              style={{ objectPosition: 'left center' }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        ))}
      </div>

      <div className="space-y-6">

        {/* THE VLQ ENGINES */}
        <div className="rounded-3xl p-6 md:p-9" style={{ background: 'linear-gradient(135deg,#eff6ff,#f0f9ff)' }}>
          <ZoneHeader
            icon={Box} iconColor="#1d4ed8" iconTint="#dbeafe"
            title="THE VLQ ENGINES" subtitle="Explore our AI-powered learning ecosystems."
            tagline="Two powerful ways to learn and grow"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            <Link
              to="/amivi"
              className="group bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all border border-slate-100"
            >
              <div className="aspect-[2171/724] bg-blue-50 overflow-hidden relative">
                <img
                  src="/vlq-amivi-overview.png"
                  alt="AMIVI"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="p-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-md font-bold text-sm mb-3 uppercase tracking-wider">AMIVI</div>
                <h3 className="font-black text-2xl sm:text-3xl text-black mb-2">Turn Complexity into Clarity.</h3>
                <p className="text-lg font-semibold text-black mb-6">Transforms complex information into clear, memorable visual learning.</p>
                <span className="inline-flex items-center gap-1.5 px-5 py-3 bg-blue-600 text-white rounded-xl text-lg font-bold group-hover:bg-blue-700 transition-colors">
                  Explore AMIVI <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </Link>

            <Link
              to="/amico"
              className="group bg-white rounded-3xl overflow-hidden shadow-sm flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all border border-slate-100"
            >
              <div className="aspect-[2172/724] bg-purple-50 overflow-hidden relative">
                <img
                  src="/vlq-amico-overview.png"
                  alt="AMICO"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="p-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-800 rounded-md font-bold text-sm mb-3 uppercase tracking-wider">AMICO</div>
                <h3 className="font-black text-2xl sm:text-3xl text-black mb-2">Turn Learning into Creativity.</h3>
                <p className="text-lg font-semibold text-black mb-6">Transforms learning into visual stories learners create, explore and remember.</p>
                <span className="inline-flex items-center gap-1.5 px-5 py-3 bg-purple-600 text-white rounded-xl text-lg font-bold group-hover:bg-purple-700 transition-colors">
                  Explore AMICO <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Quizzes */}
        <div className="rounded-3xl p-6 md:p-9" style={{ background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)' }}>
          <ZoneHeader
            icon={FileText} iconColor="#0d9488" iconTint="#ccfbf1"
            title="Quizzes" subtitle="Practice, test and challenge yourself with interactive quizzes."
            tagline="Different ways to quiz, learn and improve"
          />
          <select
            value={quizChoice}
            onChange={handleQuizChoice}
            className="w-full sm:w-auto px-6 py-4 rounded-xl border-2 border-teal-300 bg-white text-black font-extrabold text-xl cursor-pointer"
          >
            <option value="">{'Choose a quiz…'}</option>
            {QUIZ_CARDS.map((q) => (
              <option key={q.title} value={q.title}>{q.title}</option>
            ))}
          </select>
        </div>

        {/* Learning Resources */}
        <div className="rounded-3xl p-6 md:p-9" style={{ background: 'linear-gradient(135deg,#fff7ed,#fffbeb)' }}>
          <ZoneHeader
            icon={BookOpen} iconColor="#c2410c" iconTint="#fed7aa"
            title="Learning Resources" subtitle="Access materials, collaborate and manage your learning activities."
            tagline="Everything you need to learn better"
          />
          <select
            value={resourceChoice}
            onChange={handleResourceChoice}
            className="w-full sm:w-auto px-6 py-4 rounded-xl border-2 border-orange-300 bg-white text-black font-extrabold text-xl cursor-pointer"
          >
            <option value="">{'Choose a resource…'}</option>
            {LEARNING_RESOURCES.map((r) => (
              <option key={r.key} value={r.to}>{r.title}</option>
            ))}
          </select>
        </div>

        {/* Additional Categories */}
        <div className="rounded-3xl p-6 md:p-9" style={{ background: 'linear-gradient(135deg,#f5f3ff,#fdf4ff)' }}>
          <ZoneHeader
            icon={LayoutGrid} iconColor="#7c3aed" iconTint="#ede9fe"
            title="Additional Categories" subtitle="Explore more tools to make your learning journey exciting and productive."
            tagline="More ways to learn and grow"
          />
          <select
            value={categoryChoice}
            onChange={handleCategoryChoice}
            className="w-full sm:w-auto px-6 py-4 rounded-xl border-2 border-purple-300 bg-white text-black font-extrabold text-xl cursor-pointer"
          >
            <option value="">{'Choose a category…'}</option>
            {ADDITIONAL_CATEGORIES.map((c) => (
              <option key={c.key} value={c.to}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* Bottom CTA */}
        <div
          className="rounded-3xl p-6 sm:p-9 flex flex-col sm:flex-row items-center justify-between gap-5"
          style={{ background: 'linear-gradient(120deg,#4338ca 0%,#7c3aed 100%)' }}
        >
          <div className="text-center sm:text-left">
            <h3 className="font-extrabold text-2xl text-black mb-1.5">Learning Never Stops</h3>
            <p className="font-semibold text-base text-black">Jump back in and keep building your visual learning journey.</p>
          </div>
          <Link
            to="/amivi"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-black rounded-xl font-bold text-base hover:-translate-y-0.5 hover:shadow-lg transition-all whitespace-nowrap flex-shrink-0"
          >
            Start Exploring <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
