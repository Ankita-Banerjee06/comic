import { useState } from 'react';
import { Menu, X, User, Globe, ChevronDown, GraduationCap, Video, LogOut, Home, Compass, CreditCard, Lightbulb, Info } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const navLinks = [
  { name: 'Home',          path: '/',               icon: Home },
  { name: 'Introduction',  path: '/introduction',  icon: Info },
  { name: 'Explore',       path: '/explore',       icon: Compass },
  { name: 'How We Do It',  path: '/how-we-do-it',  icon: Lightbulb },
  { name: 'Courses',       path: '/courses',       icon: GraduationCap },
  { name: 'Video Tutorials', path: '/tutorials',   icon: Video },
  { name: 'Plans',          path: '/plans',         icon: CreditCard },
];

function LanguageSwitcher() {
  // Only English is supported right now, so this is a plain label
  // rather than a dropdown — nothing to switch to yet.
  return (
    <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-white font-bold text-lg">
      <Globe className="w-5 h-5" />
      <span>English</span>
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { t } = useLanguage();
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
      <header className="sticky top-0 z-50 bg-slate-950 border-b border-white/10 shadow-lg">
        <div className="w-full px-6 lg:px-12 flex items-center justify-between" style={{ height: 84 }}>
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src="/vlq-logo-clean.png" alt="VLQ" className="h-14 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span className="ml-2.5 text-base font-bold uppercase tracking-widest text-white hidden sm:inline leading-tight">
              Learn at the<br />Speed of Sight
            </span>
          </Link>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl font-bold text-base text-white hover:bg-white/15 transition-all"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-extrabold text-base shadow-md hover:bg-indigo-50 hover:-translate-y-0.5 transition-all"
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
    <header className="sticky top-0 z-50 bg-slate-950 border-b border-white/10 shadow-lg">
      <div className="w-full px-6 lg:px-12 flex items-center gap-4" style={{ height: 84 }}>

        <Link to="/" className="flex items-center flex-shrink-0">
          <img src="/vlq-logo-clean.png" alt="VLQ" className="h-12 w-auto object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <span className="ml-2 text-sm font-bold uppercase tracking-widest text-white hidden xl:inline leading-tight">
            Learn at the<br />Speed of Sight
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-0.5 flex-wrap">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2.5 lg:px-3 py-2 rounded-xl font-bold text-xl transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-md'
                      : 'text-white hover:bg-white/15'
                  }`
                }
              >
                <Icon className="w-6 h-6" />
                <span>{t(link.name)}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 rounded-xl font-extrabold text-lg shadow-md hover:bg-indigo-50 hover:-translate-y-0.5 transition-all"
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
                  `flex items-center gap-3 w-full px-4 py-3.5 rounded-xl font-bold text-lg transition-colors ${
                    isActive ? 'text-indigo-700 bg-indigo-50' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-6 h-6" />
                <span>{t(link.name)}</span>
              </NavLink>
            );
          })}
          <div className="pt-3 mt-2 border-t border-slate-200 flex flex-col gap-3">
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
