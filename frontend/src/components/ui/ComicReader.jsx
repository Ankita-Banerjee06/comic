import { ChevronLeft, ChevronRight, Maximize2, Download, BookOpen } from 'lucide-react';
import { useState } from 'react';

export default function ComicReader({ panels = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!panels || panels.length === 0) return null;

  const currentPanel = panels[currentIndex];
  // the backend returns a URL like '/static/images/comic_ID_panel_idx.png'
  // it might have backslashes on windows, so let's parse it safely just like AMIVI
  const imageUrl = currentPanel.image_url ? `https://comic-l1ai.onrender.com/static/images/${currentPanel.image_url.split('\\').pop().split('/').pop()}` : '';

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden flex flex-col h-[700px] shadow-2xl">
      {/* Header Toolbar */}
      <div className="h-14 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-fuchsia-500/20 text-fuchsia-400 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-200">Generated Comic</h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-400 font-medium bg-gray-800 px-3 py-1 rounded-full">
            Panel {currentIndex + 1} of {panels.length}
          </span>
          <div className="w-px h-6 bg-gray-800 mx-2"></div>
          <button className="text-gray-400 hover:text-fuchsia-400 transition-colors p-1.5 rounded-lg hover:bg-gray-800">
            <Download className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-fuchsia-400 transition-colors p-1.5 rounded-lg hover:bg-gray-800">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Reader Area */}
      <div className="flex-1 relative bg-[#0f1115] flex items-center justify-center p-8">
        <button 
          onClick={() => setCurrentIndex(p => Math.max(0, p - 1))}
          disabled={currentIndex === 0}
          className="absolute left-6 z-10 p-3 rounded-full bg-gray-900/80 border border-gray-700 text-white hover:bg-fuchsia-500 hover:border-fuchsia-500 transition-all disabled:opacity-30 disabled:hover:bg-gray-900"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* The Comic Panel */}
        <div className="h-full max-w-3xl aspect-[4/3] bg-white rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-white flex flex-col relative overflow-hidden group">
          <img 
            src={imageUrl} 
            alt={`Panel ${currentIndex + 1}`} 
            className="w-full h-full object-cover"
          />
          
          {/* Dialogue Bubble Overlay */}
          {currentPanel.dialogue && (
            <div className="absolute top-4 left-4 right-4 bg-white border-2 border-black rounded-2xl p-4 shadow-lg mx-auto max-w-lg transform -rotate-1 opacity-90 group-hover:opacity-100 transition-opacity">
               <p className="font-comic text-gray-900 font-bold text-center leading-tight">
                 {currentPanel.dialogue}
               </p>
               {/* Tail of the bubble */}
               <div className="absolute -bottom-3 left-8 w-4 h-4 bg-white border-b-2 border-l-2 border-black transform -rotate-45"></div>
            </div>
          )}
          
          <div className="absolute bottom-2 right-4 font-bold text-white drop-shadow-md text-sm">{currentIndex + 1}</div>
        </div>

        <button 
          onClick={() => setCurrentIndex(p => Math.min(panels.length - 1, p + 1))}
          disabled={currentIndex === panels.length - 1}
          className="absolute right-6 z-10 p-3 rounded-full bg-gray-900/80 border border-gray-700 text-white hover:bg-fuchsia-500 hover:border-fuchsia-500 transition-all disabled:opacity-30 disabled:hover:bg-gray-900"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
