import { Link } from 'react-router-dom';
import { Users, MessageCircle, BookOpen, Star, ArrowRight, Zap, Globe, Heart, Share2, Award, ChevronRight } from 'lucide-react';

const channels = [
  { emoji: '🌿', title: 'Photosynthesis Study Group', members: 24, active: 3, color: 'from-green-400 to-teal-500', topic: 'Biology' },
  { emoji: '🪐', title: 'Solar System Explorers', members: 18, active: 6, color: 'from-blue-400 to-indigo-500', topic: 'Science' },
  { emoji: '📐', title: 'Calculus Crew', members: 31, active: 1, color: 'from-purple-400 to-pink-500', topic: 'Math' },
  { emoji: '🏛️', title: 'World History Circle', members: 45, active: 8, color: 'from-orange-400 to-red-400', topic: 'History' },
  { emoji: '🧬', title: 'DNA & Genetics Lab', members: 12, active: 2, color: 'from-pink-400 to-rose-500', topic: 'Biology' },
  { emoji: '⚡', title: 'Physics Challenge Room', members: 29, active: 5, color: 'from-yellow-400 to-orange-500', topic: 'Physics' },
];

const liveActivity = [
  { user: 'Zara K.', action: 'shared a visual on Gravity', time: '2 min ago', avatar: '👩🏽', color: 'bg-blue-100 text-blue-700' },
  { user: 'Roh A.', action: 'solved the Photosynthesis quiz', time: '5 min ago', avatar: '🧑🏻', color: 'bg-green-100 text-green-700' },
  { user: 'Lucas M.', action: 'created an AMICO comic', time: '9 min ago', avatar: '👨🏾', color: 'bg-purple-100 text-purple-700' },
  { user: 'Mia T.', action: 'started a group challenge', time: '14 min ago', avatar: '👩🏻', color: 'bg-pink-100 text-pink-700' },
];

const features = [
  { icon: <MessageCircle className="w-7 h-7" />, title: 'Group Discussions', desc: 'Share visuals, comics and ideas with your study group.', color: 'bg-blue-500' },
  { icon: <Globe className="w-7 h-7" />, title: 'Global Learners', desc: 'Connect with learners from around the world.', color: 'bg-teal-500' },
  { icon: <Award className="w-7 h-7" />, title: 'Team Challenges', desc: 'Compete as a group and win badges together.', color: 'bg-purple-500' },
  { icon: <Share2 className="w-7 h-7" />, title: 'Share Creations', desc: 'Share your AMIVI visuals and AMICO comics instantly.', color: 'bg-pink-500' },
];

export default function CollaborativeLearning() {
  return (
    <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#7c3aed] text-white rounded-[40px] p-10 shadow-2xl overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"/>
        <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full bg-purple-400/20 blur-2xl pointer-events-none"/>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 rounded-full px-5 py-2 text-sm font-bold mb-5 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              147 Learners Active Now
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight tracking-tight">
              Collaborative<br/>Learning 🤝
            </h1>
            <p className="text-blue-100 font-semibold text-lg max-w-lg leading-relaxed">
              Join study groups, share visual creations and learn together. Learning is more fun when you're not alone!
            </p>
          </div>
          <div className="flex flex-col gap-3 min-w-max">
            <button className="flex items-center gap-3 px-7 py-3.5 bg-white text-[#1d4ed8] rounded-2xl font-black text-base hover:-translate-y-1 hover:shadow-lg transition-all shadow-md">
              <Users className="w-5 h-5" /> Create a Group
            </button>
            <button className="flex items-center gap-3 px-7 py-3.5 bg-white/15 border-2 border-white/40 text-white rounded-2xl font-black text-base hover:bg-white/25 transition-colors backdrop-blur-sm">
              <Globe className="w-5 h-5" /> Browse Groups
            </button>
          </div>
        </div>
      </div>

      {/* Feature tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map(f => (
          <div key={f.title} className="bg-white rounded-3xl p-6 shadow-lg border-2 border-gray-100 card-hover flex flex-col gap-4">
            <div className={`${f.color} text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-md`}>
              {f.icon}
            </div>
            <div>
              <div className="font-black text-gray-800 text-base mb-1">{f.title}</div>
              <div className="text-sm text-gray-500 font-semibold leading-snug">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Study Channels */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-black text-gray-800">📚 Study Channels</h2>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">View all →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {channels.map(ch => (
              <div key={ch.title} className="bg-white border-2 border-gray-100 rounded-[28px] overflow-hidden shadow-lg card-hover group cursor-pointer">
                <div className={`bg-gradient-to-br ${ch.color} h-28 flex items-center justify-center text-6xl relative`}>
                  {ch.emoji}
                  <div className="absolute top-3 right-3 bg-white/25 backdrop-blur-sm text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    {ch.topic}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-black text-gray-800 text-base mb-2 group-hover:text-blue-600 transition-colors leading-snug">{ch.title}</h3>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold">
                      <Users className="w-4 h-4" /> {ch.members} members
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-green-600">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      {ch.active} online
                    </div>
                  </div>
                  <button className="mt-4 w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black rounded-xl text-sm hover:scale-105 transition-transform shadow-sm">
                    Join Group
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div>
          <h2 className="text-2xl font-black text-gray-800 mb-5">⚡ Live Activity</h2>
          <div className="bg-white border-2 border-gray-100 rounded-[28px] p-6 shadow-lg space-y-5">
            {liveActivity.map(a => (
              <div key={a.user} className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">{a.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 leading-snug">
                    <span className="font-black">{a.user}</span> {a.action}
                  </p>
                  <div className={`inline-block mt-1 text-xs font-bold px-3 py-0.5 rounded-full ${a.color}`}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Challenge card */}
          <div className="mt-5 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-[28px] p-6 shadow-xl text-white">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="font-black text-xl mb-2">Weekly Challenge</h3>
            <p className="text-yellow-100 font-semibold text-sm mb-4 leading-snug">
              Create a Visual on "The Water Cycle" and get the most group likes this week!
            </p>
            <div className="flex justify-between items-center">
              <div className="text-sm font-bold text-yellow-100">Ends in <span className="text-white font-black">3 days</span></div>
              <button className="bg-white text-orange-600 font-black text-sm px-4 py-2 rounded-xl hover:scale-105 transition-transform shadow-sm">
                Join <ChevronRight className="w-4 h-4 inline" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
