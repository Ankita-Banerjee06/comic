import FileUpload from '../components/ui/FileUpload';
import ProcessingAnimation from '../components/ui/ProcessingAnimation';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  generateAmivi,
  regenerateAmiviImage,
  editAmiviChunk,
  generateAmiviCompleteVisual,
  generateAmiviPhotoStory,
  getLibraryProject,
  API_URL,
} from '../services/api';

import {
  Sparkles,
  RefreshCw,
  Pencil,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Video,
  Maximize,
  X,
  Download,
  FileText,
  UploadCloud,
  Loader2,
} from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';

// Shared pager for the Microbit grids (Box 1 / Box 2) — 6 Microbits
// per page, 3 per row x 2 rows; only rendered when there's more
// than one page.
function MicrobitPager({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        className="px-4 py-2 bg-white border-2 border-slate-200 text-black font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-300 transition-colors"
      >
        ← Previous
      </button>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`w-9 h-9 rounded-full font-bold text-base border-2 transition-colors ${
              i === page
                ? 'bg-indigo-500 border-indigo-500 text-white'
                : 'bg-white border-slate-200 text-black hover:border-indigo-300'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages - 1}
        className="px-4 py-2 bg-white border-2 border-slate-200 text-black font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:border-indigo-300 transition-colors"
      >
        Next →
      </button>
    </div>
  );
}

export default function Amivi() {
  const [isProcessing, setIsProcessing] = useState(false);

  const [result, setResult] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState(null);

  const [generateVideo, setGenerateVideo] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');

  const [processingChunkId, setProcessingChunkId] = useState(null);
  const [editingChunk, setEditingChunk] = useState(null);
  const [selectedChunks, setSelectedChunks] = useState(new Set());
  
  // Save Modal State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSpace, setSaveSpace] = useState('personal');
  const [saveFolder, setSaveFolder] = useState('Science');

  // Per-slot regenerate tracking, e.g. "42:1" or "42:2"
  const [regeneratingKey, setRegeneratingKey] = useState(null);

  // { [chunk_id]: 'a' | 'b' } — which option the learner picked
  // for each chunk's inline "check yourself" question.
  const [mcqAnswers, setMcqAnswers] = useState({});

  const [isGeneratingPhotoStory, setIsGeneratingPhotoStory] = useState(false);
  const [photoStoryError, setPhotoStoryError] = useState(null);

  // Microbit pages — 6 cards per page (3 per row x 2 rows), shared by
  // Box 1 and Box 2 so a teacher moves through the same Microbits
  // together in both. Resets to page 1 whenever a different
  // project's results load (see useEffect below).
  const [chunkPage, setChunkPage] = useState(0);
  const CHUNKS_PER_PAGE = 6;

  // Complete Visual — optional Stage 3, one new connected illustration
  // generated from the already-saved Microbits.
  const [completeVisualUrl, setCompleteVisualUrl] = useState(null);
  const [isGeneratingCompleteVisual, setIsGeneratingCompleteVisual] = useState(false);
  const [completeVisualError, setCompleteVisualError] = useState(null);

  const navigate = useNavigate();
  const { projectId } = useParams();
  const { language, t } = useLanguage();

  // ============================================================
  // OPEN FROM LIBRARY (load a previously saved AMIVI project
  // instead of running the generator again)
  // ============================================================

  useEffect(() => {
    if (!projectId) return;

    let cancelled = false;

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setMcqAnswers({});
    setPhotoStoryError(null);

    getLibraryProject(projectId)
      .then((project) => {
        if (cancelled) return;
        setResult({ ...project.data, project_id: project.id });
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Unable to load this AMIVI project.');
      })
      .finally(() => {
        if (!cancelled) setIsProcessing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // Start back at Microbit page 1 whenever a different project's
  // results load (a fresh generation, or opening one from the
  // Library) — but not on every small in-place update (an image
  // regenerate, an edit) to the same project's result.
  useEffect(() => {
    setChunkPage(0);
  }, [result?.project_id]);

  // ============================================================
  // HELPERS
  // ============================================================

  const getMediaUrl = (path) => {
    if (!path) return '';

    if (
      path.startsWith('http://') ||
      path.startsWith('https://')
    ) {
      return path;
    }

    return `${API_URL}${path}`;
  };

  // Clicking a visual card opens its photo full-size in a new browser
  // tab (not an in-page popup) — a teacher can drag that tab onto a
  // projector/second screen, like a slide, instead of being stuck
  // inside this app window. The slogan comes along with it, shown
  // under the enlarged photo, so the "slide" still carries its
  // message rather than being a bare image.
  const escapeHtml = (str) =>
    String(str || '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[ch]));

  const openImageInNewTab = (imagePath, slogan) => {
    const url = getMediaUrl(imagePath);
    if (!url) return;

    // NOTE: deliberately NOT passing 'noopener' here — when that flag
    // is set, window.open() returns null (the browser won't hand back
    // a reference), and we need the reference below to write this
    // tab's content. Sever the back-reference manually instead, right
    // after opening, so the new tab still can't reach this page via
    // window.opener.
    const tab = window.open('', '_blank');
    if (!tab) return;
    tab.opener = null;

    tab.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(slogan) || 'Microbit'}</title>
    <style>
      html, body {
        margin: 0;
        min-height: 100%;
        background: #000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Nunito', Arial, sans-serif;
      }
      img {
        max-width: 100vw;
        max-height: 85vh;
        object-fit: contain;
      }
      .slogan {
        margin-top: 1.5rem;
        padding: 0 2rem;
        color: #fcd34d;
        font-size: clamp(1.75rem, 4.5vw, 3.5rem);
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <img src="${url}" alt="${escapeHtml(slogan) || 'Microbit visual'}" />
    ${slogan ? `<div class="slogan">${escapeHtml(slogan)}</div>` : ''}
  </body>
</html>`);
    tab.document.close();
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to opening in new tab
      window.open(url, '_blank');
    }
  };

  const resetAmivi = () => {
    setResult(null);
    setTextInput('');
    setVideoUrl('');
    setError(null);
    setMcqAnswers({});
    setPhotoStoryError(null);
    setCompleteVisualUrl(null);
    setIsGeneratingCompleteVisual(false);
    setCompleteVisualError(null);
    setChunkPage(0);
  };

  // ============================================================
  // COMPLETE VISUAL — optional Stage 3. One new connected
  // illustration built from the already-generated Microbits.
  // ============================================================

  const handleGenerateCompleteVisual = async () => {
    if (!result?.project_id) return;

    setIsGeneratingCompleteVisual(true);
    setCompleteVisualError(null);

    try {
      const data = await generateAmiviCompleteVisual(result.project_id, language);
      setCompleteVisualUrl(data?.image_url || null);
    } catch (err) {
      console.error('AMIVI Complete Visual error:', err);
      setCompleteVisualError('Could not generate the Complete Visual.');
    } finally {
      setIsGeneratingCompleteVisual(false);
    }
  };

  const toggleChunkSelection = (chunkId) => {
    setSelectedChunks(prev => {
      const next = new Set(prev);
      if (next.has(chunkId)) next.delete(chunkId);
      else next.add(chunkId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!result?.chunks) return;
    if (selectedChunks.size === result.chunks.length) {
      setSelectedChunks(new Set());
    } else {
      setSelectedChunks(new Set(result.chunks.map(c => c.chunk_id)));
    }
  };

  // Microbit paging for Box 1 / Box 2 — 6 per page (3 per row, 2
  // rows); a 7th Microbit starts page 2, and so on. Select All /
  // Deselect All still applies to every Microbit, not just the
  // current page.
  const totalChunkPages = result?.chunks?.length
    ? Math.ceil(result.chunks.length / CHUNKS_PER_PAGE)
    : 0;

  const pagedChunks = result?.chunks
    ? result.chunks.slice(
        chunkPage * CHUNKS_PER_PAGE,
        chunkPage * CHUNKS_PER_PAGE + CHUNKS_PER_PAGE
      )
    : [];

  const goToChunkPage = (page) => {
    setChunkPage(
      Math.max(0, Math.min(page, totalChunkPages - 1))
    );
  };

  // ============================================================
  // GENERATE AMIVI
  // ============================================================

  const handleGenerate = async () => {
    const text = textInput.trim();
    const url = videoUrl.trim();

    // Require either text or video URL
    if (!text && !url) {
      setError(
        'Please paste learning material or enter a video URL.'
      );
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateAmivi(
        text,
        language,
        generateVideo,
        url || null
      );

      setResult(data);

    } catch (err) {
      console.error(
        'AMIVI generation error:',
        err
      );

      setError(
        err?.message ||
          'Failed to generate AMIVI content.'
      );

    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegenerate = async (chunk, slot = 1) => {
    const key = `${chunk.chunk_id}:${slot}`;
    setRegeneratingKey(key);
    try {
      // Slot 2 regenerates from the chunk's second ("alternate
      // angle") image prompt instead of its primary one.
      const chunkForRequest =
        slot === 2
          ? { ...chunk, image_prompt: chunk.image_prompt_2 || chunk.slogan || chunk.text }
          : chunk;

      const data = await regenerateAmiviImage(chunkForRequest, language, result?.project_id);

      // Update result state with new image
      setResult(prev => ({
        ...prev,
        chunks: prev.chunks.map(c => {
          if (c.chunk_id !== chunk.chunk_id) return c;

          return slot === 2
            ? { ...c, image2_id: data.image_id, image2_url: data.image_url }
            : { ...c, image_id: data.image_id, image_url: data.image_url };
        })
      }));
    } catch (err) {
      console.error('Regenerate image error:', err);
      alert('Failed to regenerate image.');
    } finally {
      setRegeneratingKey(null);
    }
  };

  // ============================================================
  // PHOTO STORY (combine every chunk's image into one poster)
  // ============================================================

  const handleGeneratePhotoStory = async () => {
    if (!result?.project_id) return;

    setIsGeneratingPhotoStory(true);
    setPhotoStoryError(null);

    try {
      const data = await generateAmiviPhotoStory(result.project_id);

      setResult(prev => ({
        ...prev,
        photo_story_pages: data.pages,
      }));
    } catch (err) {
      console.error('Photo Story generation error:', err);
      setPhotoStoryError(err?.message || 'Failed to generate Photo Story.');
    } finally {
      setIsGeneratingPhotoStory(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingChunk) return;
    
    setProcessingChunkId(editingChunk.chunk_id);
    const chunkToEdit = editingChunk;
    setEditingChunk(null); // close modal immediately
    
    try {
      const data = await editAmiviChunk(chunkToEdit, language, result?.project_id);
      
      // Update result state with edited text and new audio
      setResult(prev => ({
        ...prev,
        chunks: prev.chunks.map(c => 
          c.chunk_id === chunkToEdit.chunk_id 
            ? { 
                ...c, 
                text: chunkToEdit.text, 
                slogan: chunkToEdit.slogan, 
                description: chunkToEdit.description,
                audio_id: data.audio_id,
                audio_url: data.audio_url
              } 
            : c
        )
      }));
    } catch (err) {
      console.error('Edit chunk error:', err);
      alert('Failed to update chunk.');
    } finally {
      setProcessingChunkId(null);
    }
  };

  // ============================================================
  // FILE UPLOAD / EXTRACTION
  // ============================================================

  const handleUpload = async (file) => {
    if (!file) return;

    setError(null);

    try {
      const formData = new FormData();

      formData.append('file', file);

      const response = await fetch(
        `${API_URL}/api/amivi/extract`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message ||
            'Failed to extract content from file.'
        );
      }

      const data = await response.json();

      setTextInput(data?.text || '');

      // If file is uploaded, clear video URL
      setVideoUrl('');

    } catch (err) {
      console.error(
        'File extraction error:',
        err
      );

      setError(
        err?.message ||
          'Failed to extract content from file.'
      );
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

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-gradient-to-br from-blue-50 via-white to-purple-50">

        <div className="p-6 sm:p-10 max-w-2xl">

          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[14px] font-bold uppercase tracking-widest mb-4 text-black"
            style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}
          >
            AMIVI
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-black mb-3">
            AMIVI
          </h1>

          <p className="text-black font-medium max-w-xl text-lg">
            AMIVI converts complex information into clear visual learning. AMICO then converts that learning into creative engagement. Together they create a continuous learning journey.
          </p>

        </div>

      </div>

      {/* ======================================================
          INSERT SUBJECT  +  UPLOAD FILE / PROMPT TYPE
      ======================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* INSERT SUBJECT — heading/paragraph text, video option, other, generate */}

        <div className="bg-gradient-to-br from-blue-50/70 via-white to-white rounded-2xl border border-blue-100 border-t-4 border-t-blue-400 shadow-sm p-6 sm:p-8 flex flex-col">

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-black">
              Insert Subject
            </h2>
          </div>

          <p className="text-black font-medium mb-6 text-lg">
            Add a heading or paragraph of your learning material below.
          </p>

          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            readOnly={isProcessing || !!result}
            placeholder={t(
              'Paste your educational text here... AMIVI will break it into the key points the subject naturally calls for, each with its own picture.'
            )}
            className={`w-full flex-1 min-h-[220px] p-5 bg-blue-50/60 border border-blue-200 rounded-2xl text-black font-medium resize-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:outline-none mb-5 text-xl transition-all ${(isProcessing || !!result) ? 'opacity-60 cursor-not-allowed' : ''}`}
          />

          {!isProcessing && !result && (
            <>
              {/* VIDEO (OPTIONAL) */}

              <div className="flex items-center gap-3 mb-4 bg-white border-2 border-slate-200 rounded-xl px-4 py-3">

                <input
                  id="generate-video"
                  type="checkbox"
                  checked={generateVideo}
                  onChange={(e) =>
                    setGenerateVideo(
                      e.target.checked
                    )
                  }
                  className="w-5 h-5 accent-amber-600"
                />

                <label
                  htmlFor="generate-video"
                  className="font-bold text-black flex items-center gap-2 cursor-pointer text-lg"
                >
                  <Video className="w-5 h-5 text-amber-500" />
                  Video <span className="text-black font-semibold">(Optional)</span>
                </label>

              </div>

              <button
                onClick={handleGenerate}
                disabled={
                  !textInput.trim() &&
                  !videoUrl.trim()
                }
                className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold uppercase tracking-wide rounded-2xl transition-all text-lg hover:-translate-y-0.5 flex items-center justify-center gap-3 shadow-sm"
              >

                <Sparkles className="w-5 h-5" />

                {t('Generate')}

              </button>

              {error && (
                <p className="text-red-500 mt-4 font-bold text-center whitespace-pre-wrap">
                  {error}
                </p>
              )}

            </>
          )}

          {result && !isProcessing && (
            <p className="text-lg text-black font-bold text-center mt-auto pt-2">
              ✅ Done! Click "Start Over" below to create another.
            </p>
          )}

        </div>


        {/* UPLOAD FILE  +  PROMPT TYPE */}

        <div className="bg-gradient-to-br from-indigo-50/70 via-white to-white rounded-2xl border border-indigo-100 border-t-4 border-t-indigo-400 shadow-sm p-6 sm:p-8 flex flex-col">

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <UploadCloud className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-black">
              Upload File
            </h2>
          </div>

          <p className="text-black font-medium mb-6 text-lg">
            Upload a PDF, Word document or TXT file to fill in your subject automatically.
          </p>

          {!isProcessing && !result ? (
            <div className="bg-cyan-50 border-2 border-dashed border-cyan-200 rounded-2xl p-6 mb-6 flex-1 flex flex-col justify-center">
              <FileUpload
                accept=".pdf,.docx,.txt"
                onUpload={handleUpload}
              />
              <p className="text-base text-black font-semibold mt-3 text-center">
                Supported formats: PDF · DOCX · TXT
              </p>
            </div>
          ) : (
            <div className="bg-cyan-50/50 border-2 border-dashed border-cyan-100 rounded-2xl p-6 mb-6 flex-1 flex items-center justify-center text-cyan-400 font-bold text-center">
              File upload locked while generating
            </div>
          )}

          {/* PROMPT TYPE */}

          <div className="bg-white border-2 border-indigo-100 rounded-2xl p-5 sm:p-6">

            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <p className="text-center text-base font-extrabold uppercase tracking-widest text-black">
                Prompt Type
              </p>
            </div>
            <p className="text-center text-base font-semibold text-black mb-5">
              System / User
            </p>

            <div className="space-y-3">
              {[
                {
                  n: 1,
                  name: 'INTRODUCE',
                  description: 'Create individual visual Microbits with key points, images and short slogans.',
                },
                {
                  n: 2,
                  name: 'AMIVI EXPLAIN',
                  description: 'Automatically explains each Microbit using its own key point and slogan — no extra step needed.',
                },
              ].map((p) => (
                <div key={p.n} className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-sm font-extrabold flex items-center justify-center flex-shrink-0">
                      {p.n}
                    </span>
                    <span className="text-lg font-extrabold text-black">{p.name}</span>
                    <span className="text-sm font-bold uppercase tracking-wide text-black bg-white border border-indigo-200 rounded-full px-2 py-0.5">
                      System Generated
                    </span>
                  </div>
                  <p className="text-base font-semibold text-black pl-8 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          SUBJECT HEADING / TITLE — the short subject title AMIVI
          generates alongside the Key Points (e.g. "Photosynthesis").
          Sits above Box 1 so the subject is identified at a glance
          once results are in; not shown before generation.
      ======================================================= */}

      {result?.title && (
        <div className="bg-gradient-to-br from-indigo-50 via-white to-white rounded-2xl border border-indigo-200 shadow-sm p-6 sm:p-8 text-center">
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-base sm:text-lg font-bold uppercase tracking-[0.25em] mb-3 text-black"
            style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}
          >
            {t('Subject Heading / Title')}
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-black">{result.title}</h2>
        </div>
      )}

      {/* ======================================================
          BOX 1 — INTRODUCE (Image + Key Point + Slogan)
          Never replaced or overwritten by EXPLAIN below.
      ======================================================= */}

      <div className="bg-gradient-to-br from-slate-50 via-white to-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-base sm:text-lg font-bold uppercase tracking-[0.25em] mb-3 text-black" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            {t('Box 1 · INTRODUCE')}
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-black mb-2">Image</h2>
          <p className="text-black font-semibold text-xl sm:text-2xl">
            {isProcessing
              ? 'Sit tight — your images are being generated.'
              : result
              ? 'Your images are ready!'
              : 'Your images appear here'}
          </p>
          {!isProcessing && !result && (
            <p className="text-base font-bold uppercase tracking-widest text-black mt-1">
              Example: Prompt 1
            </p>
          )}
        </div>

        {isProcessing ? (
          <div className="py-10 flex items-center justify-center">
            <ProcessingAnimation title={`✨ ${t('Generating Images')}...`} />
          </div>
        ) : result && (result.chunks?.length > 0 || result.video_url) ? (
          <div className="flex flex-col w-full">

            {result.chunks?.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-4 px-2">
                  <p className="text-black font-bold text-lg">Select cards to use below:</p>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="px-3 py-1.5 bg-white border-2 border-indigo-200 text-black text-base font-bold rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    {selectedChunks.size === result.chunks.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pagedChunks.map((chunk, pageIndex) => {
                    const index = chunkPage * CHUNKS_PER_PAGE + pageIndex;
                    return (
                    <div
                      key={chunk.chunk_id || index}
                      className={`bg-white rounded-2xl border-2 shadow-sm relative flex flex-col overflow-hidden ${
                        selectedChunks.has(chunk.chunk_id) ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="absolute top-3 left-3 z-20">
                        <div
                          onClick={(e) => { e.stopPropagation(); toggleChunkSelection(chunk.chunk_id); }}
                          className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center cursor-pointer shadow-sm transition-colors ${
                            selectedChunks.has(chunk.chunk_id) ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-gray-300'
                          }`}
                        >
                          {selectedChunks.has(chunk.chunk_id) && <CheckCircle2 className="w-5 h-5 text-white" />}
                        </div>
                      </div>

                      <div className="relative bg-gray-100">
                        <div
                          className="absolute -bottom-2 -left-2 z-20 w-10 h-10 bg-red-700 text-white font-extrabold flex items-center justify-center shadow-md drop-shadow-md"
                          style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                        >
                          {index + 1}
                        </div>
                        <img
                          src={getMediaUrl(chunk.image_url)}
                          alt={chunk.text || `Chunk ${index + 1}`}
                          className="w-full object-contain cursor-pointer"
                          style={{ aspectRatio: '11.7/14.7' }}
                          onClick={() => openImageInNewTab(chunk.image_url, chunk.slogan)}
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col items-center justify-center text-center bg-amber-50 border-t-2 border-amber-100 gap-1">
                        <p className="text-2xl sm:text-3xl font-extrabold text-black leading-tight">
                          {chunk.key_point || chunk.text || `Chunk ${index + 1}`}
                        </p>
                        {chunk.slogan && (
                          <p className="text-lg sm:text-xl font-bold text-black uppercase tracking-wide">
                            {chunk.slogan}
                          </p>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>

                <MicrobitPager
                  page={chunkPage}
                  totalPages={totalChunkPages}
                  onChange={goToChunkPage}
                />
              </>
            )}

            {result.video_url && (
              <div className="w-full mt-6 pt-6 border-t-2 border-indigo-100 flex flex-col items-center justify-center text-center">
                <p className="text-lg font-bold text-black mb-3">This is the link of the video:</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={getMediaUrl(result.video_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-colors shadow-lg flex-1 min-w-[200px]"
                  >
                    <Video size={18} />
                    Watch Video
                  </a>
                  <button
                    onClick={() => handleDownload(getMediaUrl(result.video_url), 'amivi-video.mp4')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-100 hover:bg-indigo-200 text-black font-bold rounded-2xl transition-colors shadow-lg flex-1 min-w-[200px]"
                  >
                    <Download size={18} />
                    Download
                  </button>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-amber-50 rounded-2xl border-2 border-amber-200 flex flex-col overflow-hidden">
                <div className="flex items-center justify-center text-black font-extrabold text-4xl" style={{ aspectRatio: '11.7/14.7' }}>
                  {n}
                </div>
                <div className="py-3 bg-amber-100 border-t-2 border-amber-200 text-center">
                  <p className="text-base font-extrabold uppercase tracking-wide text-black">Slogan</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ======================================================
          BOX 2 — EXPLAIN (Same Image + Same Key Point + Same
          Slogan + Brief Explanation). A completely separate
          section — it never replaces or hides Box 1 above; both
          stay visible. Every Microbit's explanation is generated
          automatically (from its own Key Point + Slogan) as part
          of generation itself — there's no separate "AMIVI
          Explain" click any more.
      ======================================================= */}

      {result && !isProcessing && result.chunks?.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50/60 via-white to-white rounded-2xl border border-amber-200 shadow-sm p-6 sm:p-8">

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-base sm:text-lg font-bold uppercase tracking-[0.25em] mb-3 text-black" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
              {t('Box 2 · AMIVI EXPLAIN')}
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-black mb-2">{t('Understand Each Microbit')}</h2>
            <p className="text-black font-semibold text-xl sm:text-2xl">
              {t('Same image, same slogan — now explained, ready to present one at a time.')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagedChunks.map((chunk, pageIndex) => {
              const index = chunkPage * CHUNKS_PER_PAGE + pageIndex;
              return (
              <div
                key={chunk.chunk_id || index}
                className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm relative flex flex-col overflow-hidden"
              >
                <div className="relative bg-gray-100">
                  <div
                    className="absolute -bottom-2 -left-2 z-20 w-10 h-10 bg-red-700 text-white font-extrabold flex items-center justify-center shadow-md drop-shadow-md"
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                  >
                    {index + 1}
                  </div>
                  <img
                    src={getMediaUrl(chunk.image_url)}
                    alt={chunk.text || `Chunk ${index + 1}`}
                    className="w-full object-contain cursor-pointer"
                    style={{ aspectRatio: '11.7/14.7' }}
                    onClick={() => openImageInNewTab(chunk.image_url, chunk.slogan)}
                  />
                </div>

                <div className="p-4 flex flex-col items-center text-center bg-amber-50 border-t-2 border-amber-100 gap-1">
                  <p className="text-2xl sm:text-3xl font-extrabold text-black leading-tight">
                    {chunk.key_point || chunk.text || `Chunk ${index + 1}`}
                  </p>
                  {chunk.slogan && (
                    <p className="text-lg sm:text-xl font-bold text-black uppercase tracking-wide">
                      {chunk.slogan}
                    </p>
                  )}

                  <div className="w-full mt-2">
                    {chunk.description ? (
                      <p className="text-xl sm:text-2xl text-black font-medium text-left w-full bg-white border border-amber-200 rounded-xl p-3">
                        {chunk.description}
                      </p>
                    ) : (
                      <p className="text-lg text-black italic w-full bg-white border border-amber-100 rounded-xl p-3">
                        {t('Explanation not available for this Microbit.')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          <MicrobitPager
            page={chunkPage}
            totalPages={totalChunkPages}
            onChange={goToChunkPage}
          />

        </div>
      )}

      {/* ======================================================
          BOX 3 — COMPLETE VISUAL (optional)
          One new connected illustration, generated after the
          individual Microbits. Shows the relationship between
          Key Points — never a replacement for Box 1 or Box 2.
      ======================================================= */}

      {result && !isProcessing && result.chunks?.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50/60 via-white to-white rounded-2xl border border-purple-200 shadow-sm p-6 sm:p-8">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[14px] font-bold uppercase tracking-widest mb-2 text-black" style={{ background: '#faf5ff', border: '1px solid #e9d5ff' }}>
                {t('Optional')}
              </div>
              <h2 className="text-3xl font-extrabold text-black mb-1">{t('Complete Visual')}</h2>
              <p className="text-black font-semibold text-lg">
                {t('One connected illustration that brings every Microbit together.')}
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateCompleteVisual}
              disabled={isGeneratingCompleteVisual}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center gap-2 transition-all flex-shrink-0"
            >
              {isGeneratingCompleteVisual ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> {t('Generating...')}
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  {completeVisualUrl ? t('Regenerate Complete Visual') : t('Generate Complete Visual')}
                </>
              )}
            </button>
          </div>

          {completeVisualError && (
            <p className="text-red-500 font-bold text-base text-center mb-4">{completeVisualError}</p>
          )}

          {completeVisualUrl ? (
            <div className="rounded-2xl overflow-hidden border-2 border-purple-200 shadow-sm">
              <img
                src={getMediaUrl(completeVisualUrl)}
                alt={t('Complete Visual')}
                className="w-full object-contain bg-white"
              />
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/40 py-10 flex flex-col items-center justify-center text-center gap-1">
              <p className="text-black font-bold text-lg">
                {t('Generate a single connected illustration showing how all Microbits relate.')}
              </p>
            </div>
          )}

        </div>
      )}

      {/* ======================================================
          RESULTS
      ======================================================= */}

      {result && !isProcessing && (

        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">

          {/* SUCCESS */}

          <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">

            <div className="flex items-center gap-4">

              <span className="text-4xl">
                🎉
              </span>

              <div>

                <p className="font-bold text-xl">
                  {t('Generation Complete!')}
                </p>

                <p className="text-green-100 font-bold">
                  Your visual micro-bits
                  {result.video_url
                    ? ' and video'
                    : ''}{' '}
                  are ready to view!
                </p>

              </div>

            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">

              <button
                onClick={() => navigate('/quiz')}
                className="px-6 py-3 bg-white text-green-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-lg"
              >
                🧩 {t('Go to Quiz')}
              </button>

              <button
                onClick={resetAmivi}
                className="text-base font-bold text-green-100 hover:text-white underline"
              >
                {t('Start Over')}
              </button>

            </div>

          </div>




          {/* PHOTO STORY */}

          <div className="bg-gradient-to-br from-purple-50/60 via-white to-white rounded-2xl border border-purple-100 border-t-4 border-t-purple-300 shadow-sm p-5 sm:p-7">

            <div className="flex items-center justify-between gap-4 flex-wrap mb-5">

              <div>
                <h3 className="text-3xl font-bold text-black flex items-center gap-2">
                  📖 {t('Photo Story')}
                </h3>
                <p className="text-lg text-black font-semibold mt-1">
                  {t('Combine every chunk into one poster-style sheet you can print or share.')}
                </p>
              </div>

              <button
                type="button"
                onClick={handleGeneratePhotoStory}
                disabled={isGeneratingPhotoStory || !result?.project_id}
                className="px-5 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center gap-2 transition-all"
              >
                <Sparkles className={`w-5 h-5 ${isGeneratingPhotoStory ? 'animate-pulse' : ''}`} />
                {isGeneratingPhotoStory
                  ? t('Generating...')
                  : (result?.photo_story_pages?.length
                      ? t('Regenerate Photo Story')
                      : t('Generate Photo Story'))}
              </button>

            </div>

            {photoStoryError && (
              <p className="text-red-500 font-bold mb-4">{photoStoryError}</p>
            )}

            {(result?.photo_story_pages || []).length > 0 && (

              <div className="space-y-6">

                {result.photo_story_pages.map((page) => (

                  <div key={page.page_number} className="space-y-2">

                    <div className="rounded-2xl overflow-hidden border-2 border-purple-100 shadow-sm">
                      <img
                        src={getMediaUrl(page.comic_image_url)}
                        alt={`Photo Story page ${page.page_number}`}
                        className="w-full"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleDownload(
                            getMediaUrl(page.comic_image_url),
                            `amivi-photo-story-page-${page.page_number}.png`
                          )
                        }
                        className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-black font-bold rounded-xl flex items-center gap-2 transition-colors text-base"
                      >
                        <Download size={16} />
                        {t('Download Page')} {page.page_number}
                      </button>
                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>


          {/* BOTTOM ACTIONS */}

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 mt-8 shadow-sm">
            
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h3 className="text-3xl font-bold text-black mb-1">What Next?</h3>
                <p className="text-black font-medium text-lg">
                  {selectedChunks.size > 0
                    ? `${selectedChunks.size} card(s) selected.`
                    : 'Select visual cards above to use them in other activities.'}
                </p>
              </div>
              <button
                type="button"
                onClick={resetAmivi}
                className="text-base font-bold text-black hover:text-black underline"
              >
                Start New AMIVI
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

              <button
                type="button"
                className="py-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 text-black rounded-2xl font-bold text-lg flex flex-col items-center justify-center gap-2 transition"
                onClick={() => setShowSaveModal(true)}
              >
                <CheckCircle2 size={24} className="text-emerald-500" />
                Save
              </button>

              <button
                type="button"
                className="py-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-black rounded-2xl font-bold text-lg flex flex-col items-center justify-center gap-2 transition"
                onClick={() => alert(`Sharing ${selectedChunks.size || result?.chunks?.length || 0} items...`)}
              >
                <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                  <span className="sr-only">Share</span>
                  ↗
                </div>
                Share
              </button>

              <button
                type="button"
                onClick={() => navigate('/quiz')}
                className="py-4 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 text-black rounded-2xl font-bold text-lg flex flex-col items-center justify-center gap-2 transition"
              >
                <span className="text-2xl">🧩</span>
                Quiz
              </button>

              <button
                type="button"
                onClick={() => navigate('/amico', { state: { sourceProjectId: result.project_id } })}
                disabled={!result?.project_id}
                title="Sends this completed AMIVI package (Key Points, slogans, visuals and explanations) straight to AMICO — nothing needs retyping."
                className="py-4 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 text-black disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-lg flex flex-col items-center justify-center gap-2 transition"
              >
                <span className="text-2xl">🎨</span>
                Send to AMICO
              </button>

              <button
                type="button"
                onClick={() => navigate('/analytics')}
                className="py-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 text-black rounded-2xl font-bold text-lg flex flex-col items-center justify-center gap-2 transition"
              >
                <span className="text-2xl">📈</span>
                Analytics
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ======================================================
          EDIT MODAL
      ======================================================= */}
      {editingChunk && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-black mb-4">Edit Micro-Bit</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-lg font-bold text-black mb-1">Text / Key Point</label>
                <textarea
                  value={editingChunk.text || ''}
                  onChange={(e) => setEditingChunk({...editingChunk, text: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl text-black text-lg"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-black mb-1">Slogan (Optional)</label>
                <input
                  type="text"
                  value={editingChunk.slogan || ''}
                  onChange={(e) => setEditingChunk({...editingChunk, slogan: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl text-black text-lg"
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-black mb-1">Description (Optional)</label>
                <textarea
                  value={editingChunk.description || ''}
                  onChange={(e) => setEditingChunk({...editingChunk, description: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl text-black text-lg"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingChunk(null)}
                  className="px-5 py-2.5 rounded-xl font-bold text-black bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          SAVE MODAL
      ======================================================= */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-black">Save to Library</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-black hover:text-black">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-lg font-bold text-black mb-2">1. Choose Library Space</label>
                <div className="grid grid-cols-3 gap-2">
                  {['personal', 'group', 'class'].map(space => (
                    <button
                      key={space}
                      onClick={() => setSaveSpace(space)}
                      className={`py-2 rounded-xl text-base font-bold capitalize border-2 transition-colors ${
                        saveSpace === space ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-black hover:border-emerald-300'
                      }`}
                    >
                      {space}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold text-black mb-2">2. Choose Subject Folder</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Science', 'History', 'Geography', 'Math', 'Languages', 'Uncategorized'].map(folder => (
                    <button
                      key={folder}
                      onClick={() => setSaveFolder(folder)}
                      className={`py-2 rounded-xl text-base font-bold border-2 transition-colors ${
                        saveFolder === folder ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-black hover:border-emerald-300'
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
                  alert(`Successfully saved ${selectedChunks.size || result?.chunks?.length || 0} visual cards to ${saveSpace} library under ${saveFolder}!`);
                  setShowSaveModal(false);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-2"
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