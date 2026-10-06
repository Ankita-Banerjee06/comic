import FileUpload from '../components/ui/FileUpload';
import ProcessingAnimation from '../components/ui/ProcessingAnimation';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  generateAmico,
  regenerateAmicoPanel,
  editAmicoPanel,
  addAmicoPanel,
  recomposeAmico,
  generateAvatar,
  listAvatars,
  deleteAvatar,
  generateAmicoPhotoStory,
  listProjects,
  getLibraryProject,
  mediaUrl,
  downloadMedia,
} from '../services/api';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  CheckCircle2,
  LayoutGrid,
  Rows,
  Plus,
  Pencil,
  RefreshCw,
  Trash2,
  Maximize2,
  Camera,
  X,
  ArrowLeft,
  ArrowRight,
  Drama,
  ScrollText,
  NotebookText,
  Wand2,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// "What would you like to create?" — the launcher screen's choices.
// AMICO is framed as a visual storytelling engine, not just a comic
// generator, so this list is deliberately wider than what's actually
// buildable today: Comic and Photo Story are real, working content
// types; Biography, Diary and My Own Story are shown so the full
// vision is visible and demonstrable, but are marked "coming soon"
// rather than built out, per "keep the MVP version small — we
// demonstrate the possibility, not every creation tool, right now."
// The emoji below stand in for the "carefully selected images" the
// vision calls for (a small photo for Biography, a diary-style image
// for Diary, etc.) — swap them for real curated thumbnails later
// without touching the structure.
const CREATION_TYPES = [
  {
    key: 'comic',
    icon: Drama,
    label: 'Comic',
    subtitle: 'A character-driven comic strip',
    gradient: 'from-violet-600 to-fuchsia-600',
    iconColor: '#7c3aed',
    available: true,
  },
  {
    key: 'photostory',
    icon: Camera,
    label: 'Photo Story',
    subtitle: 'Turn a photo into a diagram story',
    gradient: 'from-rose-500 to-pink-600',
    iconColor: '#db2777',
    available: true,
  },
  {
    key: 'biography',
    icon: ScrollText,
    label: 'Biography',
    subtitle: 'Tell someone\'s life story',
    gradient: 'from-amber-500 to-orange-600',
    iconColor: '#c2410c',
    available: false,
  },
  {
    key: 'diary',
    icon: NotebookText,
    label: 'Diary',
    subtitle: 'A day, in your own words',
    gradient: 'from-sky-500 to-blue-600',
    iconColor: '#1d4ed8',
    available: false,
  },
  {
    key: 'myownstory',
    icon: Wand2,
    label: 'My Own Story',
    subtitle: 'Start from a blank page',
    gradient: 'from-emerald-500 to-teal-600',
    iconColor: '#0d9488',
    available: false,
  },
];

