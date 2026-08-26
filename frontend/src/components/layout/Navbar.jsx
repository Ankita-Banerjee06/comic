import { useState } from 'react';
import { Menu, X, User, Globe, Home, Image as ImageIcon, BookOpen, HelpCircle, Library, ChevronDown, Users, GraduationCap, Video } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const navLinks = [
  { name: 'Home',          path: '/',              icon: Home },
  { name: 'AMIVI',         path: '/amivi',         icon: ImageIcon },
  { name: 'AMICO',         path: '/amico',         icon: BookOpen },
  { name: 'Quiz',          path: '/quiz',          icon: HelpCircle },
  { name: 'Library',       path: '/library',       icon: Library },
  { name: 'Courses',       path: '/courses',       icon: GraduationCap },
  { name: 'Tutorials',     path: '/tutorials',     icon: Video },
  { name: 'Collaborate',   path: '/collaborative', icon: Users },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="w-full px-6 lg:px-12 h-18 flex items-center justify-between" style={{ height: 76 }}>

        <Link to="/" className="flex-shrink-0 flex items-center justify-center group" aria-label="VLQ Home">
          <img
            src="/vlq-logo-clean.png"
            alt="VLQ – Visual Learning Platform"
            className="h-11 w-auto flex-shrink-0 object-contain"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-2.5 lg:px-3.5 py-2 rounded-lg font-bold text-xs lg:text-sm transition-colors flex-shrink-0 ${
                    isActive
                      ? 'text-indigo-700 bg-indigo-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{t(link.name)}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-semibold transition-all text-sm"
            >
              <Globe className="w-4 h-4" />
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
          <Link to="/profile" className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors">
            <User className="w-4 h-4" />
            <span>{t('Student')}</span>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                  `flex items-center gap-3 w-full px-4 py-3 rounded-lg font-bold text-base transition-colors ${
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
                className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${language === 'en' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
              <button
                onClick={() => { setLanguage('es'); setIsOpen(false); }}
                className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${language === 'es' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                <span>🇪🇸</span>
                <span>Español</span>
              </button>
            </div>
            <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg font-bold w-full justify-center">
              <User className="w-4 h-4" />
              <span>{t('Student')}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
