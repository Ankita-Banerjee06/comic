import { useState } from 'react'
import AmiviDashboard from './components/AmiviDashboard'
import AmicoStudio from './components/AmicoStudio'

function App() {
  const [activeTab, setActiveTab] = useState('amivi')

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-cyan-500/30">
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-fuchsia-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
              V
            </div>
            <h1 className="text-2xl font-bold tracking-tight">VLQ Platform</h1>
          </div>
          
          <nav className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('amivi')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === 'amivi' 
                  ? 'bg-gray-700 text-cyan-400 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
              }`}
            >
              AMIVI
            </button>
            <button
              onClick={() => setActiveTab('amico')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === 'amico' 
                  ? 'bg-gray-700 text-fuchsia-400 shadow-sm' 
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
              }`}
            >
              AMICO
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'amivi' ? <AmiviDashboard /> : <AmicoStudio />}
      </main>
      
      <footer className="border-t border-gray-800 py-6 mt-12 text-center text-gray-500 text-sm">
        <p>© 2026 The Visual Learning Platform. Built at the speed of sight.</p>
      </footer>
    </div>
  )
}

export default App
