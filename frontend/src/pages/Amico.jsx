import FileUpload from '../components/ui/FileUpload';
import ComicReader from '../components/ui/ComicReader';
import ProcessingAnimation from '../components/ui/ProcessingAnimation';
import { useState } from 'react';
import { generateAmico } from '../services/api';

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-purple-500">
          AMICO Creator
        </h1>
        <p className="text-gray-400 mt-2">Type your homework topic and transform it into an engaging comic book.</p>
      </div>

      {!isProcessing && !result && (
        <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 max-w-3xl">
          <h2 className="text-xl font-semibold mb-6">Homework Topic</h2>
          <textarea 
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="e.g. Explain how photosynthesis works..."
            className="w-full flex-1 min-h-[150px] p-4 bg-gray-950 border border-gray-800 rounded-xl text-white resize-none focus:ring-2 focus:ring-fuchsia-500 focus:outline-none mb-4"
          />
          <button 
            onClick={handleGenerate}
            disabled={!textInput.trim()}
            className="w-full py-3 bg-fuchsia-500 hover:bg-fuchsia-400 disabled:opacity-50 disabled:hover:bg-fuchsia-500 text-white font-bold rounded-xl transition-colors mb-4"
          >
            Generate Comic
          </button>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          

        </div>
      )}

      {isProcessing && (
        <ProcessingAnimation title="Drawing Comic..." subtitle="Groq is writing the script and Pollinations is sketching the panels." />
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex justify-between items-center bg-fuchsia-500/10 border border-fuchsia-500/20 p-4 rounded-xl text-fuchsia-400">
             <p className="font-medium">Comic generated successfully!</p>
             <button onClick={() => { setResult(null); setTextInput(''); }} className="text-sm underline hover:text-fuchsia-300">Start Over</button>
          </div>
          <ComicReader panels={result.panels} />
        </div>
      )}
    </div>
  );
}
