import { ChevronLeft, ChevronRight, Maximize2, Download, BookOpen } from 'lucide-react';
import { useState } from 'react';

export default function ComicReader({ pages = 5 }) {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden flex flex-col h-[700px] shadow-2xl">
      {/* Header Toolbar */}
      <div className="h-14 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-fuchsia-500/20 text-fuchsia-400 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-200">The AI Journey - Chapter 1</h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-400 font-medium bg-gray-800 px-3 py-1 rounded-full">
            Page {currentPage} of {pages}
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
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="absolute left-6 z-10 p-3 rounded-full bg-gray-900/80 border border-gray-700 text-white hover:bg-fuchsia-500 hover:border-fuchsia-500 transition-all disabled:opacity-30 disabled:hover:bg-gray-900"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* The Comic Page (Placeholder) */}
        <div className="h-full aspect-[2/3] bg-white rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-800 flex flex-col items-center justify-center text-gray-900 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 border-[10px] border-white z-10 pointer-events-none"></div>
          <div className="w-full h-1/2 border-2 border-gray-900 mb-4 bg-gray-100 flex items-center justify-center">
            <span className="font-comic text-2xl font-bold text-gray-400">Panel 1</span>
          </div>
          <div className="w-full h-1/2 flex space-x-4">
            <div className="flex-1 border-2 border-gray-900 bg-gray-100 flex items-center justify-center">
              <span className="font-comic font-bold text-gray-400">Panel 2</span>
            </div>
            <div className="flex-1 border-2 border-gray-900 bg-gray-100 flex items-center justify-center">
              <span className="font-comic font-bold text-gray-400">Panel 3</span>
            </div>
          </div>
          <div className="absolute bottom-4 right-6 font-bold text-gray-400">{currentPage}</div>
        </div>

        <button 
          onClick={() => setCurrentPage(p => Math.min(pages, p + 1))}
          disabled={currentPage === pages}
          className="absolute right-6 z-10 p-3 rounded-full bg-gray-900/80 border border-gray-700 text-white hover:bg-fuchsia-500 hover:border-fuchsia-500 transition-all disabled:opacity-30 disabled:hover:bg-gray-900"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
