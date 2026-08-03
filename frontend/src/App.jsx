import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Landing />} />
        </Route>

        {/* Authentication */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Main Application */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/amivi" element={<Amivi />} />
          <Route path="/amico" element={<Amico />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/video" element={<Video />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
