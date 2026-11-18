// Large flat-style illustrations shown on the right side of each
// subject card on the Essential Learning page. Drawn as inline SVG
// (thick dark outline + flat colour fills) so they stay crisp at any
// size, need no image files, and all share one consistent look.

const INK = '#1f2937';
const LINE = {
  stroke: INK,
  strokeWidth: 5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Svg({ children, label }) {
  return (
    <svg viewBox="0 0 160 160" role="img" aria-label={label} className="w-full h-full">
      {children}
    </svg>
  );
}

function MathArt() {
  return (
    <Svg label="Math">
      <rect x="14" y="14" width="132" height="132" rx="18" fill="#ffffff" {...LINE} strokeWidth="7" />
      <rect x="20" y="20" width="57" height="57" rx="10" fill="#fecaca" />
      <rect x="83" y="20" width="57" height="57" rx="10" fill="#bbf7d0" />
      <rect x="20" y="83" width="57" height="57" rx="10" fill="#bfdbfe" />
      <rect x="83" y="83" width="57" height="57" rx="10" fill="#fde68a" />
      <line x1="80" y1="14" x2="80" y2="146" {...LINE} strokeWidth="7" />
      <line x1="14" y1="80" x2="146" y2="80" {...LINE} strokeWidth="7" />
      {/* × */}
      <line x1="34" y1="34" x2="62" y2="62" {...LINE} strokeWidth="8" />
      <line x1="62" y1="34" x2="34" y2="62" {...LINE} strokeWidth="8" />
      {/* + */}
      <line x1="111" y1="31" x2="111" y2="65" {...LINE} strokeWidth="8" />
      <line x1="94" y1="48" x2="128" y2="48" {...LINE} strokeWidth="8" />
      {/* ÷ */}
      <line x1="32" y1="111" x2="64" y2="111" {...LINE} strokeWidth="8" />
      <circle cx="48" cy="97" r="5" fill={INK} />
      <circle cx="48" cy="125" r="5" fill={INK} />
      {/* − */}
      <line x1="94" y1="111" x2="128" y2="111" {...LINE} strokeWidth="8" />
    </Svg>
  );
}

function ArtsArt() {
  return (
    <Svg label="Arts">
      {/* easel */}
      <line x1="62" y1="118" x2="46" y2="152" {...LINE} />
      <line x1="118" y1="118" x2="134" y2="152" {...LINE} />
      <line x1="90" y1="118" x2="90" y2="148" {...LINE} />
      <rect x="44" y="22" width="92" height="96" rx="6" fill="#ffffff" {...LINE} />
      {/* painting on canvas */}
      <path d="M52 108 L76 72 L92 92 L104 78 L128 108 Z" fill="#86efac" {...LINE} strokeWidth="4" />
      <circle cx="112" cy="44" r="10" fill="#fde047" {...LINE} strokeWidth="4" />
      {/* palette */}
      <path
        d="M14 92 C10 64 34 48 58 54 C78 59 80 74 68 80 C60 84 64 94 74 96 C82 98 80 116 58 120 C34 124 17 112 14 92 Z"
        fill="#fcd34d"
        {...LINE}
      />
      <circle cx="32" cy="74" r="7" fill="#ef4444" stroke={INK} strokeWidth="3" />
      <circle cx="50" cy="66" r="7" fill="#3b82f6" stroke={INK} strokeWidth="3" />
      <circle cx="28" cy="96" r="7" fill="#22c55e" stroke={INK} strokeWidth="3" />
      <circle cx="48" cy="106" r="7" fill="#a855f7" stroke={INK} strokeWidth="3" />
      {/* brush */}
      <line x1="76" y1="140" x2="112" y2="104" {...LINE} strokeWidth="7" />
      <path d="M110 106 L120 96 L126 102 L116 112 Z" fill="#9ca3af" {...LINE} strokeWidth="3" />
      <path d="M120 96 C126 86 136 84 138 82 C136 92 132 100 126 102 Z" fill="#ef4444" {...LINE} strokeWidth="3" />
    </Svg>
  );
}

function HistoryArt() {
  return (
    <Svg label="History">
      {/* temple */}
      <path d="M16 54 L80 16 L144 54 Z" fill="#fdba74" {...LINE} />
      <rect x="20" y="54" width="120" height="12" fill="#fed7aa" {...LINE} />
      {[32, 58, 84, 110].map((x) => (
        <rect key={x} x={x} y="66" width="18" height="58" fill="#ffffff" {...LINE} strokeWidth="4" />
      ))}
      <rect x="20" y="124" width="120" height="10" fill="#fed7aa" {...LINE} />
      <rect x="10" y="134" width="140" height="12" rx="2" fill="#fdba74" {...LINE} />
      <circle cx="80" cy="40" r="6" fill="#ffffff" stroke={INK} strokeWidth="3" />
    </Svg>
  );
}

function LanguageArt() {
  return (
    <Svg label="Language">
      {/* back bubble */}
      <path
        d="M70 22 H140 a10 10 0 0 1 10 10 V82 a10 10 0 0 1 -10 10 H126 L132 110 L106 92 H70 a10 10 0 0 1 -10 -10 V32 a10 10 0 0 1 10 -10 Z"
        fill="#bfdbfe"
        {...LINE}
      />
      <text x="114" y="68" textAnchor="middle" fontSize="38" fontWeight="800" fill={INK} fontFamily="sans-serif">文</text>
      {/* front bubble */}
      <path
        d="M20 62 H90 a10 10 0 0 1 10 10 V122 a10 10 0 0 1 -10 10 H48 L28 150 L32 132 H20 a10 10 0 0 1 -10 -10 V72 a10 10 0 0 1 10 -10 Z"
        fill="#ffffff"
        {...LINE}
      />
      <text x="55" y="114" textAnchor="middle" fontSize="44" fontWeight="900" fill="#2563eb" fontFamily="sans-serif">A</text>
    </Svg>
  );
}

function ScienceArt() {
  return (
    <Svg label="Science">
      {/* flask */}
      <path
        d="M62 18 H98 M68 18 V62 L32 132 a10 10 0 0 0 9 14 H119 a10 10 0 0 0 9 -14 L92 62 V18"
        fill="#ffffff"
        {...LINE}
      />
      <path d="M48 104 H112 L128 132 a10 10 0 0 1 -9 14 H41 a10 10 0 0 1 -9 -14 Z" fill="#86efac" {...LINE} />
      <circle cx="70" cy="124" r="6" fill="#ffffff" stroke={INK} strokeWidth="3" />
      <circle cx="92" cy="116" r="4" fill="#ffffff" stroke={INK} strokeWidth="3" />
      <circle cx="84" cy="134" r="4" fill="#ffffff" stroke={INK} strokeWidth="3" />
      {/* bubbles rising */}
      <circle cx="80" cy="44" r="5" fill="#bbf7d0" stroke={INK} strokeWidth="3" />
      <circle cx="112" cy="30" r="7" fill="#bbf7d0" stroke={INK} strokeWidth="3" />
      <circle cx="128" cy="56" r="5" fill="#bbf7d0" stroke={INK} strokeWidth="3" />
    </Svg>
  );
}

function TechnologyArt() {
  return (
    <Svg label="Technology">
      {/* laptop */}
      <rect x="28" y="30" width="104" height="72" rx="8" fill="#fbcfe8" {...LINE} />
      <rect x="38" y="40" width="84" height="52" rx="4" fill="#ffffff" stroke={INK} strokeWidth="3" />
      <path d="M62 56 L50 66 L62 76" fill="none" {...LINE} strokeWidth="5" stroke="#db2777" />
      <path d="M98 56 L110 66 L98 76" fill="none" {...LINE} strokeWidth="5" stroke="#db2777" />
      <line x1="86" y1="52" x2="74" y2="80" {...LINE} strokeWidth="5" stroke="#db2777" />
      <path d="M14 112 H146 L136 128 H24 Z" fill="#f9a8d4" {...LINE} />
      <line x1="70" y1="112" x2="90" y2="112" {...LINE} />
    </Svg>
  );
}

function OtherArt() {
  return (
    <Svg label="Other">
      {/* open book */}
      <path d="M80 48 C62 34 36 32 14 38 V128 C36 122 62 124 80 138 Z" fill="#ffffff" {...LINE} />
      <path d="M80 48 C98 34 124 32 146 38 V128 C124 122 98 124 80 138 Z" fill="#e2e8f0" {...LINE} />
      {[60, 76, 92].map((y) => (
        <g key={y}>
          <line x1="28" y1={y} x2="66" y2={y + 4} stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <line x1="94" y1={y + 4} x2="132" y2={y} stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
        </g>
      ))}
      {/* sparkle */}
      <path d="M80 6 L85 20 L99 25 L85 30 L80 44 L75 30 L61 25 L75 20 Z" fill="#fde047" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    </Svg>
  );
}

function UnsortedArt() {
  return (
    <Svg label="Unsorted">
      <rect x="40" y="26" width="80" height="70" rx="4" fill="#ffffff" {...LINE} strokeWidth="4" transform="rotate(-8 80 60)" />
      <rect x="44" y="30" width="80" height="70" rx="4" fill="#ffffff" {...LINE} strokeWidth="4" transform="rotate(6 84 64)" />
      <path d="M14 56 H58 L68 68 H146 V138 a6 6 0 0 1 -6 6 H20 a6 6 0 0 1 -6 -6 Z" fill="#5eead4" {...LINE} />
    </Svg>
  );
}

export const SUBJECT_ILLUSTRATION = {
  Science: ScienceArt,
  Math: MathArt,
  History: HistoryArt,
  Language: LanguageArt,
  Arts: ArtsArt,
  Technology: TechnologyArt,
  Other: OtherArt,
  Unsorted: UnsortedArt,
};
