import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Sparkles, Star, ChevronRight } from 'lucide-react';
import VLQLogo from '../components/VLQLogo';

/* ─────────────────────────────────────────────────────────────────
   SVG ILLUSTRATIONS — all built inline so there are ZERO broken
   image 404s. Each is a self-contained SVG scene.
──────────────────────────────────────────────────────────────── */

/* Hero right-side: students around an interactive screen */
function HeroSceneSVG() {
  return (
    <svg viewBox="0 0 680 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Background soft glow circles */}
      <circle cx="340" cy="220" r="190" fill="#dbeafe" opacity="0.5"/>
      <circle cx="340" cy="220" r="140" fill="#eff6ff" opacity="0.6"/>

      {/* ── CENTRAL SCREEN ── */}
      <rect x="190" y="110" width="300" height="200" rx="18" fill="#1e40af" opacity="0.08"/>
      <rect x="198" y="118" width="284" height="186" rx="14" fill="white" stroke="#bfdbfe" strokeWidth="3"/>
      {/* Screen content: photosynthesis diagram */}
      <rect x="210" y="130" width="260" height="162" rx="10" fill="#f0fdf4"/>
      {/* Leaf shape */}
      <ellipse cx="340" cy="211" rx="34" ry="46" fill="#22c55e" transform="rotate(-20 340 211)"/>
      <ellipse cx="340" cy="211" rx="22" ry="36" fill="#16a34a" transform="rotate(-20 340 211)"/>
      {/* Vein */}
      <line x1="328" y1="245" x2="348" y2="178" stroke="#15803d" strokeWidth="2"/>
      <line x1="335" y1="228" x2="323" y2="218" stroke="#15803d" strokeWidth="1.5"/>
      <line x1="338" y1="210" x2="325" y2="200" stroke="#15803d" strokeWidth="1.5"/>
      {/* CO2 arrow */}
      <text x="215" y="190" fontFamily="system-ui" fontWeight="700" fontSize="11" fill="#3b82f6">CO₂ →</text>
      {/* O2 arrow */}
      <text x="215" y="250" fontFamily="system-ui" fontWeight="700" fontSize="11" fill="#6366f1">← O₂</text>
      {/* Sun */}
      <circle cx="440" cy="165" r="18" fill="#fbbf24"/>
      {['0','45','90','135','180','225','270','315'].map((deg,i) => (
        <line key={i}
          x1={440 + 22*Math.cos(i*45*Math.PI/180)}
          y1={165 + 22*Math.sin(i*45*Math.PI/180)}
          x2={440 + 30*Math.cos(i*45*Math.PI/180)}
          y2={165 + 30*Math.sin(i*45*Math.PI/180)}
          stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      ))}
      <text x="430" y="203" fontFamily="system-ui" fontWeight="700" fontSize="10" fill="#ca8a04">SUNLIGHT</text>
      {/* Label */}
      <text x="264" y="150" fontFamily="system-ui" fontWeight="900" fontSize="13" fill="#15803d">PHOTOSYNTHESIS</text>
      {/* Screen stand */}
      <rect x="325" y="304" width="30" height="18" rx="4" fill="#93c5fd"/>
      <rect x="300" y="318" width="80" height="8" rx="4" fill="#60a5fa"/>

      {/* ── STUDENT 1 — left, pointing at screen ── */}
      {/* Body */}
      <rect x="82" y="230" width="68" height="100" rx="24" fill="#2563eb"/>
      {/* Head */}
      <circle cx="116" cy="210" r="32" fill="#fbbf24"/>
      {/* Hair */}
      <ellipse cx="116" cy="185" rx="28" ry="14" fill="#78350f"/>
      {/* Eyes */}
      <circle cx="107" cy="208" r="4" fill="#1e293b"/>
      <circle cx="125" cy="208" r="4" fill="#1e293b"/>
      <circle cx="108.5" cy="207" r="1.5" fill="white"/>
      <circle cx="126.5" cy="207" r="1.5" fill="white"/>
      {/* Smile */}
      <path d="M108 218 Q116 225 124 218" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Arm pointing */}
      <path d="M148 265 Q185 250 198 230" stroke="#2563eb" strokeWidth="16" strokeLinecap="round" fill="none"/>
      <circle cx="200" cy="228" r="9" fill="#fbbf24"/>

      {/* ── STUDENT 2 — far left, holding comic ── */}
      {/* Body */}
      <rect x="12" y="248" width="60" height="88" rx="22" fill="#ec4899"/>
      {/* Head */}
      <circle cx="42" cy="228" r="28" fill="#fed7aa"/>
      {/* Hair - pigtails */}
      <ellipse cx="42" cy="203" rx="25" ry="13" fill="#7c3aed"/>
      <circle cx="18" cy="212" r="8" fill="#7c3aed"/>
      <circle cx="66" cy="212" r="8" fill="#7c3aed"/>
      {/* Eyes */}
      <circle cx="34" cy="226" r="3.5" fill="#1e293b"/>
      <circle cx="50" cy="226" r="3.5" fill="#1e293b"/>
      {/* Smile */}
      <path d="M35 236 Q42 241 49 236" stroke="#9a3412" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Comic book held */}
      <rect x="58" y="268" width="44" height="56" rx="5" fill="white" stroke="#f472b6" strokeWidth="2"/>
      <rect x="62" y="272" width="36" height="24" rx="3" fill="#fce7f3"/>
      <ellipse cx="80" cy="284" rx="10" ry="12" fill="#f9a8d4"/>
      <rect x="64" y="300" width="32" height="4" rx="2" fill="#e5e7eb"/>
      <rect x="64" y="307" width="24" height="4" rx="2" fill="#e5e7eb"/>
      <text x="65" y="320" fontFamily="system-ui" fontWeight="900" fontSize="7" fill="#ec4899">COMIC</text>

      {/* ── STUDENT 3 — right of screen, quiz card ── */}
      {/* Body */}
      <rect x="526" y="238" width="64" height="94" rx="22" fill="#8b5cf6"/>
      {/* Head */}
      <circle cx="558" cy="218" r="29" fill="#fed7aa"/>
      {/* Hair */}
      <ellipse cx="558" cy="194" rx="26" ry="12" fill="#1e293b"/>
      {/* Eyes */}
      <circle cx="549" cy="216" r="3.5" fill="#1e293b"/>
      <circle cx="567" cy="216" r="3.5" fill="#1e293b"/>
      {/* Smile */}
      <path d="M549 226 Q558 232 567 226" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Quiz card held */}
      <rect x="576" y="256" width="80" height="100" rx="10" fill="white" stroke="#a78bfa" strokeWidth="2.5" transform="rotate(-8 576 256)"/>
      <rect x="583" y="264" width="64" height="38" rx="6" fill="#ede9fe" transform="rotate(-8 583 264)"/>
      <text x="590" y="288" fontFamily="system-ui" fontWeight="900" fontSize="10" fill="#7c3aed" transform="rotate(-8 590 288)">QUIZ</text>
      <text x="588" y="300" fontFamily="system-ui" fontWeight="700" fontSize="7" fill="#6d28d9" transform="rotate(-8 588 300)">❓ Planet?</text>
      <rect x="588" y="316" width="56" height="10" rx="5" fill="#f3f4f6" transform="rotate(-8 588 316)"/>
      <rect x="588" y="330" width="40" height="10" rx="5" fill="#bbf7d0" stroke="#22c55e" strokeWidth="1" transform="rotate(-8 588 330)"/>
      <rect x="588" y="344" width="56" height="10" rx="5" fill="#f3f4f6" transform="rotate(-8 588 344)"/>

      {/* ── STUDENT 4 — far right, celebrating ── */}
      {/* Body */}
      <rect x="626" y="256" width="54" height="82" rx="20" fill="#f97316"/>
      {/* Head */}
      <circle cx="653" cy="236" r="26" fill="#fbbf24"/>
      {/* Hair */}
      <ellipse cx="653" cy="213" rx="23" ry="11" fill="#92400e"/>
      {/* Eyes happy */}
      <path d="M644 232 Q647 228 650 232" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M656 232 Q659 228 662 232" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Big smile */}
      <path d="M644 242 Q653 252 662 242" stroke="#92400e" strokeWidth="2.5" fill="#fef3c7" strokeLinecap="round"/>
      {/* Raised arm with trophy */}
      <path d="M626 280 Q610 260 608 240" stroke="#f97316" strokeWidth="14" strokeLinecap="round" fill="none"/>
      {/* Trophy */}
      <rect x="596" y="215" width="24" height="22" rx="6" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2"/>
      <rect x="603" y="233" width="10" height="8" rx="2" fill="#f59e0b"/>
      <rect x="598" y="239" width="20" height="5" rx="2" fill="#f59e0b"/>

      {/* ── DESK / TABLE ── */}
      <ellipse cx="340" cy="340" rx="280" ry="28" fill="#bfdbfe" opacity="0.6"/>
      <rect x="130" y="328" width="420" height="18" rx="9" fill="#93c5fd" opacity="0.8"/>

      {/* ── FLOATING DECORATIVE ELEMENTS ── */}
      {/* Star top-left */}
      <polygon points="80,60 84,72 96,72 86,80 90,92 80,84 70,92 74,80 64,72 76,72" fill="#fbbf24" className="animate-pulse"/>
      {/* Star top-right */}
      <polygon points="600,50 603,60 613,60 605,66 608,76 600,70 592,76 595,66 587,60 597,60" fill="#a78bfa"/>
      {/* Small visual card floating */}
      <rect x="490" y="82" width="64" height="50" rx="8" fill="white" stroke="#93c5fd" strokeWidth="2"/>
      <rect x="496" y="88" width="52" height="28" rx="4" fill="#dbeafe"/>
      <circle cx="522" cy="102" r="9" fill="#3b82f6" opacity="0.7"/>
      <text x="498" y="125" fontFamily="system-ui" fontWeight="900" fontSize="9" fill="#1d4ed8">VISUAL</text>
      {/* Sparkle dots */}
      <circle cx="155" cy="90" r="5" fill="#f472b6" opacity="0.8"/>
      <circle cx="165" cy="78" r="3" fill="#818cf8" opacity="0.8"/>
      <circle cx="145" cy="76" r="4" fill="#34d399" opacity="0.8"/>
    </svg>
  );
}

