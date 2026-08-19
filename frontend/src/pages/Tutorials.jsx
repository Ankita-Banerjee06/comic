import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, Star, ArrowRight, CheckCircle2, BookOpen, Video, Layers, Search } from 'lucide-react';

const categories = ['All', 'AMIVI', 'AMICO', 'Quiz', 'Study Tips', 'Getting Started'];

const tutorials = [
  {
    id: 1, emoji: '🎨', title: 'How to Create Your First Visual with AMIVI',
    category: 'AMIVI', duration: '4:30', level: 'Beginner', rating: 4.9, views: '12.4k',
    color: 'from-blue-400 to-blue-600',
    steps: ['Paste your learning text', 'Choose a visual style', 'Let AI generate your visual', 'Download or share'],
    description: 'Learn to turn any text or document into a stunning visual explanation in just a few clicks.'
  },
  {
    id: 2, emoji: '📚', title: 'Creating Comic Stories with AMICO',
    category: 'AMICO', duration: '6:15', level: 'Beginner', rating: 4.8, views: '9.8k',
    color: 'from-pink-400 to-rose-600',
    steps: ['Enter your topic', 'Choose characters', 'Generate comic panels', 'Review and save'],
    description: 'Turn any subject into a memorable multi-panel comic story with AMICO\'s AI engine.'
  },
  {
    id: 3, emoji: '🧩', title: 'Taking Interactive Quizzes Effectively',
    category: 'Quiz', duration: '3:45', level: 'Beginner', rating: 4.7, views: '7.2k',
    color: 'from-purple-400 to-violet-600',
    steps: ['Choose a topic', 'Set difficulty level', 'Answer visual questions', 'Review your score'],
    description: 'Discover how to use the Quiz feature to test your knowledge and track your progress.'
  },
  {
    id: 4, emoji: '🚀', title: 'Getting Started with VLQ — Platform Overview',
    category: 'Getting Started', duration: '8:00', level: 'Beginner', rating: 5.0, views: '21.1k',
    color: 'from-indigo-400 to-blue-600',
    steps: ['Create your account', 'Explore AMIVI, AMICO & Quiz', 'Build your library', 'Track your journey'],
    description: 'Your complete guide to VLQ — what it does, how it works and how to get the most out of it.'
  },
  {
    id: 5, emoji: '🧠', title: 'Advanced AMIVI: Custom Visual Styles',
    category: 'AMIVI', duration: '7:20', level: 'Intermediate', rating: 4.8, views: '5.6k',
    color: 'from-cyan-400 to-teal-600',
    steps: ['Upload a PDF or paste text', 'Select advanced visual mode', 'Customize layout & colours', 'Export and share'],
    description: 'Dive deeper into AMIVI and learn how to customise the visual output to match your subject.'
  },
  {
    id: 6, emoji: '💡', title: 'Study Tips for Visual Learners',
    category: 'Study Tips', duration: '5:50', level: 'All Levels', rating: 4.9, views: '15.3k',
    color: 'from-yellow-400 to-orange-500',
    steps: ['Use images over text', 'Create mind maps', 'Practice with quizzes', 'Review visuals regularly'],
    description: 'Proven visual learning strategies that help you understand, remember and apply knowledge faster.'
  },
];

const levelBadge = {
  'Beginner': 'bg-green-100 text-green-700',
  'Intermediate': 'bg-yellow-100 text-yellow-700',
  'Advanced': 'bg-red-100 text-red-700',
  'All Levels': 'bg-blue-100 text-blue-700',
};

