import FileUpload from '../components/ui/FileUpload';
import ComicReader from '../components/ui/ComicReader';
import { useState } from 'react';

export default function Amico() {
  const [result, setResult] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-purple-500">
          AMICO Creator
        </h1>
        <p className="text-gray-400 mt-2">Transform your homework and notes into engaging comic books.</p>
      </div>

      {!result ? (
        <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 max-w-3xl">
          <h2 className="text-xl font-semibold mb-6">Upload Notes or Homework</h2>
          <FileUpload label="Upload PDF or Images" onUpload={() => setResult(true)} />
          
          <div className="mt-8 pt-8 border-t border-gray-800">
            <h3 className="font-medium text-gray-300 mb-4">Comic Style Preferences</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['Manga', 'Superhero', 'Noir', 'Cartoon'].map((style, i) => (
                <button key={style} className={`p-4 rounded-xl border ${i === 0 ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400' : 'border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700'}`}>
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Your Generated Comic</h2>
            <button onClick={() => setResult(false)} className="px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition-colors">
              Create New
            </button>
          </div>
          <ComicReader pages={8} />
        </div>
      )}
    </div>
  );
}
