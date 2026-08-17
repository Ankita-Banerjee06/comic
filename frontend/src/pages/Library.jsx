import { useState } from 'react';
import { Search, Filter, Play, Share2, Trash2 } from 'lucide-react';

const mockData = [
  { id: 1, title: "Biology Cells", type: "Video",    date: "2 hours ago",   emoji: "🎬", color: "from-blue-400 to-cyan-400"    },
  { id: 2, title: "History Chapter 4", type: "Comic",  date: "Yesterday",     emoji: "📚", color: "from-pink-400 to-purple-400"  },
  { id: 3, title: "Calculus Basics", type: "Visual",  date: "Oct 12, 2026",  emoji: "🎨", color: "from-orange-400 to-yellow-400" },
  { id: 4, title: "Geography Quiz", type: "Quiz",    date: "Oct 10, 2026",  emoji: "🧩", color: "from-purple-400 to-indigo-400" },
  { id: 5, title: "English Essay Prep", type: "Homework", date: "Oct 8, 2026", emoji: "📝", color: "from-green-400 to-teal-400"  },
];

const tabs = [
  { label: '📚 All Files',    key: 'All Files'   },
  { label: '🎨 My Visuals',   key: 'My Visuals'  },
  { label: '🎬 My Videos',    key: 'My Videos'   },
  { label: '📚 My Comics',    key: 'My Comics'   },
  { label: '🧩 My Quizzes',   key: 'My Quizzes'  },
  { label: '📝 My Homework',  key: 'My Homework' },
];

export default function Library() {
  const [activeTab, setActiveTab] = useState('All Files');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = mockData.filter(item => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (activeTab === 'All Files') return true;
    if (activeTab === 'My Visuals')  return item.type === 'Visual';
    if (activeTab === 'My Videos')   return item.type === 'Video';
    if (activeTab === 'My Comics')   return item.type === 'Comic';
    if (activeTab === 'My Quizzes')  return item.type === 'Quiz';
    if (activeTab === 'My Homework') return item.type === 'Homework';
    return true;
  });

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-4xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 text-[100px] opacity-10 leading-none select-none pointer-events-none">📖</div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl animate-float">📖</span>
            <div>
              <h1 className="text-4xl font-black">Your Library</h1>
              <p className="text-orange-100 font-bold text-lg">All your amazing creations in one place! 🌟</p>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your library..."
                className="w-full pl-12 pr-4 py-3 bg-white/20 border-2 border-white/30 rounded-2xl text-white placeholder-white/60 font-bold focus:outline-none focus:bg-white/30 transition-all backdrop-blur-sm"
              />
            </div>
            <button className="p-3 bg-white/20 border-2 border-white/30 rounded-2xl text-white hover:bg-white/30 transition-colors backdrop-blur-sm">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        {tabs.map(({ label, key }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-2.5 rounded-2xl font-black text-sm transition-all ${
              activeTab === key
                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-300/50 scale-105'
                : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredData.length > 0 ? (
          filteredData.map(item => (
            <LibraryCard key={item.id} {...item} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 font-black text-2xl">No files found!</p>
            <p className="text-gray-400 font-bold mt-2">Try a different search or category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LibraryCard({ title, type, date, emoji, color }) {
  return (
    <div className="bg-white border-2 border-gray-100 rounded-4xl overflow-hidden shadow-lg card-hover group">
      {/* Thumbnail */}
      <div className={`h-40 w-full bg-gradient-to-br ${color} flex items-center justify-center relative`}>
        <span className="text-7xl group-hover:scale-110 transition-transform">{emoji}</span>
        <div className="absolute top-3 right-3 bg-white/25 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-black uppercase tracking-wider">
          {type}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-black text-gray-800 group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-400 font-bold mb-5">{date}</p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black py-2.5 px-4 rounded-2xl hover:scale-105 transition-transform text-sm shadow-md">
            <Play className="w-4 h-4 fill-white" />
            Open
          </button>
          <button className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors" title="Share">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
