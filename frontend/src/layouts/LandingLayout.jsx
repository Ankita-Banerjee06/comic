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
      <footer className="relative pt-10 pb-6 md:pt-14 md:pb-8 overflow-hidden" style={{ background: 'linear-gradient(120deg, #eff6ff 0%, #f5f3ff 55%, #fdf2f8 100%)' }}>
        <div aria-hidden className="absolute top-0 inset-x-0 h-1.5" style={{ background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 33%, #db2777 66%, #16a34a 100%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/vlq-logo-clean.png" alt="VLQ" className="h-8 w-auto object-contain" />
                <div>
                  <div className="text-xl font-extrabold leading-none" style={{ color: '#000000' }}>VLQ</div>
                  <div className="text-sm font-medium mt-0.5" style={{ color: '#000000' }}>Visual Learning Platform</div>
                </div>
              </div>
              <p className="text-base font-medium max-w-xs leading-relaxed" style={{ color: '#000000' }}>
                Turning any material into clear visuals, comics and quizzes that help ideas stick.
              </p>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-sm mb-4" style={{ color: '#000000' }}>Platform</h3>
              <ul className="space-y-2.5">
                <li><Link to="/amivi" className="hover:text-blue-600 font-medium text-base transition-colors" style={{ color: '#000000' }}>AMIVI</Link></li>
                <li><Link to="/amico" className="hover:text-pink-600 font-medium text-base transition-colors" style={{ color: '#000000' }}>AMICO</Link></li>
                <li><Link to="/quiz" className="hover:text-purple-600 font-medium text-base transition-colors" style={{ color: '#000000' }}>Quiz</Link></li>
                <li><Link to="/library" className="hover:text-green-600 font-medium text-base transition-colors" style={{ color: '#000000' }}>Library</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold uppercase tracking-wider text-sm mb-4" style={{ color: '#000000' }}>Company</h3>
              <ul className="space-y-2.5">
                <li><Link to="/" className="hover:text-blue-600 font-medium text-base transition-colors" style={{ color: '#000000' }}>About</Link></li>
                <li><Link to="/" className="hover:text-blue-600 font-medium text-base transition-colors" style={{ color: '#000000' }}>Help</Link></li>
                <li><Link to="/" className="hover:text-blue-600 font-medium text-base transition-colors" style={{ color: '#000000' }}>Privacy policy</Link></li>
                <li><Link to="/" className="hover:text-blue-600 font-medium text-base transition-colors" style={{ color: '#000000' }}>Terms of service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-6 text-sm font-medium" style={{ borderColor: 'rgba(124,58,237,0.15)', color: '#000000' }}>
            <p>© {new Date().getFullYear()} VLQ — The Visual Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
