import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-sky-50 text-gray-900 font-sans flex flex-col selection:bg-yellow-200/60">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
        <div className="max-w-7xl mx-auto h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
