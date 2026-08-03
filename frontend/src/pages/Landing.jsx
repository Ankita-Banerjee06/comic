import { ArrowRight, Sparkles, BookOpen, Video, Brain, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 font-sans text-gray-200 selection:bg-fuchsia-500/30">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-4">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-gray-900/80 border border-gray-800 rounded-full px-4 py-1.5 mb-8 text-sm font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-gray-300">Introducing VLQ 2.0</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8">
            Learn at the speed of <br className="hidden lg:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-purple-600">
              sight.
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Transform dense documents into stunning visual concepts, and turn your homework into engaging comic books. The ultimate AI-powered visual learning platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/amivi" className="w-full sm:w-auto px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-gray-950 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center group">
              Try AMIVI
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/amico" className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white rounded-xl font-bold transition-all flex items-center justify-center">
              Try AMICO
            </Link>
          </div>
          
          <div className="mt-16 flex items-center justify-center space-x-2 text-gray-500 text-sm font-medium hover:text-white cursor-pointer transition-colors">
            <div className="p-2 bg-gray-900 rounded-full border border-gray-800">
              <Play className="w-4 h-4" />
            </div>
            <span>Watch Demo Video</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-900/30 border-y border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Everything you need to master any subject</h2>
            <p className="text-gray-400">Our powerful AI modules work together to create a personalized learning experience tailored exactly to how you learn best.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Sparkles className="text-cyan-400 w-6 h-6" />}
              title="AI Visual Learning"
              desc="Upload boring text and instantly get diagrams, mind maps, and flashcards."
            />
            <FeatureCard 
              icon={<BookOpen className="text-fuchsia-400 w-6 h-6" />}
              title="AI Comic Learning"
              desc="Transform your notes and PDFs into engaging, stylized comic books."
            />
            <FeatureCard 
              icon={<Brain className="text-purple-400 w-6 h-6" />}
              title="AI Quiz Generator"
              desc="Test your knowledge automatically with smart quizzes based on your material."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-white mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <Step number="01" title="Upload" desc="Drop your PDF, DOCX, or text directly into the platform." />
            <Step number="02" title="AI Processing" desc="Our engine analyzes and extracts core concepts." />
            <Step number="03" title="Learn" desc="Interact with generated visuals, comics, and videos." />
            <Step number="04" title="Save & Share" desc="Store in your library or share with classmates." />
          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-3xl hover:bg-gray-800/50 transition-colors group">
      <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ number, title, desc }) {
  return (
    <div className="relative text-center">
      <div className="text-5xl font-extrabold text-gray-800/50 mb-4">{number}</div>
      <h4 className="text-lg font-bold text-gray-200 mb-2">{title}</h4>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}
