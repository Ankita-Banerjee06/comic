import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, Star, ArrowRight, Video, Layers, Palette, BookOpen, Puzzle, Rocket, Brain, Lightbulb, Compass, GraduationCap } from 'lucide-react';

const categories = ['All', 'AMIVI', 'AMICO', 'Quiz', 'Study Tips', 'Getting Started', 'For Teachers'];

const tutorials = [
  {
    id: 1, icon: Palette, title: 'How to create your first visual with AMIVI',
    category: 'AMIVI', duration: '4:30', level: 'Beginner', rating: 4.9, views: '12.4k',
    tint: 'bg-blue-50', iconColor: 'text-blue-600',
    steps: ['Paste your learning text', 'Choose a visual style', 'Let AI generate your visual', 'Download or share'],
    description: 'Learn to turn any text or document into a clear visual explanation in just a few clicks.'
  },
  {
    id: 2, icon: BookOpen, title: 'Creating comic stories with AMICO',
    category: 'AMICO', duration: '6:15', level: 'Beginner', rating: 4.8, views: '9.8k',
    tint: 'bg-pink-50', iconColor: 'text-pink-600',
    steps: ['Enter your topic', 'Choose characters', 'Generate comic panels', 'Review and save'],
    description: 'Turn any subject into a memorable multi-panel comic story with AMICO\'s AI engine.'
  },
  {
    id: 3, icon: Puzzle, title: 'Taking interactive quizzes effectively',
    category: 'Quiz', duration: '3:45', level: 'Beginner', rating: 4.7, views: '7.2k',
    tint: 'bg-purple-50', iconColor: 'text-purple-600',
    steps: ['Choose a topic', 'Set difficulty level', 'Answer visual questions', 'Review your score'],
    description: 'Discover how to use the Quiz feature to test your knowledge and track your progress.'
  },
  {
    id: 4, icon: Rocket, title: 'Getting started with VLQ — platform overview',
    category: 'Getting Started', duration: '8:00', level: 'Beginner', rating: 5.0, views: '21.1k',
    tint: 'bg-indigo-50', iconColor: 'text-indigo-600',
    steps: ['Create your account', 'Explore AMIVI, AMICO & Quiz', 'Build your library', 'Track your journey'],
    description: 'Your complete guide to VLQ — what it does, how it works and how to get the most out of it.'
  },
  {
    id: 5, icon: Brain, title: 'Advanced AMIVI: custom visual styles',
    category: 'AMIVI', duration: '7:20', level: 'Intermediate', rating: 4.8, views: '5.6k',
    tint: 'bg-cyan-50', iconColor: 'text-cyan-600',
    steps: ['Upload a PDF or paste text', 'Select advanced visual mode', 'Customize layout & colours', 'Export and share'],
    description: 'Dive deeper into AMIVI and learn how to customise the visual output to match your subject.'
  },
  {
    id: 6, icon: Lightbulb, title: 'Study tips for visual learners',
    category: 'Study Tips', duration: '5:50', level: 'All Levels', rating: 4.9, views: '15.3k',
    tint: 'bg-yellow-50', iconColor: 'text-yellow-600',
    steps: ['Use images over text', 'Create mind maps', 'Practice with quizzes', 'Review visuals regularly'],
    description: 'Proven visual learning strategies that help you understand, remember and apply knowledge faster.'
  },
  {
    id: 7, icon: Compass, title: 'Introduction to Project VLQ',
    category: 'Getting Started', duration: '0:52', level: 'All Levels',
    tint: 'bg-indigo-50', iconColor: 'text-indigo-600',
    videoUrl: '/videos/vlq-intro-1.mp4', thumbnail: '/videos/vlq-intro-1-thumb.jpg',
    steps: ['Meet Project VLQ', 'See how visual learning works', 'Explore what you can build', 'Get started in minutes'],
    description: 'A short introduction to Project VLQ — what it is and how it turns learning material into visual, memorable lessons.'
  },
  {
    id: 8, icon: GraduationCap, title: 'VLQ — Benefits to Teachers',
    category: 'For Teachers', duration: '0:27', level: 'All Levels',
    tint: 'bg-emerald-50', iconColor: 'text-emerald-600',
    videoUrl: '/videos/vlq-benefits-to-teachers.mp4', thumbnail: '/videos/vlq-benefits-to-teachers-thumb.jpg',
    steps: ['Cut lesson prep time with ready-made visuals', 'Reinforce learning with spaced-repetition quizzes', 'Auto-generate homework from any lesson', 'Track teacher-learner success with VLQ analytics'],
    description: 'See how VLQ helps teachers save prep time, reinforce learning through visuals and quizzes, and track student progress with built-in analytics.'
  },
];

const levelBadge = {
  'Beginner': 'bg-green-50 text-green-700',
  'Intermediate': 'bg-yellow-50 text-yellow-700',
  'Advanced': 'bg-red-50 text-red-700',
  'All Levels': 'bg-blue-50 text-blue-700',
};

