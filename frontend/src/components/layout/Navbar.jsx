import { useState } from 'react';
import { Menu, X, User, Globe, Image as ImageIcon, BookOpen, HelpCircle, Library, ChevronDown, Users, GraduationCap, Video, LayoutDashboard, ClipboardList, LogOut, Home } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const navLinks = [
  { name: 'Home',          path: '/',               icon: Home },
  { name: 'Dashboard',     path: '/dashboard',     icon: LayoutDashboard },
  { name: 'AMIVI',         path: '/amivi',         icon: ImageIcon },
  { name: 'AMICO',         path: '/amico',         icon: BookOpen },
  { name: 'Quiz',          path: '/quiz',          icon: HelpCircle },
  { name: 'Library',       path: '/library',       icon: Library },
  { name: 'Classroom',     path: '/classroom',     icon: ClipboardList },
  { name: 'Collaborate',   path: '/collaborative', icon: Users },
  { name: 'Courses',       path: '/courses',       icon: GraduationCap },
  { name: 'Tutorials',     path: '/tutorials',     icon: Video },
];

function LanguageSwitcher({ langOpen, setLangOpen, language, setLanguage }) {
  return (
    <div className="relative">
      <button
        onClick={() => setLangOpen(!langOpen)}
        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-white hover:bg-white/15 font-bold transition-all text-sm"
      >
        <Globe className="w-5 h-5" />
        <span>{language === 'es' ? 'Español' : 'English'}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      {langOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
          <button
            onClick={() => { setLanguage('en'); setLangOpen(false); }}
            className={`w-full text-left px-4 py-3 text-sm font-semibold flex items-center space-x-2 hover:bg-slate-50 ${language === 'en' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-700'}`}
          >
            <span>🇬🇧</span>
            <span>English</span>
          </button>
          <button
            onClick={() => { setLanguage('es'); setLangOpen(false); }}
            className={`w-full text-left px-4 py-3 text-sm font-semibold flex items-center space-x-2 hover:bg-slate-50 ${language === 'es' ? 'text-indigo-700 bg-indigo-50' : 'text-slate-700'}`}
          >
            <span>🇪🇸</span>
            <span>Español</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  // Public / signed-out header — no app nav links (they'd only bounce
  // back to /login), just the brand and a way to log in or register.
  if (!isAuthenticated) {
    return (
      <header className="sticky top-0 z-50 bg-indigo-950/40 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="w-full px-6 lg:px-12 flex items-center justify-between" style={{ height: 84 }}>
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img src="/vlq-logo-clean.png" alt="VLQ" className="h-9 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span className="font-extrabold text-lg text-white tracking-tight">VLQ</span>
          </Link>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher langOpen={langOpen} setLangOpen={setLangOpen} language={language} setLanguage={setLanguage} />
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-white hover:bg-white/15 transition-all"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-extrabold text-sm shadow-md hover:bg-indigo-50 hover:-translate-y-0.5 transition-all"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2.5 text-white hover:bg-white/15 rounded-xl transition-colors"
          >
            {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-200 shadow-lg px-4 py-4 space-y-3 z-50">
            <div className="flex gap-2">
              <button
                onClick={() => { setLanguage('en'); setIsOpen(false); }}
                className={`flex-1 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 ${language === 'en' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
              <button
                onClick={() => { setLanguage('es'); setIsOpen(false); }}
                className={`flex-1 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 ${language === 'es' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                <span>🇪🇸</span>
                <span>Español</span>
              </button>
            </div>
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center px-4 py-3 bg-slate-50 text-slate-700 rounded-xl font-bold w-full"
            >
              Log in
            </Link>
            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold w-full"
            >
              Sign up
            </Link>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-indigo-950/40 backdrop-blur-xl border-b border-white/20 shadow-lg">
      <div className="w-full px-6 lg:px-12 flex items-center" style={{ height: 84 }}>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-1 lg:gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 lg:px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-md'
                      : 'text-white hover:bg-white/15'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{t(link.name)}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher langOpen={langOpen} setLangOpen={setLangOpen} language={language} setLanguage={setLanguage} />
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-extrabold text-sm shadow-md hover:bg-indigo-50 hover:-translate-y-0.5 transition-all"
            >
              <User className="w-5 h-5" />
              <span>{user?.name ? user.name.split(' ')[0] : t(user?.role === 'teacher' ? 'Teacher' : 'Student')}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 font-semibold truncate">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <User className="w-4 h-4" /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden ml-auto p-2.5 text-white hover:bg-white/15 rounded-xl transition-colors"
        >
          {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-slate-200 shadow-lg px-4 py-4 space-y-1 z-50">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 w-full px-4 py-3.5 rounded-xl font-bold text-base transition-colors ${
                    isActive ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{t(link.name)}</span>
              </NavLink>
            );
          })}
          <div className="pt-3 mt-2 border-t border-slate-200 flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => { setLanguage('en'); setIsOpen(false); }}
                className={`flex-1 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 ${language === 'en' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
              <button
                onClick={() => { setLanguage('es'); setIsOpen(false); }}
                className={`flex-1 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 ${language === 'es' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                <span>🇪🇸</span>
                <span>Español</span>
              </button>
            </div>
            <div className="px-1">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 font-semibold truncate">{user?.email}</p>
            </div>
            <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold w-full justify-center">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-500 rounded-xl font-bold w-full justify-center">
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