/* Journey stage illustrations */
function SeeIllustration() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="80" r="60" fill="#dbeafe" opacity="0.7"/>
      {/* Screen */}
      <rect x="50" y="50" width="100" height="70" rx="10" fill="white" stroke="#93c5fd" strokeWidth="2.5"/>
      <rect x="58" y="58" width="84" height="50" rx="6" fill="#eff6ff"/>
      {/* Visual on screen */}
      <circle cx="76" cy="83" r="12" fill="#3b82f6" opacity="0.6"/>
      <rect x="94" y="72" width="38" height="6" rx="3" fill="#93c5fd"/>
      <rect x="94" y="82" width="30" height="5" rx="2.5" fill="#bfdbfe"/>
      <rect x="94" y="91" width="34" height="5" rx="2.5" fill="#bfdbfe"/>
      {/* Screen stand */}
      <rect x="92" y="120" width="16" height="8" rx="3" fill="#93c5fd"/>
      <rect x="80" y="126" width="40" height="5" rx="2.5" fill="#60a5fa"/>
      {/* Student child */}
      <circle cx="78" cy="34" r="14" fill="#fed7aa"/>
      <ellipse cx="78" cy="22" rx="13" ry="7" fill="#78350f"/>
      <circle cx="74" cy="32" r="2.5" fill="#1e293b"/>
      <circle cx="82" cy="32" r="2.5" fill="#1e293b"/>
      <path d="M74 40 Q78 44 82 40" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Magnifying glass */}
      <circle cx="120" cy="34" r="13" fill="none" stroke="#3b82f6" strokeWidth="3.5"/>
      <circle cx="120" cy="34" r="7" fill="#dbeafe" opacity="0.7"/>
      <line x1="130" y1="44" x2="138" y2="52" stroke="#3b82f6" strokeWidth="3.5" strokeLinecap="round"/>
      {/* Eye hint */}
      <ellipse cx="120" cy="34" rx="5" ry="3.5" fill="#3b82f6"/>
      <circle cx="120" cy="34" r="2" fill="#1e293b"/>
    </svg>
  );
}

function UnderstandIllustration() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="80" r="60" fill="#dcfce7" opacity="0.7"/>
      {/* Whiteboard */}
      <rect x="42" y="44" width="116" height="78" rx="10" fill="white" stroke="#86efac" strokeWidth="2.5"/>
      {/* Mind map on board */}
      <circle cx="100" cy="83" r="12" fill="#22c55e" opacity="0.85"/>
      <text x="93" y="87" fontFamily="system-ui" fontWeight="900" fontSize="10" fill="white">VLQ</text>
      <line x1="100" y1="71" x2="100" y2="60" stroke="#86efac" strokeWidth="2"/>
      <circle cx="100" cy="57" r="6" fill="#bbf7d0" stroke="#22c55e" strokeWidth="1.5"/>
      <line x1="88" y1="80" x2="72" y2="73" stroke="#86efac" strokeWidth="2"/>
      <circle cx="67" cy="72" r="7" fill="#bbf7d0" stroke="#22c55e" strokeWidth="1.5"/>
      <line x1="112" y1="80" x2="128" y2="73" stroke="#86efac" strokeWidth="2"/>
      <circle cx="133" cy="72" r="7" fill="#bbf7d0" stroke="#22c55e" strokeWidth="1.5"/>
      <line x1="100" y1="95" x2="100" y2="108" stroke="#86efac" strokeWidth="2"/>
      <circle cx="100" cy="113" r="6" fill="#bbf7d0" stroke="#22c55e" strokeWidth="1.5"/>
      {/* Student */}
      <circle cx="152" cy="30" r="13" fill="#fbbf24"/>
      <ellipse cx="152" cy="18" rx="12" ry="6" fill="#1e293b"/>
      <circle cx="148" cy="28" r="2.5" fill="#1e293b"/>
      <circle cx="156" cy="28" r="2.5" fill="#1e293b"/>
      <path d="M148 36 Q152 40 156 36" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Lightbulb */}
      <circle cx="58" cy="28" r="12" fill="#fef08a" stroke="#fbbf24" strokeWidth="2"/>
      <path d="M52 34 Q54 40 58 40 Q62 40 64 34" fill="#fef08a" stroke="#fbbf24" strokeWidth="1.5"/>
      <line x1="54" y1="43" x2="62" y2="43" stroke="#fbbf24" strokeWidth="2"/>
      <circle cx="58" cy="26" r="3" fill="#ca8a04"/>
    </svg>
  );
}

function RememberIllustration() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="80" r="60" fill="#f3e8ff" opacity="0.7"/>
      {/* Brain */}
      <ellipse cx="95" cy="80" rx="38" ry="32" fill="#c084fc" opacity="0.9"/>
      <ellipse cx="108" cy="80" rx="28" ry="24" fill="#a855f7" opacity="0.7"/>
      {/* Brain wrinkles */}
      <path d="M72 72 Q80 66 88 72 Q96 78 104 72" stroke="#7c3aed" strokeWidth="2" fill="none"/>
      <path d="M75 84 Q83 78 91 84 Q99 90 107 84" stroke="#7c3aed" strokeWidth="2" fill="none"/>
      <path d="M72 96 Q80 90 88 96 Q96 102 104 96" stroke="#7c3aed" strokeWidth="2" fill="none"/>
      {/* Glow */}
      <circle cx="100" cy="80" r="45" fill="none" stroke="#c084fc" strokeWidth="2" opacity="0.5" strokeDasharray="4 4"/>
      {/* Memory cards floating */}
      <rect x="142" y="52" width="38" height="28" rx="6" fill="white" stroke="#c084fc" strokeWidth="2"/>
      <circle cx="154" cy="66" r="7" fill="#e9d5ff"/>
      <text x="163" y="70" fontFamily="system-ui" fontWeight="900" fontSize="9" fill="#7c3aed">📖</text>
      <rect x="20" y="64" width="38" height="28" rx="6" fill="white" stroke="#c084fc" strokeWidth="2"/>
      <circle cx="35" cy="78" r="7" fill="#e9d5ff"/>
      <text x="44" y="82" fontFamily="system-ui" fontWeight="900" fontSize="9" fill="#7c3aed">🔬</text>
      {/* Stars for memory */}
      <polygon points="155,28 157,34 163,34 158,38 160,44 155,40 150,44 152,38 147,34 153,34" fill="#fbbf24" opacity="0.9"/>
      <polygon points="45,36 47,40 51,40 48,43 49,47 45,44 41,47 42,43 39,40 43,40" fill="#f472b6" opacity="0.8"/>
      {/* Student head */}
      <circle cx="100" cy="24" r="12" fill="#fed7aa"/>
      <ellipse cx="100" cy="13" rx="11" ry="6" fill="#92400e"/>
      <path d="M95 22 Q100 18 105 22" stroke="#1e293b" strokeWidth="2" fill="none"/>
    </svg>
  );
}

