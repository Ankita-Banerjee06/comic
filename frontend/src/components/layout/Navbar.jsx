import { useState } from 'react';
import { Menu, X, User, Globe, Home, Image as ImageIcon, BookOpen, HelpCircle, Library, ChevronDown, Users, GraduationCap, Video } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

const navLinks = [
  { name: 'Home',          path: '/',             icon: Home,          pill: 'bg-amber-400 text-amber-950 hover:bg-amber-300' },
  { name: 'AMIVI',        path: '/amivi',        icon: ImageIcon,     pill: 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300' },
  { name: 'AMICO',        path: '/amico',        icon: BookOpen,      pill: 'bg-pink-400 text-pink-950 hover:bg-pink-300' },
  { name: 'Quiz',         path: '/quiz',         icon: HelpCircle,    pill: 'bg-purple-400 text-white hover:bg-purple-300' },
  { name: 'Library',      path: '/library',      icon: Library,       pill: 'bg-orange-400 text-orange-950 hover:bg-orange-300' },
  { name: 'Courses',      path: '/courses',      icon: GraduationCap, pill: 'bg-teal-400 text-teal-950 hover:bg-teal-300' },
  { name: 'Tutorials',    path: '/tutorials',    icon: Video,         pill: 'bg-indigo-400 text-white hover:bg-indigo-300' },
  { name: 'Collaborate',  path: '/collaborative',icon: Users,         pill: 'bg-sky-400 text-sky-950 hover:bg-sky-300' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-[#1e3a8a] shadow-xl">
      <div className="w-full px-6 lg:px-12 h-28 flex items-center justify-between">

        <Link to="/" className="flex-shrink-0 flex items-center justify-center group" aria-label="VLQ Home">
          <img
            src="/vlq-logo-clean.png"
            alt="VLQ – Visual Learning Platform"
            className="h-16 w-auto flex-shrink-0 object-contain group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-1.5 px-2.5 py-2 lg:px-4 lg:py-2.5 rounded-2xl font-black text-xs lg:text-base transition-all hover:scale-105 shadow-md flex-shrink-0 ${link.pill}`}
              >
                <Icon className="w-4 h-4" />
                <span>{t(link.name)}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="relative">
            <button 
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 font-bold transition-all text-sm"
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'es' ? 'Español' : 'English'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-xl overflow-hidden z-50">
                <button 
                  onClick={() => { setLanguage('en'); setLangOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center space-x-2 hover:bg-gray-100 ${language === 'en' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                >
                  <span>🇬🇧</span>
                  <span>English</span>
                </button>
                <button 
                  onClick={() => { setLanguage('es'); setLangOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center space-x-2 hover:bg-gray-100 ${language === 'es' ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                >
                  <span>🇪🇸</span>
                  <span>Español</span>
                </button>
              </div>
            )}
          </div>
          <Link to="/profile" className="flex items-center space-x-2 px-4 py-2.5 bg-white text-blue-900 rounded-2xl font-black text-[15px] hover:bg-blue-50 hover:scale-105 transition-all shadow-md">
            <User className="w-4 h-4" />
            <span>{t('Student')}</span>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
        >
          {isOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-24 left-0 w-full bg-gradient-to-br from-sky-500 to-indigo-600 border-t border-white/20 shadow-2xl px-4 py-6 space-y-2 z-50">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 w-full px-5 py-3 rounded-2xl font-black text-base transition-all ${link.pill}`}
              >
                <Icon className="w-5 h-5" />
                <span>{t(link.name)}</span>
              </Link>
            );
          })}
          <div className="pt-4 border-t border-white/20 flex flex-col space-y-3">
            <div className="flex space-x-2">
              <button 
                onClick={() => { setLanguage('en'); setIsOpen(false); }}
                className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center space-x-2 ${language === 'en' ? 'bg-white text-blue-600' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
              <button 
                onClick={() => { setLanguage('es'); setIsOpen(false); }}
                className={`flex-1 py-2 rounded-xl font-bold flex items-center justify-center space-x-2 ${language === 'es' ? 'bg-white text-blue-600' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                <span>🇪🇸</span>
                <span>Español</span>
              </button>
            </div>
            <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 px-4 py-2.5 bg-white text-blue-600 rounded-xl font-black shadow-md w-full justify-center">
              <User className="w-4 h-4" />
              <span>{t('Student')}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
