import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  BookOpen, 
  Library, 
  Settings 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'AMIVI', path: '/amivi', icon: ImageIcon },
  { name: 'AMICO', path: '/amico', icon: BookOpen },
  { name: 'Library', path: '/library', icon: Library },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-gray-800 bg-gray-900/80 backdrop-blur-xl hidden md:flex flex-col h-full sticky top-0">
      <div className="p-6 flex items-center space-x-3 border-b border-gray-800/50">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-fuchsia-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
          V
        </div>
        <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          VLQ
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Main Menu
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 text-cyan-400 border border-cyan-500/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }`
              }
            >
              <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800/50">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700/50 text-sm">
          <p className="text-gray-300 font-medium">Pro Plan</p>
          <p className="text-gray-500 text-xs mt-1">24 days remaining</p>
          <button className="mt-3 w-full bg-gray-700 hover:bg-gray-600 text-white py-1.5 rounded-lg text-xs font-medium transition-colors">
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
}
