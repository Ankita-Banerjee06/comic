import { useState, useEffect } from 'react';
import { Search, Filter, Play, Share2, Trash2 } from 'lucide-react';
import { listProjects, listComics, mediaUrl } from '../services/api';

const TYPE_META = {
  amivi: { type: 'Visual', emoji: '🎨', color: 'from-orange-400 to-red-500', bgIcon: '🎨' },
  amico: { type: 'Comic', emoji: '📚', color: 'from-pink-400 to-rose-500', bgIcon: '📚' },
  quiz: { type: 'Quiz', emoji: '🧩', color: 'from-purple-500 to-indigo-600', bgIcon: '🧩' },
};

const DEFAULT_META = { type: 'Homework', emoji: '📝', color: 'from-green-400 to-teal-500', bgIcon: '📝' };

const tabs = [
  { label: '🌟 All',    key: 'All Files'   },
  { label: '🎨 Visuals',   key: 'My Visuals'  },
  { label: '📚 Comics',    key: 'My Comics'   },
  { label: '🧩 Quizzes',   key: 'My Quizzes'  },
];

export default function Library() {
  const [activeTab, setActiveTab] = useState('All Files');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([listProjects(), listComics()])
      .then(([projectsData, comicsData]) => {
        if (cancelled) return;

        const thumbnailByProject = {};
        (comicsData.comics || []).forEach((comic) => {
          thumbnailByProject[comic.project_id] = comic.thumbnail_url;
        });

        const combined = (projectsData.projects || []).map((project) => {
          const meta = TYPE_META[project.project_type] || DEFAULT_META;
          const thumbnail = thumbnailByProject[project.project_id];

          return {
            id: project.project_id,
            title: project.title || `${meta.type} #${project.project_id}`,
            type: meta.type,
            emoji: meta.emoji,
            color: meta.color,
            bgIcon: meta.bgIcon,
            thumbnailUrl: thumbnail ? mediaUrl(thumbnail) : null,
            date: project.created_at
              ? new Date(project.created_at).toLocaleDateString()
              : '',
          };
        });

        setItems(combined);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredData = items.filter(item => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (activeTab === 'All Files') return true;
    if (activeTab === 'My Visuals')  return item.type === 'Visual';
    if (activeTab === 'My Comics')   return item.type === 'Comic';
    if (activeTab === 'My Quizzes')  return item.type === 'Quiz';
    return true;
  });

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1e40af] to-[#3b82f6] text-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 text-[180px] opacity-10 leading-none select-none pointer-events-none transform rotate-12">🖼️</div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md border border-white/30">
               <span className="text-5xl drop-shadow-md">🖼️</span>
            </div>
            <div>
              <h1 className="text-5xl font-black mb-2 tracking-tight">Visual Library</h1>
              <p className="text-blue-100 font-bold text-xl">Browse all your beautiful learning creations.</p>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gallery..."
                className="w-full pl-14 pr-4 py-4 bg-white/10 border-2 border-white/20 rounded-3xl text-white placeholder-white/60 font-bold text-lg focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all backdrop-blur-sm shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
        {tabs.map(({ label, key }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-6 py-3 rounded-full font-black text-base transition-all ${
              activeTab === key
                ? 'bg-[#1e40af] text-white shadow-lg scale-105 border-b-4 border-blue-900'
                : 'bg-white border-2 border-gray-100 text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:-translate-y-1 shadow-sm'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-7xl mb-6 opacity-50 animate-pulse">⏳</div>
            <p className="text-gray-400 font-black text-2xl">Loading your library...</p>
          </div>
        ) : filteredData.length > 0 ? (
          filteredData.map(item => (
            <LibraryCard key={item.id} {...item} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-7xl mb-6 opacity-50 animate-float">🎨</div>
            <p className="text-gray-400 font-black text-3xl mb-2">No visuals found!</p>
            <p className="text-gray-400 font-bold text-lg">Try a different search or create something new.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LibraryCard({ title, type, date, emoji, color, bgIcon, thumbnailUrl }) {
  return (
    <div className="bg-white rounded-[32px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.08)] card-hover group border-4 border-white cursor-pointer relative">
      {/* Large Thumbnail */}
      <div className={`h-56 w-full bg-gradient-to-br ${color} flex items-center justify-center relative overflow-hidden`}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <>
            {/* Abstract background icon */}
            <div className="absolute -right-8 -bottom-8 text-[120px] opacity-20 transform -rotate-12 group-hover:scale-110 transition-transform duration-500">
               {bgIcon}
            </div>

            {/* Main visual emoji */}
            <div className="relative bg-white/20 p-6 rounded-[32px] backdrop-blur-md shadow-lg border border-white/30 transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
               <span className="text-7xl drop-shadow-md">{emoji}</span>
            </div>
          </>
        )}
        
        {/* Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-gray-800 text-xs font-black uppercase tracking-wider shadow-sm border border-white flex items-center gap-2">
          {bgIcon} {type}
        </div>
      </div>

      {/* Minimal Content */}
      <div className="p-6 bg-white">
        <h3 className="text-xl font-black text-gray-800 group-hover:text-[#1e40af] transition-colors mb-2 line-clamp-1 truncate">{title}</h3>
        <div className="flex justify-between items-center">
           <p className="text-sm text-gray-400 font-bold">{date}</p>
           <button className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
             <Play className="w-5 h-5 text-gray-400 group-hover:text-blue-500" fill="currentColor"/>
           </button>
        </div>
      </div>
    </div>
  );
}
