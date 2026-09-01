import FileUpload from '../components/ui/FileUpload';
import ProcessingAnimation from '../components/ui/ProcessingAnimation';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  generateAmivi,
  regenerateAmiviImage,
  editAmiviChunk,
  getLibraryProject,
  API_URL,
} from '../services/api';

import {
  Sparkles,
  RefreshCw,
  Pencil,
  Save,
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
  const [error, setError] = useState(null);

  const [generateVideo, setGenerateVideo] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');

  const [fullscreenChunk, setFullscreenChunk] = useState(null);
  const [processingChunkId, setProcessingChunkId] = useState(null);
  const [editingChunk, setEditingChunk] = useState(null);

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
  };

  const openFullscreen = (chunk) => {
    setFullscreenChunk(chunk);
  };

  const closeFullscreen = () => {
    setFullscreenChunk(null);
  };

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

  const handleRegenerate = async (chunk) => {
    setProcessingChunkId(chunk.chunk_id);
    try {
      const data = await regenerateAmiviImage(chunk, language, result?.project_id);
      
      // Update result state with new image
      setResult(prev => ({
        ...prev,
        chunks: prev.chunks.map(c => 
          c.chunk_id === chunk.chunk_id 
            ? { ...c, image_id: data.image_id, image_url: data.image_url } 
            : c
        )
      }));
    } catch (err) {
      console.error('Regenerate image error:', err);
      alert('Failed to regenerate image.');
    } finally {
      setProcessingChunkId(null);
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

      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">

        <div className="w-full h-44 sm:h-56" style={{ background: '#eff6ff' }}>
          <img
            src="/vlq-amivi-card.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>

        <div className="p-8 sm:p-10 max-w-2xl">

          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4 text-blue-700"
            style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}
          >
            AMIVI
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3">
            {t('AMIVI')} Studio
          </h1>

          <p className="text-slate-600 font-medium max-w-xl">
            {t(
              'Transform large learning material or public video content into clear visual micro-bits with supporting images, explanations, narration and an optional educational video.'
            )}
          </p>

        </div>

      </div>

      {/* ======================================================
          INPUT
      ======================================================= */}

      {!isProcessing && !result && (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* TEXT INPUT */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col">

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {t('Your Learning Material')}
              </h2>
            </div>

            <p className="text-slate-500 font-medium mb-6">
              Paste a large educational paragraph,
              or use the video input on the right.
            </p>

            <textarea
              value={textInput}
              onChange={(e) =>
                setTextInput(e.target.value)
              }
              placeholder={t(
                'Paste your educational text here... e.g. Photosynthesis is the process by which plants convert sunlight into food...'
              )}
              className="w-full flex-1 min-h-[260px] p-5 bg-blue-50/60 border border-blue-200 rounded-2xl text-slate-700 font-medium resize-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 focus:outline-none mb-6 text-lg transition-all"
            />

            {/* VIDEO OPTION */}

            <div className="flex items-center gap-3 mb-5">

              <input
                id="generate-video"
                type="checkbox"
                checked={generateVideo}
                onChange={(e) =>
                  setGenerateVideo(
                    e.target.checked
                  )
                }
                className="w-5 h-5 accent-blue-600"
              />

              <label
                htmlFor="generate-video"
                className="font-bold text-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Video className="w-5 h-5 text-slate-400" />
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

          </div>


          {/* UPLOAD / VIDEO LINK */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col">

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <UploadCloud className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {t('Upload or Learn from Video')}
              </h2>
            </div>

            <p className="text-slate-500 font-medium mb-6">
              Upload a PDF, Word document or TXT file.
            </p>

            {/* FILE UPLOAD */}

            <div className="flex-1 flex items-center justify-center">

              <FileUpload
                accept=".pdf,.docx,.txt"
                onUpload={handleUpload}
              />

            </div>

            <p className="text-xs text-slate-400 font-semibold text-center mt-4">
              Supported formats: PDF · DOCX · TXT
            </p>

          </div>

        </div>

      )}


      {/* ======================================================
          PROCESSING
      ======================================================= */}

      {isProcessing && (

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12">

          <ProcessingAnimation
            title={`✨ ${t(
              'Creating Your Visuals'
            )}...`}
            subtitle={t(
              'OpenAI is breaking the material into learning chunks, generating supporting visuals, Piper is synthesizing voice, and MoviePy is rendering your video!'
            )}
          />

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

            <div className="flex items-center gap-4">

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


          {/* VIDEO */}

          {result.video_url && (

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7">

              <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
                <div className="flex items-center gap-3">
                  <Video className="text-blue-600" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      🎬 Educational Video
                    </h3>
                    <p className="text-sm text-gray-500 font-semibold">
                      Generated from the same visual micro-bits shown below.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(getMediaUrl(result.video_url), 'amivi-video.mp4')}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Download size={18} />
                  Download
                </button>
              </div>

              <div className="rounded-3xl overflow-hidden border-4 border-blue-200 shadow-lg bg-black aspect-video">

                <video
                  controls
                  className="w-full h-full object-contain"
                  src={getMediaUrl(
                    result.video_url
                  )}
                >
                  Your browser does not support
                  the video element.
                </video>

              </div>

            </div>

          )}


          {/* VISUAL MICRO BITS */}

          <div className="space-y-6">

            <div>

              <h3 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                🧠 Visual Micro-Bits
              </h3>

              <p className="text-gray-500 font-semibold mt-1">
                Each card represents one important
                learning idea. Click ⛶ for fullscreen.
              </p>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">

              {(result?.chunks || []).map(
                (chunk, index) => (

                  <div
                    key={
                      chunk.chunk_id ||
                      index
                    }
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all"
                  >

                    {/* IMAGE */}

                    <div className="relative bg-gray-100">

                      {chunk.image_url ? (

                        <img
                          src={getMediaUrl(
                            chunk.image_url
                          )}
                          alt={
                            chunk.text ||
                            `Chunk ${
                              index + 1
                            }`
                          }
                          className="w-full aspect-square object-cover"
                        />

                      ) : (

                        <div className="w-full aspect-square flex items-center justify-center text-gray-400 font-bold">
                          Image unavailable
                        </div>

                      )}

                      {/* NUMBER */}

                      <div className="absolute top-4 left-4 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg">
                        {index + 1}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openFullscreen(
                            chunk
                          )
                        }
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
                        title="View fullscreen"
                        aria-label="View visual fullscreen"
                      >
                        <Maximize size={18} />
                      </button>

                      {/* DOWNLOAD IMAGE */}
                      {chunk.image_url && (
                        <button
                          type="button"
                          onClick={() => handleDownload(getMediaUrl(chunk.image_url), `amivi-chunk-${index + 1}.png`)}
                          className="absolute top-16 right-4 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center shadow-lg transition-all hover:scale-110"
                          title="Download Image"
                          aria-label="Download Image"
                        >
                          <Download size={18} />
                        </button>
                      )}

                    </div>


                    {/* CONTENT */}

                    <div className="p-6">

                      <p className="text-xl font-bold text-gray-800">
                        {chunk.text ||
                          chunk.key_point ||
                          `Chunk ${
                            index + 1
                          }`}
                      </p>

                      {chunk.slogan && (

                        <p className="mt-3 text-orange-600 font-bold">
                          ✨ {chunk.slogan}
                        </p>

                      )}

                      {chunk.description && (

                        <p className="mt-4 text-gray-600 font-semibold leading-relaxed">
                          {chunk.description}
                        </p>

                      )}

                      {chunk.audio_url && (

                        <audio
                          controls
                          className="w-full mt-5"
                          src={getMediaUrl(
                            chunk.audio_url
                          )}
                        >
                          Your browser does not
                          support the audio element.
                        </audio>

                      )}

                      <div className="grid grid-cols-2 gap-3 mt-5">

                        <button
                          type="button"
                          onClick={() => setEditingChunk(chunk)}
                          disabled={processingChunkId === chunk.chunk_id}
                          className="py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold flex justify-center items-center gap-2 disabled:opacity-50 transition"
                          title="Edit text"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRegenerate(chunk)}
                          disabled={processingChunkId === chunk.chunk_id}
                          className="py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex justify-center items-center gap-2 disabled:opacity-50 transition"
                          title="Regenerate Image"
                        >
                          <RefreshCw size={16} className={processingChunkId === chunk.chunk_id ? "animate-spin" : ""} />
                          Regenerate
                        </button>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>


            {(!result?.chunks ||
              result.chunks.length === 0) && (

              <div className="bg-white rounded-2xl border border-red-100 p-8 text-center text-red-500 font-bold">
                No visual chunks were returned
                by the backend.
              </div>

            )}

          </div>


          {/* BOTTOM ACTIONS */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <button
              type="button"
              className="py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 opacity-70 cursor-not-allowed"
            >
              <Save size={20} />
              Save to Library
            </button>

            <button
              type="button"
              className="py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 opacity-70 cursor-not-allowed"
            >
              Send to AMICO
              <ArrowRight size={20} />
            </button>

            <button
              type="button"
              onClick={resetAmivi}
              className="py-4 bg-white border-2 border-blue-200 text-blue-700 rounded-2xl font-bold text-lg hover:bg-blue-50 transition"
            >
              Start New AMIVI
            </button>

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
            className="relative w-full h-full max-w-[1500px] max-h-[95vh] flex flex-col lg:flex-row gap-6 items-center justify-center"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE */}

            <button
              type="button"
              onClick={closeFullscreen}
              className="absolute top-2 right-2 lg:-top-3 lg:-right-3 z-50 w-12 h-12 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-all hover:scale-110 shadow-xl"
              title="Close fullscreen"
              aria-label="Close fullscreen"
            >

              <X size={26} />

            </button>


            {/* LARGE IMAGE */}

            <div className="flex-1 min-w-0 w-full h-full flex items-center justify-center">

              {fullscreenChunk.image_url ? (

                <img
                  src={getMediaUrl(
                    fullscreenChunk.image_url
                  )}
                  alt={
                    fullscreenChunk.text ||
                    'AMIVI visual'
                  }
                  className="max-w-full max-h-[82vh] lg:max-h-[92vh] object-contain rounded-2xl shadow-lg"
                />

              ) : (

                <div className="text-white font-bold text-xl">
                  Image unavailable
                </div>

              )}

            </div>


            {/* INFO PANEL */}

            <div className="w-full lg:w-[390px] max-h-[82vh] lg:max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-7 shadow-lg flex-shrink-0">

              <div className="flex items-center justify-between mb-4">

                <span className="px-4 py-2 rounded-full bg-red-500 text-white font-bold">
                  Chunk{' '}
                  {fullscreenChunk.chunk_number || ''}
                </span>

                <button
                  type="button"
                  onClick={closeFullscreen}
                  className="lg:hidden w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center"
                >
                  <X size={20} />
                </button>

              </div>


              <h2 className="text-2xl font-bold text-gray-800">
                {fullscreenChunk.text ||
                  fullscreenChunk.key_point ||
                  'AMIVI Visual'}
              </h2>


              {fullscreenChunk.slogan && (

                <p className="mt-4 text-orange-600 font-bold text-lg">
                  ✨{' '}
                  {fullscreenChunk.slogan}
                </p>

              )}


              {fullscreenChunk.description && (

                <p className="mt-5 text-gray-600 font-semibold leading-relaxed">
                  {fullscreenChunk.description}
                </p>

              )}


              {fullscreenChunk.audio_url && (

                <div className="mt-6">

                  <p className="text-sm font-bold text-gray-700 mb-2">
                    🔊 Narration
                  </p>

                  <audio
                    controls
                    className="w-full"
                    src={getMediaUrl(
                      fullscreenChunk.audio_url
                    )}
                  >
                    Your browser does not support
                    the audio element.
                  </audio>

                </div>

              )}

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

    </div>
  );
}