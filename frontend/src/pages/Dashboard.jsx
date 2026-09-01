import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  School,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getMyClassrooms } from '../services/api';

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

// ============================================================
// YOUR CLASSROOMS (real-account view of the code-based Classroom
// feature) — every classroom this account has been linked to via
// creating/joining a classroom, or logging in with a teacher/
// student code, while signed in. Clicking one drops straight into
// it on the Classroom page without re-entering any code.
// ============================================================

function ClassroomsPanel({ role }) {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyClassrooms()
      .then((data) => setClassrooms(data.classrooms || []))
      .catch((err) => setError(err?.message || 'Unable to load your classrooms.'))
      .finally(() => setLoading(false));
  }, []);

  const openClassroom = (c) => {
    navigate('/classroom', {
      state: {
        enterAs: {
          classCode: c.class_code,
          memberToken: c.member_token,
          memberId: c.member_id,
          displayName: c.display_name,
          role: c.role,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-center py-10">
        <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
      </div>
    );
  }

  // Quietly say nothing rather than surface a scary error on the
  // dashboard's first paint — the Classroom page itself will show
  // the real error if the person goes looking there.
  if (error) return null;

  if (!classrooms || classrooms.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-bold text-slate-900 mb-1">Your classrooms</h2>
          <p className="text-sm text-slate-700 font-medium">
            {role === 'teacher'
              ? "You haven't created a classroom with this account yet."
              : "You haven't joined a classroom with this account yet."}
          </p>
        </div>
        <Link
          to="/classroom"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm text-white bg-slate-800 hover:bg-slate-700 transition-colors shrink-0"
        >
          {role === 'teacher' ? 'Create a classroom' : 'Join a classroom'} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
        <School className="w-4.5 h-4.5 text-slate-500" /> Your classrooms
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {classrooms.map((c) => (
          <button
            key={c.classroom_id}
            onClick={() => openClassroom(c)}
            className="text-left border border-slate-100 rounded-xl px-4 py-3 hover:border-teal-200 hover:bg-teal-50/40 transition-colors"
          >
            <p className="font-bold text-slate-800 text-sm truncate">{c.name}</p>
            <p className="text-xs text-slate-600 font-semibold truncate mb-2">{c.subject || 'No subject set'}</p>
            <p className="text-xs font-bold text-slate-700">
              {c.role === 'teacher'
                ? `${c.student_count ?? 0} student${c.student_count === 1 ? '' : 's'} · ${c.assignment_count} assignment${c.assignment_count === 1 ? '' : 's'}`
                : `${c.assignment_count} assignment${c.assignment_count === 1 ? '' : 's'}`}
            </p>
          </button>
        ))}
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
      <p className="text-slate-700 font-medium text-sm mb-4 flex-1">{description}</p>
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
      <ClassroomsPanel role="student" />
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
      <ClassroomsPanel role="teacher" />
      <TileGrid tiles={tiles} />
    </div>
  );
}