function ApplyIllustration() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="80" r="60" fill="#fff7ed" opacity="0.8"/>
      {/* Laptop */}
      <rect x="38" y="72" width="124" height="76" rx="10" fill="#1e293b"/>
      <rect x="46" y="80" width="108" height="60" rx="6" fill="#f0f9ff"/>
      {/* Code/work on screen */}
      <rect x="54" y="88" width="50" height="5" rx="2.5" fill="#f97316"/>
      <rect x="54" y="97" width="70" height="4" rx="2" fill="#e2e8f0"/>
      <rect x="54" y="105" width="60" height="4" rx="2" fill="#e2e8f0"/>
      <rect x="54" y="113" width="80" height="4" rx="2" fill="#e2e8f0"/>
      {/* Checkmarks */}
      <circle cx="130" cy="90" r="8" fill="#22c55e"/>
      <path d="M126 90 L129 93 L134 87" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Laptop base */}
      <ellipse cx="100" cy="148" rx="72" ry="7" fill="#cbd5e1" opacity="0.6"/>
      {/* Student child */}
      <circle cx="138" cy="52" r="13" fill="#fbbf24"/>
      <ellipse cx="138" cy="40" rx="12" ry="6" fill="#78350f"/>
      <circle cx="134" cy="50" r="2.5" fill="#1e293b"/>
      <circle cx="142" cy="50" r="2.5" fill="#1e293b"/>
      <path d="M134 58 Q138 62 142 58" stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Pencil */}
      <rect x="54" y="38" width="6" height="30" rx="3" fill="#fbbf24" transform="rotate(-30 54 38)"/>
      <polygon points="44,60 48,70 56,66" fill="#f97316" transform="rotate(-30 44 60)"/>
      <rect x="56" y="36" width="6" height="6" rx="1" fill="#e5e7eb" transform="rotate(-30 56 36)"/>
    </svg>
  );
}

function MasterIllustration() {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="80" r="60" fill="#fdf2f8" opacity="0.8"/>
      {/* Trophy */}
      <rect x="76" y="74" width="48" height="50" rx="8" fill="#fbbf24" opacity="0.9"/>
      <rect x="82" y="80" width="36" height="36" rx="6" fill="#fef08a"/>
      {/* Trophy handles */}
      <path d="M76 86 Q58 86 60 100 Q62 114 76 108" fill="none" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round"/>
      <path d="M124 86 Q142 86 140 100 Q138 114 124 108" fill="none" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round"/>
      {/* Star in trophy */}
      <polygon points="100,88 103,96 111,96 105,101 107,109 100,104 93,109 95,101 89,96 97,96" fill="#f59e0b"/>
      {/* Trophy stand */}
      <rect x="92" y="124" width="16" height="10" rx="3" fill="#f59e0b"/>
      <rect x="82" y="132" width="36" height="7" rx="3.5" fill="#f59e0b"/>
      {/* Student celebrating */}
      <circle cx="100" cy="34" r="14" fill="#fed7aa"/>
      <ellipse cx="100" cy="21" rx="13" ry="7" fill="#7c3aed"/>
      {/* Graduation cap */}
      <rect x="88" y="20" width="24" height="5" rx="2" fill="#1e293b"/>
      <ellipse cx="100" cy="22" rx="16" ry="4" fill="#1e293b"/>
      <line x1="112" y1="22" x2="116" y2="30" stroke="#1e293b" strokeWidth="2"/>
      <circle cx="116" cy="32" r="3" fill="#fbbf24"/>
      {/* Happy eyes */}
      <path d="M94 33 Q97 29 100 33" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M100 33 Q103 29 106 33" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M93 42 Q100 50 107 42" stroke="#92400e" strokeWidth="2" fill="#fef3c7" strokeLinecap="round"/>
      {/* Confetti */}
      <rect x="40" y="50" width="7" height="4" rx="2" fill="#f472b6" transform="rotate(-30 40 50)"/>
      <rect x="152" y="42" width="7" height="4" rx="2" fill="#34d399" transform="rotate(20 152 42)"/>
      <rect x="148" y="62" width="6" height="4" rx="2" fill="#60a5fa" transform="rotate(-10 148 62)"/>
      <rect x="44" y="70" width="6" height="4" rx="2" fill="#fbbf24" transform="rotate(40 44 70)"/>
      <circle cx="58" cy="46" r="4" fill="#a78bfa"/>
      <circle cx="142" cy="48" r="3" fill="#fb923c"/>
      {/* Stars */}
      <polygon points="32,80 34,86 40,86 35,90 37,96 32,92 27,96 29,90 24,86 30,86" fill="#fbbf24" opacity="0.9"/>
      <polygon points="166,72 168,78 174,78 169,82 171,88 166,84 161,88 163,82 158,78 164,78" fill="#fbbf24" opacity="0.9"/>
    </svg>
  );
}

/* AMIVI flow illustration */
function AmiviIllustration() {
  return (
    <svg viewBox="0 0 600 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Step 1: Document */}
      <rect x="20" y="60" width="130" height="160" rx="14" fill="white" stroke="#bfdbfe" strokeWidth="2.5"/>
      <rect x="34" y="80" width="100" height="8" rx="4" fill="#e2e8f0"/>
      <rect x="34" y="96" width="80" height="6" rx="3" fill="#f1f5f9"/>
      <rect x="34" y="108" width="90" height="6" rx="3" fill="#f1f5f9"/>
      <rect x="34" y="120" width="70" height="6" rx="3" fill="#f1f5f9"/>
      <rect x="34" y="136" width="85" height="6" rx="3" fill="#f1f5f9"/>
      <rect x="34" y="148" width="75" height="6" rx="3" fill="#f1f5f9"/>
      <rect x="34" y="164" width="90" height="6" rx="3" fill="#f1f5f9"/>
      <rect x="34" y="176" width="60" height="6" rx="3" fill="#f1f5f9"/>
      <text x="50" y="56" fontFamily="system-ui" fontWeight="900" fontSize="13" fill="#64748b">Document</text>
      {/* Arrow 1 */}
      <path d="M158 140 L220 140" stroke="#93c5fd" strokeWidth="3" strokeDasharray="6 4"/>
      <polygon points="220,133 234,140 220,147" fill="#3b82f6"/>
      {/* AI Processing center */}
      <rect x="240" y="82" width="120" height="116" rx="18" fill="#1e40af"/>
      <circle cx="300" cy="130" r="32" fill="#3b82f6"/>
      <circle cx="300" cy="130" r="22" fill="#60a5fa"/>
      {/* AI brain lines */}
      <path d="M286 122 Q293 116 300 122 Q307 128 314 122" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M286 132 Q293 126 300 132 Q307 138 314 132" stroke="white" strokeWidth="2" fill="none"/>
      <path d="M286 142 Q293 136 300 142 Q307 148 314 142" stroke="white" strokeWidth="2" fill="none"/>
      <text x="272" y="190" fontFamily="system-ui" fontWeight="900" fontSize="11" fill="#bfdbfe">AI ENGINE</text>
      {/* Arrow 2 */}
      <path d="M366 140 L400 140" stroke="#93c5fd" strokeWidth="3" strokeDasharray="6 4"/>
      <polygon points="400,133 414,140 400,147" fill="#3b82f6"/>
      {/* Visual output cards */}
      <rect x="420" y="60" width="82" height="62" rx="12" fill="white" stroke="#93c5fd" strokeWidth="2.5"/>
      <rect x="430" y="70" width="62" height="36" rx="8" fill="#dbeafe"/>
      <circle cx="451" cy="88" rx="10" fill="#3b82f6"/>
      <circle cx="451" cy="88" r="10" fill="#3b82f6"/>
      <rect x="466" y="80" width="20" height="5" rx="2.5" fill="#93c5fd"/>
      <rect x="466" y="90" width="14" height="4" rx="2" fill="#bfdbfe"/>
      <text x="432" y="132" fontFamily="system-ui" fontWeight="900" fontSize="9" fill="#1d4ed8">VISUAL</text>

      <rect x="424" y="148" width="78" height="58" rx="12" fill="white" stroke="#a78bfa" strokeWidth="2.5"/>
      <rect x="434" y="158" width="58" height="32" rx="8" fill="#ede9fe"/>
      <rect x="440" y="162" width="46" height="4" rx="2" fill="#c084fc"/>
      <rect x="440" y="170" width="36" height="4" rx="2" fill="#ddd6fe"/>
      <rect x="440" y="178" width="40" height="4" rx="2" fill="#ddd6fe"/>
      <text x="436" y="214" fontFamily="system-ui" fontWeight="900" fontSize="9" fill="#7c3aed">INFOGRAPHIC</text>

      <text x="428" y="46" fontFamily="system-ui" fontWeight="900" fontSize="13" fill="#64748b">Visuals</text>

      {/* Sparkles */}
      <circle cx="238" cy="72" r="4" fill="#60a5fa"/>
      <circle cx="364" cy="72" r="4" fill="#60a5fa"/>
    </svg>
  );
}

