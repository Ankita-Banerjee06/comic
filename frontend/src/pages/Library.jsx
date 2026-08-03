import { useState } from 'react';
import { Search, Filter, BookOpen, Video, Brain, Image as ImageIcon } from 'lucide-react';

const mockData = [
  { id: 1, title: "Biology Cells", type: "Video", date: "2 hours ago", color: "bg-cyan-500", icon: <Video className="w-6 h-6 text-white"/> },
  { id: 2, title: "History Chapter 4", type: "Comic", date: "Yesterday", color: "bg-fuchsia-500", icon: <BookOpen className="w-6 h-6 text-white"/> },
  { id: 3, title: "Calculus Basics", type: "Visual", date: "Oct 12, 2026", color: "bg-purple-500", icon: <ImageIcon className="w-6 h-6 text-white"/> },
  { id: 4, title: "Geography Quiz", type: "Quiz", date: "Oct 10, 2026", color: "bg-emerald-500", icon: <Brain className="w-6 h-6 text-white"/> },
];

export default function Library() {
  const [activeTab, setActiveTab] = useState('All Files');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = mockData.filter(item => {
    // Search filter
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Tab filter
    if (activeTab === 'All Files') return true;
    if (activeTab === 'Videos') return item.type === 'Video' || item.type === 'Visual';
    if (activeTab === 'Comics') return item.type === 'Comic';
    if (activeTab === 'Quizzes') return item.type === 'Quiz';
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Your Library</h1>
          <p className="text-gray-400 mt-1">Access all your generated AMIVI concepts and AMICO comics.</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search library..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors" 
            />
          </div>
          <button className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-800 pb-px overflow-x-auto">
        <Tab icon={<ImageIcon className="w-4 h-4" />} label="All Files" active={activeTab === 'All Files'} onClick={() => setActiveTab('All Files')} />
        <Tab icon={<Video className="w-4 h-4" />} label="Videos" active={activeTab === 'Videos'} onClick={() => setActiveTab('Videos')} />
        <Tab icon={<BookOpen className="w-4 h-4" />} label="Comics" active={activeTab === 'Comics'} onClick={() => setActiveTab('Comics')} />
        <Tab icon={<Brain className="w-4 h-4" />} label="Quizzes" active={activeTab === 'Quizzes'} onClick={() => setActiveTab('Quizzes')} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredData.length > 0 ? (
          filteredData.map(item => (
            <LibraryCard key={item.id} title={item.title} type={item.type === 'Visual' ? 'AMIVI Visuals' : item.type === 'Video' ? 'AMIVI Video' : item.type === 'Comic' ? 'AMICO Comic' : 'Quiz'} date={item.date} color={item.color} icon={item.icon} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">
            No files found for this category.
          </div>
        )}
      </div>
    </div>
  );
}

function Tab({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-medium whitespace-nowrap transition-colors ${active ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function LibraryCard({ title, type, date, color, icon }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-5 hover:bg-gray-800 transition-colors group cursor-pointer">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg ${color}`}>
        {icon}
      </div>
      <h3 className="font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{title}</h3>
      <div className="flex justify-between items-center text-xs text-gray-500 font-medium mt-4">
        <span>{type}</span>
        <span>{date}</span>
      </div>
    </div>
  );
}
