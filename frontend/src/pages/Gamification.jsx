import { Link } from 'react-router-dom';
import {
  Star,
  BarChart3,
  Trophy,
  Target,
  Shield,
  Flame,
  Crown,
  BookOpen,
  Users,
  Lightbulb,
  Medal,
  ArrowRight,
  ArrowUpRight,
  Box,
  Bot,
  FileText,
  Home,
  Sparkles,
} from 'lucide-react';

// ============================================================
// GAMIFICATION — points, badges, challenges, and a leaderboard.
// Built to match the approved mockup: a hero header with the
// Visual Pursuit brand, a unified stat-tile row, a three-column
// progress/badges/leaderboard grid, and a bottom challenges +
// CTA row. Numbers are realistic mock data for "Ankita" (the
// signed-in demo account) until live progress is wired in.
// ============================================================

const STAT_ROW = [
  { key: 'points', icon: Star, color: '#d97706', tint: '#fffbeb', value: '1,250', label: 'Total Points' },
  { key: 'level', icon: BarChart3, color: '#7c3aed', tint: '#f5f3ff', value: 'Level 5', label: 'Next level in 250 points', progress: 65 },
  { key: 'badges', icon: Trophy, color: '#d97706', tint: '#fffbeb', value: '12', label: 'Badges Earned' },
  { key: 'challenges', icon: Target, color: '#db2777', tint: '#fdf2f8', value: '8', label: 'Active Challenges' },
];

const PROGRESS_CATEGORIES = [
  { key: 'quizzes', label: 'Quizzes', pct: 80, icon: FileText, color: '#0d9488', tint: '#f0fdfa' },
  { key: 'amivi', label: 'AMIVI', pct: 60, icon: Box, color: '#2563eb', tint: '#eff6ff' },
  { key: 'amico', label: 'AMICO', pct: 40, icon: Bot, color: '#7c3aed', tint: '#f5f3ff' },
  { key: 'library', label: 'Library', pct: 70, icon: BookOpen, color: '#4f46e5', tint: '#eef2ff' },
  { key: 'homework', label: 'Homework', pct: 50, icon: Home, color: '#d97706', tint: '#fffbeb' },
];

const BADGES = [
  { key: 'quick-learner', label: 'Quick Learner', icon: Star, color: '#d97706', tint: '#fffbeb' },
  { key: 'streak', label: '7-Day Streak', icon: Flame, color: '#0284c7', tint: '#f0f9ff' },
  { key: 'quiz-master', label: 'Quiz Master', icon: Target, color: '#0d9488', tint: '#f0fdfa' },
  { key: 'level-5', label: 'Level 5', icon: Crown, color: '#7c3aed', tint: '#f5f3ff' },
  { key: 'explorer', label: 'Knowledge Explorer', icon: BookOpen, color: '#db2777', tint: '#fdf2f8' },
  { key: 'collaborator', label: 'Collaborator', icon: Users, color: '#ea580c', tint: '#fff7ed' },
  { key: 'thinker', label: 'Critical Thinker', icon: Lightbulb, color: '#2563eb', tint: '#eff6ff' },
  { key: 'champion', label: 'Challenge Champion', icon: Medal, color: '#dc2626', tint: '#fef2f2' },
];

const LEADERBOARD = [
  { rank: 1, name: 'Rohan S.', points: '3,250', color: '#2563eb', isMe: false },
  { rank: 2, name: 'Ankita', points: '2,890', color: '#7c3aed', isMe: true },
  { rank: 3, name: 'Priya M.', points: '2,410', color: '#0d9488', isMe: false },
  { rank: 4, name: 'Arjun K.', points: '2,150', color: '#d97706', isMe: false },
  { rank: 5, name: 'Sneha R.', points: '1,980', color: '#db2777', isMe: false },
];

const RANK_STYLE = {
  1: { bg: '#fef3c7', color: '#b45309' },
  2: { bg: '#e2e8f0', color: '#475569' },
  3: { bg: '#fed7aa', color: '#c2410c' },
};

const CHALLENGES = [
  { key: 'quizzes', title: 'Complete 5 Quizzes', progressText: '3/5 completed', pct: 60, pts: '+100 pts', icon: FileText, color: '#2563eb' },
  { key: 'library', title: 'Read 3 Library Lessons', progressText: '1/3 completed', pct: 33, pts: '+50 pts', icon: BookOpen, color: '#7c3aed' },
  { key: 'streak', title: '7-Day Learning Streak', progressText: '5/7 days', pct: 71, pts: '+150 pts', icon: Flame, color: '#0ca30c' },
];

