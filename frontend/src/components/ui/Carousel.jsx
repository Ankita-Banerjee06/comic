import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Carousel({ items = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const next = () => setCurrentIndex((i) => (i === items.length - 1 ? 0 : i + 1));
  const prev = () => setCurrentIndex((i) => (i === 0 ? items.length - 1 : i - 1));

  return (
    <div className="relative group rounded-2xl overflow-hidden bg-gray-900 aspect-video shadow-2xl border border-gray-800">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={items[currentIndex]?.url || 'https://dummyimage.com/800x450/111827/06b6d4.png&text=AMIVI+Visual'}
          alt={items[currentIndex]?.alt || 'Carousel Image'}
          className="w-full h-full object-contain"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 pb-12 pointer-events-none">
        <h4 className="text-white font-bold text-xl drop-shadow-md">{items[currentIndex]?.title || 'Generated Visual'}</h4>
        <p className="text-gray-200 text-sm mt-2 drop-shadow-md max-w-2xl">{items[currentIndex]?.description || 'AI Generated Content'}</p>
      </div>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-cyan-500/80 backdrop-blur-sm">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-cyan-500/80 backdrop-blur-sm">
        <ChevronRight className="w-6 h-6" />
      </button>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {items.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-cyan-400' : 'bg-gray-500'}`}
          />
        ))}
      </div>
    </div>
  );
}
