import { User, Mail, CreditCard, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white">Your Profile</h1>
        <p className="text-gray-400 mt-2">Manage your personal information and subscription.</p>
      </div>

      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-fuchsia-500 p-1">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center border-4 border-gray-900">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="flex-1 space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white">
                  <User className="w-4 h-4 text-gray-500 mr-3" />
                  <span>Alex Chen</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                <div className="flex items-center bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-white">
                  <Mail className="w-4 h-4 text-gray-500 mr-3" />
                  <span>alex.chen@student.edu</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Subscription Plan</h3>
              <div className="flex items-center justify-between p-4 border border-fuchsia-500/30 bg-fuchsia-500/5 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-fuchsia-500/20 text-fuchsia-400 rounded-lg"><CreditCard className="w-5 h-5"/></div>
                  <div>
                    <p className="font-bold text-white">Pro Plan</p>
                    <p className="text-sm text-gray-400">Renews on Sept 1, 2026</p>
                  </div>
                </div>
                <button className="px-4 py-2 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                  Manage
                </button>
              </div>
            </div>
            
            <div className="pt-6">
              <Link to="/login" className="flex items-center text-red-400 hover:text-red-300 transition-colors font-medium">
                <LogOut className="w-5 h-5 mr-2" />
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
