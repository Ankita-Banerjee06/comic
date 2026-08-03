import { useState } from 'react';
import { Play, Pause, Volume2, Maximize, Settings2, SkipBack, SkipForward } from 'lucide-react';

export default function VideoPlayer({ url, poster }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35); // simulated

  return (
    <div className="w-full bg-black rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-gray-800 relative group aspect-video flex flex-col">
      {/* Video Placeholder Area */}
      <div className="flex-1 relative flex items-center justify-center bg-gray-900">
        <div className="absolute inset-0 opacity-20 bg-[url('https://via.placeholder.com/1280x720/1f2937/06b6d4?text=Video+Content')] bg-cover bg-center"></div>
        {!isPlaying && (
          <button 
            onClick={() => setIsPlaying(true)}
            className="relative z-10 w-20 h-20 bg-cyan-500/90 hover:bg-cyan-400 rounded-full flex items-center justify-center text-gray-950 transition-transform hover:scale-105 shadow-[0_0_30px_rgba(6,182,212,0.5)]"
          >
            <Play className="w-8 h-8 ml-1" />
          </button>
        )}
      </div>

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 md:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-700 rounded-full mb-4 cursor-pointer relative group/progress">
          <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${progress}%` }}></div>
          <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100" style={{ left: `calc(${progress}% - 8px)` }}></div>
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-cyan-400 transition-colors">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button className="hover:text-cyan-400 transition-colors hidden sm:block"><SkipBack className="w-5 h-5" /></button>
            <button className="hover:text-cyan-400 transition-colors hidden sm:block"><SkipForward className="w-5 h-5" /></button>
            <div className="flex items-center space-x-2 hidden sm:flex">
              <Volume2 className="w-5 h-5" />
              <div className="w-16 h-1 bg-gray-700 rounded-full"><div className="w-3/4 h-full bg-white rounded-full"></div></div>
            </div>
            <span className="text-sm font-medium text-gray-300">01:24 / 04:15</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-sm font-medium text-gray-300 hover:text-white transition-colors border border-gray-700 px-2 py-1 rounded">1x</button>
            <button className="hover:text-cyan-400 transition-colors"><Settings2 className="w-5 h-5" /></button>
            <button className="hover:text-cyan-400 transition-colors"><Maximize className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
