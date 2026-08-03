import FileUpload from '../components/ui/FileUpload';
import ProcessingAnimation from '../components/ui/ProcessingAnimation';
import Carousel from '../components/ui/Carousel';
import { useState } from 'react';

export default function Amivi() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(false);

  const handleUpload = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setResult(true);
    }, 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            AMIVI Studio
          </h1>
          <p className="text-gray-400 mt-2">Upload your documents and let AI generate stunning visuals.</p>
        </div>
      </div>

      {!isProcessing && !result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800">
            <h2 className="text-xl font-semibold mb-6">Source Material</h2>
            <FileUpload accept=".pdf,.docx,.txt,image/*" onUpload={handleUpload} />
          </div>
          
          <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 flex flex-col justify-center opacity-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-600">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-400">Waiting for upload...</p>
            </div>
          </div>
        </div>
      )}

      {isProcessing && (
        <ProcessingAnimation title="Analyzing Document..." subtitle="Extracting key concepts for visualization" />
      )}

      {result && (
        <div className="space-y-8">
          <div className="flex justify-between items-center bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-xl text-cyan-400">
            <p className="font-medium">Analysis complete! Generated 5 visual concepts.</p>
            <button onClick={() => setResult(false)} className="text-sm underline hover:text-cyan-300">Start Over</button>
          </div>
          
          <Carousel items={[
            { title: 'Concept 1: Neural Networks', description: 'A visualization of deep learning architecture' },
            { title: 'Concept 2: Data Flow', description: 'How information propagates through the system' }
          ]} />
        </div>
      )}
    </div>
  );
}