export default function Tutorials() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [featured, setFeatured] = useState(tutorials[3]); // "Getting Started" as default featured

  const filtered = tutorials.filter(t =>
    activeCategory === 'All' || t.category === activeCategory
  );

  return (
    <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#6d28d9] text-white rounded-[40px] p-10 shadow-2xl overflow-hidden">
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none"/>
        <div className="absolute -bottom-10 left-1/4 w-48 h-48 rounded-full bg-purple-400/20 blur-2xl pointer-events-none"/>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 rounded-full px-5 py-2 text-sm font-bold mb-5 backdrop-blur-sm">
              🎬 {tutorials.length} Step-by-Step Tutorials
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight tracking-tight">
              Tutorials 🎬
            </h1>
            <p className="text-blue-100 font-semibold text-lg max-w-lg leading-relaxed">
              Short, clear video-style tutorials that teach you exactly how to use VLQ's visual learning tools.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 backdrop-blur-sm">
              <Video className="w-5 h-5 text-blue-200"/>
              <span className="font-black text-sm">All tutorials are free</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-5 py-3 backdrop-blur-sm">
              <Layers className="w-5 h-5 text-blue-200"/>
              <span className="font-black text-sm">Step-by-step guides</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Tutorial */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-black text-gray-800">⭐ Featured Tutorial</h2>
          <span className="text-sm text-gray-400 font-semibold">Click any tutorial to feature it</span>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 bg-white rounded-[32px] overflow-hidden shadow-xl border-2 border-gray-100">
          {/* Video preview */}
          <div className={`lg:w-1/2 h-64 lg:h-auto bg-gradient-to-br ${featured.color} flex flex-col items-center justify-center relative overflow-hidden cursor-pointer group`}>
            <div className="text-[90px] mb-2 drop-shadow-xl group-hover:scale-110 transition-transform duration-300">{featured.emoji}</div>
            {/* Play button */}
            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <Play className="w-9 h-9 text-gray-800 ml-1" fill="currentColor"/>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/40 text-white text-sm font-black px-3 py-1 rounded-lg backdrop-blur-sm">
              {featured.duration}
            </div>
          </div>
          {/* Info */}
          <div className="lg:w-1/2 p-8 flex flex-col justify-center">
            <div className="flex gap-3 mb-4">
              <span className={`text-xs font-black px-3 py-1.5 rounded-full ${levelBadge[featured.level]}`}>{featured.level}</span>
              <span className="text-xs font-black px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">{featured.category}</span>
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-3 leading-tight">{featured.title}</h2>
            <p className="text-gray-500 font-semibold mb-6 leading-relaxed">{featured.description}</p>
            {/* Steps */}
            <div className="space-y-2 mb-6">
              {featured.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm font-semibold text-gray-600">{step}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-5 mb-6 text-sm text-gray-400 font-semibold">
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400"/>{featured.rating}</span>
              <span className="flex items-center gap-1.5"><Play className="w-3.5 h-3.5"/>{featured.views} views</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/>{featured.duration}</span>
            </div>
            <button className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-black text-base text-white w-max hover:-translate-y-0.5 transition-all shadow-lg"
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#6d28d9)', borderBottom: '3px solid #1e3a8a' }}>
              <Play className="w-5 h-5" fill="currentColor"/> Watch Tutorial
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full font-black text-sm transition-all ${
              activeCategory === cat
                ? 'bg-[#1d4ed8] text-white shadow-lg scale-105 border-b-4 border-blue-900'
                : 'bg-white border-2 border-gray-100 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:-translate-y-0.5 shadow-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tutorial Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7">
        {filtered.map(tut => (
          <div
            key={tut.id}
            onClick={() => setFeatured(tut)}
            className={`bg-white rounded-[28px] overflow-hidden shadow-lg card-hover group border-2 cursor-pointer transition-all flex flex-col ${featured.id === tut.id ? 'border-blue-400 shadow-blue-200/50 shadow-xl' : 'border-gray-100'}`}
          >
            {/* Thumbnail */}
            <div className={`h-44 bg-gradient-to-br ${tut.color} flex items-center justify-center relative overflow-hidden`}>
              <div className="text-[72px] drop-shadow-xl group-hover:scale-110 transition-transform duration-300">{tut.emoji}</div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                  <Play className="w-6 h-6 text-gray-800 ml-0.5" fill="currentColor"/>
                </div>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-black px-2.5 py-1 rounded-lg backdrop-blur-sm">
                {tut.duration}
              </div>
              {featured.id === tut.id && (
                <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full">
                  ▶ Featured
                </div>
              )}
            </div>
            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
              <div className="flex gap-2 mb-3 flex-wrap">
                <span className={`text-xs font-black px-2.5 py-1 rounded-full ${levelBadge[tut.level]}`}>{tut.level}</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{tut.category}</span>
              </div>
              <h3 className="font-black text-gray-800 text-base mb-2 leading-snug group-hover:text-blue-700 transition-colors flex-1">{tut.title}</h3>
              <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 mt-3 pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"/>{tut.rating}</span>
                <span className="flex items-center gap-1"><Play className="w-3 h-3"/>{tut.views}</span>
                <span className="ml-auto text-blue-600 font-black group-hover:underline">Watch →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#6d28d9] rounded-[32px] p-10 text-white text-center shadow-2xl relative overflow-hidden">
        <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-white/10 blur-xl pointer-events-none"/>
        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-purple-400/20 blur-xl pointer-events-none"/>
        <div className="relative z-10">
          <div className="text-5xl mb-4">🎓</div>
          <h2 className="text-3xl font-black mb-3">Ready to start learning visually?</h2>
          <p className="text-blue-200 font-semibold text-lg mb-8 max-w-lg mx-auto">
            Jump into AMIVI, AMICO or the Quiz — all tools are free and ready to use.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/amivi" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-blue-800 rounded-2xl font-black text-base hover:-translate-y-1 transition-all shadow-lg">
              🎨 Try AMIVI <ArrowRight className="w-5 h-5"/>
            </Link>
            <Link to="/amico" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/15 border-2 border-white/40 text-white rounded-2xl font-black text-base hover:bg-white/25 transition-colors backdrop-blur-sm">
              📚 Try AMICO <ArrowRight className="w-5 h-5"/>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
