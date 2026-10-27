import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  School,
  Heart,
  LogIn,
  UserPlus,
  LayoutDashboard,
  KeyRound,
  ClipboardList,
  Palette,
  BookOpen,
  Puzzle,
  PlayCircle,
  Archive,
  Users,
  BarChart3,
  Repeat,
  ArrowRight,
  MessageCircleQuestion,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// ============================================================
// HELP / GETTING STARTED — a role-based "where do I go, what do
// I do" map for someone brand new to the platform. No screenshots
// (those go stale the moment a page changes); instead every step
// is a clearly numbered card with an icon and, where there's a
// real page behind it, a button straight to that page.
// ============================================================

function RoleTab({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 rounded-2xl font-extrabold text-lg transition-all ${
        active
          ? 'bg-indigo-600 text-white shadow-md'
          : 'bg-white text-black border border-slate-200 hover:border-indigo-300'
      }`}
    >
      <Icon className="w-6 h-6" />
      {label}
    </button>
  );
}

function GuideStep({ n, icon: Icon, tint, iconColor, title, children, to, cta }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex gap-5">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-12 h-12 rounded-xl ${tint} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <span className="mt-2 text-sm font-extrabold text-black">{n}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-extrabold text-black mb-1">{title}</h3>
        <p className="text-base text-black font-medium mb-3">{children}</p>
        {to && (
          <Link
            to={to}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            {cta || 'Go there now'} <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

function StudentGuide() {
  return (
    <div className="space-y-4">
      <GuideStep n={1} icon={UserPlus} tint="bg-indigo-50" iconColor="text-indigo-600" title="Create your account" to="/register" cta="Go to Sign up">
        Sign up and choose <strong>Student</strong> when it asks who you are. Already have an account? Just log in instead.
      </GuideStep>
      <GuideStep n={2} icon={KeyRound} tint="bg-amber-50" iconColor="text-amber-600" title="Join your teacher's classroom" to="/classroom" cta="Go to Classroom">
        Ask your teacher for their class code, then use "Join a classroom" on the Classroom page. This is how homework reaches you.
      </GuideStep>
      <GuideStep n={3} icon={LayoutDashboard} tint="bg-slate-100" iconColor="text-black" title="Find everything from your Dashboard" to="/dashboard" cta="Go to Dashboard">
        After you log in you land here. It has a tile for Homework, AMIVI Lessons, Quizzes, AMICO Comics, Library, and Collaboration — pick one to open it.
      </GuideStep>
      <GuideStep n={4} icon={ClipboardList} tint="bg-amber-50" iconColor="text-amber-600" title="Do the homework your teacher assigned" to="/classroom" cta="Go to Classroom">
        Open the Homework tile (or Classroom). Each assignment shows what's attached — Visuals, a Comic, and/or a Quiz — and a button to start it.
      </GuideStep>
      <GuideStep n={5} icon={Palette} tint="bg-blue-50" iconColor="text-blue-600" title="Turn any topic into a visual lesson" to="/amivi" cta="Go to AMIVI">
        Type a topic, paste text, or upload a file/link in AMIVI and it turns it into simple image-and-slogan cards you can flip through.
      </GuideStep>
      <GuideStep n={6} icon={BookOpen} tint="bg-pink-50" iconColor="text-pink-600" title="Turn a lesson into a comic" to="/amico" cta="Go to AMICO">
        From an AMIVI lesson, use "Send to AMICO" to turn it into a comic story. You can add your own twist so your comic is different from anyone else's.
      </GuideStep>
      <GuideStep n={7} icon={Puzzle} tint="bg-purple-50" iconColor="text-purple-600" title="Test yourself with a quiz" to="/quiz" cta="Go to Quiz">
        Generate a quiz on anything you're learning, or take one your teacher attached to homework, and see your score right away.
      </GuideStep>
      <GuideStep n={8} icon={Archive} tint="bg-slate-100" iconColor="text-black" title="Find everything you've made before" to="/library" cta="Go to Library">
        Every lesson, comic, and quiz you create is saved here automatically — open it again any time without starting over.
      </GuideStep>
    </div>
  );
}

function TeacherGuide() {
  return (
    <div className="space-y-4">
      <GuideStep n={1} icon={UserPlus} tint="bg-indigo-50" iconColor="text-indigo-600" title="Create your account" to="/register" cta="Go to Sign up">
        Sign up and choose <strong>Teacher</strong> when it asks who you are. Already signed up as a student? Use "Switch to Teacher view" in the account menu (top right) instead of making a second account.
      </GuideStep>
      <GuideStep n={2} icon={School} tint="bg-teal-50" iconColor="text-teal-600" title="Create your classroom" to="/classroom" cta="Go to Classroom">
        Use "Create a classroom" to get a class code. Share that code with your students so they can join from their own account.
      </GuideStep>
      <GuideStep n={3} icon={LayoutDashboard} tint="bg-slate-100" iconColor="text-black" title="Find everything from your Dashboard" to="/dashboard" cta="Go to Dashboard">
        After you log in you land here. It has a tile for Create Homework, AMIVI Visuals, AMICO Comics, Quizzes, Student Progress, and Collaboration.
      </GuideStep>
      <GuideStep n={4} icon={Palette} tint="bg-blue-50" iconColor="text-blue-600" title="Build your lesson material" to="/amivi" cta="Go to AMIVI">
        Paste your teaching material, a file, or a link into AMIVI to turn it into simple visual lesson cards your students can follow at a glance.
      </GuideStep>
      <GuideStep n={5} icon={PlayCircle} tint="bg-indigo-50" iconColor="text-indigo-600" title="Present it in class" to="/amivi" cta="Go to AMIVI">
        Open any AMIVI lesson and use "Classroom Mode" to show it full-screen, one card at a time, as you teach.
      </GuideStep>
      <GuideStep n={6} icon={BookOpen} tint="bg-pink-50" iconColor="text-pink-600" title="Turn it into a comic (optional)" to="/amico" cta="Go to AMICO">
        Send an AMIVI lesson to AMICO to generate an educational comic version of the same material.
      </GuideStep>
      <GuideStep n={7} icon={Puzzle} tint="bg-purple-50" iconColor="text-purple-600" title="Generate a quiz (optional)" to="/quiz" cta="Go to Quiz">
        Create a quiz on the topic you're teaching if you want students' homework to be auto-graded with a score.
      </GuideStep>
      <GuideStep n={8} icon={ClipboardList} tint="bg-amber-50" iconColor="text-amber-600" title="Assign homework" to="/classroom" cta="Go to Classroom">
        In Classroom, attach a Quiz and/or Visuals and/or a Comic (a Quiz isn't required), give it a title and due date, and hit Assign.
      </GuideStep>
      <GuideStep n={9} icon={BarChart3} tint="bg-teal-50" iconColor="text-teal-600" title="Track how your class is doing" to="/classroom" cta="Go to Classroom">
        Each assignment shows who's completed it and their results, right from the Classroom page.
      </GuideStep>
      <GuideStep n={10} icon={Archive} tint="bg-slate-100" iconColor="text-black" title="Reuse what you've already made" to="/library" cta="Go to Library">
        Everything you create is saved in your Library, so you can reuse it in a new classroom or assignment without regenerating it.
      </GuideStep>
    </div>
  );
}

function ParentGuide() {
  return (
    <div className="space-y-4">
      <GuideStep n={1} icon={Heart} tint="bg-rose-50" iconColor="text-rose-600" title="What this platform is">
        VLQ turns whatever your child is learning into simple visuals (AMIVI), comics (AMICO), and quizzes — the idea is to make lessons click faster by showing, not just telling.
      </GuideStep>
      <GuideStep n={2} icon={ClipboardList} tint="bg-amber-50" iconColor="text-amber-600" title="How homework works">
        Their teacher creates a classroom and assigns homework — usually a visual lesson, a comic, and/or a quiz. Your child joins with a class code their teacher gives them and completes it from their own account.
      </GuideStep>
      <GuideStep n={3} icon={Repeat} tint="bg-indigo-50" iconColor="text-indigo-600" title="There's no separate parent login yet">
        Right now accounts are Student or Teacher only. To see how your child is doing, the best source is their teacher (results and progress are visible on the teacher's side) or looking over their shoulder in their own Student account.
      </GuideStep>
      <GuideStep n={4} icon={MessageCircleQuestion} tint="bg-slate-100" iconColor="text-black" title="How to help at home">
        Ask your child to explain what their visual lesson or comic was about in their own words — that's usually the fastest way to tell if a topic has really sunk in. If a quiz score was low, they can simply retake it.
      </GuideStep>
      <GuideStep n={5} icon={Users} tint="bg-teal-50" iconColor="text-teal-600" title="Questions?">
        For anything specific to your child's class, schedule, or grades, your first stop should always be their teacher — they can see exactly what's been assigned and how it went.
      </GuideStep>
    </div>
  );
}

export default function Help() {
  const { user, isAuthenticated } = useAuth();
  const defaultTab = isAuthenticated && user?.role === 'teacher' ? 'teacher' : 'student';
  const [tab, setTab] = useState(defaultTab);

  return (
    <div className="space-y-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div
        className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-5 sm:p-8 text-white"
        style={{ minHeight: 140 }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(120deg, #1e1b4b 0%, #3730a3 60%, #6366f1 130%)' }}
        />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-xs font-bold mb-4">
            <GraduationCap className="w-4 h-4" /> Getting started
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">New here? Start on this page.</h1>
          <p className="text-white/90 font-medium max-w-xl">
            Pick who you are below for a simple, step-by-step map of where to go and what to do first.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <RoleTab active={tab === 'student'} onClick={() => setTab('student')} icon={GraduationCap} label="I'm a Student" />
        <RoleTab active={tab === 'teacher'} onClick={() => setTab('teacher')} icon={School} label="I'm a Teacher" />
        <RoleTab active={tab === 'parent'} onClick={() => setTab('parent')} icon={Heart} label="I'm a Parent" />
      </div>

      {!isAuthenticated && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 flex-wrap">
          <LogIn className="w-5 h-5 text-amber-700 flex-shrink-0" />
          <p className="text-base font-semibold text-black">
            Not signed in yet? Most steps below need an account — start with Sign up or Log in.
          </p>
          <Link to="/register" className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
            Sign up <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {tab === 'student' && <StudentGuide />}
      {tab === 'teacher' && <TeacherGuide />}
      {tab === 'parent' && <ParentGuide />}
    </div>
  );
}
