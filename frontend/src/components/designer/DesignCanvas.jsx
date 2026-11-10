import { useEffect, useRef, useState } from 'react';
import { ImageIcon } from 'lucide-react';

import { mediaUrl } from '../../services/api';

// Everything is drawn on a fixed 16:9 board and scaled from a 1280px
// baseline, so the editor preview, the teacher's projector and every
// student's screen show exactly the same picture — same spacing, same
// relative text size — and all five cards always fit on screen.
export const BASE_WIDTH = 1280;

export const LAYOUTS = [
  { key: 'row5', label: 'Row of 5' },
  { key: '3-2', label: '3 on top, 2 below' },
  { key: '2-3', label: '2 on top, 3 below' },
  { key: 'spotlight', label: 'Spotlight + 4' },
];

export const DEFAULT_DESIGN = {
  layout: 'row5',
  background: '#0f172a',
  textColor: '#ffffff',
  textSize: 24,
  heading: '',
  cards: Array.from({ length: 5 }, () => ({ image_url: '', caption: '' })),
};

function imageSrc(path) {
  if (!path) return '';
  return path.startsWith('/api/') || path.startsWith('http') ? mediaUrl(path) : path;
}

function Card({ card, index, style, scale, textColor, textSize, selected, onSelect, showEmpty }) {
  const clickable = Boolean(onSelect);
  return (
    <div
      onClick={clickable ? () => onSelect(index) : undefined}
      className={`flex flex-col min-w-0 min-h-0 overflow-hidden ${clickable ? 'cursor-pointer' : ''}`}
      style={{
        ...style,
        borderRadius: 18 * scale,
        padding: 10 * scale,
        gap: 8 * scale,
        background: `color-mix(in srgb, ${textColor} 8%, transparent)`,
        border: `${Math.max(1, 2 * scale)}px solid ${
          selected ? '#f43f5e' : `color-mix(in srgb, ${textColor} 22%, transparent)`
        }`,
        boxShadow: selected ? `0 0 0 ${3 * scale}px rgba(244,63,94,0.35)` : undefined,
      }}
    >
      <div className="flex-1 min-h-0 flex items-center justify-center" style={{ borderRadius: 12 * scale, overflow: 'hidden' }}>
        {card.image_url ? (
          <img src={imageSrc(card.image_url)} alt={card.caption || ''} className="w-full h-full object-contain" />
        ) : showEmpty ? (
          <div
            className="w-full h-full flex flex-col items-center justify-center"
            style={{
              border: `${Math.max(1, 2 * scale)}px dashed color-mix(in srgb, ${textColor} 35%, transparent)`,
              borderRadius: 12 * scale,
              color: textColor,
              opacity: 0.7,
              fontSize: 14 * scale,
              gap: 4 * scale,
            }}
          >
            <ImageIcon style={{ width: 28 * scale, height: 28 * scale }} />
            <span className="font-bold">Image {index + 1}</span>
          </div>
        ) : null}
      </div>
      {card.caption && (
        <p
          className="text-center font-bold shrink-0"
          style={{
            color: textColor,
            fontSize: textSize * scale,
            lineHeight: 1.2,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            overflowWrap: 'anywhere',
          }}
        >
          {card.caption}
        </p>
      )}
    </div>
  );
}

// `maxHeight` caps the board so it never runs off the bottom of the
// screen (the width then follows from the 16:9 ratio).
export default function DesignCanvas({ design, selectedIndex = null, onSelectCard, showEmpty = false, maxHeight }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(BASE_WIDTH);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width || BASE_WIDTH));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const d = { ...DEFAULT_DESIGN, ...(design || {}) };
  const cards = [...(d.cards || [])];
  while (cards.length < 5) cards.push({ image_url: '', caption: '' });

  const scale = width / BASE_WIDTH;
  const gap = 24 * scale;
  const pad = 32 * scale;

  const cardProps = (i, style) => ({
    card: cards[i],
    index: i,
    style,
    scale,
    textColor: d.textColor,
    textSize: d.textSize,
    selected: selectedIndex === i,
    onSelect: onSelectCard,
    showEmpty,
  });

  // Rows of equal-width cards; shorter rows are centred so the gaps
  // between every card are identical.
  const renderRows = (rows) => {
    const maxCols = Math.max(...rows);
    const cardWidth = `calc((100% - ${(maxCols - 1) * gap}px) / ${maxCols})`;
    let i = 0;
    return (
      <div className="flex-1 min-h-0 flex flex-col" style={{ gap }}>
        {rows.map((count, r) => (
          <div key={r} className="flex-1 min-h-0 flex justify-center" style={{ gap }}>
            {Array.from({ length: count }, () => {
              const idx = i++;
              return <Card key={idx} {...cardProps(idx, { width: cardWidth, flex: '0 0 auto' })} />;
            })}
          </div>
        ))}
      </div>
    );
  };

  let body;
  if (d.layout === 'spotlight') {
    body = (
      <div
        className="flex-1 min-h-0 grid"
        style={{ gap, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gridTemplateRows: 'repeat(2, minmax(0, 1fr))' }}
      >
        <Card {...cardProps(0, { gridColumn: 'span 2', gridRow: 'span 2' })} />
        {[1, 2, 3, 4].map((i) => <Card key={i} {...cardProps(i, {})} />)}
      </div>
    );
  } else if (d.layout === '3-2') {
    body = renderRows([3, 2]);
  } else if (d.layout === '2-3') {
    body = renderRows([2, 3]);
  } else {
    // Row of 5: a single row, cards vertically centred at a sensible
    // height rather than stretched into thin strips.
    body = (
      <div className="flex-1 min-h-0 flex items-center">
        <div className="w-full flex" style={{ gap, height: '78%' }}>
          {[0, 1, 2, 3, 4].map((i) => <Card key={i} {...cardProps(i, { flex: '1 1 0' })} />)}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="relative w-full mx-auto overflow-hidden shadow-lg"
      style={{
        aspectRatio: '16 / 9',
        maxWidth: maxHeight ? `calc(${maxHeight} * 16 / 9)` : undefined,
        background: d.background,
        borderRadius: 20 * scale,
      }}
    >
      <div className="absolute inset-0 flex flex-col" style={{ padding: pad, gap }}>
        {d.heading && (
          <h2
            className="text-center font-extrabold shrink-0"
            style={{ color: d.textColor, fontSize: d.textSize * 1.6 * scale, lineHeight: 1.15, overflowWrap: 'anywhere' }}
          >
            {d.heading}
          </h2>
        )}
        {body}
      </div>
    </div>
  );
}
