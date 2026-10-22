// ============================================================
// CORE ECOSYSTEMS — introduces VLQ's two proprietary engines,
// AMIVI and AMICO. Built as a standalone page per request
// ("create this page, we shall insert it in the proper location
// later") — not yet wired into navigation/routes.
//
// The two large graphics below (AMIVI overview, AMICO overview)
// were cropped from the reference mockup supplied in chat. They
// are screenshot-resolution, not the original source files — if
// higher-resolution originals of these two graphics exist, swap
// them in at /ecosystems/amivi-overview.png and
// /ecosystems/amico-overview.png for a sharper result.
// ============================================================

import { Sparkles } from 'lucide-react';

export default function CoreEcosystems() {
  return (
    <div className="py-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 w-[95%] max-w-[100rem] mx-auto">

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-5"
          style={{ background: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff' }}
        >
          <Sparkles className="w-4 h-4" /> The VLQ Engine
        </div>
        <h1 className="font-extrabold leading-snug text-black" style={{ fontSize: 'clamp(28px,3.4vw,44px)' }}>
          Two Proprietary Ecosystems.
          <br />
          One Learning Platform.
        </h1>
        <p className="mt-3 text-xl font-bold text-black">
          AMIVI turns complexity into clarity. AMICO turns learning into creativity.
        </p>
      </div>

      {/* ======================================================
          AMIVI + AMICO overview graphics — large, side by side,
          stacking on smaller screens.
      ======================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/50 aspect-[5/4]">
          <img
            src="/ecosystems/amivi-overview.png"
            alt="AMIVI — VLQ's Central Transformer: turns long text, video transcripts and complex content into VLQ micro-lessons and chunks. From Information to Inspiration."
            className="w-full h-full object-cover block"
          />
        </div>
        <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/50 aspect-[5/4]">
          <img
            src="/ecosystems/amico-overview.png"
            alt="AMICO — Your Visual Storytelling Engine: turns life into visual stories through comics, photos, photo stories, memories, visual diaries and biographies."
            className="w-full h-full object-cover block"
          />
        </div>
      </div>

    </div>
  );
}