export default function Gamification() {
  return (
    <div className="py-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div
        className="max-w-5xl mx-auto rounded-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#eef2ff 0%,#f0f7ff 55%,#fdf2f8 100%)' }}
      >
        <div
          className="absolute -top-10 -right-10 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,#c7d2fe55,transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,#fbcfe855,transparent 70%)' }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center relative">
          <div>
            <h1 className="font-extrabold leading-tight text-slate-900" style={{ fontSize: 'clamp(30px,3.6vw,44px)' }}>
              Gamification
            </h1>
            <p className="mt-2 text-lg font-bold text-slate-700">
              Make learning fun, engaging, and rewarding with Visual Pursuit.
            </p>
            <p className="mt-3 text-base font-medium text-slate-500 max-w-md">
              Earn points, unlock badges, complete challenges, and climb the leaderboard as you learn with VLQ.
            </p>
            <img
              src="/vlq-gamification-logo2.png"
              alt="Visual Pursuit"
              className="h-12 sm:h-14 w-auto mt-5"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          <div className="relative flex items-center justify-center">
            <div
              className="absolute top-2 left-0 sm:-left-4 bg-white rounded-xl shadow-md px-3 py-2 flex items-center gap-2 animate-float-reverse z-10"
            >
              <Star className="w-4 h-4 text-amber-500 flex-shrink-0" fill="#f59e0b" />
              <div className="leading-tight">
                <p className="text-sm font-extrabold text-slate-900">+50</p>
                <p className="text-[10px] font-bold text-slate-500">Points</p>
              </div>
            </div>

            <div
              className="absolute top-0 right-2 sm:right-0 rounded-xl shadow-md px-3 py-2 flex items-center gap-1.5 animate-float z-10"
              style={{ background: '#0d9488', color: '#fff' }}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="text-xs font-extrabold whitespace-nowrap">Level Up!</span>
            </div>

            <div
              className="absolute bottom-6 right-0 sm:-right-2 bg-white rounded-xl shadow-md px-3 py-2 flex items-center gap-2 animate-float-reverse z-10"
              style={{ animationDelay: '0.6s' }}
            >
              <Shield className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="#e0e7ff" />
              <span className="text-xs font-extrabold text-slate-900 whitespace-nowrap">New Badge</span>
            </div>

            <img
              src="/vlq-gamification-hero.jpg"
              alt="A learner celebrating with a trophy after earning points"
              className="w-full max-w-[280px] sm:max-w-[320px] h-auto block rounded-2xl"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </div>
      </div>

      {/* Stat row */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x lg:divide-x divide-slate-100">
        {STAT_ROW.map((tile) => {
          const Icon = tile.icon;
          return (
            <div key={tile.key} className="p-5 sm:p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tile.tint }}>
                <Icon className="w-6 h-6" style={{ color: tile.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xl font-extrabold text-slate-900 leading-tight">{tile.value}</p>
                <p className="text-sm font-semibold text-slate-500 leading-tight">{tile.label}</p>
                {tile.progress != null && (
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mt-2">
                    <div className="h-full rounded-full" style={{ width: `${tile.progress}%`, background: tile.color }} />
                  </div>
                )}
              </div>
              {tile.progress == null && <ArrowUpRight className="w-4 h-4 text-slate-300 flex-shrink-0 hidden sm:block" />}
            </div>
          );
        })}
      </div>

      {/* Progress / Badges / Leaderboard */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Your Progress */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h2 className="font-extrabold text-lg text-slate-900">Your Progress</h2>
            </div>
            <span className="text-xs font-bold text-slate-400">This Week</span>
          </div>
          <div className="space-y-4">
            {PROGRESS_CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.key}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: c.tint }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: c.color }} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 flex-1">{c.label}</span>
                    <span className="text-sm font-extrabold text-slate-500">{c.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Badges */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              <h2 className="font-extrabold text-lg text-slate-900">Recent Badges</h2>
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-indigo-600">
              View All <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {BADGES.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.key} className="flex flex-col items-center text-center gap-1.5">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: b.tint }}>
                    <Icon className="w-5 h-5" style={{ color: b.color }} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 leading-tight">{b.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="font-extrabold text-lg text-slate-900">Leaderboard</h2>
            </div>
            <span className="text-xs font-bold text-slate-400">This Month</span>
          </div>
          <div className="space-y-2">
            {LEADERBOARD.map((u) => {
              const rankStyle = RANK_STYLE[u.rank] || { bg: '#f1f5f9', color: '#64748b' };
              return (
                <div
                  key={u.rank}
                  className="flex items-center gap-3 p-2 rounded-xl"
                  style={u.isMe ? { background: '#f5f3ff', border: '1px solid #ddd6fe' } : undefined}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                    style={{ background: rankStyle.bg, color: rankStyle.color }}
                  >
                    {u.rank}
                  </span>
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0"
                    style={{ background: u.color }}
                  >
                    {u.name.charAt(0)}
                  </span>
                  <span className={`text-sm flex-1 truncate ${u.isMe ? 'font-extrabold text-indigo-700' : 'font-bold text-slate-700'}`}>
                    {u.name}
                  </span>
                  <span className="text-sm font-extrabold text-slate-800 flex-shrink-0">{u.points}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Challenges + CTA */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 items-stretch">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <h2 className="font-extrabold text-lg text-slate-900">Active Challenges</h2>
            </div>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-indigo-600">
              View All <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {CHALLENGES.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.key} className="rounded-xl border border-slate-100 p-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${c.color}1a` }}>
                    <Icon className="w-4.5 h-4.5" style={{ color: c.color }} />
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-tight mb-1">{c.title}</p>
                  <p className="text-xs font-semibold text-slate-400 mb-2">{c.progressText}</p>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-2">
                    <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                  </div>
                  <span className="text-xs font-extrabold" style={{ color: '#0ca30c' }}>{c.pts}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-8 flex flex-col justify-center text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#7c3aed 0%,#a21caf 55%,#db2777 100%)' }}
        >
          <Trophy className="w-24 h-24 absolute -bottom-4 -right-4 text-white/10" />
          <Sparkles className="w-5 h-5 absolute top-5 right-6 text-white/40" />
          <h2 className="font-extrabold text-2xl mb-2 relative">Keep Going!</h2>
          <p className="text-sm font-medium text-white/80 mb-5 relative">
            Complete challenges, earn rewards, and reach new milestones.
          </p>
          <Link
            to="/explore"
            className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-purple-700 rounded-xl font-bold hover:-translate-y-0.5 hover:shadow-lg transition-all whitespace-nowrap w-fit"
          >
            Explore Challenges <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
