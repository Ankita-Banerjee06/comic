import FileUpload from '../components/ui/FileUpload';
import ComicReader from '../components/ui/ComicReader';
import ProcessingAnimation from '../components/ui/ProcessingAnimation';
import { useState } from 'react';
import { generateAmico } from '../services/api';
import { Sparkles } from 'lucide-react';

export default function Amico() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!textInput.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const data = await generateAmico(textInput);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white rounded-4xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 text-[100px] opacity-10 leading-none select-none pointer-events-none">📚</div>
        <div className="relative z-10 flex items-center gap-4">
          <span className="text-5xl animate-float">📚</span>
          <div>
            <h1 className="text-4xl font-black">AMICO Creator</h1>
            <p className="text-pink-100 font-bold text-lg">IMAGINE IT. Turn your homework into fun comic stories! 🦸‍♀️</p>
          </div>
        </div>
      </div>

      {!isProcessing && !result && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-4xl border-2 border-pink-100 shadow-xl p-8 flex flex-col">
            <h2 className="text-2xl font-black text-gray-800 mb-2">💭 Your Homework Topic</h2>
            <p className="text-gray-500 font-bold mb-6">What did you learn today? We'll turn it into a comic adventure!</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[['💬', 'Speech Bubbles'], ['👤', 'Characters'], ['🎨', 'AI Art']].map(([e, l]) => (
                <div key={l} className="bg-pink-50 border-2 border-pink-200 rounded-2xl py-3 flex flex-col items-center gap-1 text-pink-600 font-black text-sm">
                  <span className="text-2xl">{e}</span>
                  {l}
                </div>
              ))}
            </div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. I learned about the Taj Mahal and Shah Jahan today. The Taj Mahal is a beautiful marble mausoleum..."
              className="w-full flex-1 min-h-[180px] p-5 bg-pink-50 border-2 border-pink-200 rounded-2xl text-gray-700 font-semibold resize-none focus:ring-4 focus:ring-pink-300 focus:border-pink-400 focus:outline-none mb-6 text-lg transition-all"
            />
            <button
              onClick={handleGenerate}
              disabled={!textInput.trim()}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all text-xl hover:scale-105 hover:shadow-[0_10px_25px_rgba(236,72,153,0.4)] flex items-center justify-center gap-3 shadow-lg"
            >
              <Sparkles className="w-6 h-6" />
              Generate Comic 🦸‍♂️
            </button>
            {error && <p className="text-red-500 mt-4 font-bold text-center">{error}</p>}
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="bg-white rounded-4xl border-2 border-pink-100 shadow-xl p-12">
          <ProcessingAnimation title="📚 Drawing Your Comic..." subtitle="Groq AI is writing the script and Pollinations AI is sketching the panels!" />
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-4xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🎉</span>
              <div>
                <p className="font-black text-xl">Comic Generated!</p>
                <p className="text-pink-100 font-bold">Your comic strip is ready to read!</p>
              </div>
            </div>
            <button onClick={() => { setResult(null); setTextInput(''); }} className="text-sm font-bold text-pink-100 hover:text-white underline">
              Create Another Comic
            </button>
          </div>
          <ComicReader panels={result.panels} />
        </div>
      )}
    </div>
  );
}
