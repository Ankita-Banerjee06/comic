import FileUpload from '../components/ui/FileUpload';
import ProcessingAnimation from '../components/ui/ProcessingAnimation';
import Carousel from '../components/ui/Carousel';
import VideoPlayer from '../components/ui/VideoPlayer';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAmivi, generateAmiviQuiz, API_URL } from '../services/api';

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
    // Simulate extracting text from a file for now
    setTextInput("Simulated text extracted from " + file.name + ". In a real implementation, this would parse the document first.");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            AMIVI Studio
          </h1>
          <p className="text-gray-400 mt-2">Paste text or upload documents and let AI generate stunning visuals.</p>
        </div>
      </div>

      {!isProcessing && !result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Source Material</h2>
            <textarea 
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your educational text here..."
              className="w-full flex-1 min-h-[200px] p-4 bg-gray-950 border border-gray-800 rounded-xl text-white resize-none focus:ring-2 focus:ring-cyan-500 focus:outline-none mb-4"
            />
            <button 
              onClick={handleGenerate}
              disabled={!textInput.trim()}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 text-gray-950 font-bold rounded-xl transition-colors"
            >
              Generate AMIVI
            </button>
            {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
          </div>
          
          <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 flex flex-col">
             <h2 className="text-xl font-semibold mb-4 text-gray-500">Or Upload File</h2>
             <div className="flex-1 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
               <FileUpload accept=".pdf,.docx,.txt,image/*" onUpload={handleUpload} />
             </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <ProcessingAnimation title="Analyzing Text..." subtitle="Groq is generating scripts, Piper is synthesizing voice, and MoviePy is rendering your video." />
      )}

      {result && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex justify-between items-center bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-xl text-cyan-400">
            <p className="font-medium">Generation complete! Visuals and Video are ready.</p>
            <div className="flex items-center space-x-4">
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
                 className="text-sm px-4 py-2 bg-cyan-500 text-gray-900 rounded-lg hover:bg-cyan-400 disabled:opacity-50 transition-colors font-bold flex items-center"
               >
                 {isGeneratingQuiz ? 'Generating AI Quiz...' : 'Take Quiz on this Topic'}
               </button>
               <button onClick={() => { setResult(null); setTextInput(''); }} className="text-sm underline hover:text-cyan-300">Start Over</button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Final Video</h3>
              <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl bg-black aspect-video">
                <video controls className="w-full h-full object-contain" src={API_URL + result.video_url}>
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            
            <div className="space-y-4">
               <h3 className="text-xl font-bold text-white">Generated Slides</h3>
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
