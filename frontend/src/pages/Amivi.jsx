import FileUpload from '../components/ui/FileUpload';
import ProcessingAnimation from '../components/ui/ProcessingAnimation';
import Carousel from '../components/ui/Carousel';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAmivi, generateAmiviQuiz, API_URL } from '../services/api';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Amivi() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [result, setResult] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!textInput.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const data = await generateAmivi(textInput);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = (file) => {
    setTextInput("Simulated text extracted from " + file.name + ". In a real implementation, this would parse the document first.");
  };

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-4xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 text-[100px] opacity-10 leading-none select-none pointer-events-none">🎨</div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-5xl">🎨</span>
            <div>
              <h1 className="text-4xl font-black">AMIVI Studio</h1>
              <p className="text-blue-100 font-bold text-lg">SEE IT. Transform text into amazing visuals! ✨</p>
            </div>
          </div>
        </div>
      </div>

      {!isProcessing && !result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Text input panel */}
          <div className="bg-white rounded-4xl border-2 border-blue-100 shadow-xl p-8 flex flex-col">
            <h2 className="text-2xl font-black text-gray-800 mb-2">📝 Your Learning Material</h2>
            <p className="text-gray-500 font-bold mb-6">Paste any educational text and watch the magic happen!</p>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your educational text here... e.g. Photosynthesis is the process by which plants convert sunlight into food..."
              className="w-full flex-1 min-h-[220px] p-5 bg-blue-50 border-2 border-blue-200 rounded-2xl text-gray-700 font-semibold resize-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 focus:outline-none mb-6 text-lg transition-all"
            />
            <button
              onClick={handleGenerate}
              disabled={!textInput.trim()}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all text-xl hover:scale-105 hover:shadow-[0_10px_25px_rgba(59,130,246,0.4)] flex items-center justify-center gap-3 shadow-lg"
            >
              <Sparkles className="w-6 h-6" />
              Generate AMIVI ✨
            </button>
            {error && <p className="text-red-500 mt-4 font-bold text-center">{error}</p>}
          </div>

          {/* Upload panel */}
          <div className="bg-white rounded-4xl border-2 border-purple-100 shadow-xl p-8 flex flex-col">
            <h2 className="text-2xl font-black text-gray-800 mb-2">📄 Or Upload a File</h2>
            <p className="text-gray-500 font-bold mb-6">Upload a PDF, Word doc, or image to get started!</p>
            <div className="flex-1 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">
              <FileUpload accept=".pdf,.docx,.txt,image/*" onUpload={handleUpload} />
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="bg-white rounded-4xl border-2 border-blue-100 shadow-xl p-12">
          <ProcessingAnimation title="✨ Creating Your Visuals..." subtitle="Groq AI is generating scripts, Piper is synthesizing voice, and MoviePy is rendering your video!" />
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          {/* Success banner */}
          <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-4xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🎉</span>
              <div>
                <p className="font-black text-xl">Generation Complete!</p>
                <p className="text-green-100 font-bold">Your visuals and video are ready to view!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={async () => {
                  setIsGeneratingQuiz(true);
                  try {
                    const quizData = await generateAmiviQuiz(textInput);
                    if (quizData && quizData.quiz) {
                      navigate('/quiz', { state: { quiz: quizData.quiz } });
                    } else {
                      throw new Error("Invalid quiz data returned");
                    }
                  } catch (e) {
                    console.error(e);
                    setIsGeneratingQuiz(false);
                    alert("Failed to generate quiz. Please try again.");
                  }
                }}
                disabled={isGeneratingQuiz}
                className="px-6 py-3 bg-white text-green-700 font-black rounded-2xl hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg"
              >
                🧩 {isGeneratingQuiz ? 'Generating Quiz...' : 'Take Quiz on this Topic'}
              </button>
              <button onClick={() => { setResult(null); setTextInput(''); }} className="text-sm font-bold text-green-100 hover:text-white underline">
                Start Over
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-gray-800 flex items-center gap-2">🎬 Final Video</h3>
              <div className="rounded-3xl overflow-hidden border-4 border-blue-200 shadow-2xl bg-black aspect-video">
                <video controls className="w-full h-full object-contain" src={API_URL + result.video_url}>
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black text-gray-800 flex items-center gap-2">🖼️ Generated Slides</h3>
              <Carousel items={result.slides.map((s, i) => ({
                title: `Slide ${i + 1}`,
                description: s.text,
                url: API_URL + '/static/images/' + s.image_path.split('\\').pop().split('/').pop()
              }))} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
