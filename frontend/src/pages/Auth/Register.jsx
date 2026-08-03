import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Full Name
          </label>
          <div className="mt-1">
            <input id="name" name="name" type="text" required className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-950/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm transition-all" placeholder="Alex Chen" />
          </div>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email address
          </label>
          <div className="mt-1">
            <input id="email" name="email" type="email" required className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-950/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm transition-all" placeholder="Enter your email" />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <div className="mt-1">
            <input id="password" name="password" type="password" required className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-950/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm transition-all" placeholder="••••••••" />
          </div>
        </div>

        <div>
          <Link to="/dashboard" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-fuchsia-500/20 text-sm font-bold text-white bg-fuchsia-600 hover:bg-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500 focus:ring-offset-gray-900 transition-all">
            Create Account
          </Link>
        </div>
      </form>
      
      <p className="mt-8 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300">
          Sign in
        </Link>
      </p>
    </div>
  );
}
