import { Trophy, TrendingUp, BookOpen, Video as VideoIcon, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end bg-gradient-to-r from-cyan-900/40 to-fuchsia-900/40 p-8 rounded-3xl border border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Alex! 👋</h1>
          <p className="text-gray-400 max-w-lg">You've learned 14 new concepts this week. Keep up the great momentum!</p>
        </div>
        <button className="mt-6 md:mt-0 px-6 py-2.5 bg-white text-gray-950 font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg">
          Resume Last Course
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Trophy className="text-yellow-400" />} title="Current Streak" value="12 Days" trend="+2 from last week" />
        <StatCard icon={<TrendingUp className="text-emerald-400" />} title="Total XP" value="2,450" trend="Top 15% of learners" />
        <StatCard icon={<BookOpen className="text-cyan-400" />} title="Comics Read" value="34" trend="12 this month" />
        <StatCard icon={<VideoIcon className="text-fuchsia-400" />} title="Visuals Watched" value="128" trend="45 hours total" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Projects / Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Continue Learning</h2>
            <Link to="/library" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">View all</Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ProjectCard title="Photosynthesis Journey" type="AMICO Comic" progress={75} image="https://dummyimage.com/400x200/15803d/ffffff.png&text=Bio+Comic" />
            <ProjectCard title="Quantum Mechanics 101" type="AMIVI Visuals" progress={30} image="https://dummyimage.com/400x200/4338ca/ffffff.png&text=Physics+Visuals" />
            <ProjectCard title="World War II Timeline" type="Interactive Quiz" progress={0} image="https://dummyimage.com/400x200/b91c1c/ffffff.png&text=History+Quiz" />
            <ProjectCard title="Advanced Calculus" type="AMIVI Video" progress={100} image="https://dummyimage.com/400x200/0f766e/ffffff.png&text=Math+Video" />
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
            <h2 className="text-lg font-bold text-white mb-4">Daily Goals</h2>
            <div className="space-y-4">
              <GoalItem title="Complete 1 Quiz" current={0} target={1} />
              <GoalItem title="Read a Comic Chapter" current={1} target={1} />
              <GoalItem title="Generate new AMIVI" current={2} target={3} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, title, value, trend }) {
  return (
    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 flex items-start space-x-4">
      <div className="p-3 bg-gray-800 rounded-xl">{icon}</div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        <p className="text-xs text-gray-500 mt-1">{trend}</p>
      </div>
    </div>
  );
}

function ProjectCard({ title, type, progress, image }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden group cursor-pointer hover:border-gray-600 transition-colors">
      <div className="h-32 bg-gray-800 relative overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold text-cyan-400 mb-1">{type}</p>
        <h4 className="font-bold text-white mb-3 truncate">{title}</h4>
        
        <div className="flex items-center space-x-3">
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-xs text-gray-500 font-medium">{progress}%</span>
        </div>
      </div>
    </div>
  );
}

function GoalItem({ title, current, target }) {
  const isComplete = current >= target;
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className={isComplete ? 'text-gray-500 line-through' : 'text-gray-300'}>{title}</span>
        <span className="text-gray-500">{current}/{target}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${isComplete ? 'bg-emerald-500' : 'bg-fuchsia-500'}`} style={{ width: `${(current/target)*100}%` }}></div>
      </div>
    </div>
  );
}
