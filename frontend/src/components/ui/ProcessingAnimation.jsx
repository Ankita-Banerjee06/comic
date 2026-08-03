import { Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProcessingAnimation({ title = "AI is thinking...", subtitle = "Generating your content" }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden relative">
      {/* Background glowing effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/4 w-64 h-64 bg-fuchsia-500/10 blur-3xl rounded-full"></div>

      <div className="relative z-10 flex flex-col items-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="relative w-24 h-24 flex items-center justify-center mb-8"
        >
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-500 opacity-50"></div>
          {/* Inner ring */}
          <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-fuchsia-500 opacity-50" style={{ animationDirection: 'reverse' }}></div>
          
          <div className="bg-gray-900 rounded-full p-4 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>
        </motion.div>

        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h3>
        
        <div className="flex items-center space-x-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">{subtitle}</span>
        </div>
      </div>
    </div>
  );
}
