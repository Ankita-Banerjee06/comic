import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 text-center text-gray-400 space-y-3">
        <p>Password reset emails aren't set up yet on this platform.</p>
        <p className="text-sm">
          If you're locked out of your account, ask an admin to help — or register a new account if you don't need the old one.
        </p>
      </div>

      <p className="mt-8 text-center text-sm text-gray-400">
        Remember your password?{' '}
        <Link to="/login" className="font-medium text-fuchsia-400 hover:text-fuchsia-300">
          Back to Login
        </Link>
      </p>
    </div>
  );
}
