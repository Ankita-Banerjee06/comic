import { useState } from 'react';

export default function AmiviDashboard() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!text) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/amivi/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
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
    <div className="p-6 bg-gray-800 rounded-xl shadow-2xl max-w-4xl mx-auto my-8 border border-gray-700 transition-all duration-300 hover:shadow-cyan-500/20">
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6">AMIVI - Visual Synthesis</h2>
      <p className="text-gray-400 mb-4">Transform lengthy texts into engaging visual micro-bits and videos instantly.</p>
      
      <div className="mb-6">
        <textarea
          className="w-full h-40 p-4 bg-gray-900 text-white rounded-lg border border-gray-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-900 transition-all outline-none resize-none"
          placeholder="Paste educational text here (e.g., Photosynthesis is the process...)"
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Synthesizing Visuals...' : 'Generate Learning Module'}
      </button>

      {error && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="mt-8 animate-fade-in-up">
          <h3 className="text-2xl font-bold mb-4 text-cyan-300">Generated Module</h3>
          {result.video_url && (
            <div className="mb-8 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
              <video controls className="w-full">
                <source src={`http://localhost:8000${result.video_url}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.slides && result.slides.map((slide, idx) => (
              <div key={idx} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-cyan-500 transition-colors">
                <img src={`http://localhost:8000${slide.image_path}`} alt={`Slide ${idx+1}`} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <p className="text-sm text-gray-300 font-semibold">{slide.text}</p>
                  {slide.audio_path && (
                    <audio controls className="w-full mt-4 h-8" src={`http://localhost:8000${slide.audio_path}`} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
