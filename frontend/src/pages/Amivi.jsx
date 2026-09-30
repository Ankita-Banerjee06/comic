import FileUpload from '../components/ui/FileUpload';
import ProcessingAnimation from '../components/ui/ProcessingAnimation';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  generateAmivi,
  regenerateAmiviImage,
  editAmiviChunk,
  generateAmiviPhotoStory,
  getLibraryProject,
  API_URL,
} from '../services/api';

import {
  Sparkles,
  RefreshCw,
  Pencil,
  CheckCircle2,
  ArrowRight,
  Video,
  Maximize,
  X,
  Download,
  FileText,
  UploadCloud,
} from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';

export default function Amivi() {
  const [isProcessing, setIsProcessing] = useState(false);

  const [result, setResult] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [instructionInput, setInstructionInput] = useState('');
  const [error, setError] = useState(null);

  const [generateVideo, setGenerateVideo] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');

  const [fullscreenChunk, setFullscreenChunk] = useState(null);
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
    setFullscreenChunk(null);
    setMcqAnswers({});
    setPhotoStoryError(null);
  };

  const openFullscreen = (chunk, slot = 1) => {
    setFullscreenChunk({ ...chunk, __slot: slot });
  };

  const closeFullscreen = () => {
    setFullscreenChunk(null);
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

  // Whichever image is showing in the fullscreen viewer right now.
  const fullscreenImageUrl = fullscreenChunk
    ? fullscreenChunk.__slot === 2
      ? fullscreenChunk.image2_url
      : fullscreenChunk.image_url
    : null;

  // Escape key closes fullscreen viewer
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setFullscreenChunk(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, []);

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

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-gradient-to-br from-blue-50 via-white to-purple-50">

        <div className="w-full h-44 sm:h-56" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 100%)' }}>
          <img
            src="/vlq-amivi-card.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        <div className="p-6 sm:p-10 max-w-2xl">

          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4 text-blue-700"
            style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}
          >
            AMIVI
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
            AMIVI
          </h1>

          <p className="text-slate-600 font-medium max-w-xl">
            AMIVI converts complex information into clear visual learning. AMICO then converts that learning into creative engagement.
          </p>

        </div>

      </div>

      {/* ======================================================
          INPUT + VIDEO OUTPUT
      ======================================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEARNING MATERIAL — paste text OR upload a document */}

        <div className="bg-gradient-to-br from-blue-50/70 via-white to-white rounded-2xl border border-blue-100 border-t-4 border-t-blue-400 shadow-sm p-6 sm:p-8 flex flex-col">

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {t('Your Learning Material')}
            </h2>
          </div>

          <p className="text-slate-500 font-medium mb-6">
            Paste your educational text below, or upload a PDF, Word document or TXT file to fill it in for you.
          </p>

          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            readOnly={isProcessing || !!result}
            placeholder={t(
              'Paste your educational text here... e.g. Give this in 5 key points, and the pics should come with key points.'
            )}
            className={`w-full flex-1 min-h-[220px] p-5 bg-blue-50/60 border border-blue-200 rounded-2xl text-slate-700 font-medium resize-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:outline-none mb-5 text-lg transition-all ${(isProcessing || !!result) ? 'opacity-60 cursor-not-allowed' : ''}`}
          />

          {!isProcessing && !result && (
            <>
              {/* EXTRACTION INSTRUCTION */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-slate-700 mb-2">Extraction Instruction</label>
                <input
                  value={instructionInput}
                  onChange={(e) => setInstructionInput(e.target.value)}
                  placeholder="e.g. Give this in 5 key points"
                  className="w-full px-5 py-3 bg-white border border-blue-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all text-lg shadow-inner"
                />
              </div>

              {/* FILE UPLOAD */}

              <div className="bg-cyan-50 border-2 border-dashed border-cyan-200 rounded-2xl p-4 mb-5">

                <div className="flex items-center gap-2 mb-3">
                  <UploadCloud className="w-4 h-4 text-cyan-600" />
                  <p className="text-sm text-cyan-700 font-bold">
                    Or upload a document to fill in the text above
                  </p>
                </div>

                <FileUpload
                  accept=".pdf,.docx,.txt"
                  onUpload={handleUpload}
                />

                <p className="text-xs text-cyan-600/70 font-semibold mt-3">
                  Supported formats: PDF · DOCX · TXT
                </p>

              </div>

              {/* VIDEO OPTION */}

              <div className="flex items-center gap-3 mb-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">

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
                  className="font-bold text-amber-800 flex items-center gap-2 cursor-pointer"
                >
                  <Video className="w-5 h-5 text-amber-500" />
                  Generate educational video
                </label>

              </div>

              <button
                onClick={handleGenerate}
                disabled={
                  !textInput.trim() &&
                  !videoUrl.trim()
                }
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all text-lg hover:-translate-y-0.5 flex items-center justify-center gap-3 shadow-sm"
              >

                <Sparkles className="w-5 h-5" />

                {t('Generate AMIVI')}

              </button>

              {error && (
                <p className="text-red-500 mt-4 font-bold text-center whitespace-pre-wrap">
                  {error}
                </p>
              )}

            </>
          )}

          {result && !isProcessing && (
            <p className="text-sm text-slate-500 font-bold text-center mt-auto pt-2">
              ✅ Done! Click "Start Over" above to create another.
            </p>
          )}

        </div>


        {/* VIDEO OUTPUT */}

        <div className="bg-gradient-to-br from-indigo-50/70 via-white to-white rounded-2xl border border-indigo-100 border-t-4 border-t-indigo-400 shadow-sm p-6 sm:p-8 flex flex-col">

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <Video className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              {t('Your Images')}
            </h2>
          </div>

          <p className="text-slate-500 font-medium mb-6">
            {isProcessing
              ? 'Sit tight — your images are being generated.'
              : result
              ? 'Your images are ready! Scroll down to see your visual cards.'
              : 'Your generated images will appear here once you click Generate AMIVI.'}
          </p>

          <div className="flex-1 flex flex-col w-full h-full mt-4">
            {isProcessing ? (
              <div className="flex-1 flex items-center justify-center">
                <ProcessingAnimation title={`✨ ${t('Generating Images')}...`} />
              </div>
            ) : result && (result.chunks?.length > 0 || result.video_url) ? (
              <div className="flex flex-col flex-1 w-full">
                
                {result.chunks?.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-4 px-2">
                      <p className="text-slate-600 font-bold text-sm">Select cards to use below:</p>
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="px-3 py-1.5 bg-white border-2 border-indigo-200 text-indigo-600 text-sm font-bold rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        {selectedChunks.size === result.chunks.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className="flex flex-col gap-6 w-full max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                      {result.chunks.map((chunk, index) => (
                        <div
                          key={chunk.chunk_id || index}
                          className={`bg-white rounded-2xl border-2 shadow-sm relative w-full flex flex-col shrink-0 ${
                            selectedChunks.has(chunk.chunk_id) ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                            <div 
                              onClick={(e) => { e.stopPropagation(); toggleChunkSelection(chunk.chunk_id); }}
                              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center cursor-pointer shadow-sm transition-colors ${
                                selectedChunks.has(chunk.chunk_id) ? 'bg-indigo-500 border-indigo-500' : 'bg-white border-gray-300'
                              }`}
                            >
                              {selectedChunks.has(chunk.chunk_id) && <CheckCircle2 className="w-5 h-5 text-white" />}
                            </div>
                          </div>

                          <div className="relative bg-gray-100 rounded-t-2xl overflow-hidden shrink-0">
                            <div 
                              className="absolute -bottom-2 -left-2 z-20 w-10 h-10 bg-red-700 text-white font-extrabold flex items-center justify-center shadow-md drop-shadow-md"
                              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                            >
                              {index + 1}
                            </div>
                            <img
                              src={getMediaUrl(chunk.image_url)}
                              alt={chunk.text || `Chunk ${index + 1}`}
                              className="w-full object-cover cursor-pointer"
                              style={{ aspectRatio: '11.7/14.7' }}
                              onClick={() => openFullscreen(chunk, 1)}
                            />
                          </div>
                          <div className="p-4 sm:p-5 flex-1 flex items-center justify-center text-center">
                            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight tracking-tight">
                              {chunk.text || chunk.key_point || `Chunk ${index + 1}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {result.video_url && (
                  <div className="w-full mt-6 pt-6 border-t-2 border-indigo-100 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-bold text-slate-500 mb-3">This is the link of the video:</p>
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
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold rounded-2xl transition-colors shadow-lg flex-1 min-w-[200px]"
                      >
                        <Download size={18} />
                        Download
                      </button>
                    </div>
                  </div>
                )}
                
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                    <Video className="w-9 h-9 text-indigo-400" />
                  </div>
                  <p className="text-indigo-400 font-bold">No images generated yet</p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>


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
                className="text-sm font-bold text-green-100 hover:text-white underline"
              >
                {t('Start Over')}
              </button>

            </div>

          </div>




          {/* PHOTO STORY */}

          <div className="bg-gradient-to-br from-purple-50/60 via-white to-white rounded-2xl border border-purple-100 border-t-4 border-t-purple-300 shadow-sm p-5 sm:p-7">

            <div className="flex items-center justify-between gap-4 flex-wrap mb-5">

              <div>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  📖 {t('Photo Story')}
                </h3>
                <p className="text-sm text-gray-500 font-semibold mt-1">
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
                        className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold rounded-xl flex items-center gap-2 transition-colors text-sm"
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
                <h3 className="text-2xl font-bold text-slate-800 mb-1">What Next?</h3>
                <p className="text-slate-500 font-medium">
                  {selectedChunks.size > 0 
                    ? `${selectedChunks.size} card(s) selected.`
                    : 'Select visual cards above to use them in other activities.'}
                </p>
              </div>
              <button
                type="button"
                onClick={resetAmivi}
                className="text-sm font-bold text-slate-500 hover:text-slate-800 underline"
              >
                Start New AMIVI
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

              <button
                type="button"
                className="py-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 text-emerald-700 rounded-2xl font-bold text-base flex flex-col items-center justify-center gap-2 transition"
                onClick={() => setShowSaveModal(true)}
              >
                <CheckCircle2 size={24} className="text-emerald-500" />
                Save
              </button>

              <button
                type="button"
                className="py-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 text-blue-700 rounded-2xl font-bold text-base flex flex-col items-center justify-center gap-2 transition"
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
                className="py-4 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 text-amber-700 rounded-2xl font-bold text-base flex flex-col items-center justify-center gap-2 transition"
              >
                <span className="text-2xl">🧩</span>
                Quiz
              </button>

              <button
                type="button"
                onClick={() => navigate('/amico', { state: { sourceProjectId: result.project_id } })}
                disabled={!result?.project_id}
                className="py-4 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-base flex flex-col items-center justify-center gap-2 transition"
              >
                <span className="text-2xl">🎨</span>
                AMICO
              </button>

              <button
                type="button"
                onClick={() => navigate('/analytics')}
                className="py-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 text-purple-700 rounded-2xl font-bold text-base flex flex-col items-center justify-center gap-2 transition"
              >
                <span className="text-2xl">📈</span>
                Analytics
              </button>

            </div>

          </div>

        </div>

      )}


      {/* ======================================================
          FULLSCREEN VIEWER
      ======================================================= */}

      {fullscreenChunk && (

        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 md:p-8"
          onClick={closeFullscreen}
        >

          <div
            className="relative flex flex-col"
            style={{ width: 'min(100%, calc(85vh * (11.7 / 14.7)))', aspectRatio: '11.7/14.7' }}
            onClick={(event) => event.stopPropagation()}
          >
            {/* CLOSE */}
            <button
              type="button"
              onClick={closeFullscreen}
              className="absolute -top-4 -right-4 md:-top-6 md:-right-6 z-50 w-12 h-12 rounded-full bg-white text-gray-900 flex items-center justify-center transition-all hover:scale-110 shadow-2xl border border-gray-200"
              title="Close fullscreen"
              aria-label="Close fullscreen"
            >
              <X size={26} />
            </button>

            <div className="w-full h-full bg-white rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
              {/* LARGE IMAGE */}
              <div className="relative flex-1 min-h-0 bg-gray-100 flex flex-col items-center justify-center">
                {/* Red chunk number badge */}
                <div 
                  className="absolute bottom-0 left-0 z-20 px-3 py-1 sm:px-5 sm:py-2 bg-[#e3000f] text-white font-extrabold text-xl sm:text-2xl shadow-sm"
                  style={{ borderTopRightRadius: '16px' }}
                >
                  {fullscreenChunk.chunk_number || ''}
                </div>

                {fullscreenImageUrl ? (
                  <img
                    src={getMediaUrl(fullscreenImageUrl)}
                    alt={fullscreenChunk.text || 'AMIVI visual'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 font-bold text-xl">
                    Image unavailable
                  </div>
                )}
              </div>

              {/* CAPTION INFO */}
              <div className="bg-white px-6 py-5 sm:px-8 sm:py-8 flex items-center justify-center text-center shrink-0" style={{ minHeight: '15%' }}>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
                  {fullscreenChunk.text || fullscreenChunk.key_point || 'AMIVI Visual'}
                </h2>
              </div>
            </div>

            {/* DOWNLOAD BUTTON */}
            {fullscreenImageUrl && (
              <div className="mt-6 flex justify-center w-full">
                <button
                  type="button"
                  onClick={() =>
                    handleDownload(
                      getMediaUrl(fullscreenImageUrl),
                      `amivi-card-${fullscreenChunk.chunk_number || ''}${fullscreenChunk.__slot === 2 ? '-b' : ''}.png`
                    )
                  }
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/30 backdrop-blur-sm shadow-lg"
                >
                  <Download size={18} />
                  {t('Download Card Image')}
                </button>
              </div>
            )}

          </div>

        </div>

      )}

      {/* ======================================================
          EDIT MODAL
      ======================================================= */}
      {editingChunk && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Micro-Bit</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Text / Key Point</label>
                <textarea
                  value={editingChunk.text || ''}
                  onChange={(e) => setEditingChunk({...editingChunk, text: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Slogan (Optional)</label>
                <input
                  type="text"
                  value={editingChunk.slogan || ''}
                  onChange={(e) => setEditingChunk({...editingChunk, slogan: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={editingChunk.description || ''}
                  onChange={(e) => setEditingChunk({...editingChunk, description: e.target.value})}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingChunk(null)}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
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
              <h3 className="text-xl font-extrabold text-slate-800">Save to Library</h3>
              <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">1. Choose Library Space</label>
                <div className="grid grid-cols-3 gap-2">
                  {['personal', 'group', 'class'].map(space => (
                    <button
                      key={space}
                      onClick={() => setSaveSpace(space)}
                      className={`py-2 rounded-xl text-sm font-bold capitalize border-2 transition-colors ${
                        saveSpace === space ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-emerald-300'
                      }`}
                    >
                      {space}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">2. Choose Subject Folder</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Science', 'History', 'Geography', 'Math', 'Languages', 'Uncategorized'].map(folder => (
                    <button
                      key={folder}
                      onClick={() => setSaveFolder(folder)}
                      className={`py-2 rounded-xl text-sm font-bold border-2 transition-colors ${
                        saveFolder === folder ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-emerald-300'
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
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
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
        <div className="px-4 py-2 bg-slate-200 rounded-xl shadow-sm border border-slate-300 font-bold text-slate-700">Complexity</div>
        <ArrowRight className="w-5 h-5 text-slate-400 rotate-90 sm:rotate-0" />
        <div className="px-4 py-2 bg-blue-100 rounded-xl shadow-sm border border-blue-200 font-bold text-blue-700">Clarity</div>
        <ArrowRight className="w-5 h-5 text-slate-400 rotate-90 sm:rotate-0" />
        <div className="px-4 py-2 bg-pink-100 rounded-xl shadow-sm border border-pink-200 font-bold text-pink-700">Creativity</div>
        <ArrowRight className="w-5 h-5 text-slate-400 rotate-90 sm:rotate-0" />
        <div className="px-4 py-2 bg-purple-600 rounded-xl shadow-sm border border-purple-600 font-bold text-white">Mastery</div>
      </div>

    </div>
  );
}