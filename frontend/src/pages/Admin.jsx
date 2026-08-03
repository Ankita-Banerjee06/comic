import { Users, Activity, HardDrive } from 'lucide-react';

export default function Admin() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Control Panel</h1>
        <p className="text-gray-400 mt-2">Platform usage statistics and system health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex items-center space-x-3 mb-2 text-cyan-400">
            <Users className="w-5 h-5" />
            <h3 className="font-bold text-white">Total Users</h3>
          </div>
          <p className="text-3xl font-bold text-white">1,204</p>
          <p className="text-sm text-emerald-400 mt-2">+12% this week</p>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex items-center space-x-3 mb-2 text-fuchsia-400">
            <Activity className="w-5 h-5" />
            <h3 className="font-bold text-white">AI Generations</h3>
          </div>
          <p className="text-3xl font-bold text-white">45,892</p>
          <p className="text-sm text-emerald-400 mt-2">+34% this week</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
          <div className="flex items-center space-x-3 mb-2 text-purple-400">
            <HardDrive className="w-5 h-5" />
            <h3 className="font-bold text-white">Storage Used</h3>
          </div>
          <p className="text-3xl font-bold text-white">842 GB</p>
          <p className="text-sm text-gray-500 mt-2">Of 2TB capacity</p>
        </div>
      </div>
      
      <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8">
        <h2 className="text-xl font-bold text-white mb-6">Recent User Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="text-xs text-gray-500 uppercase bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 rounded-tl-lg">User</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Module</th>
                <th className="px-6 py-3 rounded-tr-lg">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="px-6 py-4 text-white">alex.chen@student.edu</td>
                <td className="px-6 py-4">Generated 8-page Comic</td>
                <td className="px-6 py-4 text-fuchsia-400">AMICO</td>
                <td className="px-6 py-4">2 mins ago</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="px-6 py-4 text-white">sarah.j@school.org</td>
                <td className="px-6 py-4">Completed Photosynthesis Quiz</td>
                <td className="px-6 py-4 text-cyan-400">Quiz</td>
                <td className="px-6 py-4">15 mins ago</td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-white">teacher.mike@edu.com</td>
                <td className="px-6 py-4">Uploaded Calculus Syllabus</td>
                <td className="px-6 py-4 text-emerald-400">AMIVI</td>
                <td className="px-6 py-4">1 hour ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
