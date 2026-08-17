import { Link } from 'react-router-dom';
import {
  ArrowRight, Sparkles, BookOpen, Brain, Play,
  Image as ImageIcon, Video, FileText, CheckCircle2,
  ChevronRight, Trophy, Star, Zap, Target, Flame,
  Rocket, GraduationCap, UserCircle2, Eye
} from 'lucide-react';

// ─── Decorative floating star ────────────────────────────────────────────────
function FloatingStar({ size = 20, color = '#fbbf24', top, left, right, bottom, delay = '0s' }) {
  return (
    <span
      className="absolute pointer-events-none select-none animate-float"
      style={{ top, left, right, bottom, animationDelay: delay, fontSize: size, color, zIndex: 1 }}
    >
      ★
    </span>
  );
}

// ─── Section divider wave ─────────────────────────────────────────────────────
function WaveDivider({ fill = '#fff', flipped = false }) {
  return (
    <div className={`w-full overflow-hidden leading-none ${flipped ? 'rotate-180' : ''}`} style={{ height: 60 }}>
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-full">
        <path d="M0,30 C200,60 400,0 600,30 C800,60 1000,0 1200,30 L1200,60 L0,60 Z" fill={fill} />
      </svg>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen font-sans selection:bg-yellow-200/60 overflow-x-hidden">

      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-500 text-white overflow-hidden pt-8 pb-0">
        {/* Background stars */}
        <FloatingStar size={28} color="#fbbf24" top="10%" left="5%"  delay="0s"   />
        <FloatingStar size={18} color="#f9a8d4" top="20%" right="8%" delay="0.5s" />
        <FloatingStar size={22} color="#a78bfa" top="60%" left="3%"  delay="1s"   />
        <FloatingStar size={16} color="#fbbf24" top="70%" right="5%" delay="1.5s" />
        <FloatingStar size={30} color="#6ee7b7" top="40%" right="2%" delay="0.8s" />

        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-yellow-400/15 blur-[80px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 pb-16 pt-4">

            {/* ── Left text ── */}
            <div className="flex-1 text-center lg:text-left">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 rounded-full px-5 py-2 mb-8 text-sm font-bold backdrop-blur-sm">
                <span className="animate-sparkle">✨</span>
                Learn at the Speed of Sight
                <span className="animate-sparkle" style={{ animationDelay: '0.5s' }}>✨</span>
              </div>

              {/* Main heading */}
              <h1 className="text-5xl lg:text-7xl font-black leading-[1.05] mb-6">
                <span className="block text-white/90 drop-shadow-md">THE</span>
                <span className="block text-yellow-300 drop-shadow-md">VISUAL</span>
                <span className="block text-green-300 drop-shadow-md">LEARNING</span>
                <span className="block text-pink-300 drop-shadow-md">PLATFORM</span>
              </h1>

              {/* "For Learners" badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full px-6 py-2.5 mb-8 font-black text-lg shadow-xl">
                <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                FOR LEARNERS
                <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
              </div>

              <p className="text-blue-100 text-xl font-bold mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Learn faster with visuals, interactive comics and fun quizzes. Transform learning material into engaging visual experiences!
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/amivi"
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-3xl font-black text-xl hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(251,191,36,0.5)] transition-all"
                >
                  <Rocket className="w-6 h-6" />
                  START LEARNING
                </Link>
                <Link
                  to="/amivi"
                  className="flex items-center justify-center gap-3 px-7 py-4 bg-white/25 border-2 border-white/60 backdrop-blur-sm text-white rounded-3xl font-black text-lg hover:bg-white/35 hover:-translate-y-1 transition-all"
                >
                  <ImageIcon className="w-5 h-5" />
                  EXPLORE AMIVI
                </Link>
                <Link
                  to="/amico"
                  className="flex items-center justify-center gap-3 px-7 py-4 bg-white/25 border-2 border-white/60 backdrop-blur-sm text-white rounded-3xl font-black text-lg hover:bg-white/35 hover:-translate-y-1 transition-all"
                >
                  <BookOpen className="w-5 h-5" />
                  EXPLORE AMICO
                </Link>
              </div>

              {/* Floating mini cards */}
              <div className="flex flex-wrap gap-3 mt-10 justify-center lg:justify-start">
                {[
                  { icon: '✨', label: 'Visual Learning', bg: 'bg-yellow-400/20 border-yellow-400/40' },
                  { icon: '🎨', label: 'Create', bg: 'bg-pink-400/20 border-pink-400/40' },
                  { icon: '🧠', label: 'Understand', bg: 'bg-green-400/20 border-green-400/40' },
                  { icon: '🏆', label: 'Master', bg: 'bg-purple-400/20 border-purple-400/40' },
                ].map((card) => (
                  <div key={card.label} className={`flex items-center gap-2 px-4 py-2 ${card.bg} border rounded-2xl text-white font-bold text-sm backdrop-blur-sm animate-float`}>
                    <span className="text-base">{card.icon}</span>
                    {card.label}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right illustration ── */}
            <div className="flex-1 flex justify-center items-end relative min-h-[320px] lg:min-h-[400px]">
              {/* Boy character */}
              <div className="absolute bottom-0 left-0 lg:left-[-20px] w-40 animate-float" style={{ animationDelay: '0.3s' }}>
                <div className="w-36 h-44 bg-gradient-to-b from-orange-400 to-orange-300 rounded-t-full rounded-b-3xl shadow-2xl flex flex-col items-center justify-end pb-4 relative">
                  <div className="absolute -top-8 w-20 h-20 bg-gradient-to-b from-amber-300 to-amber-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-4xl">👦</div>
                  <div className="text-white font-black text-center text-xs leading-tight">VLQ<br/>Student</div>
                </div>
              </div>

              {/* Central illustration plate — CUTE VERSION */}
              <div className="relative z-10 mx-16 lg:mx-8 animate-float" style={{ animationDelay: '0.1s' }}>
                {/* Outer glow ring */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/40 via-pink-400/30 to-purple-400/40 rounded-4xl blur-xl scale-110 pointer-events-none" />

                {/* Card */}
                <div className="relative bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl border-2 border-white/50 rounded-4xl p-7 shadow-2xl text-center min-w-[200px]">

                  {/* Corner sparkles */}
                  <span className="absolute -top-3 -left-3 text-2xl animate-sparkle">✨</span>
                  <span className="absolute -top-3 -right-3 text-2xl animate-sparkle" style={{ animationDelay: '0.5s' }}>⭐</span>
                  <span className="absolute -bottom-3 -left-3 text-xl animate-sparkle" style={{ animationDelay: '1s' }}>💫</span>
                  <span className="absolute -bottom-3 -right-3 text-xl animate-sparkle" style={{ animationDelay: '1.5s' }}>✨</span>

                  {/* Robot with glow */}
                  <div className="relative inline-block mb-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-pink-400 rounded-full blur-md opacity-60 scale-125" />
                    <div className="relative text-7xl leading-none select-none">🤖</div>
                  </div>

                  {/* Title */}
                  <div className="font-black text-white text-xl drop-shadow-md leading-tight">
                    AI Learning
                  </div>

                  {/* Cute pill badge */}
                  <div className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-black text-xs px-3 py-1 rounded-full mt-2 mb-4 shadow-lg">
                    ⚡ 60,000× faster!
                  </div>

                  {/* Colorful icon row */}
                  <div className="flex justify-center gap-3">
                    {[['📚', 'bg-blue-400'],['💡', 'bg-yellow-400'],['🎨', 'bg-pink-400']].map(([e, bg], i) => (
                      <div
                        key={e}
                        className={`w-11 h-11 ${bg} rounded-2xl flex items-center justify-center text-xl shadow-lg animate-float`}
                        style={{ animationDelay: `${i * 0.4}s` }}
                      >
                        {e}
                      </div>
                    ))}
                  </div>

                  {/* Rainbow dots bottom */}
                  <div className="flex justify-center gap-1.5 mt-4">
                    {['bg-red-400','bg-yellow-400','bg-green-400','bg-blue-400','bg-purple-400'].map(c => (
                      <div key={c} className={`w-2 h-2 ${c} rounded-full`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Girl character */}
              <div className="absolute bottom-0 right-0 lg:right-[-20px] w-40 animate-float" style={{ animationDelay: '0.7s' }}>
                <div className="w-36 h-44 bg-gradient-to-b from-pink-400 to-pink-300 rounded-t-full rounded-b-3xl shadow-2xl flex flex-col items-center justify-end pb-4 relative">
                  <div className="absolute -top-8 w-20 h-20 bg-gradient-to-b from-pink-200 to-pink-300 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-4xl">👧</div>
                  <div className="text-white font-black text-center text-xs leading-tight">AMICO<br/>Reader</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <WaveDivider fill="#f0f9ff" />
      </section>

      {/* ── 2. HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-sky-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full px-6 py-2 font-black text-sm mb-4 uppercase tracking-widest">
              Simple Steps
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-blue-900">
              HOW VLQ MAKES LEARNING <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500">FUN</span>
            </h2>
            <p className="text-gray-500 font-bold text-xl mt-3">60,000 times faster than text!</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Arrows */}
            <div className="hidden md:flex absolute top-1/2 left-[31%] -translate-y-1/2 z-10">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-300/50">
                <ChevronRight className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="hidden md:flex absolute top-1/2 right-[31%] -translate-y-1/2 z-10">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-300/50">
                <ChevronRight className="w-7 h-7 text-white" />
              </div>
            </div>

            <HowCard
              num="01" emoji="📥" title="RECEIVES" sub="Take In"
              desc="Convert your learning material into fun visual content."
              from="from-blue-500" to="to-cyan-500"
              border="border-blue-400" bg="bg-blue-50"
            />
            <HowCard
              num="02" emoji="🧠" title="UNDERSTANDS" sub="Sort Out"
              desc="AI identifies the important concepts and organizes them."
              from="from-green-500" to="to-teal-500"
              border="border-green-400" bg="bg-green-50"
            />
            <HowCard
              num="03" emoji="🚀" title="RESPONDS" sub="Understand It"
              desc="Learners interact, practice and remember through visuals."
              from="from-purple-500" to="to-pink-500"
              border="border-purple-400" bg="bg-purple-50"
            />
          </div>

          {/* Quote strip */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-4xl p-6 text-center flex flex-wrap gap-4 justify-center items-center">
            {['See it.', 'Understand it.', 'Remember it.', 'Apply it.', 'Master it.'].map((text, i) => (
              <span key={i} className={`font-black text-xl ${['text-yellow-300', 'text-green-300', 'text-pink-300', 'text-orange-300', 'text-cyan-300'][i]}`}>
                {text}
              </span>
            ))}
            <span className="font-black text-white text-xl">That's the VLQ Way! ✨</span>
          </div>
        </div>
      </section>



      {/* ── 4. AMICO SECTION ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 relative overflow-hidden">
        <FloatingStar size={26} color="#f472b6" top="10%" left="5%"  delay="0.5s" />
        <FloatingStar size={20} color="#a78bfa" top="70%" right="6%" delay="1.2s" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1">
              <div className="inline-block bg-pink-100 border border-pink-300 rounded-full px-4 py-1.5 font-black text-pink-600 text-sm mb-4 uppercase tracking-widest">
                📚 Comic AI
              </div>
              <h2 className="text-6xl font-black text-purple-800 mb-2">AMICO</h2>
              <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl px-5 py-1.5 font-black text-2xl mb-6">IMAGINE IT. 💭</div>
              <p className="text-gray-700 text-xl font-bold mb-10 leading-relaxed">
                Turn what you learn into fun, interactive comic stories! 🦸‍♀️🦸‍♂️
              </p>
              <Link
                to="/amico"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-3xl font-black text-xl hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(236,72,153,0.4)] transition-all"
              >
                📚 CREATE COMIC
              </Link>
            </div>

            {/* Comic feature bubbles */}
            <div className="flex-1 w-full max-w-md">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['💬', 'Speech Bubbles', 'from-pink-400 to-rose-400'],
                  ['👤', 'Custom Characters', 'from-purple-400 to-indigo-400'],
                  ['🎨', 'AI Artwork', 'from-orange-400 to-yellow-400'],
                  ['📖', 'Multiple Pages', 'from-green-400 to-teal-400'],
                  ['✨', '2–7 Panels', 'from-blue-400 to-cyan-400'],
                  ['🤩', 'Fun Stories', 'from-pink-500 to-purple-500'],
                ].map(([e, l, g]) => (
                  <div key={l} className={`bg-gradient-to-br ${g} text-white rounded-3xl p-5 shadow-lg card-hover flex flex-col items-center gap-2 text-center`}>
                    <span className="text-4xl">{e}</span>
                    <span className="font-black text-sm leading-tight">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. QUIZ SECTION ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <FloatingStar size={28} color="#fbbf24" top="8%"  left="5%"  delay="0s"   />
        <FloatingStar size={20} color="#f9a8d4" top="80%" right="7%" delay="1s"   />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-block bg-yellow-400/20 border border-yellow-400/40 rounded-full px-4 py-1.5 font-black text-yellow-300 text-sm mb-4 uppercase tracking-widest">
                🧩 Quiz Game
              </div>
              <h2 className="text-6xl font-black mb-2">QUIZ</h2>
              <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-2xl px-5 py-1.5 font-black text-2xl mb-6">MASTER IT. 🏆</div>
              <p className="text-purple-100 text-xl font-bold mb-10 leading-relaxed">
                Test what you learned and earn points! Challenge yourself and beat your high score! ⭐
              </p>
              <div className="flex gap-3 flex-wrap mb-10">
                {['⭐ Earn Points', '🏆 Win Badges', '🔥 Keep Streaks', '📈 Track Progress'].map((t) => (
                  <div key={t} className="bg-white/10 border border-white/20 rounded-2xl px-4 py-2 font-bold text-sm backdrop-blur-sm">
                    {t}
                  </div>
                ))}
              </div>
              <Link
                to="/quiz"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-3xl font-black text-xl hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(251,191,36,0.5)] transition-all"
              >
                🧩 START QUIZ
              </Link>
            </div>

            {/* Quiz Preview card */}
            <div className="flex-1 w-full max-w-md">
              <div className="bg-white rounded-4xl overflow-hidden shadow-2xl text-gray-800">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-5 flex justify-between items-center">
                  <span className="text-white font-black text-lg">Question 3/5</span>
                  <span className="bg-yellow-400 text-gray-900 font-black px-4 py-1.5 rounded-full shadow-md">Score: 40 ⭐</span>
                </div>

                <div className="p-6">
                  <div className="w-full h-36 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl border-2 border-dashed border-orange-300 flex items-center justify-center mb-5 text-6xl">
                    🔴
                  </div>
                  <h3 className="text-xl font-black text-gray-800 mb-5">What planet is known as the Red Planet? 🌌</h3>

                  <div className="space-y-3">
                    <div className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 font-bold text-gray-600">A. Earth 🌍</div>
                    <div className="w-full px-5 py-3.5 rounded-2xl border-2 border-green-400 bg-green-50 font-black text-green-700 flex justify-between items-center">
                      <span>B. Mars 🔴</span>
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="w-full px-5 py-3.5 rounded-2xl border-2 border-gray-200 font-bold text-gray-600">C. Jupiter 🪐</div>
                  </div>

                  <div className="flex justify-between items-center mt-5">
                    <span className="text-green-600 font-black bg-green-100 px-4 py-2 rounded-xl">✅ Correct! +20 XP</span>
                    <button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-2.5 rounded-2xl font-black hover:scale-105 transition-transform">
                      NEXT →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. THREE CORE FEATURES ───────────────────────────────────────────── */}
      <section className="py-20 bg-sky-50 relative overflow-hidden">
        <FloatingStar size={22} color="#fbbf24" top="10%" right="5%" delay="0s" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-blue-900">
              ONE PLATFORM. <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">THREE</span> WAYS TO LEARN.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <CoreCard
              emoji="🎨" title="AMIVI" sub="See it." path="/amivi"
              desc="Transform learning material into powerful visual explanations."
              gradient="from-blue-500 to-cyan-500" btnColor="bg-blue-500 hover:bg-blue-600"
            />
            <CoreCard
              emoji="📚" title="AMICO" sub="Imagine it." path="/amico"
              desc="Turn concepts into memorable comic stories."
              gradient="from-pink-500 to-purple-500" btnColor="bg-pink-500 hover:bg-pink-600"
            />
            <CoreCard
              emoji="🧩" title="QUIZ" sub="Master it." path="/quiz"
              desc="Test your understanding with interactive visual quizzes."
              gradient="from-purple-500 to-indigo-500" btnColor="bg-purple-500 hover:bg-purple-600"
            />
          </div>
        </div>
      </section>

      {/* ── 7. GAMIFICATION ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-yellow-50 to-orange-50 border-y-4 border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-orange-700 mb-4">LEARN. PLAY. ACHIEVE. 🎉</h2>
          <p className="text-gray-600 font-bold text-xl mb-12">Earn points, badges and level up as you learn!</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { icon: '⭐', label: '250 Points', color: 'from-yellow-400 to-orange-400', sub: 'Keep earning!' },
              { icon: '🏆', label: 'Visual Explorer', color: 'from-purple-400 to-indigo-400', sub: 'Badge earned!' },
              { icon: '🔥', label: '5 Day Streak', color: 'from-orange-400 to-red-400', sub: 'On fire!' },
              { icon: '🎯', label: '80% Mastery', color: 'from-green-400 to-teal-400', sub: 'Almost there!' },
              { icon: '🚀', label: 'Level 3', color: 'from-blue-400 to-cyan-400', sub: 'Rising star!' },
            ].map((item) => (
              <div key={item.label} className={`bg-gradient-to-br ${item.color} text-white rounded-4xl p-6 shadow-xl card-hover flex flex-col items-center gap-3`}>
                <span className="text-5xl animate-float" style={{ animationDelay: Math.random() + 's' }}>{item.icon}</span>
                <div className="font-black text-center leading-tight">{item.label}</div>
                <div className="text-white/70 text-xs font-bold">{item.sub}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-sm text-gray-500 font-bold bg-yellow-100 border border-yellow-300 rounded-2xl px-6 py-3 inline-block">
            ℹ️ Gamification features are coming soon! These are previews of the VLQ achievement system.
          </div>
        </div>
      </section>

      {/* ── 8. LEARNING JOURNEY ──────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-green-50 via-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-green-800 mb-16">YOUR LEARNING ADVENTURE 🗺️</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-0 overflow-x-auto pb-4">
            {[
              { icon: '🚀', label: 'START', color: 'bg-blue-500' },
              { icon: '👁️', label: 'SEE', color: 'bg-cyan-500' },
              { icon: '🧠', label: 'UNDERSTAND', color: 'bg-purple-500' },
              { icon: '🎨', label: 'CREATE', color: 'bg-pink-500' },
              { icon: '📝', label: 'PRACTICE', color: 'bg-orange-500' },
              { icon: '🏆', label: 'MASTER', color: 'bg-yellow-500' },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-20 h-20 ${step.color} text-white rounded-full flex items-center justify-center text-4xl shadow-xl card-hover`}>
                    {step.icon}
                  </div>
                  <div className="font-black text-gray-700 mt-2 text-sm">{step.label}</div>
                </div>
                {i < arr.length - 1 && (
                  <div className="hidden sm:flex w-12 h-4 items-center justify-center mx-1">
                    <div className="w-full h-2 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. BENEFITS ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-blue-900 mb-16">
            <span className="text-blue-600">SEE IT.</span>{' '}
            <span className="text-green-600">UNDERSTAND IT.</span>{' '}
            <span className="text-pink-600">REMEMBER IT.</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: '👁️', title: 'Visual Learning', color: 'bg-blue-500', desc: 'See concepts, not just words' },
              { icon: '🧠', title: 'Better Understanding', color: 'bg-green-500', desc: 'AI explains in simple terms' },
              { icon: '🎮', title: 'Active Practice', color: 'bg-orange-500', desc: 'Learn by doing & playing' },
              { icon: '✅', title: 'Better Recall', color: 'bg-purple-500', desc: 'Remember 6× more with visuals' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center card-hover">
                <div className={`w-24 h-24 ${item.color} text-white rounded-full flex items-center justify-center text-5xl shadow-xl mb-5`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-black text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 font-bold text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function HowCard({ num, emoji, title, sub, desc, from, to, border, bg }) {
  return (
    <div className={`relative ${bg} border-4 ${border} rounded-4xl p-8 text-center shadow-xl card-hover`}>
      <div className={`absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br ${from} ${to} text-white font-black text-xl flex items-center justify-center shadow-lg`}>
        {num}
      </div>
      <div className="text-6xl mt-4 mb-4">{emoji}</div>
      <h3 className={`text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br ${from} ${to} mb-1`}>{title}</h3>
      <div className={`inline-block bg-gradient-to-r ${from} ${to} text-white rounded-full px-4 py-1 font-black text-sm mb-3`}>
        » {sub} «
      </div>
      <p className="text-gray-600 font-bold leading-relaxed">{desc}</p>
    </div>
  );
}

function CoreCard({ emoji, title, sub, desc, path, gradient, btnColor }) {
  return (
    <Link to={path} className="block bg-white rounded-4xl overflow-hidden shadow-xl card-hover border-2 border-gray-100 group">
      <div className={`bg-gradient-to-br ${gradient} p-10 text-center`}>
        <div className="text-7xl mb-4">{emoji}</div>
        <div className="text-white font-black text-3xl">{title}</div>
        <div className="text-white/80 font-bold text-lg">{sub}</div>
      </div>
      <div className="p-8 text-center">
        <p className="text-gray-600 font-bold text-lg mb-6 leading-relaxed">{desc}</p>
        <div className={`${btnColor} text-white font-black py-3 px-6 rounded-2xl transition-colors inline-block group-hover:scale-105 transition-transform`}>
          Open →
        </div>
      </div>
    </Link>
  );
}
