import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// PROCESSING ANIMATION — the "please wait" screen shown while
// AMIVI / AMICO are generating. A rotating set of cute sticker
// mascots "buffers" while a rotating set of short quotes keeps
// the wait feeling light instead of like a stalled spinner.
// ============================================================

const DEFAULT_QUOTES = [
  'Great things take a little patience — and so does great learning.',
  'Every expert was once a beginner.',
  'Small steps every day add up to big leaps in understanding.',
  'Curiosity is the spark that lights up learning.',
  'The best way to learn something is to see it come to life.',
  'Hang tight — your visuals are being drawn right now!',
  'A picture is worth a thousand words, and yours are on the way.',
];

// Rotating set of sticker mascots standing in for the buffering
// indicator, each with its own accent color for the spinning ring
// behind it.
const STICKERS = [
  { key: 'penguin', src: '/stickers/penguin.png', color: '#0ea5e9' },
  { key: 'frog', src: '/stickers/frog.png', color: '#16a34a' },
  { key: 'star', src: '/stickers/star.png', color: '#eab308' },
  { key: 'cat', src: '/stickers/cat.png', color: '#ec4899' },
  { key: 'bunny', src: '/stickers/bunny.png', color: '#f472b6' },
  { key: 'panda', src: '/stickers/panda.png', color: '#334155' },
  { key: 'avocado', src: '/stickers/avocado.png', color: '#65a30d' },
  { key: 'clover', src: '/stickers/clover.png', color: '#22c55e' },
];

function Mascot({ mascot }) {
  return (
    <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-slate-200"
        style={{ borderTopColor: mascot.color, borderRightColor: mascot.color }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
      />
      <img
        src={mascot.src}
        alt=""
        className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-sm select-none"
        draggable={false}
      />
    </div>
  );
}

export default function ProcessingAnimation({
  title = 'AI is thinking...',
  quotes = DEFAULT_QUOTES,
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((i) => i + 1);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const mascot = STICKERS[step % STICKERS.length];
  const quote = quotes[step % quotes.length];

  return (
    <div
      className="flex flex-col items-center justify-center p-10 sm:p-20 rounded-3xl overflow-hidden relative border border-blue-100 min-h-[380px] sm:min-h-[480px]"
      style={{ background: 'linear-gradient(160deg,#eff6ff 0%,#f5f9ff 55%,#ffffff 100%)' }}
    >
      {/* soft glow accents */}
      <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-200/40 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-200/40 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-lg">
        <div className="w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={mascot.key}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.35 }}
            >
              <Mascot mascot={mascot} />
            </motion.div>
          </AnimatePresence>
        </div>

        <h3 className="mt-7 text-2xl sm:text-3xl font-extrabold text-slate-800 text-center tracking-tight">
          {title}
        </h3>

        {/* rotating quote */}
        <div className="w-full min-h-[64px] flex items-center justify-center px-2 mt-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={quote}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="text-center text-base sm:text-lg font-semibold text-blue-700 italic"
            >
              “{quote}”
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
