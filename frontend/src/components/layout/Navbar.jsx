import { Search, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="h-16 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6">
      
      {/* Mobile Menu Button (placeholder) */}
      <div className="md:hidden flex items-center">
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-fuchsia-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
          V
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md hidden md:flex items-center">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyan-400 transition-colors">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-xl leading-5 bg-gray-950/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 sm:text-sm transition-all shadow-inner"
            placeholder="Search projects, visuals, or comics..."
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.8)]"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-800 hidden sm:block"></div>
        
        <Link to="/profile" className="flex items-center space-x-3 p-1 rounded-full hover:bg-gray-800 pr-3 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center border border-gray-600">
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <span className="text-sm font-medium hidden sm:block text-gray-200">
            Alex Chen
          </span>
        </Link>
      </div>
    </header>
  );
}
