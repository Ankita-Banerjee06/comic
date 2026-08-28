import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password are both required.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Incorrect email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-950/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-4 py-3 border border-gray-700 rounded-xl bg-gray-950/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-cyan-400 hover:text-cyan-300">
              Forgot your password?
            </Link>
          </div>
        </div>

        {error && <p className="text-red-400 font-medium text-sm text-center whitespace-pre-wrap">{error}</p>}

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-cyan-500/20 text-sm font-bold text-gray-950 bg-cyan-500 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 transition-all disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin text-gray-950" />}
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-fuchsia-400 hover:text-fuchsia-300">
          Sign up now
        </Link>
      </p>
    </div>
  );
}
