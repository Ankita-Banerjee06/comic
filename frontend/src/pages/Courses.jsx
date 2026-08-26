import { useState } from 'react';
import { ArrowRight, BookOpen, Clock, Star, Search, GraduationCap, Trophy, Leaf, Orbit, Ruler, Landmark, Dna, Palette } from 'lucide-react';

const categories = ['All', 'Science', 'Math', 'History', 'Language', 'Arts', 'Technology'];

const courses = [
  {
    id: 1, icon: Leaf, title: 'Introduction to Biology', subject: 'Science',
    lessons: 12, duration: '4h 30m', level: 'Beginner', rating: 4.8, students: 1240,
    tint: 'bg-green-50', iconColor: 'text-green-600', bar: 'bg-green-500', progress: 0,
    tags: ['Cells', 'Photosynthesis', 'DNA'],
    description: 'Explore the living world through clear visual diagrams and interactive quizzes.'
  },
  {
    id: 2, icon: Orbit, title: 'Our Solar System', subject: 'Science',
    lessons: 10, duration: '3h 15m', level: 'Beginner', rating: 4.9, students: 2100,
    tint: 'bg-blue-50', iconColor: 'text-blue-600', bar: 'bg-blue-500', progress: 45,
    tags: ['Planets', 'Stars', 'Space'],
    description: 'Journey through the planets, moons and stars with vivid visual storytelling.'
  },
  {
    id: 3, icon: Ruler, title: 'Algebra Fundamentals', subject: 'Math',
    lessons: 16, duration: '6h 00m', level: 'Intermediate', rating: 4.7, students: 890,
    tint: 'bg-purple-50', iconColor: 'text-purple-600', bar: 'bg-purple-500', progress: 0,
    tags: ['Equations', 'Variables', 'Graphs'],
    description: 'Master algebra step-by-step with visual methods and practice quizzes.'
  },
  {
    id: 4, icon: Landmark, title: 'Ancient Civilisations', subject: 'History',
    lessons: 14, duration: '5h 20m', level: 'Beginner', rating: 4.6, students: 670,
    tint: 'bg-orange-50', iconColor: 'text-orange-600', bar: 'bg-orange-500', progress: 100,
    tags: ['Egypt', 'Greece', 'Rome'],
    description: 'Travel back in time through comic-style visual stories and timelines.'
  },
  {
    id: 5, icon: Dna, title: 'DNA & Genetics Explained', subject: 'Science',
    lessons: 9, duration: '3h 45m', level: 'Advanced', rating: 4.9, students: 512,
    tint: 'bg-pink-50', iconColor: 'text-pink-600', bar: 'bg-pink-500', progress: 20,
    tags: ['DNA', 'Genes', 'Heredity'],
    description: 'Unravel the code of life through clear molecular illustrations.'
  },
  {
    id: 6, icon: Palette, title: 'Art & Visual Thinking', subject: 'Arts',
    lessons: 8, duration: '2h 50m', level: 'Beginner', rating: 4.8, students: 1560,
    tint: 'bg-yellow-50', iconColor: 'text-yellow-600', bar: 'bg-yellow-500', progress: 60,
    tags: ['Colour', 'Design', 'Creativity'],
    description: 'Learn to think visually and create through guided lessons.'
  },
];

const levelColor = { Beginner: 'bg-green-50 text-green-700', Intermediate: 'bg-yellow-50 text-yellow-700', Advanced: 'bg-red-50 text-red-700' };

export default function Courses() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = courses.filter(c => {
    const matchCat = activeCategory === 'All' || c.subject === activeCategory;
    const matchSearch = !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-8" style={{ minHeight: 200, background: '#ecfdf5' }}>
        <img
          src="/vlq-gen-dashboard.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(6,78,59,0.62)' }}
        />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-xs font-bold mb-4 text-white">
              {courses.length} visual courses available
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight text-white">
              Courses
            </h1>
            <p className="text-white/90 font-medium max-w-lg">
              Structured learning paths with AMIVI visuals, AMICO comics and interactive quizzes.
            </p>
          </div>
          {/* Search */}
          <div className="w-full md:w-72 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/15 border border-white/25 rounded-xl text-white placeholder-white/60 font-medium text-sm focus:outline-none focus:bg-white/25 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile icon={BookOpen} label="Total courses" value="6" tint="bg-green-50" iconColor="text-green-600" />
        <StatTile icon={GraduationCap} label="Learners enrolled" value="7,000+" tint="bg-blue-50" iconColor="text-blue-600" />
        <StatTile icon={Star} label="Avg. rating" value="4.8" tint="bg-yellow-50" iconColor="text-yellow-600" />
        <StatTile icon={Trophy} label="Completed" value="1,200+" tint="bg-purple-50" iconColor="text-purple-600" />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
              activeCategory === cat
                ? 'bg-green-600 text-white'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-green-300 hover:text-green-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length > 0 ? filtered.map(course => (
          <div key={course.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
            {/* Thumbnail */}
            <div className={`h-36 ${course.tint} flex items-center justify-center relative`}>
              <course.icon className={`w-12 h-12 ${course.iconColor}`} />
              <div className="absolute top-3 left-3 bg-white/90 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {course.subject}
              </div>
              <div className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${levelColor[course.level]}`}>
                {course.level}
              </div>
              {course.progress > 0 && (
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/10">
                  <div className={`h-full ${course.bar} transition-all`} style={{ width: `${course.progress}%` }} />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
              <div className="flex gap-1.5 flex-wrap mb-2.5">
                {course.tags.map(tag => (
                  <span key={tag} className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">{tag}</span>
                ))}
              </div>
              <h3 className="font-bold text-slate-800 mb-1.5 leading-tight group-hover:text-green-700 transition-colors">{course.title}</h3>
              <p className="text-sm text-slate-500 font-medium mb-3 leading-relaxed flex-1">{course.description}</p>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 mb-3">
                <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {course.lessons} lessons</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.duration}</span>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> {course.rating}</span>
              </div>
              {course.progress > 0 ? (
                <div className="mb-3">
                  <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                    <span>Progress</span><span>{course.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${course.bar} rounded-full`} style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              ) : null}
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white bg-green-600 hover:bg-green-700 transition-colors">
                {course.progress === 100 ? 'Review course' : course.progress > 0 ? 'Continue' : 'Start course'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-lg mb-1">No courses found</p>
            <p className="text-slate-400 font-medium text-sm">Try a different category or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({ icon: Icon, label, value, tint, iconColor }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className={`w-10 h-10 ${tint} rounded-xl flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="text-xl font-extrabold text-slate-900">{value}</div>
      <div className="text-xs font-semibold text-slate-500">{label}</div>
    </div>
  );
}
