import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Sparkles, BookOpen, Palette, Target } from 'lucide-react';

// ============================================================
// PROCESSING ANIMATION — the "please wait" screen shown while
// AMIVI / AMICO are generating. A rotating set of simple, brand-
// colored icons "buffers" while a rotating set of short quotes
// keeps the wait feeling light instead of like a stalled spinner.
// Friendly, but not a children's-mascot cast — this app is used
// by teachers and adult learners as much as by students.
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

// Rotating set of simple icon badges standing in for the buffering
// mascot — each a plain, universally-readable symbol rather than a
// cartoon character, in the app's existing brand colors.
const ICONS = [
  { key: 'idea', icon: Lightbulb, bg: '#2563eb' },
  { key: 'sparkle', icon: Sparkles, bg: '#7c3aed' },
  { key: 'learn', icon: BookOpen, bg: '#0d9488' },
  { key: 'create', icon: Palette, bg: '#db2777' },
  { key: 'focus', icon: Target, bg: '#d97706' },
];

function Mascot({ mascot }) {
  const Icon = mascot.icon;
  return (
    <motion.div
      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-lg"
      style={{ background: mascot.bg }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Icon className="w-14 h-14 sm:w-16 sm:h-16 text-white" strokeWidth={1.75} />
    </motion.div>
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

  const mascot = ICONS[step % ICONS.length];
  const quote = quotes[step % quotes.length];

  return (
    <div
      className="flex flex-col items-center justify-center p-8 sm:p-14 rounded-3xl overflow-hidden relative border border-blue-100"
      style={{ background: 'linear-gradient(160deg,#eff6ff 0%,#f5f9ff 55%,#ffffff 100%)' }}
    >
      {/* soft glow accents */}
      <div className="absolute -top-10 -left-10 w-52 h-52 bg-blue-200/40 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-52 h-52 bg-indigo-200/40 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-md">
        <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
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

        <h3 className="mt-5 text-xl sm:text-2xl font-extrabold text-slate-800 text-center tracking-tight">
          {title}
        </h3>

        {/* rotating quote */}
        <div className="w-full min-h-[52px] flex items-center justify-center px-2 mt-3">
          <AnimatePresence mode="wait">
            <motion.p
              key={quote}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="text-center text-sm sm:text-base font-semibold text-blue-700 italic"
            >
              “{quote}”
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
