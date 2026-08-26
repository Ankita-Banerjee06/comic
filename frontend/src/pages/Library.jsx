import { useState, useEffect } from 'react';
import { Search, Play, Palette, BookOpen, Puzzle, FileText } from 'lucide-react';
import { listProjects, listComics, mediaUrl } from '../services/api';

const TYPE_META = {
  amivi: { type: 'Visual', icon: Palette, tint: 'bg-orange-50', iconColor: 'text-orange-500' },
  amico: { type: 'Comic', icon: BookOpen, tint: 'bg-pink-50', iconColor: 'text-pink-500' },
  quiz: { type: 'Quiz', icon: Puzzle, tint: 'bg-purple-50', iconColor: 'text-purple-500' },
};

const DEFAULT_META = { type: 'Homework', icon: FileText, tint: 'bg-green-50', iconColor: 'text-green-500' };

const tabs = [
  { label: 'All', key: 'All Files' },
  { label: 'Visuals', key: 'My Visuals' },
  { label: 'Comics', key: 'My Comics' },
  { label: 'Quizzes', key: 'My Quizzes' },
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
            icon: meta.icon,
            tint: meta.tint,
            iconColor: meta.iconColor,
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
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-8" style={{ minHeight: 180, background: '#eff6ff' }}>
        <img
          src="/vlq-hero-main.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(15,23,42,0.6)' }}
        />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1.5">Your library</h1>
            <p className="text-white/90 font-medium">Browse everything you've created, in one place.</p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your library..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/15 border border-white/25 rounded-xl text-white placeholder-white/60 font-medium text-sm focus:outline-none focus:bg-white/25 focus:border-white/40 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(({ label, key }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
              activeTab === key
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-semibold">Loading your library…</p>
          </div>
        ) : filteredData.length > 0 ? (
          filteredData.map(item => (
            <LibraryCard key={item.id} {...item} />
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-500 font-bold text-lg mb-1">Nothing here yet</p>
            <p className="text-slate-400 font-medium text-sm">Try a different search, or create something new.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LibraryCard({ title, type, date, icon: Icon, tint, iconColor, thumbnailUrl }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
      {/* Thumbnail */}
      <div className={`h-44 w-full ${tint} flex items-center justify-center relative overflow-hidden`}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <Icon className={`w-12 h-12 ${iconColor}`} />
        )}

        {/* Badge */}
        <div className="absolute top-3 left-3 bg-white/90 px-3 py-1 rounded-full text-slate-700 text-xs font-bold flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} /> {type}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors mb-1 truncate">{title}</h3>
        <div className="flex justify-between items-center">
          <p className="text-xs text-slate-400 font-semibold">{date}</p>
          <button className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
            <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500" fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
