// VLQ Logo — bold rounded V with cyan→purple gradient + contrast background
export default function VLQLogo({ size = 62, showText = true }) {
  const gradId   = 'vlq-v-grad';
  const shadowId = 'vlq-glow';
  const height   = showText ? Math.round(size * 1.55) : size;

  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 110 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="VLQ logo"
    >
      <defs>
        {/* Bright cyan-top → violet → hot-pink-bottom for max contrast on blue bg */}
        <linearGradient id={gradId} x1="10" y1="0" x2="90" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#e0f2fe" /> {/* almost white-cyan top */}
          <stop offset="30%"  stopColor="#a5f3fc" /> {/* cyan-200 */}
          <stop offset="65%"  stopColor="#c084fc" /> {/* purple-400 */}
          <stop offset="100%" stopColor="#f0abfc" /> {/* fuchsia-300 */}
        </linearGradient>

        {/* Drop-shadow filter for the V */}
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#7c3aed" floodOpacity="0.6"/>
        </filter>
      </defs>

      {/* Dark pill background for contrast */}
      <rect
        x="4" y="4" width="102" height="105"
        rx="18" ry="18"
        fill="rgba(15,23,42,0.45)"
      />

      {/*
        Rounded V arms using cubic bezier curves.
        Left arm:  curves inward from top-left down to the centre notch.
        Right arm: mirrors it.
        Bottom notch is a smooth arc.
      */}
      <path
        d={[
          /* Start: outer top-left */
          'M 12,12',
          /* Curve top-left arm outward slightly then down to centre */
          'C 12,12  28,16  38,60',    /* left outer edge */
          'C 42,76  48,95  55,105',   /* left inner toward bottom apex */
          /* rounded bottom notch */
          'C 58,111 63,111 66,105',   /* right side of notch */
          /* right arm back up to top-right */
          'C 72,95  78,76  82,60',
          'C 92,16 100,12 100,12',    /* outer top-right */
          /* back across the top - right arm inner */
          'L 78,12',
          'C 78,12  68,14  62,48',
          'C 59,62  56,78  55,85',    /* inner right going down */
          'C 54,78  51,62  48,48',    /* inner left going down */
          'C 42,14  32,12  32,12',
          'L 12,12 Z',
        ].join(' ')}
        fill={`url(#${gradId})`}
        filter={`url(#${shadowId})`}
      />

      {showText && (
        <>
          {/* "VLQ" — white, bold, good size */}
          <text
            x="55"
            y="130"
            textAnchor="middle"
            fontFamily="'Segoe UI Black','Arial Black',Arial,sans-serif"
            fontWeight="900"
            fontSize="26"
            fill="white"
            letterSpacing="4"
          >
            VLQ
          </text>

          {/* "SINCE 2026" — fuchsia on white pill so it's always visible */}
          <rect x="14" y="140" width="82" height="20" rx="10" fill="rgba(255,255,255,0.18)" />
          <text
            x="55"
            y="154"
            textAnchor="middle"
            fontFamily="'Segoe UI','Arial',sans-serif"
            fontWeight="700"
            fontSize="9"
            fill="#f0abfc"
            letterSpacing="3"
          >
            SINCE 2026
          </text>
        </>
      )}
    </svg>
  );
}
