import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function LandingLayout() {
  return (
    <div className="min-h-screen text-gray-900 font-sans selection:bg-yellow-200/60 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/vlq-logo-clean.png" alt="VLQ" className="h-8 w-auto object-contain" />
                <div>
                  <div className="text-lg font-extrabold text-slate-900 leading-none">VLQ</div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">Visual Learning Platform</div>
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium max-w-xs leading-relaxed">
                Turning any material into clear visuals, comics and quizzes that help ideas stick.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-slate-400 uppercase tracking-wider text-xs mb-4">Platform</h3>
              <ul className="space-y-2.5">
                <li><Link to="/amivi" className="text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors">AMIVI</Link></li>
                <li><Link to="/amico" className="text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors">AMICO</Link></li>
                <li><Link to="/quiz" className="text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors">Quiz</Link></li>
                <li><Link to="/library" className="text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors">Library</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-400 uppercase tracking-wider text-xs mb-4">Company</h3>
              <ul className="space-y-2.5">
                <li><Link to="/" className="text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors">About</Link></li>
                <li><Link to="/" className="text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors">Help</Link></li>
                <li><Link to="/" className="text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors">Privacy policy</Link></li>
                <li><Link to="/" className="text-slate-600 hover:text-blue-700 font-medium text-sm transition-colors">Terms of service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-6 text-slate-400 text-xs font-medium">
            <p>© {new Date().getFullYear()} VLQ — The Visual Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
