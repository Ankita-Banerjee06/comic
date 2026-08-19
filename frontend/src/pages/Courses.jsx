import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Star, Play, ChevronRight, Award, Search, Filter } from 'lucide-react';

const categories = ['All', 'Science', 'Math', 'History', 'Language', 'Arts', 'Technology'];

const courses = [
  {
    id: 1, emoji: '🌿', title: 'Introduction to Biology', subject: 'Science',
    lessons: 12, duration: '4h 30m', level: 'Beginner', rating: 4.8, students: 1240,
    color: 'from-green-400 to-teal-500', progress: 0,
    tags: ['Cells', 'Photosynthesis', 'DNA'],
    description: 'Explore the living world through stunning visual diagrams and interactive quizzes.'
  },
  {
    id: 2, emoji: '🪐', title: 'Our Solar System', subject: 'Science',
    lessons: 10, duration: '3h 15m', level: 'Beginner', rating: 4.9, students: 2100,
    color: 'from-blue-400 to-indigo-600', progress: 45,
    tags: ['Planets', 'Stars', 'Space'],
    description: 'Journey through the planets, moons and stars with vivid visual storytelling.'
  },
  {
    id: 3, emoji: '📐', title: 'Algebra Fundamentals', subject: 'Math',
    lessons: 16, duration: '6h 00m', level: 'Intermediate', rating: 4.7, students: 890,
    color: 'from-purple-400 to-violet-600', progress: 0,
    tags: ['Equations', 'Variables', 'Graphs'],
    description: 'Master algebra step-by-step with visual methods and practice quizzes.'
  },
  {
    id: 4, emoji: '🏛️', title: 'Ancient Civilisations', subject: 'History',
    lessons: 14, duration: '5h 20m', level: 'Beginner', rating: 4.6, students: 670,
    color: 'from-orange-400 to-red-500', progress: 100,
    tags: ['Egypt', 'Greece', 'Rome'],
    description: 'Travel back in time through comic-style visual stories and timelines.'
  },
  {
    id: 5, emoji: '🧬', title: 'DNA & Genetics Explained', subject: 'Science',
    lessons: 9, duration: '3h 45m', level: 'Advanced', rating: 4.9, students: 512,
    color: 'from-pink-400 to-rose-600', progress: 20,
    tags: ['DNA', 'Genes', 'Heredity'],
    description: 'Unravel the code of life through beautiful molecular illustrations.'
  },
  {
    id: 6, emoji: '🎨', title: 'Art & Visual Thinking', subject: 'Arts',
    lessons: 8, duration: '2h 50m', level: 'Beginner', rating: 4.8, students: 1560,
    color: 'from-yellow-400 to-orange-400', progress: 60,
    tags: ['Colour', 'Design', 'Creativity'],
    description: 'Learn to think visually and create stunning art through guided lessons.'
  },
];

const levelColor = { Beginner: 'bg-green-100 text-green-700', Intermediate: 'bg-yellow-100 text-yellow-700', Advanced: 'bg-red-100 text-red-700' };

export default function Courses() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = courses.filter(c => {
    const matchCat = activeCategory === 'All' || c.subject === activeCategory;
    const matchSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#15803d] via-[#16a34a] to-[#0d9488] text-white rounded-[40px] p-10 shadow-2xl overflow-hidden">
        <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none"/>
        <div className="absolute bottom-0 left-1/3 w-44 h-44 rounded-full bg-teal-300/20 blur-2xl pointer-events-none"/>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 rounded-full px-5 py-2 text-sm font-bold mb-5 backdrop-blur-sm">
              📚 {courses.length} Visual Courses Available
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3 leading-tight tracking-tight">
              Courses 📖
            </h1>
            <p className="text-green-100 font-semibold text-lg max-w-lg leading-relaxed">
              Structured learning paths packed with AMIVI visuals, AMICO comics and interactive quizzes. Learn anything, visually.
            </p>
          </div>
          {/* Search */}
          <div className="w-full md:w-80 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-12 pr-4 py-4 bg-white/15 border-2 border-white/25 rounded-2xl text-white placeholder-white/60 font-bold focus:outline-none focus:bg-white/25 transition-all backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { icon: '📚', label: 'Total Courses', value: '6', color: 'from-green-400 to-teal-400' },
          { icon: '🎓', label: 'Learners Enrolled', value: '7,000+', color: 'from-blue-400 to-indigo-400' },
          { icon: '⭐', label: 'Avg. Rating', value: '4.8', color: 'from-yellow-400 to-orange-400' },
          { icon: '🏆', label: 'Completed', value: '1,200+', color: 'from-purple-400 to-pink-400' },
        ].map(s => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} text-white rounded-3xl p-5 shadow-xl card-hover`}>
            <div className="text-4xl mb-2">{s.icon}</div>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-sm font-semibold text-white/80">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full font-black text-sm transition-all ${
              activeCategory === cat
                ? 'bg-[#15803d] text-white shadow-lg scale-105 border-b-4 border-green-900'
                : 'bg-white border-2 border-gray-100 text-gray-500 hover:border-green-300 hover:text-green-700 hover:-translate-y-0.5 shadow-sm'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.length > 0 ? filtered.map(course => (
          <div key={course.id} className="bg-white rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.08)] card-hover group border-2 border-gray-50 flex flex-col">
            {/* Thumbnail */}
            <div className={`h-48 bg-gradient-to-br ${course.color} flex items-center justify-center relative overflow-hidden`}>
              <div className="text-[80px] group-hover:scale-110 transition-transform duration-300 drop-shadow-xl">{course.emoji}</div>
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                {course.subject}
              </div>
              <div className={`absolute top-4 right-4 text-xs font-black px-3 py-1.5 rounded-full ${levelColor[course.level]}`}>
                {course.level}
              </div>
              {course.progress > 0 && (
                <div className="absolute bottom-0 left-0 w-full h-2 bg-black/20">
                  <div className="h-full bg-white/80 transition-all" style={{ width: `${course.progress}%` }} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex gap-2 flex-wrap mb-3">
                {course.tags.map(tag => (
                  <span key={tag} className="text-xs font-bold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg">{tag}</span>
                ))}
              </div>
              <h3 className="font-black text-gray-800 text-lg mb-2 leading-tight group-hover:text-[#15803d] transition-colors">{course.title}</h3>
              <p className="text-sm text-gray-500 font-semibold mb-4 leading-relaxed flex-1">{course.description}</p>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mb-4">
                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5"/> {course.lessons} lessons</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {course.duration}</span>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"/> {course.rating}</span>
              </div>
              {course.progress > 0 ? (
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-bold text-gray-400 mb-1.5">
                    <span>Progress</span><span>{course.progress}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-teal-400 rounded-full" style={{ width: `${course.progress}%` }}/>
                  </div>
                </div>
              ) : null}
              <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm text-white transition-all hover:scale-[1.02] shadow-md"
                style={{ background: 'linear-gradient(135deg,#15803d,#0d9488)', borderBottom: '3px solid #14532d' }}>
                {course.progress === 100 ? '✅ Review Course' : course.progress > 0 ? '▶ Continue' : '🚀 Start Course'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="text-6xl mb-4 opacity-50">🔍</div>
            <p className="text-gray-400 font-black text-2xl mb-2">No courses found</p>
            <p className="text-gray-400 font-semibold">Try a different category or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
