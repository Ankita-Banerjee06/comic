import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 text-center text-gray-400">
        <p>Enter your email address and we'll send you a link to reset your password.</p>
      </div>
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
          <button type="button" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-cyan-500/20 text-sm font-bold text-gray-950 bg-cyan-500 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 transition-all">
            Send Reset Link
          </button>
        </div>
      </form>
      
      <p className="mt-8 text-center text-sm text-gray-400">
        Remember your password?{' '}
        <Link to="/login" className="font-medium text-fuchsia-400 hover:text-fuchsia-300">
          Back to Login
        </Link>
      </p>
    </div>
  );
}
