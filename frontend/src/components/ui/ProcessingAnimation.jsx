import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================
// PROCESSING ANIMATION — the "please wait" screen shown while
// AMIVI / AMICO are generating. A rotating cast of cute mascots
// (the bear + a set of sticker characters) "buffers" while a
// rotating set of short quotes keeps the wait feeling light
// instead of like a stalled spinner.
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

function Bear() {
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className="w-32 h-32 sm:w-36 sm:h-36"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* shadow */}
      <ellipse cx="100" cy="182" rx="46" ry="8" fill="#1d4ed8" opacity="0.12" />

      {/* ears */}
      <circle cx="60" cy="55" r="22" fill="#a9754f" />
      <circle cx="140" cy="55" r="22" fill="#a9754f" />
      <circle cx="60" cy="55" r="11" fill="#f0d9c0" />
      <circle cx="140" cy="55" r="11" fill="#f0d9c0" />

      {/* head */}
      <circle cx="100" cy="88" r="58" fill="#c48a5a" />

      {/* muzzle */}
      <ellipse cx="100" cy="102" rx="30" ry="22" fill="#f0d9c0" />
      <ellipse cx="100" cy="96" rx="7" ry="5.5" fill="#3b2417" />

      {/* eyes */}
      <motion.g
        animate={{ scaleY: [1, 1, 0.1, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, times: [0, 0.9, 0.95, 1], ease: 'easeInOut' }}
        style={{ transformOrigin: '100px 78px' }}
      >
        <circle cx="78" cy="78" r="6.5" fill="#241408" />
        <circle cx="122" cy="78" r="6.5" fill="#241408" />
        <circle cx="80.5" cy="75.5" r="2" fill="white" />
        <circle cx="124.5" cy="75.5" r="2" fill="white" />
      </motion.g>

      {/* blush */}
      <ellipse cx="66" cy="98" rx="8" ry="5" fill="#f4a56b" opacity="0.6" />
      <ellipse cx="134" cy="98" rx="8" ry="5" fill="#f4a56b" opacity="0.6" />

      {/* graduation cap */}
      <g>
        <rect x="72" y="36" width="56" height="10" rx="2" fill="#1d4ed8" />
        <polygon points="100,18 146,38 100,48 54,38" fill="#2563eb" />
        <circle cx="100" cy="38" r="3.5" fill="#facc15" />
        <line x1="100" y1="38" x2="122" y2="52" stroke="#facc15" strokeWidth="2.5" />
        <circle cx="122" cy="52" r="4" fill="#facc15" />
      </g>

      {/* body */}
      <ellipse cx="100" cy="168" rx="52" ry="34" fill="#c48a5a" />
      <ellipse cx="100" cy="172" rx="26" ry="20" fill="#f0d9c0" />

      {/* waving arm */}
      <motion.g
        animate={{ rotate: [0, 22, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '150px 150px' }}
      >
        <ellipse cx="152" cy="152" rx="12" ry="20" fill="#c48a5a" />
        <circle cx="152" cy="136" r="10" fill="#f0d9c0" />
      </motion.g>

      {/* still arm */}
      <ellipse cx="48" cy="160" rx="12" ry="20" fill="#c48a5a" />
    </motion.svg>
  );
}

// Rotating cast of buffering mascots — the bear plus the sticker set.
const MASCOTS = [
  { key: 'bear', render: () => <Bear /> },
  { key: 'cupcake', src: '/vlq-sticker-cupcake.png', alt: 'Cupcake' },
  { key: 'penguin', src: '/vlq-sticker-penguin.png', alt: 'Penguin' },
  { key: 'frog', src: '/vlq-sticker-frog.png', alt: 'Frog' },
  { key: 'star', src: '/vlq-sticker-star.png', alt: 'Star' },
];

function Mascot({ mascot }) {
  if (mascot.render) return mascot.render();
  return (
    <motion.img
      src={mascot.src}
      alt={mascot.alt}
      className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-md"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
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

  const mascot = MASCOTS[step % MASCOTS.length];
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
