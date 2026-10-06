import { Brain, Eye, Sparkles, Trophy, ArrowRight } from 'lucide-react';

// ============================================================
// LEARNING JOURNEY — the shared AMIVI/AMICO strip:
// Complexity -> Clarity -> Creativity -> Mastery.
//
// Shown at the top of both the AMIVI and AMICO pages in place of
// a generic decorative photo, so the journey stays visible and
// memorable wherever a teacher lands. AMIVI's job is turning
// Complexity into Clarity; AMICO's job is turning that learning
// into Creativity; Mastery is the shared destination both are
// building toward. Uses the same pill + arrow pattern already
// used elsewhere in the app (Explore's five steps, the Quiz
// Decks flowchart) so typography, spacing and card treatment
// stay consistent rather than introducing a new visual language.
// ============================================================

const STAGES = [
  { key: 'complexity', label: 'Complexity', icon: Brain, tint: '#f1f5f9', border: '#e2e8f0', text: '#475569', dot: '#64748b' },
  { key: 'clarity', label: 'Clarity', icon: Eye, tint: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', dot: '#2563eb' },
  { key: 'creativity', label: 'Creativity', icon: Sparkles, tint: '#fdf2f8', border: '#fbcfe8', text: '#be185d', dot: '#db2777' },
  { key: 'mastery', label: 'Mastery', icon: Trophy, tint: '#fffbeb', border: '#fde68a', text: '#b45309', dot: '#d97706' },
];

export default function LearningJourney({ highlight }) {
  return (
    <div
      className="w-full px-5 sm:px-8 py-5 sm:py-6"
      style={{ background: 'linear-gradient(135deg,#f8fafc 0%,#f5f3ff 100%)' }}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-black mb-3 text-center sm:text-left">
        The VLQ Learning Journey
      </p>
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const active = stage.key === highlight;
          return (
            <div key={stage.key} className="flex items-center gap-2 sm:gap-3">
              <div
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold text-sm sm:text-base transition-all ${active ? 'shadow-md scale-105' : ''}`}
                style={{
                  background: stage.tint,
                  border: `${active ? 2 : 1}px solid ${stage.border}`,
                  color: stage.text,
                }}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: stage.dot }} />
                {stage.label}
              </div>
              {i < STAGES.length - 1 && (
                <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