export default function Tutorials() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [featured, setFeatured] = useState(tutorials.find(t => t.id === 7) || tutorials[0]);

  const filtered = tutorials.filter(t =>
    activeCategory === 'All' || t.category === activeCategory
  );

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-8" style={{ minHeight: 190, background: '#eef2ff' }}>
        <img
          src="/vlq-see-tool.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(30,27,75,0.62)' }}
        />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-white">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-xs font-bold mb-4">
              {tutorials.length} step-by-step tutorials
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight">
              Tutorials
            </h1>
            <p className="text-white/90 font-medium max-w-lg">
              Short, clear video guides that show you exactly how to use VLQ's visual learning tools.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
              <Video className="w-4 h-4 text-blue-200" />
              <span className="font-semibold text-sm">All tutorials are free</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5">
              <Layers className="w-4 h-4 text-blue-200" />
              <span className="font-semibold text-sm">Step-by-step guides</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Tutorial */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-900">Featured tutorial</h2>
          <span className="text-xs text-slate-400 font-medium">Click any tutorial below to feature it</span>
        </div>
        <div className="flex flex-col lg:flex-row gap-0 bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          {/* Video preview */}
          {featured.videoUrl ? (
            <div className="lg:w-1/2 h-56 lg:h-auto bg-black relative">
              <video
                key={featured.id}
                controls
                poster={featured.thumbnail}
                className="w-full h-full object-cover"
              >
                <source src={featured.videoUrl} type="video/mp4" />
              </video>
            </div>
          ) : (
            <div className={`lg:w-1/2 h-56 lg:h-auto ${featured.tint} flex flex-col items-center justify-center relative cursor-pointer group`}>
              <featured.icon className={`w-16 h-16 mb-4 ${featured.iconColor}`} />
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Play className="w-7 h-7 text-slate-800 ml-0.5" fill="currentColor" />
              </div>
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                {featured.duration}
              </div>
            </div>
          )}
          {/* Info */}
          <div className="lg:w-1/2 p-7 flex flex-col justify-center">
            <div className="flex gap-2 mb-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${levelBadge[featured.level]}`}>{featured.level}</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{featured.category}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2.5 leading-tight">{featured.title}</h2>
            <p className="text-slate-500 font-medium mb-5 leading-relaxed text-sm">{featured.description}</p>
            {/* Steps */}
            <div className="space-y-2 mb-5">
              {featured.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium text-slate-600">{step}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mb-5 text-xs text-slate-400 font-semibold">
              {featured.rating && (
                <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />{featured.rating}</span>
              )}
              {featured.views && (
                <span className="flex items-center gap-1.5"><Play className="w-3 h-3" />{featured.views} views</span>
              )}
              <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{featured.duration}</span>
            </div>
            {!featured.videoUrl && (
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white w-max hover:-translate-y-0.5 transition-all bg-indigo-600 hover:bg-indigo-700">
                <Play className="w-4 h-4" fill="currentColor" /> Watch tutorial
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tutorial Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(tut => (
          <div
            key={tut.id}
            onClick={() => setFeatured(tut)}
            className={`bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-md group cursor-pointer transition-all flex flex-col ${featured.id === tut.id ? 'border-indigo-300' : 'border-slate-200'}`}
          >
            {/* Thumbnail */}
            <div className={`h-36 relative overflow-hidden ${tut.thumbnail ? '' : tut.tint}`}>
              {tut.thumbnail ? (
                <img
                  src={tut.thumbnail}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <tut.icon className={`w-10 h-10 ${tut.iconColor}`} />
                </div>
              )}
              <div className={`absolute inset-0 transition-colors flex items-center justify-center ${tut.thumbnail ? 'bg-black/10 group-hover:bg-black/25' : 'bg-black/0 group-hover:bg-black/5'}`}>
                <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                  <Play className="w-4 h-4 text-slate-800 ml-0.5" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                {tut.duration}
              </div>
              {featured.id === tut.id && (
                <div className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  Featured
                </div>
              )}
            </div>
            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              <div className="flex gap-2 mb-2 flex-wrap">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${levelBadge[tut.level]}`}>{tut.level}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{tut.category}</span>
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-2 leading-snug group-hover:text-indigo-700 transition-colors flex-1">{tut.title}</h3>
              <div className="flex items-center gap-3 text-xs font-medium text-slate-400 mt-2 pt-2 border-t border-slate-100">
                {tut.rating && (
                  <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />{tut.rating}</span>
                )}
                {tut.views && (
                  <span className="flex items-center gap-1"><Play className="w-3 h-3" />{tut.views}</span>
                )}
                <span className="ml-auto text-indigo-600 font-bold group-hover:underline">Watch →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div className="bg-indigo-900 rounded-2xl p-9 text-white text-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-xl md:text-2xl font-extrabold mb-2.5">Ready to start learning visually?</h2>
          <p className="text-indigo-200 font-medium mb-6 max-w-lg mx-auto text-sm">
            Jump into AMIVI, AMICO or the Quiz — all tools are free and ready to use.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/amivi" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-800 rounded-xl font-bold text-sm hover:-translate-y-0.5 transition-all">
              Try AMIVI <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/amico" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/25 text-white rounded-xl font-bold text-sm hover:bg-white/20 transition-colors">
              Try AMICO <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
