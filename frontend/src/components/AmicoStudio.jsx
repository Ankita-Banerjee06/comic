import { useState } from 'react';

export default function AmicoStudio() {
  const [homeworkPrompt, setHomeworkPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!homeworkPrompt) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('https://comic-l1ai.onrender.com/api/amico/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homework_prompt: homeworkPrompt })
      });
      
      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.detail || 'An error occurred.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 rounded-xl shadow-2xl max-w-4xl mx-auto my-8 border border-gray-700 transition-all duration-300 hover:shadow-fuchsia-500/20">
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-600 mb-6">AMICO - Comic Studio</h2>
      <p className="text-gray-400 mb-4">Turn your homework and assignments into interactive, fun comic strips!</p>
      
      <div className="mb-6">
        <textarea
          className="w-full h-32 p-4 bg-gray-900 text-white rounded-lg border border-gray-600 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-900 transition-all outline-none resize-none"
          placeholder="What did you learn today? (e.g., I learned about the Taj Mahal and Shah Jahan...)"
          value={homeworkPrompt}
          onChange={(e) => setHomeworkPrompt(e.target.value)}
        ></textarea>
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-fuchsia-400 hover:to-purple-500 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Drawing Comic...' : 'Generate Comic'}
      </button>

      {error && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="mt-12 animate-fade-in-up">
          <h3 className="text-2xl font-bold mb-6 text-fuchsia-300 text-center">Your Comic Strip</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow-inner">
            {result.panels && result.panels.map((panel, idx) => (
              <div key={idx} className="relative border-4 border-black rounded-sm overflow-hidden bg-white">
                <img src={`https://comic-l1ai.onrender.com${panel.image_url}`} alt={`Panel ${idx+1}`} className="w-full h-64 object-cover filter contrast-125" />
                
                {/* Speech Bubble */}
                {panel.dialogue && (
                  <div className="absolute top-4 left-4 right-4 bg-white border-2 border-black rounded-[2rem] p-3 shadow-md">
                    <p className="text-black font-comic font-bold text-sm leading-tight text-center">{panel.dialogue}</p>
                    {/* Bubble tail */}
                    <div className="absolute -bottom-3 left-8 w-4 h-4 bg-white border-b-2 border-r-2 border-black transform rotate-45"></div>
                  </div>
                )}
                
                {/* Panel Number */}
                <div className="absolute bottom-2 right-2 bg-yellow-400 text-black border-2 border-black rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                  {panel.panel_number}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
