import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { getLibrary, getLibraryProject, deleteLibraryProject, mediaUrl } from '../services/api';

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

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

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
      {/* Header */}
      <div
        className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-8"
        style={{
          background:
            'linear-gradient(120deg, #4338ca 0%, #7c3aed 45%, #db2777 100%)',
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-1.5">
              📚 My Library
            </h1>
            <p className="text-white/90 font-medium">
              Everything you've created with AMIVI, AMICO and Quiz, all in one place.
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
                  : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
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
            className="w-full appearance-none pl-4 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm focus:outline-none focus:border-indigo-300 transition-all cursor-pointer"
          >
            {SORTS.map(({ key, label }) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Content */}
      {status === 'loading' && <LibrarySkeleton />}

      {status === 'error' && (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-slate-700 font-bold text-lg mb-1">
            Unable to load your Library.
          </p>
          <p className="text-slate-400 font-medium text-sm mb-5">
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
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-bold text-lg mb-1">No matches found</p>
          <p className="text-slate-400 font-medium text-sm">
            Try a different search term or filter.
          </p>
        </div>
      )}

      {status === 'ready' && visibleItems.length > 0 && (
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
            <h3 className="text-lg font-extrabold text-slate-900 mb-1.5">
              Delete this project?
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-6 leading-relaxed">
              All generated content related to this project will be removed.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
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

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border font-semibold text-sm ${
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

        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/25 flex items-center justify-center transition-colors">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 bg-white/95 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full">
            <Eye className="w-3.5 h-3.5" /> Preview
          </span>
        </div>
      </button>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="font-bold text-slate-800 mb-1 truncate cursor-pointer hover:text-indigo-700 transition-colors"
          onClick={onPreview}
        >
          {item.title || `${meta.label} project`}
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-4">
          <span className="uppercase">{item.language || 'en'}</span>
          <span>•</span>
          <span>{date}</span>
        </div>

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
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
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

function PreviewModal({ item, data, loading, error, onRetry, onClose, onOpenFull, onDelete }) {
  const meta = TYPE_META[item.type] || TYPE_META.amivi;
  const Icon = meta.icon;

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
              <h3 className="font-extrabold text-slate-900 truncate">
                {data?.title || item.title || `${meta.label} project`}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin mb-3" />
              <p className="font-semibold text-sm">Loading preview…</p>
            </div>
          )}

          {!loading && error && (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <AlertTriangle className="w-7 h-7 text-red-400 mb-3" />
              <p className="text-slate-700 font-bold mb-1">Couldn't load this preview.</p>
              <p className="text-slate-400 text-sm font-medium mb-4">{error}</p>
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 bg-slate-900 text-white font-bold py-2 px-4 rounded-xl hover:bg-slate-800 transition-colors text-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Try Again
              </button>
            </div>
          )}

          {!loading && !error && data && item.type === 'amivi' && <AmiviPreview data={data} />}
          {!loading && !error && data && item.type === 'amico' && <AmicoPreview data={data} />}
          {!loading && !error && data && item.type === 'quiz' && <QuizPreview data={data} />}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-sm text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <div className="flex-1" />
          <button
            onClick={onOpenFull}
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            {item.type === 'quiz' ? 'Open & Retake' : 'Open Full'} <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AmiviPreview({ data }) {
  const project = data.data || {};
  const chunks = project.chunks || [];

  return (
    <div className="space-y-5">
      {project.video_url && (
        <video
          controls
          className="w-full rounded-2xl border border-slate-200 bg-black aspect-video"
          src={mediaUrl(project.video_url)}
        >
          Your browser does not support the video element.
        </video>
      )}

      {chunks.length === 0 ? (
        <EmptyPreviewNote text="No visual micro-bits were saved for this project." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {chunks.map((chunk, i) => (
            <div key={chunk.chunk_id || i} className="rounded-xl overflow-hidden border border-slate-200">
              <div className="aspect-square bg-slate-50 flex items-center justify-center overflow-hidden">
                {chunk.image_url ? (
                  <img
                    src={mediaUrl(chunk.image_url)}
                    alt={chunk.text || `Chunk ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageOff className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <div className="p-2.5">
                <p className="text-xs font-bold text-slate-700 truncate">
                  {chunk.text || chunk.key_point || `Chunk ${i + 1}`}
                </p>
                {chunk.slogan && (
                  <p className="text-[11px] text-orange-600 font-semibold truncate mt-0.5">
                    ✨ {chunk.slogan}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AmicoPreview({ data }) {
  const project = data.data || {};
  const pages = project.pages || [];
  const [pageIndex, setPageIndex] = useState(0);
  const currentPage = pages[pageIndex];

  if (pages.length === 0) {
    return <EmptyPreviewNote text="No composed comic pages were saved for this project." />;
  }

  return (
    <div className="space-y-4">
      {project.learning_objective && (
        <p className="text-sm text-slate-500 font-medium">{project.learning_objective}</p>
      )}

      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
        {currentPage?.comic_image_url ? (
          <img
            src={mediaUrl(currentPage.comic_image_url)}
            alt={`Page ${pageIndex + 1}`}
            className="w-full max-h-[46vh] object-contain bg-white"
          />
        ) : (
          <div className="h-64 flex items-center justify-center">
            <ImageOff className="w-8 h-8 text-slate-300" />
          </div>
        )}

        {pages.length > 1 && (
          <>
            <button
              onClick={() => setPageIndex((i) => Math.max(0, i - 1))}
              disabled={pageIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-slate-600 disabled:opacity-30"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setPageIndex((i) => Math.min(pages.length - 1, i + 1))}
              disabled={pageIndex === pages.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-slate-600 disabled:opacity-30"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </>
        )}
      </div>

      {pages.length > 1 && (
        <p className="text-center text-xs font-bold text-slate-400">
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
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
        {questions.length} question{questions.length === 1 ? '' : 's'} · saved answers below
      </p>

      {questions.map((q, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 p-4">
          <p className="font-bold text-slate-800 mb-3">
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
                    : 'bg-slate-50 text-slate-500'
                }`}
              >
                {idx === q.correct ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                {opt}
              </div>
            ))}
          </div>

          {q.explanation && (
            <p className="text-xs text-slate-400 font-medium mt-3 leading-relaxed">
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
    <div className="py-10 text-center text-slate-400 font-semibold text-sm">{text}</div>
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
      <p className="text-slate-800 font-extrabold text-xl mb-1.5">
        📚 Your Library is empty
      </p>
      <p className="text-slate-400 font-medium text-sm mb-6 max-w-sm mx-auto">
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
