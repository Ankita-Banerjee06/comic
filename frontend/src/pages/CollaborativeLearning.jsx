import { Users, MessageCircle, Globe, Award, Share2, ChevronRight, Leaf, Orbit, Ruler, Landmark, Dna, Zap, Trophy } from 'lucide-react';

const channels = [
  { icon: Leaf, title: 'Photosynthesis Study Group', members: 24, active: 3, tint: 'bg-green-50', iconColor: 'text-green-600', topic: 'Biology' },
  { icon: Orbit, title: 'Solar System Explorers', members: 18, active: 6, tint: 'bg-blue-50', iconColor: 'text-blue-600', topic: 'Science' },
  { icon: Ruler, title: 'Calculus Crew', members: 31, active: 1, tint: 'bg-purple-50', iconColor: 'text-purple-600', topic: 'Math' },
  { icon: Landmark, title: 'World History Circle', members: 45, active: 8, tint: 'bg-orange-50', iconColor: 'text-orange-600', topic: 'History' },
  { icon: Dna, title: 'DNA & Genetics Lab', members: 12, active: 2, tint: 'bg-pink-50', iconColor: 'text-pink-600', topic: 'Biology' },
  { icon: Zap, title: 'Physics Challenge Room', members: 29, active: 5, tint: 'bg-yellow-50', iconColor: 'text-yellow-600', topic: 'Physics' },
];

const liveActivity = [
  { user: 'Zara K.', action: 'shared a visual on Gravity', time: '2 min ago' },
  { user: 'Roh A.', action: 'solved the Photosynthesis quiz', time: '5 min ago' },
  { user: 'Lucas M.', action: 'created an AMICO comic', time: '9 min ago' },
  { user: 'Mia T.', action: 'started a group challenge', time: '14 min ago' },
];

const features = [
  { icon: MessageCircle, title: 'Group discussions', desc: 'Share visuals, comics and ideas with your study group.', tint: 'bg-blue-50', iconColor: 'text-blue-600' },
  { icon: Globe, title: 'Global learners', desc: 'Connect with learners from around the world.', tint: 'bg-teal-50', iconColor: 'text-teal-600' },
  { icon: Award, title: 'Team challenges', desc: 'Compete as a group and win badges together.', tint: 'bg-purple-50', iconColor: 'text-purple-600' },
  { icon: Share2, title: 'Share creations', desc: 'Share your AMIVI visuals and AMICO comics instantly.', tint: 'bg-pink-50', iconColor: 'text-pink-600' },
];

export default function CollaborativeLearning() {
  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-8 text-white" style={{ minHeight: 200, background: '#eef2ff' }}>
        <img
          src="/vlq-collab-hero.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(30,27,75,0.62)' }}
        />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-xs font-bold mb-4">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
              147 learners active now
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">
              Collaborative learning
            </h1>
            <p className="text-white/90 font-medium max-w-lg">
              Join study groups, share visual creations and learn together.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-w-max">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all">
              <Users className="w-4 h-4" /> Create a group
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/25 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-colors">
              <Globe className="w-4 h-4" /> Browse groups
            </button>
          </div>
        </div>
      </div>

      {/* Feature tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map(f => (
          <div key={f.title} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className={`${f.tint} w-11 h-11 rounded-xl flex items-center justify-center`}>
              <f.icon className={`w-5 h-5 ${f.iconColor}`} />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-sm mb-1">{f.title}</div>
              <div className="text-xs text-slate-500 font-medium leading-snug">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Channels */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900">Study channels</h2>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">View all →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {channels.map(ch => (
              <div key={ch.title} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                <div className={`${ch.tint} h-24 flex items-center justify-center relative`}>
                  <ch.icon className={`w-9 h-9 ${ch.iconColor}`} />
                  <div className="absolute top-2.5 right-2.5 bg-white/80 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {ch.topic}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 text-sm mb-2 group-hover:text-blue-600 transition-colors leading-snug">{ch.title}</h3>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <Users className="w-3.5 h-3.5" /> {ch.members} members
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      {ch.active} online
                    </div>
                  </div>
                  <button className="mt-3 w-full py-2 bg-blue-50 text-blue-700 font-bold rounded-lg text-sm hover:bg-blue-100 transition-colors">
                    Join group
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Live activity</h2>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            {liveActivity.map(a => (
              <div key={a.user} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-slate-500">{a.user.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 leading-snug">
                    <span className="font-bold text-slate-900">{a.user}</span> {a.action}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Challenge card */}
          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <Trophy className="w-7 h-7 text-amber-500 mb-3" />
            <h3 className="font-bold text-slate-800 mb-1.5">Weekly challenge</h3>
            <p className="text-slate-600 font-medium text-sm mb-4 leading-snug">
              Create a visual on "The Water Cycle" and get the most group likes this week.
            </p>
            <div className="flex justify-between items-center">
              <div className="text-xs font-semibold text-slate-500">Ends in <span className="text-slate-800 font-bold">3 days</span></div>
              <button className="bg-amber-500 text-white font-bold text-sm px-3.5 py-1.5 rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1">
                Join <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
