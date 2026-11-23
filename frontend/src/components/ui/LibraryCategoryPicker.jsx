// Shared "Category / Group / Subject" picker for the Library "Save"
// modal, used identically from Amivi.jsx and Amico.jsx. Replaces the
// old flat folder-name button grid with the structure from the
// client's mockup: a fixed top-level Category (kept in sync with the
// Essential Learning auto-classifier's own subject buckets, so a
// manually-saved item lands in the same place as an auto-classified
// one), plus a Group and a Subject — both free text, with quick-pick
// suggestions so returning to a Group/Subject used before is one
// click instead of re-typing it.
//
// Backed by POST /api/library/{id}/categorize (see api.js's
// categorizeLibraryProject), which writes these three values onto
// the existing Project.subject / chapter / chapter_key columns —
// no new columns, no migration.

// Mirrors backend/main.py's SUBJECT_CATEGORIES exactly, so a
// manually-chosen Category always matches one Essential Learning
// already knows how to group by.
export const LIBRARY_CATEGORIES = [
  'Science', 'Math', 'History', 'Language', 'Arts', 'Technology', 'Other',
];

// Seeded from the client's own example rows, purely as quick-pick
// suggestions — typing anything else is always allowed.
export const LIBRARY_GROUP_SUGGESTIONS = [
  'Biology', 'Physics', 'Chemistry', 'History', 'Museums', 'Geography',
];
export const LIBRARY_SUBJECT_SUGGESTIONS = [
  'Photosynthesis', 'Laws of Motion', 'Gravity', 'Civilisations', 'Europe',
];

export default function LibraryCategoryPicker({
  category,
  onCategoryChange,
  group,
  onGroupChange,
  topic,
  onTopicChange,
  t = (s) => s,
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-base font-bold text-black mb-1.5" htmlFor="library-category-select">
          {t('Category')}
        </label>
        <select
          id="library-category-select"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-base font-bold text-black focus:outline-none focus:border-emerald-400 bg-white"
        >
          {LIBRARY_CATEGORIES.map((c) => (
            <option key={c} value={c}>{t(c)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-base font-bold text-black mb-1.5" htmlFor="library-group-input">
          {t('Group')}
        </label>
        <input
          id="library-group-input"
          type="text"
          list="library-group-suggestions"
          value={group}
          onChange={(e) => onGroupChange(e.target.value)}
          placeholder={t('e.g. Biology')}
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-base font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 bg-white"
        />
        <datalist id="library-group-suggestions">
          {LIBRARY_GROUP_SUGGESTIONS.map((g) => <option key={g} value={g} />)}
        </datalist>
      </div>

      <div>
        <label className="block text-base font-bold text-black mb-1.5" htmlFor="library-subject-input">
          {t('Subject')}
        </label>
        <input
          id="library-subject-input"
          type="text"
          list="library-subject-suggestions"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          placeholder={t('e.g. Photosynthesis')}
          className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 text-base font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 bg-white"
        />
        <datalist id="library-subject-suggestions">
          {LIBRARY_SUBJECT_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
        </datalist>
      </div>
    </div>
  );
}
