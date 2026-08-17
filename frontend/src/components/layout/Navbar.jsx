import { useState } from 'react';
import { Menu, X, User, Globe, Home, Image as ImageIcon, BookOpen, HelpCircle, Library } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

const navLinks = [
  { name: 'Home',    path: '/',        icon: Home,       pill: 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300'  },
  { name: 'AMIVI',  path: '/amivi',   icon: ImageIcon,  pill: 'bg-green-400 text-green-900 hover:bg-green-300'     },
  { name: 'AMICO',  path: '/amico',   icon: BookOpen,   pill: 'bg-pink-400 text-pink-900 hover:bg-pink-300'        },
  { name: 'Quiz',   path: '/quiz',    icon: HelpCircle, pill: 'bg-purple-400 text-white hover:bg-purple-300'       },
  { name: 'Library',path: '/library', icon: Library,    pill: 'bg-orange-400 text-orange-900 hover:bg-orange-300'  },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex flex-col items-center justify-center group mt-1" aria-label="VLQ Home">
          <img
            src="/vlq-logo-clean.png"
            alt="VLQ – Visual Learning Platform"
            className="h-16 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-xl"
          />
          <span className="text-[10px] font-bold tracking-[0.25em] text-white/90 uppercase mt-1 group-hover:text-white transition-colors drop-shadow-md">
            Since 2026
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-2xl font-black text-sm transition-all hover:scale-105 shadow-md ${link.pill}`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center space-x-3">
          <button className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 font-bold transition-all text-sm">
            <Globe className="w-4 h-4" />
            <span>EN</span>
          </button>
          <Link to="/profile" className="flex items-center space-x-2 px-4 py-2.5 bg-white text-blue-600 rounded-2xl font-black text-sm hover:bg-blue-50 hover:scale-105 transition-all shadow-md">
            <User className="w-4 h-4" />
            <span>Student</span>
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
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-4 border-t border-white/20 flex items-center justify-between">
            <button className="flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-white/80">
              <Globe className="w-4 h-4" />
              <span>Language: EN</span>
            </button>
            <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 px-4 py-2.5 bg-white text-blue-600 rounded-xl font-black shadow-md">
              <User className="w-4 h-4" />
              <span>Student</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
