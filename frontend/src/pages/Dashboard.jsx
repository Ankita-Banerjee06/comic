import { Trophy, TrendingUp, BookOpen, Video as VideoIcon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Welcome banner */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white rounded-4xl p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 text-[120px] opacity-10 leading-none select-none pointer-events-none">🎓</div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black mb-2">Welcome back! 👋</h1>
          <p className="text-blue-100 font-bold text-lg mb-6">You've learned 14 new concepts this week. Keep it up! 🔥</p>
          <Link to="/amivi" className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-black py-3 px-6 rounded-2xl hover:scale-105 transition-transform shadow-lg">
            <span>Resume Learning</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard emoji="🔥" title="Day Streak" value="12 Days"  trend="+2 days" color="from-orange-400 to-red-400" />
        <StatCard emoji="⭐" title="Total XP"   value="2,450"    trend="Top 15%" color="from-yellow-400 to-orange-400" />
        <StatCard emoji="📚" title="Comics Read" value="34"      trend="12 this month" color="from-pink-400 to-purple-400" />
        <StatCard emoji="🎬" title="Visuals"    value="128"      trend="45 hours total" color="from-blue-400 to-cyan-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Continue learning */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-800">Continue Learning 🚀</h2>
            <Link to="/library" className="text-blue-600 font-bold hover:text-blue-800 transition-colors text-sm">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ProjectCard title="Photosynthesis Journey" type="AMICO Comic" progress={75} emoji="🌿" color="bg-green-500" />
            <ProjectCard title="Quantum Mechanics 101"  type="AMIVI Visuals" progress={30} emoji="⚛️" color="bg-blue-500" />
            <ProjectCard title="World War II Timeline" type="Quiz" progress={0} emoji="🏛️" color="bg-red-500" />
            <ProjectCard title="Advanced Calculus"     type="AMIVI Video" progress={100} emoji="📐" color="bg-purple-500" />
          </div>
        </div>

        {/* Quick launch + daily goals */}
        <div className="space-y-5">
          <div className="bg-white rounded-4xl border-2 border-gray-100 shadow-xl p-6">
            <h2 className="text-xl font-black text-gray-800 mb-5">Quick Launch 🚀</h2>
            <div className="space-y-3">
              <Link to="/amivi" className="flex items-center gap-3 w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black py-3 px-5 rounded-2xl hover:scale-105 transition-transform shadow-md">
                <span className="text-2xl">🎨</span> AMIVI Studio
              </Link>
              <Link to="/amico" className="flex items-center gap-3 w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black py-3 px-5 rounded-2xl hover:scale-105 transition-transform shadow-md">
                <span className="text-2xl">📚</span> AMICO Comics
              </Link>
              <Link to="/quiz" className="flex items-center gap-3 w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black py-3 px-5 rounded-2xl hover:scale-105 transition-transform shadow-md">
                <span className="text-2xl">🧩</span> Take a Quiz
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-4xl border-2 border-gray-100 shadow-xl p-6">
            <h2 className="text-xl font-black text-gray-800 mb-5">Daily Goals 🎯</h2>
            <div className="space-y-4">
              <GoalItem title="Complete 1 Quiz"      current={0} target={1} color="bg-purple-500" />
              <GoalItem title="Read a Comic Chapter" current={1} target={1} color="bg-pink-500" />
              <GoalItem title="Generate new AMIVI"   current={2} target={3} color="bg-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ emoji, title, value, trend, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} text-white rounded-3xl p-5 shadow-xl card-hover`}>
      <div className="text-4xl mb-3">{emoji}</div>
      <div className="text-sm font-bold text-white/80">{title}</div>
      <div className="text-2xl font-black mt-1">{value}</div>
      <div className="text-xs text-white/60 font-bold mt-1">{trend}</div>
    </div>
  );
}

function ProjectCard({ title, type, progress, emoji, color }) {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-3xl p-5 shadow-lg card-hover group cursor-pointer">
      <div className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-md group-hover:scale-110 transition-transform`}>
        {emoji}
      </div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1">{type}</p>
      <h4 className="font-black text-gray-800 mb-4 text-lg leading-tight">{title}</h4>
      <div className="flex items-center space-x-3">
        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-sm text-gray-500 font-black">{progress}%</span>
      </div>
    </div>
  );
}

function GoalItem({ title, current, target, color }) {
  const isComplete = current >= target;
  return (
    <div>
      <div className="flex justify-between text-sm font-bold mb-2">
        <span className={isComplete ? 'text-gray-400 line-through' : 'text-gray-700'}>{title} {isComplete ? '✅' : ''}</span>
        <span className="text-gray-400">{current}/{target}</span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${isComplete ? 'bg-green-400' : color} rounded-full transition-all`} style={{ width: `${(current / target) * 100}%` }} />
      </div>
    </div>
  );
}