/* AMICO comic panels */
function AmicoIllustration() {
  return (
    <svg viewBox="0 0 560 280" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Panel 1 */}
      <rect x="10" y="20" width="155" height="240" rx="16" fill="white" stroke="#f472b6" strokeWidth="3"/>
      <rect x="20" y="30" width="135" height="110" rx="10" fill="#fce7f3"/>
      {/* Character 1 in panel 1 */}
      <circle cx="88" cy="70" r="22" fill="#fed7aa"/>
      <ellipse cx="88" cy="50" rx="20" ry="10" fill="#7c3aed"/>
      <circle cx="82" cy="68" r="3.5" fill="#1e293b"/>
      <circle cx="94" cy="68" r="3.5" fill="#1e293b"/>
      <path d="M82 78 Q88 84 94 78" stroke="#92400e" strokeWidth="2" fill="none"/>
      {/* Speech bubble 1 */}
      <rect x="26" y="152" width="128" height="52" rx="10" fill="white" stroke="#f472b6" strokeWidth="2"/>
      <polygon points="54,152 44,138 64,152" fill="white" stroke="#f472b6" strokeWidth="2"/>
      <polygon points="54,152 44,138 64,152" fill="white"/>
      <text x="40" y="172" fontFamily="system-ui" fontWeight="700" fontSize="11" fill="#be185d">"What is</text>
      <text x="40" y="187" fontFamily="system-ui" fontWeight="700" fontSize="11" fill="#be185d">gravity?"</text>
      <text x="34" y="218" fontFamily="system-ui" fontWeight="900" fontSize="10" fill="#f472b6">Panel 1</text>

      {/* Panel 2 */}
      <rect x="195" y="20" width="165" height="240" rx="16" fill="white" stroke="#f97316" strokeWidth="3"/>
      <rect x="205" y="30" width="145" height="120" rx="10" fill="#fff7ed"/>
      {/* Planet/Earth visual */}
      <circle cx="278" cy="90" r="38" fill="#3b82f6"/>
      <ellipse cx="278" cy="90" rx="38" ry="12" fill="none" stroke="#f97316" strokeWidth="4"/>
      <path d="M255 70 Q265 60 275 70 Q285 80 295 70" fill="#22c55e" stroke="none"/>
      <path d="M260 95 Q270 85 280 95 Q290 105 300 95" fill="#22c55e" stroke="none"/>
      {/* Character looking up */}
      <circle cx="248" cy="40" r="14" fill="#fbbf24"/>
      <ellipse cx="248" cy="28" rx="13" ry="7" fill="#78350f"/>
      <circle cx="244" cy="39" r="2.5" fill="#1e293b"/>
      <circle cx="252" cy="39" r="2.5" fill="#1e293b"/>
      <path d="M244 46 Q248 50 252 46" stroke="#92400e" strokeWidth="1.5" fill="none"/>
      {/* Speech bubble 2 */}
      <rect x="205" y="162" width="145" height="56" rx="10" fill="white" stroke="#f97316" strokeWidth="2"/>
      <text x="215" y="182" fontFamily="system-ui" fontWeight="700" fontSize="11" fill="#c2410c">"Everything</text>
      <text x="215" y="196" fontFamily="system-ui" fontWeight="700" fontSize="11" fill="#c2410c">pulls together!"</text>
      <text x="216" y="226" fontFamily="system-ui" fontWeight="900" fontSize="10" fill="#f97316">Panel 2</text>

      {/* Panel 3 */}
      <rect x="390" y="20" width="160" height="240" rx="16" fill="white" stroke="#8b5cf6" strokeWidth="3"/>
      <rect x="400" y="30" width="140" height="115" rx="10" fill="#ede9fe"/>
      {/* Achievement scene */}
      <circle cx="470" cy="80" r="28" fill="#a855f7" opacity="0.85"/>
      <polygon points="470,62 474,74 486,74 476,82 480,94 470,86 460,94 464,82 454,74 466,74" fill="#fbbf24"/>
      <text x="410" y="158" fontFamily="system-ui" fontWeight="700" fontSize="10" fill="#6d28d9">"Now I</text>
      {/* Speech bubble 3 */}
      <rect x="400" y="160" width="140" height="56" rx="10" fill="white" stroke="#8b5cf6" strokeWidth="2"/>
      <text x="413" y="180" fontFamily="system-ui" fontWeight="700" fontSize="11" fill="#6d28d9">"Now I understand</text>
      <text x="413" y="195" fontFamily="system-ui" fontWeight="700" fontSize="11" fill="#6d28d9">gravity! 🚀"</text>
      <text x="416" y="226" fontFamily="system-ui" fontWeight="900" fontSize="10" fill="#8b5cf6">Panel 3</text>
    </svg>
  );
}

