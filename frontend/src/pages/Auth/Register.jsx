import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, GraduationCap, School, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError('Name, email, and password are all required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password, role });
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Failed to create your account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        <div>
          <span className="block text-sm font-medium text-gray-300 mb-2">I am a...</span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border transition-colors ${
                role === 'student'
                  ? 'bg-fuchsia-600/20 border-fuchsia-500 text-fuchsia-300'
                  : 'bg-gray-950/50 border-gray-700 text-gray-400 hover:text-gray-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Student
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm border transition-colors ${
                role === 'teacher'
                  ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300'
                  : 'bg-gray-950/50 border-gray-700 text-gray-400 hover:text-gray-200'
              }`}
            >
              <School className="w-4 h-4" /> Teacher
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Full Name
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
              <User className="h-5 w-5" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="appearance-none block w-full pl-12 pr-4 py-3 border border-gray-700 rounded-xl bg-gray-950/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm transition-all"
              placeholder="Your full name"
              autoComplete="off"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email address
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
              <Mail className="h-5 w-5" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full pl-12 pr-4 py-3 border border-gray-700 rounded-xl bg-gray-950/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm transition-all"
              placeholder="you@example.com"
              autoComplete="off"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">
            Password
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
              <Lock className="h-5 w-5" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full pl-12 pr-4 py-3 border border-gray-700 rounded-xl bg-gray-950/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 sm:text-sm transition-all"
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>
        </div>

        {error && <p className="text-red-400 font-medium text-sm text-center whitespace-pre-wrap">{error}</p>}

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-fuchsia-500/20 text-sm font-bold text-white bg-fuchsia-600 hover:bg-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500 focus:ring-offset-gray-900 transition-all disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
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