export default function Amico() {
  // Top-level mode: a character-driven comic, or a photo-based
  // character-free diagram story. Starts unset — null means "show
  // the launcher" ('What would you like to create?'); picking a
  // tile there sets this, which is also what makes the rest of the
  // page (comic flow / photo story flow) start rendering.
  const [mode, setMode] = useState(null); // null | 'comic' | 'photostory'
  const [comingSoonNotice, setComingSoonNotice] = useState(null);

  // Source: free-typed homework topic, or imported AMIVI content
  const [source, setSource] = useState('amivi'); // 'text' | 'amivi'
  const [textInput, setTextInput] = useState('');
  const [extraInstructions, setExtraInstructions] = useState('');
  const [amiviProjects, setAmiviProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Comic layout options
  const [panelsPerPage, setPanelsPerPage] = useState(4);
  const [pagesCount, setPagesCount] = useState(1);
  const [layout, setLayout] = useState('horizontal');

  // Avatars
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState(null);
  const [avatarName, setAvatarName] = useState('');
  const [avatarStyle, setAvatarStyle] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [savedNotice, setSavedNotice] = useState(false);

  // Save Modal State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSpace, setSaveSpace] = useState('personal');
  const [saveFolder, setSaveFolder] = useState('Science');

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [editingPanel, setEditingPanel] = useState(null);
  const [busyPanelNumber, setBusyPanelNumber] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Photo Story mode
  const [psFile, setPsFile] = useState(null);
  const [psPreviewUrl, setPsPreviewUrl] = useState('');
  const [psPanelCount, setPsPanelCount] = useState(6);
  const [psProcessing, setPsProcessing] = useState(false);
  const [psResult, setPsResult] = useState(null);
  const [psError, setPsError] = useState(null);
  const [psCurrentPageIndex, setPsCurrentPageIndex] = useState(0);
  const [psFullscreen, setPsFullscreen] = useState(false);

  const { language, t } = useLanguage();
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // AMIVI's "Send to AMICO" button navigates here with the AMIVI
  // project id in route state, so this page can pre-select it
  // as the source instead of the learner re-picking it manually.
  const incomingSourceProjectId = location.state?.sourceProjectId || null;

  useEffect(() => {
    listAvatars()
      .then((data) => setAvatars(data.avatars || []))
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (incomingSourceProjectId) {
      // Arriving here via AMIVI's "Send to AMICO" — skip the
      // launcher and go straight into the Comic flow with this
      // project pre-selected, same as before the launcher existed.
      setSource('amivi');
      setMode('comic');
    }
  }, [incomingSourceProjectId]);

  useEffect(() => {
    if (source === 'amivi' && amiviProjects.length === 0) {
      listProjects('amivi')
        .then((data) => setAmiviProjects(data.projects || []))
        .catch(() => { });
    }
  }, [source, amiviProjects.length]);

  useEffect(() => {
    if (incomingSourceProjectId && amiviProjects.length > 0) {
      setSelectedProjectId(String(incomingSourceProjectId));
    }
  }, [incomingSourceProjectId, amiviProjects]);

  // Titles in the AMIVI package picker are short, auto-generated
  // 2-word summaries, so two different lessons can easily end up
  // with the exact same title (e.g. two separate "Photosynthesis"
  // projects from different classes or test runs) — a teacher
  // can't tell those apart in the dropdown. When a title repeats,
  // disambiguate it with the project's own id; a project with no
  // title at all still falls back to its id alone, as before.
  const amiviProjectOptions = useMemo(() => {
    const titleCounts = {};
    amiviProjects.forEach((project) => {
      const base = (project.title || '').trim();
      if (base) titleCounts[base] = (titleCounts[base] || 0) + 1;
    });

    return amiviProjects.map((project) => {
      const base = (project.title || '').trim();
      const label = !base
        ? `Learning Package #${project.project_id}`
        : titleCounts[base] > 1
          ? `${base} (#${project.project_id})`
          : base;
      return { ...project, label };
    });
  }, [amiviProjects]);

  // ============================================================
  // OPEN FROM LIBRARY (load a previously saved AMICO comic
  // instead of running the generator again)
  // ============================================================

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;

    setMode('comic');
    setIsProcessing(true);
    setError(null);
    setResult(null);

    getLibraryProject(projectId)
      .then((project) => {
        if (cancelled) return;
        setResult({ ...project.data, project_id: project.id });
        setCurrentPageIndex(0);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Unable to load this AMICO comic.');
      })
      .finally(() => {
        if (!cancelled) setIsProcessing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // ============================================================
  // GENERATE
  // ============================================================

  const canGenerate =
    source === 'text' ? !!textInput.trim() : !!selectedProjectId;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsProcessing(true);
    setError(null);
    setSavedNotice(false);

    try {
      const data = await generateAmico({
        homeworkPrompt:
          source === 'amivi' ? extraInstructions.trim() : textInput.trim(),
        language,
        sourceProjectId:
          source === 'amivi' ? Number(selectedProjectId) : null,
        panelsPerPage,
        pages: pagesCount,
        layout,
        avatarId: selectedAvatarId,
      });

      setResult(data);
      setCurrentPageIndex(0);
      setSavedNotice(false); // Wait for explicit save
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAmico = () => {
    setResult(null);
    setTextInput('');
    setExtraInstructions('');
    setSelectedProjectId('');
    setError(null);
    setSavedNotice(false);
  };

  // ============================================================
  // PHOTO STORY (upload one photo -> character-free diagram story)
  // ============================================================

  const handlePhotoStoryUpload = (file) => {
    setPsFile(file);
    setPsPreviewUrl(URL.createObjectURL(file));
  };

  const handleGeneratePhotoStory = async () => {
    if (!psFile) return;

    setPsProcessing(true);
    setPsError(null);

    try {
      const data = await generateAmicoPhotoStory(
        psFile,
        language,
        psPanelCount
      );

      setPsResult(data);
      setPsCurrentPageIndex(0);
    } catch (err) {
      setPsError(err.message);
    } finally {
      setPsProcessing(false);
    }
  };

  const resetPhotoStory = () => {
    setPsResult(null);
    setPsFile(null);
    setPsPreviewUrl('');
    setPsError(null);
  };

  const psPages = psResult?.pages || [];
  const psCurrentPage = psPages[psCurrentPageIndex];

  const handleDownloadPhotoStoryPage = () => {
    if (!psCurrentPage) return;

    const safeTitle = (psResult.title || 'amico-photo-story')
      .replace(/\s+/g, '-')
      .toLowerCase();

    downloadMedia(
      psCurrentPage.comic_image_url,
      `${safeTitle}-page-${psCurrentPage.page_number}.png`
    );
  };

  const handleSharePhotoStoryPage = async () => {
    if (!psCurrentPage) return;

    const url = mediaUrl(psCurrentPage.comic_image_url);

    if (navigator.share) {
      try {
        await navigator.share({ title: psResult.title || 'My AMICO Photo Story', url });
        return;
      } catch {
        // user cancelled the native share sheet — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch {
      window.prompt('Copy this link to share your photo story:', url);
    }
  };

  // ============================================================
  // AVATARS
  // ============================================================

  const handleAvatarUpload = async (file) => {
    setAvatarUploading(true);
    try {
      const data = await generateAvatar(file, avatarName, avatarStyle);
      setAvatars((prev) => [
        {
          avatar_id: data.avatar_id,
          name: data.name,
          image_url: data.image_url,
          description: data.description,
        },
        ...prev,
      ]);
      setSelectedAvatarId(data.avatar_id);
      setShowAvatarUpload(false);
    } catch (err) {
      alert(err.message || 'Failed to generate avatar.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDeleteAvatar = async (avatar) => {
    if (!window.confirm(`Delete avatar "${avatar.name}"?`)) return;

    try {
      await deleteAvatar(avatar.avatar_id);
      setAvatars((prev) =>
        prev.filter((a) => a.avatar_id !== avatar.avatar_id)
      );
      if (selectedAvatarId === avatar.avatar_id) {
        setSelectedAvatarId(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete avatar.');
    }
  };

  // ============================================================
  // PANEL EDITING (edit / regenerate / add / remove)
  // ============================================================

  const applyRecompose = async (nextPanels) => {
    const data = await recomposeAmico(
      result.project_id,
      nextPanels,
      result.panels_per_page || panelsPerPage,
      result.layout || layout
    );

    setResult((prev) => ({ ...prev, panels: data.panels, pages: data.pages }));
    setCurrentPageIndex(0);
  };

  const handleRegeneratePanel = async (panel) => {
    setBusyPanelNumber(panel.panel_number);
    try {
      const data = await regenerateAmicoPanel(panel, result.project_id);

      const nextPanels = result.panels.map((p) =>
        p.panel_number === panel.panel_number
          ? { ...p, image_id: data.image_id, image_url: data.image_url }
          : p
      );

      await applyRecompose(nextPanels);
    } catch (err) {
      alert(err.message || 'Failed to regenerate panel.');
    } finally {
      setBusyPanelNumber(null);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingPanel) return;

    setBusyPanelNumber(editingPanel.panel_number);
    const panelToEdit = editingPanel;
    setEditingPanel(null);

    try {
      // The dialogue is drawn directly into the panel artwork, so
      // when it changes the backend regenerates that panel's image
      // too — use its response (with the new image_id/url), not the
      // locally-edited panel, which still points at the old picture.
      const data = await editAmicoPanel(result.project_id, panelToEdit);

      await applyRecompose(data.panels);
    } catch (err) {
      alert(err.message || 'Failed to update panel.');
    } finally {
      setBusyPanelNumber(null);
    }
  };

  const handleRemovePanel = async (panel) => {
    if (result.panels.length <= 2) {
      alert('A comic needs at least 2 panels.');
      return;
    }

    if (!window.confirm(`Remove panel ${panel.panel_number}?`)) return;

    setBusyPanelNumber(panel.panel_number);
    try {
      const nextPanels = result.panels.filter(
        (p) => p.panel_number !== panel.panel_number
      );

      await applyRecompose(nextPanels);
    } catch (err) {
      alert(err.message || 'Failed to remove panel.');
    } finally {
      setBusyPanelNumber(null);
    }
  };

  const handleAddPanel = async (afterPanel) => {
    setBusyPanelNumber(-1);
    try {
      const insertAfter = afterPanel
        ? afterPanel.panel_number
        : result.panels.length;

      const data = await addAmicoPanel(
        result.project_id,
        insertAfter,
        '',
        language
      );

      await applyRecompose(data.panels);
    } catch (err) {
      alert(err.message || 'Failed to add panel.');
    } finally {
      setBusyPanelNumber(null);
    }
  };

  // ============================================================
  // DOWNLOAD / SHARE
  // ============================================================

  const pages = result?.pages || [];
  const currentPage = pages[currentPageIndex];

  const handleDownloadPage = () => {
    if (!currentPage) return;

    const safeTitle = (result.title || 'amico-comic')
      .replace(/\s+/g, '-')
      .toLowerCase();

    downloadMedia(
      currentPage.comic_image_url,
      `${safeTitle}-page-${currentPage.page_number}.png`
    );
  };

  const handleShare = async () => {
    if (!currentPage) return;

    const url = mediaUrl(currentPage.comic_image_url);

    if (navigator.share) {
      try {
        await navigator.share({ title: result.title || 'My AMICO Comic', url });
        return;
      } catch {
        // user cancelled the native share sheet — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch {
      window.prompt('Copy this link to share your comic:', url);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        type="button"
        onClick={() => navigate('/explore')}
        className="inline-flex items-center gap-1.5 text-base font-bold text-black hover:text-black transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
        <div className="p-6 sm:p-10 max-w-2xl">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[14px] font-bold uppercase tracking-widest mb-4 text-black"
            style={{ background: '#fdf2f8', border: '1px solid #fbcfe8' }}
          >
            AMICO
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-black mb-3">AMICO</h1>
          <p className="text-black font-medium max-w-xl text-lg">AMIVI converts complex information into clear visual learning. AMICO then converts that learning into creative engagement. Together they create a continuous learning journey.</p>
        </div>
      </div>

      {/* ======================================================
          LAUNCHER — "What would you like to create?" Shown until
          a creation type is picked. Comic and Photo Story are real
          and clickable; the other three are visible (so the full
          vision is demonstrable) but marked "coming soon" rather
          than built out yet.
      ======================================================= */}
      {!mode && (
        <div className="max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-black text-center">
            {t('What would you like to create?')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 sm:gap-6">
            {CREATION_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => {
                    if (!type.available) {
                      setComingSoonNotice(type.label);
                      return;
                    }
                    setComingSoonNotice(null);
                    setMode(type.key);
                  }}
                  className={`relative overflow-hidden rounded-3xl p-7 sm:p-8 min-h-[190px] sm:min-h-[220px] flex flex-col items-start text-left text-white bg-gradient-to-br ${type.gradient} shadow-md transition-all ${type.available
                      ? 'hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer'
                      : 'opacity-70 cursor-not-allowed'
                    }`}
                >
                  {!type.available && (
                    <span className="absolute top-4 right-4 text-xs font-bold uppercase tracking-wide bg-black/25 px-2.5 py-1 rounded-full">
                      {t('Coming soon')}
                    </span>
                  )}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-md flex items-center justify-center mb-4 sm:mb-5">
                    <Icon className="w-9 h-9 sm:w-11 sm:h-11" style={{ color: type.iconColor }} strokeWidth={2} />
                  </div>
                  <p className="font-extrabold text-xl sm:text-2xl mb-1">{t(type.label)}</p>
                  <p className="text-base sm:text-lg text-white/85 font-medium">{t(type.subtitle)}</p>
                </button>
              );
            })}
          </div>
          {comingSoonNotice && (
            <p className="text-center text-base font-bold text-black bg-slate-50 border border-slate-200 rounded-2xl py-3">
              {t(comingSoonNotice)} {t("isn't ready yet — Comic and Photo Story are open now.")}
            </p>
          )}
        </div>
      )}

      {mode && (
        <div className="max-w-3xl mx-auto -mt-2">
          <button
            type="button"
            onClick={() => setMode(null)}
            className="text-base font-bold text-black hover:text-black transition-colors"
          >
            ← {t('Choose a different way to create')}
          </button>
        </div>
      )}

      {mode === 'comic' && !isProcessing && !result && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6 sm:p-8 flex flex-col">
            {/* Source tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSource('amivi')}
                className={`flex-1 py-3 rounded-2xl font-bold transition-all ${source === 'amivi'
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'bg-pink-50 text-black border-2 border-pink-200 hover:bg-pink-100'
                  }`}
              >
                🎨 {t('Import from AMIVI')}
              </button>
              <button
                onClick={() => setSource('text')}
                className={`flex-1 py-3 rounded-2xl font-bold transition-all ${source === 'text'
                    ? 'bg-pink-500 text-white shadow-lg'
                    : 'bg-pink-50 text-black border-2 border-pink-200 hover:bg-pink-100'
                  }`}
              >
                ✍️ {t('Paste Text')}
              </button>
            </div>

            {source === 'amivi' ? (
              <>
                {/* Automatic AMIVI Data Import Banner */}
                <div className="flex items-center gap-3 mb-6 bg-pink-50 p-4 rounded-xl border border-pink-100">
                  <CheckCircle2 className="w-6 h-6 text-pink-500" />
                  <div>
                    <h3 className="font-bold text-black">AMIVI Learning Package Connected</h3>
                    <p className="text-base font-medium text-black">Essential Learning, Key Points, Slogans, and Images are automatically imported.</p>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-black mb-2">🎨 {t('Select AMIVI Material')}</h2>
                <p className="text-black font-bold mb-4">{t('Choose the learning material to transform into a creative format. No retyping required.')}</p>
                {amiviProjects.length === 0 ? (
                  <p className="text-black font-semibold bg-pink-50 border-2 border-pink-200 rounded-2xl p-4 mb-4">
                    {t('No AMIVI lessons found yet. Create one in AMIVI Studio first.')}
                  </p>
                ) : (
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full p-4 bg-pink-50 border-2 border-pink-200 rounded-2xl text-black font-bold mb-4 focus:ring-4 focus:ring-pink-300 focus:border-pink-400 focus:outline-none"
                  >
                    <option value="">{t('Select an AMIVI Learning Package...')}</option>
                    {amiviProjectOptions.map((project) => (
                      <option key={project.project_id} value={project.project_id}>
                        {project.label}
                      </option>
                    ))}
                  </select>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-black mb-2">✍️ {t('Paste Your Text')}</h2>
                <p className="text-black font-bold mb-6">{t("Paste any text here and we'll turn it into a creative visual story or comic.")}</p>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder={t('e.g. Paste your learning material, notes, or story here...')}
                  className="w-full flex-1 min-h-[160px] p-5 bg-pink-50 border-2 border-pink-200 rounded-2xl text-black font-semibold resize-none focus:ring-4 focus:ring-pink-300 focus:border-pink-400 focus:outline-none mb-2 text-lg transition-all"
                />
              </>
            )}

            {/* Comic layout settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 mb-6">
              <div>
                <label className="text-base font-bold text-black block mb-1">{t('Panels per page')}</label>
                <select
                  value={panelsPerPage}
                  onChange={(e) => setPanelsPerPage(Number(e.target.value))}
                  className="w-full p-3 bg-pink-50 border-2 border-pink-200 rounded-xl font-bold text-black focus:outline-none"
                >
                  {[2, 3, 4, 5, 6, 7].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-base font-bold text-black block mb-1">{t('Pages')}</label>
                <select
                  value={pagesCount}
                  onChange={(e) => setPagesCount(Number(e.target.value))}
                  className="w-full p-3 bg-pink-50 border-2 border-pink-200 rounded-xl font-bold text-black focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-base font-bold text-black block mb-1">{t('Layout')}</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLayout('horizontal')}
                    className={`flex-1 p-3 rounded-xl border-2 flex items-center justify-center gap-1 font-bold transition-all ${layout === 'horizontal'
                        ? 'bg-pink-500 border-pink-500 text-white'
                        : 'bg-pink-50 border-pink-200 text-pink-500'
                      }`}
                    title={t('Horizontal grid')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLayout('vertical')}
                    className={`flex-1 p-3 rounded-xl border-2 flex items-center justify-center gap-1 font-bold transition-all ${layout === 'vertical'
                        ? 'bg-pink-500 border-pink-500 text-white'
                        : 'bg-pink-50 border-pink-200 text-pink-500'
                      }`}
                    title={t('Vertical stack')}
                  >
                    <Rows className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Avatars */}
            <div className="mb-6">
              <label className="text-base font-bold text-black block mb-2">{t('Character Avatar (optional)')}</label>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedAvatarId(null)}
                  className={`shrink-0 w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-sm font-bold ${selectedAvatarId === null
                      ? 'border-pink-500 bg-pink-50 text-black'
                      : 'border-gray-200 text-black'
                    }`}
                >
                  {t('None')}
                </button>
                {avatars.map((avatar) => (
                  <div key={avatar.avatar_id} className="relative shrink-0 group">
                    <button
                      onClick={() => setSelectedAvatarId(avatar.avatar_id)}
                      className={`w-16 h-16 rounded-2xl overflow-hidden border-2 ${selectedAvatarId === avatar.avatar_id
                          ? 'border-pink-500 ring-4 ring-pink-200'
                          : 'border-gray-200'
                        }`}
                      title={avatar.name}
                    >
                      <img src={mediaUrl(avatar.image_url)} alt={avatar.name} className="w-full h-full object-cover" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAvatar(avatar);
                      }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      title={t('Delete avatar')}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setShowAvatarUpload((v) => !v)}
                  className="shrink-0 w-16 h-16 rounded-2xl border-2 border-dashed border-pink-300 text-pink-400 flex items-center justify-center hover:bg-pink-50"
                  title={t('Add a new avatar')}
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              {showAvatarUpload && (
                <div className="mt-4 bg-pink-50 border-2 border-pink-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-black">{t('Create an avatar from a photo')}</p>
                    <button onClick={() => setShowAvatarUpload(false)} className="text-black hover:text-black">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={avatarName}
                    onChange={(e) => setAvatarName(e.target.value)}
                    placeholder={t('Avatar name (optional)')}
                    className="w-full p-3 bg-white border-2 border-pink-200 rounded-xl font-semibold text-black focus:outline-none"
                  />
                  <input
                    type="text"
                    value={avatarStyle}
                    onChange={(e) => setAvatarStyle(e.target.value)}
                    placeholder={t('Art style (optional, e.g. "cartoon superhero")')}
                    className="w-full p-3 bg-white border-2 border-pink-200 rounded-xl font-semibold text-black focus:outline-none"
                  />
                  {avatarUploading ? (
                    <p className="text-center font-bold text-black py-4">{t('Generating your avatar')}...</p>
                  ) : (
                    <FileUpload accept="image/*" label={t('Upload a photo')} onUpload={handleAvatarUpload} />
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all text-lg sm:text-xl hover:scale-105 hover:shadow-[0_10px_25px_rgba(236,72,153,0.4)] flex items-center justify-center gap-3 shadow-lg"
            >
              <Sparkles className="w-6 h-6" />
              {t('Generate Comic')} 🦸‍♂️
            </button>
            {error && <p className="text-red-500 mt-4 font-bold text-center">{error}</p>}
          </div>
        </div>
      )}

      {mode === 'comic' && isProcessing && (
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6 sm:p-12">
          <ProcessingAnimation title={`📚 ${t('Drawing Your Comic')}...`} />
        </div>
      )}

      {mode === 'comic' && result && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🎉</span>
              <div>
                <p className="font-bold text-xl">{t('Comic Generated!')}</p>
                <p className="text-pink-100 font-bold flex flex-wrap items-center gap-2">
                  {t('Your comic strip is ready to read!')}
                  {!savedNotice ? (
                    <button onClick={() => setShowSaveModal(true)} className="inline-flex items-center gap-1.5 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors cursor-pointer font-bold ml-2">
                      <CheckCircle2 className="w-3 h-3" /> Save to Library...
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm bg-emerald-500/20 text-emerald-100 px-3 py-1.5 rounded-full font-bold ml-2">
                      <CheckCircle2 className="w-3 h-3" /> Saved to {saveSpace} / {saveFolder}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button onClick={resetAmico} className="text-base font-bold text-pink-100 hover:text-white underline">
              {t('Create Another Comic')}
            </button>
          </div>

          {/* Complete comic page preview */}
          {pages.length > 0 && (
            <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="text-xl font-bold text-black">
                  📖 {t('Page')} {currentPage?.page_number} {t('of')} {pages.length}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="p-2 rounded-xl bg-pink-50 text-pink-500 hover:bg-pink-100 border-2 border-pink-200"
                    title={t('View full screen')}
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDownloadPage}
                    className="p-2 rounded-xl bg-pink-50 text-pink-500 hover:bg-pink-100 border-2 border-pink-200"
                    title={t('Download this page')}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-xl bg-pink-50 text-pink-500 hover:bg-pink-100 border-2 border-pink-200"
                    title={t('Share this page')}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center bg-gray-50 rounded-2xl p-4">
                {pages.length > 1 && (
                  <button
                    onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
                    disabled={currentPageIndex === 0}
                    className="absolute left-4 z-10 p-2 rounded-full bg-white shadow-lg border-2 border-pink-200 text-pink-500 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {currentPage && (
                  <img
                    src={mediaUrl(currentPage.comic_image_url)}
                    alt={`Page ${currentPage.page_number}`}
                    onClick={() => setIsFullscreen(true)}
                    className="max-w-full max-h-[88vh] rounded-xl shadow-md border-4 border-white cursor-zoom-in"
                  />
                )}

                {pages.length > 1 && (
                  <button
                    onClick={() => setCurrentPageIndex((p) => Math.min(pages.length - 1, p + 1))}
                    disabled={currentPageIndex === pages.length - 1}
                    className="absolute right-4 z-10 p-2 rounded-full bg-white shadow-lg border-2 border-pink-200 text-pink-500 disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Manage individual panels — the composed page above already
              shows the full comic; this strip is just for editing
              dialogue, regenerating art, or adding/removing a panel. */}
          {result.panels?.length > 0 && (
            <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
              <h3 className="text-xl font-bold text-black mb-4">🧩 {t('Manage Panels')}</h3>
              <div className="flex items-start gap-3 overflow-x-auto pb-2">
                {result.panels.map((panel) => {
                  const isBusy = busyPanelNumber === panel.panel_number;
                  return (
                    <div key={panel.panel_number} className="relative flex-shrink-0 w-32">
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-pink-100 bg-gray-50">
                        <img
                          src={mediaUrl(panel.image_url)}
                          alt={`Panel ${panel.panel_number}`}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 bg-black/60 text-white text-sm font-bold px-1.5 py-0.5 rounded-full">
                          {panel.panel_number}
                        </span>
                        {isBusy && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <RefreshCw className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <button
                          onClick={() => setEditingPanel(panel)}
                          title={t('Edit dialogue')}
                          className="p-1.5 rounded-lg text-pink-500 hover:bg-pink-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRegeneratePanel(panel)}
                          disabled={isBusy}
                          title={t("Regenerate this panel's image")}
                          className="p-1.5 rounded-lg text-pink-500 hover:bg-pink-50 disabled:opacity-40"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemovePanel(panel)}
                          disabled={result.panels.length <= 2}
                          title={t('Remove this panel')}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleAddPanel(panel)}
                          title={t('Add a new panel after this one')}
                          className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {mode === 'photostory' && !psProcessing && !psResult && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6 sm:p-8 flex flex-col">
            <h2 className="text-2xl font-bold text-black mb-2">📷 {t('Upload a Photo')}</h2>
            <p className="text-black font-bold mb-6">
              {t('Upload one photo and AMICO will turn it into a labeled diagram story — no characters, just clear step-by-step visuals, like a real science poster.')}
            </p>

            {psPreviewUrl ? (
              <div className="relative w-full mb-6">
                <img
                  src={psPreviewUrl}
                  alt="Uploaded photo"
                  className="w-full max-h-80 object-contain rounded-2xl border-2 border-pink-200 bg-pink-50"
                />
                <button
                  onClick={() => {
                    setPsFile(null);
                    setPsPreviewUrl('');
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-black hover:text-black shadow"
                  title={t('Remove photo')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <FileUpload accept="image/*" label={t('Upload a photo')} onUpload={handlePhotoStoryUpload} />
              </div>
            )}

            <div className="mb-6">
              <label className="text-base font-bold text-black block mb-1">{t('Number of stages')}</label>
              <select
                value={psPanelCount}
                onChange={(e) => setPsPanelCount(Number(e.target.value))}
                className="w-full p-3 bg-pink-50 border-2 border-pink-200 rounded-xl font-bold text-black focus:outline-none"
              >
                {[4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGeneratePhotoStory}
              disabled={!psFile}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all text-lg sm:text-xl hover:scale-105 hover:shadow-[0_10px_25px_rgba(236,72,153,0.4)] flex items-center justify-center gap-3 shadow-lg"
            >
              <Camera className="w-6 h-6" />
              {t('Generate Photo Story')} 📷
            </button>
            {psError && <p className="text-red-500 mt-4 font-bold text-center">{psError}</p>}
          </div>
        </div>
      )}

      {mode === 'photostory' && psProcessing && (
        <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6 sm:p-12">
          <ProcessingAnimation title={`📷 ${t('Building Your Photo Story')}...`} />
        </div>
      )}

      {mode === 'photostory' && psResult && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🎉</span>
              <div>
                <p className="font-bold text-xl">{t('Photo Story Generated!')}</p>
                <p className="text-pink-100 font-bold">{t('Your diagram story is ready to read!')}</p>
              </div>
            </div>
            <button onClick={resetPhotoStory} className="text-base font-bold text-pink-100 hover:text-white underline">
              {t('Create Another Photo Story')}
            </button>
          </div>

          {psPages.length > 0 && (
            <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <h3 className="text-xl font-bold text-black">
                  📖 {t('Page')} {psCurrentPage?.page_number} {t('of')} {psPages.length}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPsFullscreen(true)}
                    className="p-2 rounded-xl bg-pink-50 text-pink-500 hover:bg-pink-100 border-2 border-pink-200"
                    title={t('View full screen')}
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDownloadPhotoStoryPage}
                    className="p-2 rounded-xl bg-pink-50 text-pink-500 hover:bg-pink-100 border-2 border-pink-200"
                    title={t('Download this page')}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSharePhotoStoryPage}
                    className="p-2 rounded-xl bg-pink-50 text-pink-500 hover:bg-pink-100 border-2 border-pink-200"
                    title={t('Share this page')}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center bg-gray-50 rounded-2xl p-4">
                {psPages.length > 1 && (
                  <button
                    onClick={() => setPsCurrentPageIndex((p) => Math.max(0, p - 1))}
                    disabled={psCurrentPageIndex === 0}
                    className="absolute left-4 z-10 p-2 rounded-full bg-white shadow-lg border-2 border-pink-200 text-pink-500 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {psCurrentPage && (
                  <img
                    src={mediaUrl(psCurrentPage.comic_image_url)}
                    alt={`Page ${psCurrentPage.page_number}`}
                    onClick={() => setPsFullscreen(true)}
                    className="max-w-full max-h-[88vh] rounded-xl shadow-md border-4 border-white cursor-zoom-in"
                  />
                )}

                {psPages.length > 1 && (
                  <button
                    onClick={() => setPsCurrentPageIndex((p) => Math.min(psPages.length - 1, p + 1))}
                    disabled={psCurrentPageIndex === psPages.length - 1}
                    className="absolute right-4 z-10 p-2 rounded-full bg-white shadow-lg border-2 border-pink-200 text-pink-500 disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full screen page view — big enough to read the dialogue clearly */}
      {mode === 'comic' && isFullscreen && currentPage && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-2 sm:p-6">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
            title={t('Close')}
          >
            <X className="w-6 h-6" />
          </button>

          {pages.length > 1 && (
            <button
              onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
              disabled={currentPageIndex === 0}
              className="absolute left-2 sm:left-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          <img
            src={mediaUrl(currentPage.comic_image_url)}
            alt={`Page ${currentPage.page_number}`}
            className="max-w-full max-h-full object-contain"
          />

          {pages.length > 1 && (
            <button
              onClick={() => setCurrentPageIndex((p) => Math.min(pages.length - 1, p + 1))}
              disabled={currentPageIndex === pages.length - 1}
              className="absolute right-2 sm:right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}

          {pages.length > 1 && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-base font-bold">
              {t('Page')} {currentPage.page_number} {t('of')} {pages.length}
            </span>
          )}
        </div>
      )}

      {/* Full screen Photo Story page view */}
      {mode === 'photostory' && psFullscreen && psCurrentPage && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-2 sm:p-6">
          <button
            onClick={() => setPsFullscreen(false)}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white"
            title={t('Close')}
          >
            <X className="w-6 h-6" />
          </button>

          {psPages.length > 1 && (
            <button
              onClick={() => setPsCurrentPageIndex((p) => Math.max(0, p - 1))}
              disabled={psCurrentPageIndex === 0}
              className="absolute left-2 sm:left-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          <img
            src={mediaUrl(psCurrentPage.comic_image_url)}
            alt={`Page ${psCurrentPage.page_number}`}
            className="max-w-full max-h-full object-contain"
          />

          {psPages.length > 1 && (
            <button
              onClick={() => setPsCurrentPageIndex((p) => Math.min(psPages.length - 1, p + 1))}
              disabled={psCurrentPageIndex === psPages.length - 1}
              className="absolute right-2 sm:right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}

          {psPages.length > 1 && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-base font-bold">
              {t('Page')} {psCurrentPage.page_number} {t('of')} {psPages.length}
            </span>
          )}
        </div>
      )}

      {/* Edit dialogue modal */}
      {editingPanel && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-lg"
          >
            <h3 className="text-xl font-bold text-black">
              {t('Edit Panel')} {editingPanel.panel_number}
            </h3>
            <div>
              <label className="text-base font-bold text-black block mb-1">{t('Title')}</label>
              <input
                type="text"
                value={editingPanel.title || ''}
                onChange={(e) => setEditingPanel({ ...editingPanel, title: e.target.value })}
                className="w-full p-3 bg-pink-50 border-2 border-pink-200 rounded-xl font-semibold text-black focus:outline-none"
              />
            </div>
            <div>
              <label className="text-base font-bold text-black block mb-1">{t('Dialogue')}</label>
              <textarea
                value={editingPanel.dialogue || ''}
                onChange={(e) => setEditingPanel({ ...editingPanel, dialogue: e.target.value })}
                className="w-full min-h-[80px] p-3 bg-pink-50 border-2 border-pink-200 rounded-xl font-semibold text-black resize-none focus:outline-none"
              />
            </div>
            <div>
              <label className="text-base font-bold text-black block mb-1">{t('Caption / Learning Point')}</label>
              <textarea
                value={editingPanel.learning_point || ''}
                onChange={(e) => setEditingPanel({ ...editingPanel, learning_point: e.target.value })}
                className="w-full min-h-[60px] p-3 bg-pink-50 border-2 border-pink-200 rounded-xl font-semibold text-black resize-none focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditingPanel(null)}
                className="flex-1 py-3 rounded-xl font-bold bg-gray-100 text-black hover:bg-gray-200"
              >
                {t('Cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600"
              >
                {t('Save')}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* ======================================================
          SAVE MODAL
      ======================================================= */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-black">Save to Library</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-black hover:text-black">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-base font-bold text-black mb-2">1. Choose Library Space</label>
                <div className="grid grid-cols-3 gap-2">
                  {['personal', 'group', 'class'].map(space => (
                    <button
                      key={space}
                      onClick={() => setSaveSpace(space)}
                      className={`py-2 rounded-xl text-base font-bold capitalize border-2 transition-colors ${saveSpace === space ? 'border-pink-500 bg-pink-50 text-black' : 'border-slate-200 text-black hover:border-pink-300'
                        }`}
                    >
                      {space}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-base font-bold text-black mb-2">2. Choose Subject Folder</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Science', 'History', 'Geography', 'Math', 'Languages', 'Uncategorized'].map(folder => (
                    <button
                      key={folder}
                      onClick={() => setSaveFolder(folder)}
                      className={`py-2 rounded-xl text-base font-bold border-2 transition-colors ${saveFolder === folder ? 'border-pink-500 bg-pink-50 text-black' : 'border-slate-200 text-black hover:border-pink-300'
                        }`}
                    >
                      {folder}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-black hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setSavedNotice(true);
                  setShowSaveModal(false);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-pink-600 hover:bg-pink-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle2 size={18} /> Confirm Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4-Step Flowchart */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-12 mb-8 bg-slate-50 py-6 rounded-2xl border border-slate-200">
        <div className="px-4 py-2 bg-slate-200 rounded-xl shadow-sm border border-slate-300 font-bold text-black">Complexity</div>
        <ArrowRight className="w-5 h-5 text-black rotate-90 sm:rotate-0" />
        <div className="px-4 py-2 bg-blue-100 rounded-xl shadow-sm border border-blue-200 font-bold text-black">Clarity</div>
        <ArrowRight className="w-5 h-5 text-black rotate-90 sm:rotate-0" />
        <div className="px-4 py-2 bg-pink-100 rounded-xl shadow-sm border border-pink-200 font-bold text-black">Creativity</div>
        <ArrowRight className="w-5 h-5 text-black rotate-90 sm:rotate-0" />
        <div className="px-4 py-2 bg-purple-600 rounded-xl shadow-sm border border-purple-600 font-bold text-white">Mastery</div>
      </div>

    </div>
  );
}
