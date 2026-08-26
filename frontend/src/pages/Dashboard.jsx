import { Flame, Star, BookOpen, Clapperboard, ArrowRight, Palette, Puzzle, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Welcome banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ minHeight: 200, background: '#eff6ff' }}>
        <img
          src="/vlq-gen-dashboard.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(15,23,42,0.6)' }}
        />
        <div className="relative z-10 p-7 md:p-9">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">Welcome back!</h1>
          <p className="text-white/90 font-medium mb-6">You've learned 14 new concepts this week. Keep it up.</p>
          <Link to="/amivi" className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold py-2.5 px-5 rounded-xl hover:-translate-y-0.5 transition-transform shadow-sm text-sm">
            <span>Resume learning</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Flame} title="Day streak" value="12 days" trend="+2 days this week" tint="bg-orange-50" iconColor="text-orange-500" />
        <StatCard icon={Star} title="Total XP" value="2,450" trend="Top 15%" tint="bg-yellow-50" iconColor="text-yellow-500" />
        <StatCard icon={BookOpen} title="Comics read" value="34" trend="12 this month" tint="bg-pink-50" iconColor="text-pink-500" />
        <StatCard icon={Clapperboard} title="Visuals made" value="128" trend="45 hours total" tint="bg-blue-50" iconColor="text-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue learning */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Continue learning</h2>
            <Link to="/library" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors text-sm">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProjectCard title="Photosynthesis Journey" type="AMICO comic" progress={75} icon={BookOpen} tint="bg-green-50" iconColor="text-green-600" bar="bg-green-500" />
            <ProjectCard title="Quantum Mechanics 101" type="AMIVI visuals" progress={30} icon={Clapperboard} tint="bg-blue-50" iconColor="text-blue-600" bar="bg-blue-500" />
            <ProjectCard title="World War II Timeline" type="Quiz" progress={0} icon={Puzzle} tint="bg-red-50" iconColor="text-red-600" bar="bg-red-500" />
            <ProjectCard title="Advanced Calculus" type="AMIVI video" progress={100} icon={Clapperboard} tint="bg-purple-50" iconColor="text-purple-600" bar="bg-purple-500" />
          </div>
        </div>

        {/* Quick launch + daily goals */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-base font-bold text-slate-900 mb-4">Quick launch</h2>
            <div className="space-y-2.5">
              <Link to="/amivi" className="flex items-center gap-3 w-full bg-blue-50 text-blue-700 font-bold py-3 px-4 rounded-xl hover:bg-blue-100 transition-colors text-sm">
                <Palette className="w-5 h-5" /> AMIVI Studio
              </Link>
              <Link to="/amico" className="flex items-center gap-3 w-full bg-pink-50 text-pink-700 font-bold py-3 px-4 rounded-xl hover:bg-pink-100 transition-colors text-sm">
                <BookOpen className="w-5 h-5" /> AMICO Comics
              </Link>
              <Link to="/quiz" className="flex items-center gap-3 w-full bg-purple-50 text-purple-700 font-bold py-3 px-4 rounded-xl hover:bg-purple-100 transition-colors text-sm">
                <Puzzle className="w-5 h-5" /> Take a quiz
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-slate-400" /> Daily goals</h2>
            <div className="space-y-3.5">
              <GoalItem title="Complete 1 quiz" current={0} target={1} color="bg-purple-500" />
              <GoalItem title="Read a comic chapter" current={1} target={1} color="bg-pink-500" />
              <GoalItem title="Generate new AMIVI" current={2} target={3} color="bg-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, trend, tint, iconColor }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className={`w-10 h-10 ${tint} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="text-xs font-semibold text-slate-500">{title}</div>
      <div className="text-xl font-extrabold text-slate-900 mt-0.5">{value}</div>
      <div className="text-xs text-slate-400 font-medium mt-1">{trend}</div>
    </div>
  );
}

function ProjectCard({ title, type, progress, icon: Icon, tint, iconColor, bar }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
      <div className={`w-11 h-11 ${tint} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{type}</p>
      <h4 className="font-bold text-slate-800 mb-4 leading-tight">{title}</h4>
      <div className="flex items-center space-x-3">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${bar} rounded-full transition-all duration-500`} style={{ width: `${progress}%` }} />
        </div>
        <span className="text-xs text-slate-500 font-bold">{progress}%</span>
      </div>
    </div>
  );
}

function GoalItem({ title, current, target, color }) {
  const isComplete = current >= target;
  return (
    <div>
      <div className="flex justify-between text-sm font-semibold mb-1.5">
        <span className={isComplete ? 'text-slate-400 line-through' : 'text-slate-700'}>{title}</span>
        <span className="text-slate-400">{current}/{target}</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${isComplete ? 'bg-green-400' : color} rounded-full transition-all`} style={{ width: `${(current / target) * 100}%` }} />
      </div>
    </div>
  );
}
