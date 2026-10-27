import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Palette,
  BookOpen,
  Puzzle,
  Trash2,
  Eye,
  ArrowUpRight,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ImageOff,
  Library as LibraryIcon,
  Sparkles,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { getLibrary, getLibraryProject, deleteLibraryProject, generateQuiz, recomposeAmico, mediaUrl } from '../services/api';

const TYPE_META = {
  amivi: {
    label: 'AMIVI',
    icon: Palette,
    tint: 'bg-orange-50',
    iconColor: 'text-orange-500',
    badge: 'bg-orange-50 text-orange-700',
  },
  amico: {
    label: 'AMICO',
    icon: BookOpen,
    tint: 'bg-pink-50',
    iconColor: 'text-pink-500',
    badge: 'bg-pink-50 text-pink-700',
  },
  quiz: {
    label: 'Quiz',
    icon: Puzzle,
    tint: 'bg-purple-50',
    iconColor: 'text-purple-500',
    badge: 'bg-purple-50 text-purple-700',
  },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'amivi', label: 'AMIVI' },
  { key: 'amico', label: 'AMICO' },
  { key: 'quiz', label: 'Quiz' },
];

const SORTS = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
  { key: 'az', label: 'A – Z' },
];

export default function Library() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [search, setSearch] = useState('');
  // Lets a link land here pre-filtered, e.g. /library?type=quiz from
  // the Explore page's VIEW dropdown — falls back to "all" otherwise.
  const [filter, setFilter] = useState(() => {
    const requested = searchParams.get('type');
    return FILTERS.some((f) => f.key === requested) ? requested : 'all';
  });
  const [sort, setSort] = useState('newest');
  const [librarySpace, setLibrarySpace] = useState('personal'); // personal | group | class
  const [activeSubject, setActiveSubject] = useState(null); // for folder navigation demo
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareSpace, setShareSpace] = useState('group');

  // Preview modal — shown before navigating into the full
  // AMIVI / AMICO / Quiz page.
  const [previewItem, setPreviewItem] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  const toastTimer = useRef(null);

  const showToast = useCallback((message, tone = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, tone });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const load = useCallback(() => {
    let cancelled = false;

    setStatus('loading');

    getLibrary()
      .then((res) => {
        if (cancelled) return;
        setItems(res.projects || []);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cancel = load();
    return cancel;
  }, [load]);

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = items.filter((item) => {
      // The Personal/Group/Class space tabs above are not backed by
      // any real grouping yet — there's no group_id/classroom_id on
      // a saved project to filter by. This used to assign each item
      // to a space with a fake hash of its own id (last character's
      // char code mod 3), purely so the three tabs had *something*
      // to show for an early demo. The real bug: that hash silently
      // hid 2 out of every 3 real saved items from "Personal
      // Library" (the default tab) depending only on their id — a
      // saved project like "Bridge Types" could vanish from the
      // library entirely with no error, no warning, nothing wrong
      // with the data itself. Until spaces are real, every tab shows
      // the full library rather than hiding real saved work behind
      // a coin flip.

      if (filter !== 'all' && item.type !== filter) return false;

      if (!query) return true;

      const haystack = [item.title, item.type, item.language, item.input_text]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });

    result = [...result].sort((a, b) => {
      if (sort === 'az') {
        return (a.title || '').localeCompare(b.title || '');
      }
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sort === 'oldest' ? aTime - bTime : bTime - aTime;
    });

    return result;
  }, [items, filter, search, sort]);

  // --------------------------------------------------------
  // PREVIEW (opens before navigating into the full page)
  // --------------------------------------------------------

  const openPreview = useCallback((item) => {
    setPreviewItem(item);
    setPreviewData(null);
    setPreviewError(null);
    setPreviewLoading(true);

    getLibraryProject(item.id)
      .then((project) => setPreviewData(project))
      .catch((err) => setPreviewError(err?.message || 'Unable to load this project.'))
      .finally(() => setPreviewLoading(false));
  }, []);

  // Lets AmicoPreview push freshly-recomposed pages/panels back
  // into the open preview once a stale-pages repair succeeds, so
  // the modal reflects the fix immediately without a full reload.
  const handleAmicoRepaired = useCallback((newPages, newPanels) => {
    setPreviewData((prev) =>
      prev
        ? { ...prev, data: { ...prev.data, pages: newPages, panels: newPanels } }
        : prev
    );
  }, []);

  const closePreview = useCallback(() => {
    setPreviewItem(null);
    setPreviewData(null);
    setPreviewError(null);
    setPreviewLoading(false);
  }, []);

  // Escape key closes the preview modal.
  useEffect(() => {
    if (!previewItem) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closePreview();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewItem, closePreview]);

  const handleOpenFull = (item) => {
    closePreview();
    navigate(`/${item.type}/${item.id}`);
  };

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await deleteLibraryProject(deleteTarget.id);
      setItems((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast('Project deleted.', 'success');
    } catch (err) {
      showToast(err?.message || 'Failed to delete project.', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        type="button"
        onClick={() => navigate('/explore')}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-black hover:text-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div
        className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-5 sm:p-8"
        style={{
          background:
            'linear-gradient(120deg, #4338ca 0%, #7c3aed 45%, #db2777 100%)',
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1.5">
              <img src="/vlq-badge-digital-library-icon.png" alt="" className="w-9 h-9 rounded-full object-cover shadow-md" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              Digital Library
            </h1>
            <p className="text-white/90 font-medium">
              A personal home for visual learning materials. Learners can save, revisit and reinforce important knowledge. Learning remains available whenever it is needed.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your library..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/15 border border-white/25 rounded-xl text-white placeholder-white/60 font-medium text-sm focus:outline-none focus:bg-white/25 focus:border-white/40 transition-all"
            />
          </div>
        </div>

        {/* Spaces Tabs */}
        <div className="flex gap-6 mt-8 border-b border-white/20">
          {[
            { id: 'personal', label: 'Personal Library' },
            { id: 'group', label: 'Group Library' },
            { id: 'class', label: 'Class Library' },
          ].map(space => (
            <button
              key={space.id}
              onClick={() => { setLibrarySpace(space.id); setActiveSubject(null); }}
              className={`pb-3 font-bold text-sm transition-colors relative ${
                librarySpace === space.id ? 'text-white' : 'text-white/60 hover:text-white/80'
              }`}
            >
              {space.label}
              {librarySpace === space.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Path / Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm font-bold text-black">
        <button onClick={() => setActiveSubject(null)} className={`${!activeSubject ? 'text-black' : 'hover:text-indigo-600'}`}>
          {librarySpace === 'personal' ? 'My Library' : librarySpace === 'group' ? 'Group Space' : 'Classroom'}
        </button>
        {activeSubject && (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-black">{activeSubject}</span>
          </>
        )}
      </div>

      {/* Filters + sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                filter === key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white border border-slate-200 text-black hover:border-indigo-300 hover:text-indigo-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-52">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full appearance-none pl-4 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-black font-semibold text-sm focus:outline-none focus:border-indigo-300 transition-all cursor-pointer"
          >
            {SORTS.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none" />
        </div>
      </div>

      {/* Content */}
      {status === 'loading' && <LibrarySkeleton />}

      {status === 'error' && (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-black font-bold text-lg mb-1">
            Unable to load your Library.
          </p>
          <p className="text-black font-medium text-sm mb-5">
            Something went wrong while fetching your projects.
          </p>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-indigo-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      )}

      {status === 'ready' && items.length === 0 && <EmptyLibrary navigate={navigate} />}

      {status === 'ready' && items.length > 0 && visibleItems.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <Search className="w-8 h-8 text-black mx-auto mb-3" />
          <p className="text-black font-bold text-lg mb-1">No matches found</p>
          <p className="text-black font-medium text-sm">
            Try a different search term or filter.
          </p>
        </div>
      )}

      {/* Mock Folders View for Library Demo */}
      {status === 'ready' && !activeSubject && visibleItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {['Science', 'History', 'Geography', 'Uncategorized'].map(subject => (
            <button
              key={subject}
              onClick={() => setActiveSubject(subject)}
              className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 hover:border-indigo-300 hover:shadow-sm transition-all text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                <LibraryIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-black">{subject}</h4>
                <p className="text-xs text-black font-medium">{subject === 'Uncategorized' ? visibleItems.length : Math.floor(Math.random() * 5) + 1} items</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {status === 'ready' && visibleItems.length > 0 && (
        <>
          {activeSubject && <h3 className="font-bold text-black text-lg mb-4">Saved Visual Learning Content</h3>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {visibleItems.map((item) => (
            <LibraryCard
              key={item.id}
              item={item}
              onPreview={() => openPreview(item)}
              onDelete={() => setDeleteTarget(item)}
            />
          ))}
        </div>
        </>
      )}

      {/* Preview modal — shown before opening the full page */}
      {previewItem && (
        <PreviewModal
          item={previewItem}
          data={previewData}
          loading={previewLoading}
          error={previewError}
          onRetry={() => openPreview(previewItem)}
          onClose={closePreview}
          onOpenFull={() => handleOpenFull(previewItem)}
          onDelete={() => {
            const target = previewItem;
            closePreview();
            setDeleteTarget(target);
          }}
          onShare={handleShareClick}
          onToast={showToast}
          onAmicoRepaired={handleAmicoRepaired}
        />
      )}

      {/* Delete confirmation dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => (!deleting ? setDeleteTarget(null) : null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-6">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-extrabold text-black mb-1.5">
              Delete this project?
            </h3>
            <p className="text-sm text-black font-medium mb-6 leading-relaxed">
              All generated content related to this project will be removed.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-black bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-black">Share Material</h3>
              <button onClick={() => setShowShareModal(false)} className="text-black hover:text-black">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-black mb-2">Choose Destination</label>
                <div className="grid grid-cols-1 gap-2">
                  <button onClick={() => setShareSpace('individual')} className={`py-3 rounded-xl text-sm font-bold border-2 transition-colors ${shareSpace === 'individual' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-black hover:border-indigo-300'}`}>Individual Space</button>
                  <button onClick={() => setShareSpace('group')} className={`py-3 rounded-xl text-sm font-bold border-2 transition-colors ${shareSpace === 'group' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-black hover:border-indigo-300'}`}>Learning Group (Collab Room)</button>
                  <button onClick={() => setShareSpace('class')} className={`py-3 rounded-xl text-sm font-bold border-2 transition-colors ${shareSpace === 'class' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-black hover:border-indigo-300'}`}>Class Library</button>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowShareModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-black hover:bg-slate-200 transition-colors">Cancel</button>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  if (shareSpace === 'group') {
                    navigate('/collaborate');
                  } else {
                    showToast(`Material shared to ${shareSpace} destination!`);
                  }
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 transition-colors"
              >
                Continue <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border font-semibold text-sm sm:max-w-sm ${
              toast.tone === 'error'
                ? 'bg-red-600 border-red-700 text-white'
                : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            {toast.tone === 'error' ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            )}
            {toast.message}
            <button
              onClick={() => setToast(null)}
              className="ml-1 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 4-Step Flowchart */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-12 mb-8 bg-slate-50 py-6 rounded-2xl border border-slate-200">
        <div className="px-4 py-2 bg-indigo-100 rounded-xl shadow-sm border border-indigo-200 font-bold text-indigo-700">Learn</div>
        <ArrowRight className="w-5 h-5 text-black rotate-90 sm:rotate-0" />
        <div className="px-4 py-2 bg-emerald-100 rounded-xl shadow-sm border border-emerald-200 font-bold text-emerald-700">Save</div>
        <ArrowRight className="w-5 h-5 text-black rotate-90 sm:rotate-0" />
        <div className="px-4 py-2 bg-amber-100 rounded-xl shadow-sm border border-amber-200 font-bold text-amber-700">Revisit</div>
        <ArrowRight className="w-5 h-5 text-black rotate-90 sm:rotate-0" />
        <div className="px-4 py-2 bg-pink-600 rounded-xl shadow-sm border border-pink-600 font-bold text-white">Remember</div>
      </div>

    </div>
  );
}

function LibraryCard({ item, onPreview, onDelete }) {
  const meta = TYPE_META[item.type] || TYPE_META.amivi;
  const Icon = meta.icon;
  const [imgFailed, setImgFailed] = useState(false);
  const hasThumbnail = item.type !== 'quiz' && item.thumbnail_url && !imgFailed;

  const date = item.created_at
    ? new Date(item.created_at).toLocaleDateString()
    : '';

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
      {/* Thumbnail */}
      <button
        onClick={onPreview}
        className={`h-40 w-full ${meta.tint} flex items-center justify-center relative overflow-hidden text-left`}
      >
        {hasThumbnail ? (
          <img
            src={mediaUrl(item.thumbnail_url)}
            alt={item.title}
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : item.type === 'quiz' ? (
          <span className="text-5xl">🧠</span>
        ) : (
          <Icon className={`w-12 h-12 ${meta.iconColor}`} />
        )}

        <div
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${meta.badge}`}
        >
          <Icon className="w-3.5 h-3.5" /> {meta.label}
        </div>

        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/25 transition-colors" />
      </button>

      <h3
        className="bg-[#111] text-white text-center font-bold uppercase text-sm py-3 px-4 w-full cursor-pointer hover:bg-black transition-colors"
        onClick={onPreview}
      >
        <span className="line-clamp-2">{item.title || `${meta.label} project`}</span>
      </h3>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mt-auto flex items-center gap-2">
          <button
            onClick={onPreview}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Preview
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-black hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PREVIEW MODAL
// Shown before navigating into the full AMIVI / AMICO / Quiz
// page — lets someone glance at what they saved (including the
// full saved quiz, questions and correct answers) without
// having to replay or regenerate anything.
// ============================================================

function PreviewModal({ item, data, loading, error, onRetry, onClose, onOpenFull, onDelete, onShare, onToast, onAmicoRepaired }) {
  const meta = TYPE_META[item.type] || TYPE_META.amivi;
  const Icon = meta.icon;
  const navigate = useNavigate();
  const [creatingQuiz, setCreatingQuiz] = useState(false);

  // Builds a real quiz straight from this saved AMIVI/AMICO project's
  // own material (backend already supports this via source_project_id
  // — see Courses.jsx's "Generate Quiz" for the same pattern) rather
  // than just linking out to a blank quiz generator.
  const handleCreateQuiz = async () => {
    setCreatingQuiz(true);
    try {
      const result = await generateQuiz({ sourceProjectId: item.id });
      if (result?.project_id) {
        navigate(`/quiz/${result.project_id}`);
      } else {
        throw new Error('No quiz was returned.');
      }
    } catch (err) {
      onToast?.(err?.message || 'Failed to create a quiz from this project.', 'error');
    } finally {
      setCreatingQuiz(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl ${meta.tint} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4.5 h-4.5 ${meta.iconColor}`} />
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-bold uppercase tracking-wide ${meta.iconColor}`}>
                {meta.label}
              </p>
              <h3 className="font-extrabold text-black truncate">
                {data?.title || item.title || `${meta.label} project`}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 text-black hover:bg-slate-100 hover:text-black transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center text-black">
              <Loader2 className="w-7 h-7 animate-spin mb-3" />
              <p className="font-semibold text-sm">Loading preview…</p>
            </div>
          )}

          {!loading && error && (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <AlertTriangle className="w-7 h-7 text-red-400 mb-3" />
              <p className="text-black font-bold mb-1">Couldn't load this preview.</p>
              <p className="text-black text-sm font-medium mb-4">{error}</p>
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold py-2 px-4 rounded-xl hover:bg-slate-800 transition-colors text-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Try Again
              </button>
            </div>
          )}

          {!loading && !error && data && item.type === 'amivi' && <AmiviPreview item={item} data={data} />}
          {!loading && !error && data && item.type === 'amico' && (
            <AmicoPreview item={item} data={data} onRepaired={onAmicoRepaired} onToast={onToast} />
          )}
          {!loading && !error && data && item.type === 'quiz' && <QuizPreview data={data} />}
        </div>

        {/* Footer Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <button
            onClick={onShare}
            className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg font-bold text-sm text-black bg-white border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" /> Share
          </button>
          
          {item.type !== 'quiz' && (
            <button
              onClick={handleCreateQuiz}
              disabled={creatingQuiz}
              className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg font-bold text-sm text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-60"
            >
              {creatingQuiz ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating…
                </>
              ) : (
                <>
                  <Puzzle className="w-4 h-4" /> Create Quiz
                </>
              )}
            </button>
          )}

          {item.type === 'amivi' && (
            <button
              onClick={() =>
                navigate('/amico', { state: { sourceProjectId: item.id } })
              }
              title="Sends this AMIVI package (Key Points, slogans, visuals and explanations) straight to AMICO — nothing needs retyping, and the original AMIVI stays exactly as it is."
              className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg font-bold text-sm text-pink-700 bg-pink-50 border border-pink-200 hover:bg-pink-100 transition-colors"
            >
              <BookOpen className="w-4 h-4" /> Send to AMICO
            </button>
          )}

          <div className="flex-1" />

          <button
            onClick={onOpenFull}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-lg font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            {item.type === 'quiz' ? 'Retake Quiz' : 'Click Here to See It Again'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

const AMIVI_CHUNKS_PER_PAGE = 6;

function AmiviPreview({ item, data }) {
  const project = data.data || {};
  const chunks = project.chunks || [];
  const [imgFailed, setImgFailed] = useState(false);
  const hasThumbnail = item?.thumbnail_url && !imgFailed;
  const [chunkPage, setChunkPage] = useState(0);

  // "Image + Slogan" vs "Image + Description" are the same saved
  // AMIVI chunks (every chunk already carries both, once a learner
  // has opened EXPLAIN for it) — just a different field shown
  // under each image. No separate view/page needed, just a toggle
  // over the one preview that's already here.
  const [viewMode, setViewMode] = useState('slogan');
  const captionFor = (chunk) =>
    viewMode === 'description'
      ? chunk.description || ''
      : chunk.slogan || '';
  const totalChunkPages = Math.max(1, Math.ceil(chunks.length / AMIVI_CHUNKS_PER_PAGE));
  const visibleChunks = chunks.slice(
    chunkPage * AMIVI_CHUNKS_PER_PAGE,
    chunkPage * AMIVI_CHUNKS_PER_PAGE + AMIVI_CHUNKS_PER_PAGE
  );

  const [lightboxIndex, setLightboxIndex] = useState(null);
  const openLightbox = (globalIndex) => setLightboxIndex(globalIndex);
  const closeLightbox = () => setLightboxIndex(null);
  const showPrevChunk = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : Math.max(0, i - 1))),
    []
  );
  const showNextChunk = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : Math.min(chunks.length - 1, i + 1))),
    [chunks.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrevChunk();
      if (e.key === 'ArrowRight') showNextChunk();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, showPrevChunk, showNextChunk]);

  const lightboxChunk = lightboxIndex !== null ? chunks[lightboxIndex] : null;

  return (
    <div className="space-y-5">
      {hasThumbnail && (
        <img
          src={mediaUrl(item.thumbnail_url)}
          alt={item.title || 'AMIVI Preview'}
          onError={() => setImgFailed(true)}
          className="w-full rounded-2xl border border-slate-200 object-cover aspect-video bg-slate-50"
        />
      )}
      
      {project.video_url && (
        <video
          controls
          className="w-full rounded-2xl border border-slate-200 bg-black aspect-video"
          src={mediaUrl(project.video_url)}
        >
          Your browser does not support the video element.
        </video>
      )}

      {chunks.length > 0 && (
        <div className="flex items-center justify-center gap-1 bg-slate-100 rounded-full p-1 w-fit mx-auto">
          <button
            type="button"
            onClick={() => setViewMode('slogan')}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
              viewMode === 'slogan' ? 'bg-white text-black shadow' : 'text-black'
            }`}
          >
            Image + Slogan
          </button>
          <button
            type="button"
            onClick={() => setViewMode('description')}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${
              viewMode === 'description' ? 'bg-white text-black shadow' : 'text-black'
            }`}
          >
            Image + Description
          </button>
        </div>
      )}

      {chunks.length === 0 ? (
        <EmptyPreviewNote text="No visual micro-bits were saved for this project." />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            {visibleChunks.map((chunk, i) => {
              const globalIndex = chunkPage * AMIVI_CHUNKS_PER_PAGE + i;
              return (
                <button
                  key={chunk.chunk_id || globalIndex}
                  type="button"
                  onClick={() => openLightbox(globalIndex)}
                  className="rounded-xl overflow-hidden border border-slate-200 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                    {chunk.image_url ? (
                      <img
                        src={mediaUrl(chunk.image_url)}
                        alt={chunk.text || `Chunk ${globalIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageOff className="w-6 h-6 text-black" />
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-bold text-black truncate">
                      {chunk.text || chunk.key_point || `Chunk ${globalIndex + 1}`}
                    </p>
                    {captionFor(chunk) ? (
                      <p
                        className={`text-[11px] font-semibold mt-0.5 ${
                          viewMode === 'description'
                            ? 'text-black line-clamp-2'
                            : 'text-orange-600 truncate'
                        }`}
                      >
                        {viewMode === 'description' ? captionFor(chunk) : `✨ ${captionFor(chunk)}`}
                      </p>
                    ) : (
                      viewMode === 'description' && (
                        <p className="text-[11px] text-black italic mt-0.5">No explanation yet</p>
                      )
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {totalChunkPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setChunkPage((p) => Math.max(0, p - 1))}
                disabled={chunkPage === 0}
                className="w-9 h-9 rounded-full bg-slate-100 shadow flex items-center justify-center text-black disabled:opacity-30"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              <p className="text-xs font-bold text-black">
                Page {chunkPage + 1} of {totalChunkPages}
              </p>
              <button
                onClick={() => setChunkPage((p) => Math.min(totalChunkPages - 1, p + 1))}
                disabled={chunkPage === totalChunkPages - 1}
                className="w-9 h-9 rounded-full bg-slate-100 shadow flex items-center justify-center text-black disabled:opacity-30"
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </>
      )}

      {lightboxChunk && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/85" onClick={closeLightbox} />

          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center text-black hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {lightboxIndex > 0 && (
            <button
              onClick={showPrevChunk}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 shadow flex items-center justify-center text-black hover:bg-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {lightboxIndex < chunks.length - 1 && (
            <button
              onClick={showNextChunk}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 shadow flex items-center justify-center text-black hover:bg-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl max-w-6xl w-full max-h-[92vh] flex flex-col">
            <div className="bg-slate-50 flex items-center justify-center overflow-hidden flex-1">
              {lightboxChunk.image_url ? (
                <img
                  src={mediaUrl(lightboxChunk.image_url)}
                  alt={lightboxChunk.text || `Chunk ${lightboxIndex + 1}`}
                  className="w-full max-h-[78vh] object-contain"
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center">
                  <ImageOff className="w-12 h-12 text-black" />
                </div>
              )}
            </div>
            <div className="p-6 text-center">
              <p className="text-4xl sm:text-5xl font-extrabold text-black">
                {lightboxChunk.text || lightboxChunk.key_point || `Chunk ${lightboxIndex + 1}`}
              </p>
              {captionFor(lightboxChunk) ? (
                viewMode === 'description' ? (
                  <p className="text-lg sm:text-xl text-black font-medium mt-3 max-w-2xl mx-auto">
                    {captionFor(lightboxChunk)}
                  </p>
                ) : (
                  <p className="text-2xl sm:text-3xl text-orange-600 font-bold mt-3">
                    ✨ {captionFor(lightboxChunk)}
                  </p>
                )
              ) : (
                viewMode === 'description' && (
                  <p className="text-base text-black italic mt-3">
                    No explanation saved yet for this Key Point — open it in AMIVI's Explain step to add one.
                  </p>
                )
              )}
              <p className="text-sm font-bold text-black mt-4">
                {lightboxIndex + 1} of {chunks.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AmicoPreview({ item, data, onRepaired, onToast }) {
  const project = data.data || {};
  const pages = project.pages || [];
  const [pageIndex, setPageIndex] = useState(0);
  const [repairing, setRepairing] = useState(false);
  const currentPage = pages[pageIndex];

  // A saved comic can end up with a "pages" array that's stale
  // relative to its panels (e.g. it was composed by an older
  // version of this app before being saved, or an edit saved the
  // panel change but a recompose never ran for it). The symptom
  // is exactly what shows up here: the Prev/Next counter moves,
  // but two different page slots end up pointing at the same
  // composed sheet. Detect that and offer a one-click repair that
  // rebuilds the page images straight from the already-saved
  // panels/images — no AI image/text generation involved, so no
  // new artwork, just a correct re-composition.
  const hasDuplicatePages =
    pages.length > 1 &&
    new Set(pages.map((p) => p.comic_image_url)).size < pages.length;

  // Page index can go stale if we just repaired down to fewer/
  // more pages than before.
  useEffect(() => {
    if (pageIndex > pages.length - 1) setPageIndex(0);
  }, [pages.length, pageIndex]);

  const handleRepair = async () => {
    if (!item?.id || !project.panels?.length) return;
    setRepairing(true);
    try {
      const res = await recomposeAmico(
        item.id,
        project.panels,
        project.panels_per_page || 4,
        project.layout || 'horizontal'
      );
      onRepaired?.(res.pages, res.panels);
      setPageIndex(0);
      onToast?.('Page display fixed — pages rebuilt from your saved artwork.', 'success');
    } catch (err) {
      onToast?.(err?.message || 'Could not fix the page display.', 'error');
    } finally {
      setRepairing(false);
    }
  };

  if (pages.length === 0) {
    return <EmptyPreviewNote text="No composed comic pages were saved for this project." />;
  }

  return (
    <div className="space-y-4">
      {project.learning_objective && (
        <p className="text-sm text-black font-medium">{project.learning_objective}</p>
      )}

      {hasDuplicatePages && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-bold text-amber-700">
            Two or more pages are showing the same image. This can happen on
            comics saved before a fix — rebuild them from the saved artwork.
          </p>
          <button
            onClick={handleRepair}
            disabled={repairing}
            className="shrink-0 inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-60 transition-colors"
          >
            {repairing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {repairing ? 'Fixing…' : 'Fix page display'}
          </button>
        </div>
      )}

      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
        {currentPage?.comic_image_url ? (
          <img
            key={currentPage.comic_image_url}
            src={mediaUrl(currentPage.comic_image_url)}
            alt={`Page ${pageIndex + 1}`}
            className="w-full max-h-[46vh] object-contain bg-white"
          />
        ) : (
          <div className="h-64 flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-black" />
          </div>
        )}

        {pages.length > 1 && (
          <>
            <button
              onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
              disabled={pageIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-black disabled:opacity-30"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setPageIndex((i) => Math.min(pages.length - 1, i + 1))}
              disabled={pageIndex === pages.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-black disabled:opacity-30"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </>
        )}
      </div>

      {pages.length > 1 && (
        <p className="text-center text-xs font-bold text-black">
          Page {pageIndex + 1} of {pages.length}
        </p>
      )}
    </div>
  );
}

function QuizPreview({ data }) {
  const project = data.data || {};
  const questions = project.questions || [];

  if (questions.length === 0) {
    return <EmptyPreviewNote text="No questions were saved for this quiz." />;
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-black uppercase tracking-wide">
        {questions.length} question{questions.length === 1 ? '' : 's'} · saved answers below
      </p>

      {questions.map((q, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 p-4">
          <p className="font-bold text-black mb-3">
            {i + 1}. {q.q}
          </p>

          {q.image_url && (
            <img
              src={mediaUrl(q.image_url)}
              alt={q.q}
              className="w-full max-h-40 object-contain rounded-xl border border-slate-100 mb-3"
            />
          )}

          <div className="space-y-1.5">
            {(q.options || []).map((opt, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg ${
                  idx === q.correct
                    ? 'bg-green-50 text-green-700'
                    : 'bg-slate-50 text-black'
                }`}
              >
                {idx === q.correct ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-black shrink-0" />
                )}
                {opt}
              </div>
            ))}
          </div>

          {q.explanation && (
            <p className="text-xs text-black font-medium mt-3 leading-relaxed">
              💡 {q.explanation}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function EmptyPreviewNote({ text }) {
  return (
    <div className="py-10 text-center text-black font-semibold text-sm">{text}</div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm animate-pulse"
        >
          <div className="h-40 w-full bg-slate-100" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-3/4 bg-slate-100 rounded-md" />
            <div className="h-3 w-1/2 bg-slate-100 rounded-md" />
            <div className="h-9 w-full bg-slate-100 rounded-xl mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyLibrary({ navigate }) {
  return (
    <div className="py-16 px-6 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
        <LibraryIcon className="w-7 h-7 text-indigo-500" />
      </div>
      <p className="text-black font-extrabold text-xl mb-1.5">
        📚 Your Library is empty
      </p>
      <p className="text-black font-medium text-sm mb-6 max-w-sm mx-auto">
        Everything you create with AMIVI, AMICO and Quiz will show up here.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate('/amivi')}
          className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 font-bold py-2.5 px-5 rounded-xl hover:bg-orange-100 transition-colors text-sm"
        >
          <Palette className="w-4 h-4" /> Create AMIVI
        </button>
        <button
          onClick={() => navigate('/amico')}
          className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 font-bold py-2.5 px-5 rounded-xl hover:bg-pink-100 transition-colors text-sm"
        >
          <BookOpen className="w-4 h-4" /> Create AMICO
        </button>
        <button
          onClick={() => navigate('/quiz')}
          className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 font-bold py-2.5 px-5 rounded-xl hover:bg-purple-100 transition-colors text-sm"
        >
          <Sparkles className="w-4 h-4" /> Create Quiz
        </button>
      </div>
    </div>
  );
}