/* Quiz preview card */
function QuizIllustration() {
  return (
    <svg viewBox="0 0 420 360" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Card shadow */}
      <rect x="24" y="28" width="372" height="316" rx="24" fill="#c4b5fd" opacity="0.4"/>
      {/* Card */}
      <rect x="18" y="20" width="372" height="316" rx="24" fill="white" stroke="#ddd6fe" strokeWidth="2"/>
      {/* Header */}
      <rect x="18" y="20" width="372" height="64" rx="24" fill="#7c3aed"/>
      <rect x="18" y="60" width="372" height="24" fill="#7c3aed"/>
      <text x="40" y="56" fontFamily="system-ui" fontWeight="900" fontSize="16" fill="white">Question 3 of 5</text>
      <rect x="290" y="36" width="80" height="28" rx="14" fill="#fbbf24"/>
      <text x="308" y="54" fontFamily="system-ui" fontWeight="900" fontSize="12" fill="#78350f">★ 40 pts</text>
      {/* Image area */}
      <rect x="36" y="102" width="336" height="100" rx="16" fill="#f5f3ff" stroke="#ddd6fe" strokeWidth="2"/>
      <circle cx="122" cy="152" r="36" fill="#dbeafe"/>
      <circle cx="122" cy="152" r="24" fill="#3b82f6"/>
      {/* Saturn rings */}
      <ellipse cx="122" cy="152" rx="48" ry="10" fill="none" stroke="#f59e0b" strokeWidth="5"/>
      <ellipse cx="122" cy="152" rx="36" ry="7" fill="none" stroke="#fbbf24" strokeWidth="3"/>
      <circle cx="122" cy="152" r="22" fill="#a855f7"/>
      <text x="188" y="138" fontFamily="system-ui" fontWeight="900" fontSize="14" fill="#3730a3">Which planet</text>
      <text x="188" y="156" fontFamily="system-ui" fontWeight="900" fontSize="14" fill="#3730a3">has rings?</text>
      <text x="188" y="178" fontFamily="system-ui" fontWeight="700" fontSize="12" fill="#6d28d9">Choose the right answer</text>
      {/* Answer options */}
      <rect x="36" y="218" width="336" height="38" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2"/>
      <text x="56" y="241" fontFamily="system-ui" fontWeight="700" fontSize="14" fill="#64748b">A.  Mars</text>
      <rect x="36" y="264" width="336" height="40" rx="12" fill="#f0fdf4" stroke="#22c55e" strokeWidth="2.5"/>
      <text x="56" y="288" fontFamily="system-ui" fontWeight="900" fontSize="14" fill="#15803d">B.  Saturn ✓</text>
      <circle cx="362" cy="284" r="12" fill="#22c55e"/>
      <path d="M356 284 L360 288 L368 280" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <rect x="36" y="314" width="336" height="10" rx="5" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2"/>
      {/* XP badge */}
      <rect x="36" y="278" width="100" height="0" rx="0" fill="none"/>
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────
   JOURNEY STEP CARDS
──────────────────────────────────────────────────────────────── */
const journeySteps = [
  {
    id: 'see', label: 'SEE', color: '#1d4ed8', light: '#dbeafe', border: '#93c5fd',
    desc: 'Observe visual information and learning content',
    Illustration: SeeIllustration,
  },
  {
    id: 'understand', label: 'UNDERSTAND', color: '#15803d', light: '#dcfce7', border: '#86efac',
    desc: 'Organize concepts and build mental models',
    Illustration: UnderstandIllustration,
  },
  {
    id: 'remember', label: 'REMEMBER', color: '#7c3aed', light: '#f3e8ff', border: '#c084fc',
    desc: 'Retain knowledge through visual memory cues',
    Illustration: RememberIllustration,
  },
  {
    id: 'apply', label: 'APPLY', color: '#c2410c', light: '#fff7ed', border: '#fdba74',
    desc: 'Practice and solve problems with confidence',
    Illustration: ApplyIllustration,
  },
  {
    id: 'master', label: 'MASTER', color: '#be185d', light: '#fdf2f8', border: '#f9a8d4',
    desc: 'Achieve mastery and celebrate your success',
    Illustration: MasterIllustration,
  },
];

/* ────────────────────────────────────────────────────────────────
   MAIN PAGE COMPONENT
──────────────────────────────────────────────────────────────── */
export default function Landing() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(160deg,#f0f7ff 0%,#fafcff 60%,#f5f0ff 100%)' }}>

      {/* ── subtle background decoration ── */}
      <div aria-hidden className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div style={{ position:'absolute', top:'-10%', right:'-5%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,#dbeafe 0%,transparent 70%)', opacity:0.6 }}/>
        <div style={{ position:'absolute', bottom:'20%', left:'-8%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,#f3e8ff 0%,transparent 70%)', opacity:0.5 }}/>
        <div style={{ position:'absolute', top:'40%', left:'40%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,#dcfce7 0%,transparent 70%)', opacity:0.35 }}/>
      </div>

      {/* ════════════════════════════════════════════════════════════
          HERO — Image-first, ultra-colorful
      ═══════════════════════════════════════════════════════════ */}
      {/* ════════════════════════════════════════════════════════════
          HERO — Layout matched to client reference image
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 overflow-hidden" style={{ minHeight: '92vh', display: 'flex', alignItems: 'center' }}>

        {/* ── Full-bleed animated background ── */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Main gradient */}
          <div className="absolute inset-0 animate-shimmer-bg"
            style={{ background: 'linear-gradient(135deg,#e0f2fe 0%,#ede9fe 25%,#fce7f3 50%,#fef9c3 75%,#dcfce7 100%)', backgroundSize: '400% 400%' }}/>
          
          {/* Blobs */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full animate-drift opacity-50 mix-blend-multiply"
            style={{ background: 'radial-gradient(circle,#93c5fd 0%,transparent 65%)', animationDuration:'15s' }}/>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full animate-drift opacity-40 mix-blend-multiply"
            style={{ background: 'radial-gradient(circle,#c084fc 0%,transparent 65%)', animationDuration:'18s', animationDelay:'-6s' }}/>
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full animate-float-slow opacity-35 mix-blend-multiply"
            style={{ background: 'radial-gradient(circle,#6ee7b7 0%,transparent 65%)', animationDuration:'11s', animationDelay:'-3s' }}/>
          <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full animate-float opacity-30 mix-blend-multiply"
            style={{ background: 'radial-gradient(circle,#fde68a 0%,transparent 65%)', animationDuration:'8s', animationDelay:'-2s' }}/>

          {/* Left Side Elements (Mesmerizing space fillers) */}
          <div className="absolute top-20 -left-32 w-96 h-96 rounded-full animate-spin-slow opacity-40"
            style={{ border: '40px solid rgba(139,92,246,0.15)', borderTopColor: 'rgba(236,72,153,0.6)', filter: 'blur(8px)', animationDuration: '25s' }}/>
          <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full animate-float opacity-80 mix-blend-multiply"
            style={{ background: 'radial-gradient(circle at 30% 30%, #a78bfa, #c084fc, transparent 70%)', filter: 'blur(28px)', animationDuration: '14s' }}/>
          {/* Glassmorphic shape left */}
          <div className="absolute top-1/4 left-[3%] w-24 h-24 rounded-3xl animate-drift opacity-80 backdrop-blur-lg shadow-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.1))', border: '1.5px solid rgba(255,255,255,0.9)', transform: 'rotate(15deg) scale(1.2)', boxShadow: '0 12px 40px rgba(124,58,237,0.3)', animationDuration: '12s' }}/>

          {/* ── NEW: Balloon Cluster (Left Margin) ── */}
          <div className="absolute top-[15%] left-[1%] z-15 animate-drift pointer-events-auto cursor-pointer hover:scale-105 transition-transform"
            style={{ animationDuration: '14s' }}>
            <svg viewBox="0 0 240 400" className="w-48 sm:w-60 h-auto drop-shadow-2xl">
              {/* Strings */}
              <path d="M 80 165 Q 120 250, 150 400" fill="none" stroke="black" strokeWidth="4" />
              <path d="M 120 145 Q 120 250, 150 400" fill="none" stroke="black" strokeWidth="4" />
              <path d="M 160 155 Q 150 250, 150 400" fill="none" stroke="black" strokeWidth="4" />
              
              {/* Left Green Balloon */}
              <g transform="rotate(-15 60 120)">
                <ellipse cx="60" cy="120" rx="40" ry="50" fill="#4d7c0f" stroke="black" strokeWidth="4" />
                <path d="M 45 80 Q 25 90, 25 120" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
                <polygon points="53,170 67,170 60,180" fill="#3f6212" stroke="black" strokeWidth="2" />
              </g>

              {/* Right Orange Balloon */}
              <g transform="rotate(15 180 110)">
                <ellipse cx="180" cy="110" rx="40" ry="50" fill="#ea580c" stroke="black" strokeWidth="4" />
                <path d="M 165 70 Q 145 80, 145 110" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
                <polygon points="173,160 187,160 180,170" fill="#c2410c" stroke="black" strokeWidth="2" />
              </g>

              {/* Center Cream Balloon */}
              <g>
                <ellipse cx="120" cy="90" rx="50" ry="60" fill="#fef3c7" stroke="black" strokeWidth="4" />
                <path d="M 100 40 Q 75 55, 75 90" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" opacity="0.5" />
                <polygon points="112,150 128,150 120,160" fill="#fde68a" stroke="black" strokeWidth="2" />
                {/* Content inside Center Balloon */}
                <text x="120" y="105" textAnchor="middle" fill="black" className="font-black text-3xl font-sans">FUN!</text>
              </g>
            </svg>
          </div>

          {/* Right Side Elements (Mesmerizing space fillers) */}
          <div className="absolute bottom-10 -right-40 w-[600px] h-[600px] rounded-full animate-spin-reverse-slow opacity-40"
            style={{ border: '3px dashed rgba(59,130,246,0.6)', filter: 'blur(1px)', animationDuration: '45s' }}/>
          <div className="absolute bottom-1/4 -right-10 w-96 h-96 rounded-full animate-float-reverse opacity-80 mix-blend-multiply"
            style={{ background: 'radial-gradient(circle at 70% 70%, #60a5fa, #3b82f6, transparent 70%)', filter: 'blur(36px)', animationDuration: '18s' }}/>
          {/* Glassmorphic shape right */}
          <div className="absolute bottom-1/3 right-[3%] w-32 h-32 rounded-full animate-float opacity-70 backdrop-blur-lg shadow-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.05))', border: '1.5px solid rgba(255,255,255,0.8)', boxShadow: '0 12px 40px rgba(59,130,246,0.3)', animationDuration: '10s' }}/>

          {/* ── NEW: Balloon Cluster (Right Margin) ── */}
          <div className="absolute top-[20%] right-[1%] z-15 animate-float pointer-events-auto cursor-pointer hover:scale-105 transition-transform"
            style={{ animationDuration: '16s' }}>
            <svg viewBox="0 0 240 400" className="w-48 sm:w-60 h-auto drop-shadow-2xl">
              {/* Strings */}
              <path d="M 80 165 Q 120 250, 110 400" fill="none" stroke="black" strokeWidth="4" />
              <path d="M 120 145 Q 120 250, 110 400" fill="none" stroke="black" strokeWidth="4" />
              <path d="M 160 155 Q 150 250, 110 400" fill="none" stroke="black" strokeWidth="4" />
              
              {/* Left Green Balloon */}
              <g transform="rotate(-15 60 120)">
                <ellipse cx="60" cy="120" rx="40" ry="50" fill="#4d7c0f" stroke="black" strokeWidth="4" />
                <path d="M 45 80 Q 25 90, 25 120" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
                <polygon points="53,170 67,170 60,180" fill="#3f6212" stroke="black" strokeWidth="2" />
              </g>

              {/* Right Orange Balloon */}
              <g transform="rotate(15 180 110)">
                <ellipse cx="180" cy="110" rx="40" ry="50" fill="#ea580c" stroke="black" strokeWidth="4" />
                <path d="M 165 70 Q 145 80, 145 110" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
                <polygon points="173,160 187,160 180,170" fill="#c2410c" stroke="black" strokeWidth="2" />
              </g>

              {/* Center Cream Balloon */}
              <g>
                <ellipse cx="120" cy="90" rx="50" ry="60" fill="#fef3c7" stroke="black" strokeWidth="4" />
                <path d="M 100 40 Q 75 55, 75 90" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" opacity="0.5" />
                <polygon points="112,150 128,150 120,160" fill="#fde68a" stroke="black" strokeWidth="2" />
                {/* Content inside Center Balloon */}
                <text x="120" y="105" textAnchor="middle" fill="black" className="font-black text-2xl font-sans">LEARN</text>
              </g>
            </svg>
          </div>
            
          {/* Ambient light flares */}
          <div className="absolute top-10 left-10 w-40 h-40 bg-white/60 blur-[40px] rounded-full animate-pulse" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/60 blur-[40px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col xl:flex-row items-center gap-10 xl:gap-6">

            {/* ════════ LEFT — Branding + CTA ════════ */}
            <div className="w-full xl:w-[44%] flex flex-col items-center xl:items-start text-center xl:text-left z-10 relative">
              {/* Decorative floating icons behind text */}
              <div className="absolute -left-10 top-20 text-4xl animate-float opacity-80" style={{ animationDelay: '0.2s' }}>💡</div>
              <div className="absolute right-10 top-10 text-3xl animate-float-reverse opacity-80" style={{ animationDelay: '0.5s' }}>🚀</div>
              <div className="absolute left-1/4 bottom-32 text-3xl animate-bounce-y opacity-80" style={{ animationDelay: '1.2s' }}>🎯</div>

              {/* Animated badge */}
              <div className="animate-slide-left mb-6" style={{ animationDelay:'0.05s' }}>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-black shadow-lg"
                  style={{ background:'linear-gradient(135deg,#6366f1,#ec4899,#f97316)', color:'white' }}>
                  <span className="animate-sparkle">✨</span>
                  Learn at the Speed of Sight
                  <span className="animate-sparkle" style={{ animationDelay:'0.8s' }}>✨</span>
                </div>
              </div>

              {/* Heading */}
              <h1 className="font-black leading-[1.05] tracking-tight mb-5 animate-slide-left"
                style={{ animationDelay:'0.15s', fontSize:'clamp(40px,5vw,72px)', color:'#0f172a' }}>
                <span className="block" style={{ color:'#1e3a8a' }}>THE VISUAL</span>
                <span className="block" style={{ color:'#1e3a8a' }}>LEARNING</span>
                <span className="block font-black text-transparent bg-clip-text animate-shimmer-bg"
                  style={{ backgroundImage:'linear-gradient(90deg, #2563eb, #7c3aed, #ec4899, #f97316, #2563eb)', backgroundSize:'300% auto' }}>
                  PLATFORM
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg font-semibold mb-8 max-w-sm mx-auto xl:mx-0 leading-relaxed animate-slide-left"
                style={{ color:'#374151', animationDelay:'0.22s' }}>
                Visual tools that help learners{' '}
                <strong style={{ color:'#1d4ed8' }}>see</strong>,{' '}
                <strong style={{ color:'#15803d' }}>understand</strong>,{' '}
                <strong style={{ color:'#7c3aed' }}>remember</strong> and{' '}
                <strong style={{ color:'#c2410c' }}>apply</strong>{' '}
                knowledge — 60,000× faster than text.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap flex-col sm:flex-row gap-4 mb-10 w-full justify-center xl:justify-start animate-slide-left"
                style={{ animationDelay:'0.29s' }}>
                <Link to="/amivi"
                  className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-black text-lg text-white transition-all hover:-translate-y-1.5 hover:scale-105"
                  style={{ background:'linear-gradient(135deg,#1d4ed8,#7c3aed)', boxShadow:'0 14px 36px rgba(99,102,241,0.45)', borderBottom:'4px solid #3730a3' }}>
                  <Sparkles className="w-5 h-5" /> START LEARNING
                </Link>
                <Link to="/amivi"
                  className="flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-black text-lg transition-all hover:-translate-y-1 hover:scale-105"
                  style={{ background:'white', color:'#1d4ed8', border:'2.5px solid #c7d2fe', boxShadow:'0 6px 20px rgba(99,102,241,0.15)' }}>
                  EXPLORE AMIVI <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/amico"
                  className="flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-black text-lg transition-all hover:-translate-y-1 hover:scale-105"
                  style={{ background:'white', color:'#7c3aed', border:'2.5px solid #e9d5ff', boxShadow:'0 6px 20px rgba(124,58,237,0.15)' }}>
                  EXPLORE AMICO <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Stats */}
              <div className="flex gap-6 flex-wrap justify-center xl:justify-start animate-slide-left" style={{ animationDelay:'0.36s' }}>
                {[
                  { val:'60,000×', label:'Faster', color:'#1d4ed8', bg:'#eff6ff' },
                  { val:'3', label:'AI Tools', color:'#7c3aed', bg:'#f3e8ff' },
                  { val:'∞', label:'Visuals', color:'#15803d', bg:'#f0fdf4' },
                ].map((s,i) => (
                  <div key={s.label} className="text-center px-5 py-3 rounded-2xl font-black shadow-sm animate-bounce-y"
                    style={{ background:s.bg, border:`2px solid ${s.color}20`, animationDelay:`${i*0.4}s`, animationDuration:'2.8s' }}>
                    <div className="text-2xl font-black" style={{ color:s.color }}>{s.val}</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ════════ RIGHT — Real images composition ════════ */}
            <div className="w-full xl:w-[56%] relative flex items-center justify-center" style={{ minHeight:560 }}>

              {/* ── Main hero image ── */}
              <div className="relative z-20 animate-fade-scale" style={{ animationDelay:'0.2s' }}>
                {/* Glow ring behind image */}
                <div className="absolute -inset-8 rounded-full animate-pulse-glow-purple"
                  style={{ background:'radial-gradient(ellipse,rgba(139,92,246,0.3) 0%,transparent 70%)', filter:'blur(20px)' }}/>
                <div className="absolute -inset-4 rounded-[40px] animate-pulse-glow"
                  style={{ background:'radial-gradient(ellipse,rgba(59,130,246,0.2) 0%,transparent 70%)', filter:'blur(10px)' }}/>

                {/* Hero image */}
                <div className="relative rounded-[36px] overflow-hidden shadow-[0_32px_100px_rgba(99,102,241,0.3)] border-4 border-white/80"
                  style={{ width:420 }}>
                  <img src="/vlq-hero-main.jpg" alt="VLQ students learning visually"
                    className="w-full h-full object-cover"
                    style={{ display:'block' }}/>
                  {/* Overlay gradient at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-20"
                    style={{ background:'linear-gradient(to top, rgba(255,255,255,0.9), transparent)' }}/>
                  {/* Bottom label */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-2 px-5 py-2 rounded-full font-black text-xs text-white shadow-lg"
                      style={{ background:'linear-gradient(135deg,#1d4ed8,#7c3aed)', whiteSpace:'nowrap' }}>
                      <span className="animate-sparkle">⭐</span> SEE → UNDERSTAND → MASTER
                    </div>
                  </div>
                </div>
              </div>

              {/* ── AMIVI floating card (top-left) ── */}
              <div className="absolute z-30 animate-drift"
                style={{ top:'2%', left:'0%', animationDuration:'9s', animationDelay:'-2s' }}>
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
                  style={{ width:150, transform:'rotate(-6deg)' }}>
                  <img src="/vlq-amivi-card.jpg" alt="AMIVI visual generation"
                    className="w-full h-28 object-cover"/>
                  <div className="px-3 py-2" style={{ background:'linear-gradient(135deg,#2563eb,#0ea5e9)' }}>
                    <div className="font-black text-xs text-white">🎨 AMIVI</div>
                    <div className="text-xs text-blue-100 font-semibold">See It!</div>
                  </div>
                </div>
              </div>

              {/* ── Quiz floating card (top-right) ── */}
              <div className="absolute z-30 animate-float"
                style={{ top:'0%', right:'0%', animationDelay:'-1.5s', animationDuration:'5s' }}>
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
                  style={{ width:150, transform:'rotate(5deg)' }}>
                  <img src="/vlq-quiz-card.jpg" alt="VLQ interactive quiz"
                    className="w-full h-28 object-cover"/>
                  <div className="px-3 py-2" style={{ background:'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
                    <div className="font-black text-xs text-white">🧩 QUIZ</div>
                    <div className="text-xs text-purple-100 font-semibold">Master It!</div>
                  </div>
                </div>
              </div>

              {/* ── AMICO floating card (bottom-left) ── */}
              <div className="absolute z-30 animate-float-reverse"
                style={{ bottom:'8%', left:'2%', animationDelay:'-3s', animationDuration:'6s' }}>
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
                  style={{ width:150, transform:'rotate(4deg)' }}>
                  <img src="/vlq-comic-card.jpg" alt="AMICO comic creation"
                    className="w-full h-28 object-cover"/>
                  <div className="px-3 py-2" style={{ background:'linear-gradient(135deg,#be185d,#ec4899)' }}>
                    <div className="font-black text-xs text-white">📚 AMICO</div>
                    <div className="text-xs text-pink-100 font-semibold">Imagine It!</div>
                  </div>
                </div>
              </div>

              {/* ── SEE floating card (bottom-right) ── */}
              <div className="absolute z-30 animate-bounce-y"
                style={{ bottom:'6%', right:'0%', animationDuration:'3s', animationDelay:'-1s' }}>
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white"
                  style={{ width:148, transform:'rotate(-4deg)' }}>
                  <img src="/vlq-see-card.jpg" alt="Visual learning SEE stage"
                    className="w-full h-28 object-cover"/>
                  <div className="px-3 py-2" style={{ background:'linear-gradient(135deg,#059669,#10b981)' }}>
                    <div className="font-black text-xs text-white">🔍 SEE</div>
                    <div className="text-xs text-green-100 font-semibold">Explore!</div>
                  </div>
                </div>
              </div>

              {/* ── XP Badge ── */}
              <div className="absolute z-40 animate-bounce-y"
                style={{ top:'38%', right:'-2%', animationDuration:'2.2s' }}>
                <div className="rounded-2xl px-4 py-3 text-center shadow-2xl border-4 border-white"
                  style={{ background:'linear-gradient(135deg,#fbbf24,#f59e0b)', width:110 }}>
                  <div className="text-2xl">🏆</div>
                  <div className="font-black text-sm text-white">+250 XP</div>
                  <div className="text-xs font-bold text-yellow-100">Level Up!</div>
                </div>
              </div>

              {/* ── Online pill ── */}
              <div className="absolute z-40 animate-float"
                style={{ top:'42%', left:'-4%', animationDelay:'-2s', animationDuration:'4s' }}>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm shadow-xl border-4 border-white"
                  style={{ background:'linear-gradient(135deg,#15803d,#22c55e)', color:'white' }}>
                  <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse inline-block"/>
                  147 Online
                </div>
              </div>

              {/* ── Sparkle dots ── */}
              {[
                { top:'12%', left:'28%', size:10, color:'#f472b6', delay:'0s' },
                { top:'22%', right:'22%', size:8, color:'#a78bfa', delay:'0.7s' },
                { bottom:'35%', left:'20%', size:12, color:'#34d399', delay:'1.2s' },
                { bottom:'25%', right:'22%', size:7, color:'#fbbf24', delay:'0.4s' },
                { top:'65%', left:'38%', size:9, color:'#60a5fa', delay:'1.8s' },
                { top:'8%', left:'48%', size:6, color:'#fb923c', delay:'2.2s' },
              ].map((d,i) => (
                <div key={i} className="absolute rounded-full animate-sparkle pointer-events-none"
                  style={{ top:d.top, left:d.left, right:d.right, bottom:d.bottom,
                    width:d.size, height:d.size, background:d.color,
                    animationDelay:d.delay, boxShadow:`0 0 ${d.size*2}px ${d.color}` }}/>
              ))}

            </div>
          </div>
        </div>

        {/* ── Bottom wave ── */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight:0 }}>
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width:'100%', height:80 }}>
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="rgba(255,255,255,0.7)"/>
            <path d="M0,60 C480,20 960,80 1440,50 L1440,80 L0,80 Z" fill="white"/>
          </svg>
        </div>
      </section>


      {/* ════════════════════════════════════════════════════════════
          LEARNING JOURNEY — Main visual centrepiece
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Section heading */}
          <div className="text-center mb-14">
            <div className="inline-block px-5 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-5 text-white" style={{ background:'linear-gradient(135deg,#1d4ed8,#7c3aed)' }}>
              The VLQ Method
            </div>
            <h2 className="font-black leading-tight" style={{ fontSize:'clamp(28px,3.5vw,52px)', color:'#0f172a' }}>
              One Platform. <span style={{ color:'#2563eb' }}>One Journey.</span>
            </h2>
            <p className="mt-3 text-lg font-semibold" style={{ color:'#64748b' }}>
              Every learner follows the same visual path to mastery.
            </p>
          </div>

          {/* Journey cards row */}
          <div className="relative flex flex-col sm:flex-row items-stretch gap-4">
            {journeySteps.map((step, i) => {
              const Illus = step.Illustration;
              return (
                <div key={step.id} className="flex sm:flex-col items-center gap-4 sm:gap-0 flex-1">
                  {/* Card */}
                  <div
                    className="group flex-1 sm:flex-none flex flex-col items-center rounded-[28px] p-6 shadow-lg transition-all duration-500 hover:-translate-y-4 hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:scale-105 w-full cursor-pointer relative overflow-hidden"
                    style={{ background:`linear-gradient(145deg,${step.light} 0%,white 100%)`, border:`3px solid ${step.border}` }}
                  >
                    {/* 3D Glass overlay on hover */}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none mix-blend-overlay"></div>
                    {/* Stage badge */}
                    <div className="inline-flex items-center justify-center px-5 py-2 rounded-full text-white font-black text-sm mb-4 shadow-md transition-transform duration-500 group-hover:scale-110"
                      style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)` }}>
                      {step.label}
                    </div>
                    {/* Illustration */}
                    <div className="w-full aspect-[4/3] sm:aspect-square flex items-center justify-center mb-4">
                      <Illus />
                    </div>
                    {/* Description */}
                    <p className="text-sm font-bold text-center leading-snug" style={{ color:'#475569' }}>
                      {step.desc}
                    </p>
                  </div>
                  {/* Arrow connector (except after last) */}
                  {i < journeySteps.length - 1 && (
                    <div className="flex sm:hidden items-center justify-center px-2">
                      <ChevronRight style={{ color: step.color }} className="w-8 h-8 font-black" strokeWidth={3}/>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Desktop horizontal arrows overlaid between cards */}
            <div className="hidden sm:flex absolute inset-0 pointer-events-none items-center" style={{ paddingLeft:'calc(20% - 16px)', gap:'calc(20% - 32px)' }}>
              {[0,1,2,3].map(i => (
                <ChevronRight key={i} className="w-8 h-8 flex-shrink-0" strokeWidth={3.5} style={{ color: journeySteps[i].color, opacity:0.7, minWidth:32 }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          AMIVI  — SEE IT
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-14">

            {/* Text */}
            <div className="w-full lg:w-2/5">
              <div className="inline-block px-4 py-1.5 rounded-full font-black text-sm mb-5 text-white" style={{ background:'#1d4ed8' }}>
                AMIVI
              </div>
              <h2 className="font-black leading-tight mb-4" style={{ fontSize:'clamp(30px,3.5vw,52px)', color:'#0f172a' }}>
                SEE IT.
              </h2>
              <p className="text-lg font-semibold mb-8 leading-relaxed" style={{ color:'#475569' }}>
                Paste or upload any learning material. AMIVI's AI engine transforms it into beautiful visual explanations — diagrams, infographics and illustrated cards.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['📄 Any Document','🤖 AI-Powered','🎨 Visual Output','⚡ Instant'].map(tag => (
                  <div key={tag} className="px-4 py-2 rounded-xl font-bold text-sm" style={{ background:'#dbeafe', color:'#1d4ed8' }}>
                    {tag}
                  </div>
                ))}
              </div>
              <Link to="/amivi"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-lg text-white hover:-translate-y-1 transition-all"
                style={{ background:'linear-gradient(135deg,#1d4ed8,#2563eb)', boxShadow:'0 10px 28px rgba(29,78,216,0.3)', borderBottom:'4px solid #1e3a8a' }}>
                CREATE VISUALS <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Illustration */}
            <div className="w-full lg:w-3/5 rounded-[32px] p-6 shadow-xl" style={{ background:'linear-gradient(150deg,#eff6ff,#f0f9ff)', border:'2px solid #bfdbfe' }}>
              <AmiviIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          AMICO  — IMAGINE IT
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8" style={{ background:'linear-gradient(160deg,#fdf2f8 0%,#fafcff 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-14">

            {/* Text */}
            <div className="w-full lg:w-2/5">
              <div className="inline-block px-4 py-1.5 rounded-full font-black text-sm mb-5 text-white" style={{ background:'#be185d' }}>
                AMICO
              </div>
              <h2 className="font-black leading-tight mb-4" style={{ fontSize:'clamp(30px,3.5vw,52px)', color:'#0f172a' }}>
                IMAGINE IT.
              </h2>
              <p className="text-lg font-semibold mb-8 leading-relaxed" style={{ color:'#475569' }}>
                Turn any concept into a multi-panel comic story. Characters, speech bubbles, dramatic scenes — AMICO makes learning unforgettable through visual storytelling.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['🎭 Characters','💬 Dialogues','📖 Multi-Panel','🌟 Memorable'].map(tag => (
                  <div key={tag} className="px-4 py-2 rounded-xl font-bold text-sm" style={{ background:'#fdf2f8', color:'#be185d', border:'1.5px solid #fbcfe8' }}>
                    {tag}
                  </div>
                ))}
              </div>
              <Link to="/amico"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-lg text-white hover:-translate-y-1 transition-all"
                style={{ background:'linear-gradient(135deg,#be185d,#ec4899)', boxShadow:'0 10px 28px rgba(190,24,93,0.3)', borderBottom:'4px solid #9d174d' }}>
                CREATE COMIC <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Illustration */}
            <div className="w-full lg:w-3/5 rounded-[32px] p-6 shadow-xl" style={{ background:'linear-gradient(150deg,#fdf2f8,#fff1f2)', border:'2px solid #fbcfe8' }}>
              <AmicoIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          QUIZ  — MASTER IT
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-14">

            {/* Text */}
            <div className="w-full lg:w-2/5">
              <div className="inline-block px-4 py-1.5 rounded-full font-black text-sm mb-5 text-white" style={{ background:'#7c3aed' }}>
                QUIZ
              </div>
              <h2 className="font-black leading-tight mb-4" style={{ fontSize:'clamp(30px,3.5vw,52px)', color:'#0f172a' }}>
                MASTER IT.
              </h2>
              <p className="text-lg font-semibold mb-8 leading-relaxed" style={{ color:'#475569' }}>
                Test your understanding through interactive visual quizzes. Earn points, track progress, and reach mastery — one question at a time.
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['⭐ Earn Points','📈 Track Progress','🏆 Badges','🎯 Visual Questions'].map(tag => (
                  <div key={tag} className="px-4 py-2 rounded-xl font-bold text-sm" style={{ background:'#f3e8ff', color:'#7c3aed', border:'1.5px solid #ddd6fe' }}>
                    {tag}
                  </div>
                ))}
              </div>
              <Link to="/quiz"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-lg text-white hover:-translate-y-1 transition-all"
                style={{ background:'linear-gradient(135deg,#7c3aed,#8b5cf6)', boxShadow:'0 10px 28px rgba(124,58,237,0.3)', borderBottom:'4px solid #6d28d9' }}>
                START QUIZ <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Illustration */}
            <div className="w-full lg:w-3/5 flex justify-center">
              <div className="w-full max-w-md">
                <QuizIllustration />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          JOURNEY SUMMARY BANNER
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="group rounded-[36px] p-12 text-center text-white relative overflow-hidden transition-all duration-700 hover:shadow-[0_32px_80px_rgba(29,78,216,0.5)] hover:-translate-y-2" style={{ background:'linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 40%,#7c3aed 100%)', boxShadow:'0 24px 64px rgba(29,78,216,0.4)' }}>
            {/* decorative blobs */}
            <div aria-hidden className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-30 animate-spin-slow" style={{ background:'radial-gradient(circle, #60a5fa, transparent 70%)', animationDuration:'25s' }}/>
            <div aria-hidden className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full opacity-30 animate-spin-reverse-slow" style={{ background:'radial-gradient(circle, #c084fc, transparent 70%)', animationDuration:'30s' }}/>
            
            {/* Hover glow */}
            <div aria-hidden className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] mb-6 px-5 py-2 rounded-full bg-black/20 text-blue-200 border border-blue-400/30 shadow-inner">
                 🏆 LEVEL COMPLETE
              </div>
              <h2 className="font-black mb-10 leading-tight" style={{ fontSize:'clamp(28px,4vw,56px)' }}>
                Start your journey today.<br/>
                <span className="text-blue-300 inline-block hover:scale-110 transition-transform cursor-default">SEE</span> →{' '}
                <span className="text-green-300 inline-block hover:scale-110 transition-transform cursor-default">UNDERSTAND</span> →{' '}
                <span className="text-purple-300 inline-block hover:scale-110 transition-transform cursor-default">REMEMBER</span> →{' '}
                <span className="text-orange-300 inline-block hover:scale-110 transition-transform cursor-default">APPLY</span> →{' '}
                <span className="text-pink-300 inline-block hover:scale-110 transition-transform cursor-default">MASTER</span>
              </h2>
              <div className="flex justify-center mt-8">
                <Link to="/amivi"
                  className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-xl text-blue-900 bg-white transition-all duration-300 hover:bg-yellow-300 hover:text-blue-950 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(253,224,71,0.4)] border-b-4 border-gray-200 hover:border-yellow-500">
                  <Sparkles className="w-6 h-6 animate-pulse" /> START YOUR JOURNEY NOW
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
