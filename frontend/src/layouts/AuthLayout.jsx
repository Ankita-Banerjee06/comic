import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-fuchsia-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg text-xl">
            V
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white">
          Welcome to VLQ
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900/50 backdrop-blur-xl py-8 px-4 shadow-2xl shadow-cyan-900/20 sm:rounded-2xl sm:px-10 border border-gray-800">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
