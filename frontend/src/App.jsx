import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import LandingLayout from './layouts/LandingLayout';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Amivi from './pages/Amivi';
import Amico from './pages/Amico';
import Quiz from './pages/Quiz';
import Video from './pages/Video';
import Library from './pages/Library';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Collaborate from './pages/Collaborate';
import Classroom from './pages/Classroom';
import Courses from './pages/Courses';
import Tutorials from './pages/Tutorials';
import QuizDecks from './pages/QuizDecks';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RedirectIfAuthed({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
        {/* Public Landing Page */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Landing />} />
        </Route>

        {/* Authentication */}
        <Route element={<RedirectIfAuthed><AuthLayout /></RedirectIfAuthed>}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Main Application — requires a signed-in account */}
        <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/amivi" element={<Amivi />} />
          <Route path="/amivi/:projectId" element={<Amivi />} />
          <Route path="/amico" element={<Amico />} />
          <Route path="/amico/:projectId" element={<Amico />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quiz/:projectId" element={<Quiz />} />
          <Route path="/video" element={<Video />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/collaborative" element={<Collaborate />} />
          <Route path="/collaborate" element={<Collaborate />} />
          <Route path="/classroom" element={<Classroom />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/quiz-decks" element={<QuizDecks />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
