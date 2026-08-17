import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function LandingLayout() {
  return (
    <div className="min-h-screen bg-sky-50 text-gray-900 font-sans selection:bg-yellow-200/60 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-blue-900 to-purple-900 text-white pt-16 pb-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-lg">
                  V
                </div>
                <div>
                  <div className="text-2xl font-black">VLQ</div>
                  <div className="text-xs text-blue-200">Visual Learning Platform</div>
                </div>
              </div>
              <p className="text-blue-200 font-bold italic text-lg">✨ Learn at the Speed of Sight.</p>
              <p className="text-blue-300 mt-2 text-sm">Making learning fun, visual, and exciting for every child!</p>
            </div>

            <div>
              <h3 className="font-black text-yellow-300 uppercase tracking-wider text-sm mb-5">🚀 Platform</h3>
              <ul className="space-y-3">
                <li><Link to="/amivi" className="text-blue-200 hover:text-yellow-300 font-bold transition-colors flex items-center gap-2">🎨 AMIVI</Link></li>
                <li><Link to="/amico" className="text-blue-200 hover:text-yellow-300 font-bold transition-colors flex items-center gap-2">📚 AMICO</Link></li>
                <li><Link to="/quiz" className="text-blue-200 hover:text-yellow-300 font-bold transition-colors flex items-center gap-2">🧩 Quiz</Link></li>
                <li><Link to="/library" className="text-blue-200 hover:text-yellow-300 font-bold transition-colors flex items-center gap-2">📖 Library</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-black text-yellow-300 uppercase tracking-wider text-sm mb-5">🏫 Company</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-blue-200 hover:text-yellow-300 font-bold transition-colors">About</Link></li>
                <li><Link to="/" className="text-blue-200 hover:text-yellow-300 font-bold transition-colors">Help</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-700/50 pt-8 text-center text-blue-300 text-sm font-semibold">
            <p>© {new Date().getFullYear()} VLQ — The Visual Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
