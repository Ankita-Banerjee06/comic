import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email address
          </label>
          <div className="mt-1">
            <input id="email" name="email" type="email" required className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-950/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all" placeholder="Enter your email" />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <div className="mt-1">
            <input id="password" name="password" type="password" required className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-950/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all" placeholder="••••••••" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-700 rounded bg-gray-950" />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-cyan-400 hover:text-cyan-300">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <Link to="/dashboard" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-cyan-500/20 text-sm font-bold text-gray-950 bg-cyan-500 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 transition-all">
            Sign in
          </Link>
        </div>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900/50 text-gray-500 backdrop-blur-xl">Or continue with</span>
          </div>
        </div>
        <div className="mt-6">
          <button className="w-full flex justify-center py-3 px-4 border border-gray-700 rounded-xl shadow-sm bg-gray-800/50 text-sm font-medium text-white hover:bg-gray-700 transition-colors">
            Google
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-fuchsia-400 hover:text-fuchsia-300">
          Sign up now
        </Link>
      </p>
    </div>
  );
}
