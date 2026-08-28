import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Palette,
  Puzzle,
  BookOpen,
  Archive,
  Users,
  BarChart3,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return role === 'teacher' ? (
    <TeacherDashboard user={user} />
  ) : (
    <StudentDashboard user={user} />
  );
}

function DashboardHeader({ name, role }) {
  const isTeacher = role === 'teacher';
  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-8 text-white"
      style={{ minHeight: 160 }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: isTeacher
            ? 'linear-gradient(120deg, #1e293b 0%, #334155 60%, #0d9488 130%)'
            : 'linear-gradient(120deg, #1e1b4b 0%, #3730a3 60%, #6366f1 130%)',
        }}
      />
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-xs font-bold mb-4">
          {isTeacher ? '👩‍🏫 Teacher' : '🎓 Student'}
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">
          {name ? `Welcome back, ${name.split(' ')[0]}` : 'Welcome back'}
        </h1>
        <p className="text-white/90 font-medium max-w-lg">
          {isTeacher
            ? 'Build lessons, assign homework, and track how your students are doing — all in one place.'
            : 'Pick up your homework, keep learning with AMIVI and AMICO, or jump into a quiz.'}
        </p>
      </div>
    </div>
  );
}

function TileGrid({ tiles }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {tiles.map((tile) => (
        <DashboardTile key={tile.title} {...tile} />
      ))}
    </div>
  );
}

function DashboardTile({ to, icon: Icon, title, description, tint, iconColor, accentColor }) {
  return (
    <Link
      to={to}
      className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col"
    >
      <div className={`w-11 h-11 rounded-xl ${tint} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-slate-500 font-medium text-sm mb-4 flex-1">{description}</p>
      <span className={`inline-flex items-center gap-1.5 font-bold text-sm ${accentColor}`}>
        Open <ArrowRight className="w-4 h-4" />
      </span>
    </Link>
  );
}

function StudentDashboard({ user }) {
  const tiles = [
    {
      to: '/classroom',
      icon: ClipboardList,
      title: 'Homework',
      description: 'See homework your teacher assigned, complete it, and check your scores.',
      tint: 'bg-amber-50',
      iconColor: 'text-amber-600',
      accentColor: 'text-amber-600',
    },
    {
      to: '/amivi',
      icon: Palette,
      title: 'AMIVI Lessons',
      description: 'Turn any topic or material into visual, easy-to-follow lessons.',
      tint: 'bg-blue-50',
      iconColor: 'text-blue-600',
      accentColor: 'text-blue-600',
    },
    {
      to: '/quiz',
      icon: Puzzle,
      title: 'Quizzes',
      description: 'Practice with AI-generated quizzes on anything you’re learning.',
      tint: 'bg-purple-50',
      iconColor: 'text-purple-600',
      accentColor: 'text-purple-600',
    },
    {
      to: '/amico',
      icon: BookOpen,
      title: 'AMICO Comics',
      description: 'Turn tricky topics into comics that make them click.',
      tint: 'bg-pink-50',
      iconColor: 'text-pink-600',
      accentColor: 'text-pink-600',
    },
    {
      to: '/library',
      icon: Archive,
      title: 'Library',
      description: 'Everything you’ve saved — lessons, visuals, comics, and quizzes.',
      tint: 'bg-slate-100',
      iconColor: 'text-slate-600',
      accentColor: 'text-slate-600',
    },
    {
      to: '/collaborate',
      icon: Users,
      title: 'Collaboration',
      description: 'Join a study room, share material, and quiz together with classmates.',
      tint: 'bg-teal-50',
      iconColor: 'text-teal-600',
      accentColor: 'text-teal-600',
    },
  ];

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DashboardHeader name={user?.name} role="student" />
      <TileGrid tiles={tiles} />
    </div>
  );
}

function TeacherDashboard({ user }) {
  const tiles = [
    {
      to: '/classroom',
      icon: ClipboardList,
      title: 'Create Homework',
      description: 'Build assignments from AMIVI, AMICO, or a quiz, and assign them to your class.',
      tint: 'bg-amber-50',
      iconColor: 'text-amber-600',
      accentColor: 'text-amber-600',
    },
    {
      to: '/amivi',
      icon: Palette,
      title: 'AMIVI Visuals',
      description: 'Turn your teaching material into visual lessons students can follow.',
      tint: 'bg-blue-50',
      iconColor: 'text-blue-600',
      accentColor: 'text-blue-600',
    },
    {
      to: '/amico',
      icon: BookOpen,
      title: 'AMICO Comics',
      description: 'Create educational comics that make difficult topics click.',
      tint: 'bg-pink-50',
      iconColor: 'text-pink-600',
      accentColor: 'text-pink-600',
    },
    {
      to: '/quiz',
      icon: Puzzle,
      title: 'Quizzes',
      description: 'Generate quizzes from the topics you teach, ready to assign.',
      tint: 'bg-purple-50',
      iconColor: 'text-purple-600',
      accentColor: 'text-purple-600',
    },
    {
      to: '/classroom',
      icon: BarChart3,
      title: 'Student Progress',
      description: 'See who’s completed homework, their scores, and their history.',
      tint: 'bg-teal-50',
      iconColor: 'text-teal-600',
      accentColor: 'text-teal-600',
    },
    {
      to: '/collaborate',
      icon: Users,
      title: 'Collaboration',
      description: 'Run a live study room — shared material, chat, and a shared quiz.',
      tint: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      accentColor: 'text-indigo-600',
    },
  ];

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DashboardHeader name={user?.name} role="teacher" />
      <TileGrid tiles={tiles} />
    </div>
  );
}
