import { Outlet } from 'react-router-dom';

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-fuchsia-500/30">
      <header className="border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-fuchsia-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
              V
            </div>
            <span className="text-xl font-bold tracking-tight">VLQ</span>
          </div>
          <nav className="flex space-x-6 items-center">
            <a href="/login" className="text-gray-300 hover:text-white font-medium transition-colors">Log In</a>
            <a href="/register" className="bg-cyan-500 hover:bg-cyan-400 text-gray-950 px-4 py-2 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              Get Started
            </a>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-gray-900 mt-20 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>© 2026 The Visual Learning Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
