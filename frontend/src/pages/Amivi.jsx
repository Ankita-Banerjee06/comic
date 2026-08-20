import FileUpload from '../components/ui/FileUpload';
import ProcessingAnimation from '../components/ui/ProcessingAnimation';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  generateAmivi,
  generateAmiviQuiz,
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
} from 'lucide-react';

import { useLanguage } from '../contexts/LanguageContext';

export default function Amivi() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const [result, setResult] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState(null);

  const [generateVideo, setGenerateVideo] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');

  const [fullscreenChunk, setFullscreenChunk] = useState(null);

  const navigate = useNavigate();
  const { language, t } = useLanguage();

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

  // Allow Escape key to close the visual viewer.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setFullscreenChunk(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // ============================================================
  // GENERATE AMIVI
  // ============================================================

  const handleGenerate = async () => {
    if (!textInput.trim()) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateAmivi(
        textInput,
        language,
        generateVideo
      );

      setResult(data);
    } catch (err) {
      console.error('AMIVI generation error:', err);

      setError(
        err?.message ||
          'Failed to generate AMIVI content.'
      );
    } finally {
      setIsProcessing(false);
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
  // QUIZ
  // ============================================================

  const handleGenerateQuiz = async () => {
    setIsGeneratingQuiz(true);

    try {
      const quizData = await generateAmiviQuiz(
        textInput,
        language
      );

      if (
        quizData &&
        quizData.quiz
      ) {
        navigate('/quiz', {
          state: {
            quiz: quizData.quiz,
          },
        });
      } else {
        throw new Error(
          'Invalid quiz data returned.'
        );
      }
    } catch (err) {
      console.error(
        'Quiz generation failed:',
        err
      );

      alert(
        'Failed to generate quiz. Please try again.'
      );
    } finally {
      setIsGeneratingQuiz(false);
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

      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-4xl p-8 shadow-2xl relative overflow-hidden">

        <div className="absolute top-0 right-0 text-[100px] opacity-10 leading-none select-none pointer-events-none">
          🎨
        </div>

        <div className="relative z-10">

          <div className="flex items-center gap-3 mb-3">

            <span className="text-5xl">
              🎨
            </span>

            <div>

              <h1 className="text-4xl font-black">
                {t('AMIVI')} Studio
              </h1>

              <p className="text-blue-100 font-bold text-lg">
                {t(
                  'SEE IT. Transform text into amazing visuals!'
                )}{' '}
                ✨
              </p>

            </div>

          </div>

          <p className="text-blue-100 font-semibold max-w-3xl">
            Transform large learning material into
            meaningful visual micro-bits with
            supporting images, explanations,
            narration and an optional educational video.
          </p>

        </div>

      </div>


      {/* ======================================================
          INPUT SECTION
      ======================================================= */}

      {!isProcessing && !result && (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ==================================================
              TEXT INPUT
          =================================================== */}

          <div className="bg-white rounded-4xl border-2 border-blue-100 shadow-xl p-8 flex flex-col">

            <h2 className="text-2xl font-black text-gray-800 mb-2">
              📝 {t('Your Learning Material')}
            </h2>

            <p className="text-gray-500 font-bold mb-6">
              Paste a large educational paragraph.
              AMIVI will break it into meaningful
              learning chunks and create supporting
              visuals for each concept.
            </p>

            <textarea
              value={textInput}
              onChange={(e) =>
                setTextInput(e.target.value)
              }
              placeholder={t(
                'Paste your educational text here... e.g. Photosynthesis is the process by which plants convert sunlight into food...'
              )}
              className="w-full flex-1 min-h-[260px] p-5 bg-blue-50 border-2 border-blue-200 rounded-2xl text-gray-700 font-semibold resize-none focus:ring-4 focus:ring-blue-300 focus:border-blue-400 focus:outline-none mb-6 text-lg transition-all"
            />

            {/* Video option */}

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
                className="font-bold text-gray-700 flex items-center gap-2 cursor-pointer"
              >
                <Video className="w-5 h-5" />
                Generate educational video
              </label>

            </div>

            <button
              onClick={handleGenerate}
              disabled={!textInput.trim()}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl transition-all text-xl hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(59,130,246,0.4)] flex items-center justify-center gap-3 shadow-lg"
            >

              <Sparkles className="w-6 h-6" />

              {t('Generate AMIVI')} ✨

            </button>

            {error && (
              <p className="text-red-500 mt-4 font-bold text-center whitespace-pre-wrap">
                {error}
              </p>
            )}

          </div>


          {/* ==================================================
              UPLOAD / VIDEO LINK
          =================================================== */}

          <div className="bg-white rounded-4xl border-2 border-purple-100 shadow-xl p-8 flex flex-col">

            <h2 className="text-2xl font-black text-gray-800 mb-2">
              📄 {t('Or Upload a File')}
            </h2>

            <p className="text-gray-500 font-bold mb-6">
              Upload a PDF, Word document or text
              file and AMIVI will extract the material.
            </p>

            <div className="flex-1 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity">

              <FileUpload
                accept=".pdf,.docx,.txt"
                onUpload={handleUpload}
              />

            </div>

            {/* Video link */}

            <div className="mt-8">

              <label
                htmlFor="video-link"
                className="font-black text-gray-800"
              >
                🎥 Video Link
              </label>

              <input
                id="video-link"
                type="url"
                value={videoUrl}
                onChange={(e) =>
                  setVideoUrl(e.target.value)
                }
                placeholder="Paste a video link"
                className="w-full mt-2 p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-200"
              />

              <p className="text-xs text-gray-400 mt-2">
                Video-link extraction can be connected
                to the backend next.
              </p>

            </div>

          </div>

        </div>

      )}


      {/* ======================================================
          PROCESSING
      ======================================================= */}

      {isProcessing && (

        <div className="bg-white rounded-4xl border-2 border-blue-100 shadow-xl p-12">

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

          {/* ==================================================
              SUCCESS BANNER
          =================================================== */}

          <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-4xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl">

            <div className="flex items-center gap-4">

              <span className="text-4xl">
                🎉
              </span>

              <div>

                <p className="font-black text-xl">
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
                onClick={handleGenerateQuiz}
                disabled={isGeneratingQuiz}
                className="px-6 py-3 bg-white text-green-700 font-black rounded-2xl hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg"
              >
                🧩{' '}
                {isGeneratingQuiz
                  ? 'Generating Quiz...'
                  : t(
                      'Take Quiz on this Topic'
                    )}
              </button>

              <button
                onClick={resetAmivi}
                className="text-sm font-bold text-green-100 hover:text-white underline"
              >
                {t('Start Over')}
              </button>

            </div>

          </div>


          {/* ==================================================
              EDUCATIONAL VIDEO
          =================================================== */}

          {result.video_url && (

            <div className="bg-white rounded-4xl border-2 border-blue-100 shadow-xl p-7">

              <div className="flex items-center gap-3 mb-5">

                <Video className="text-blue-600" />

                <div>

                  <h3 className="text-2xl font-black text-gray-800">
                    🎬 Educational Video
                  </h3>

                  <p className="text-sm text-gray-500 font-semibold">
                    Generated from the same visual
                    micro-bits shown below.
                  </p>

                </div>

              </div>

              <div className="rounded-3xl overflow-hidden border-4 border-blue-200 shadow-2xl bg-black aspect-video">

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


          {/* ==================================================
              VISUAL MICRO-BITS
          =================================================== */}

          <div className="space-y-6">

            <div>

              <h3 className="text-3xl font-black text-gray-800 flex items-center gap-2">
                🧠 Visual Micro-Bits
              </h3>

              <p className="text-gray-500 font-semibold mt-1">
                Each card represents one important
                learning idea from the original material.
                Click ⛶ to view a visual in fullscreen.
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
                    className="bg-white rounded-3xl border-2 border-orange-100 shadow-lg overflow-hidden hover:shadow-2xl transition-all"
                  >

                    {/* ==================================================
                        IMAGE
                    =================================================== */}

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


                      {/* Chunk number */}

                      <div className="absolute top-4 left-4 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black shadow-lg">
                        {index + 1}
                      </div>


                      {/* Fullscreen */}

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
                        <Maximize
                          size={18}
                        />
                      </button>

                    </div>


                    {/* ==================================================
                        CONTENT
                    =================================================== */}

                    <div className="p-6">

                      <p className="text-xl font-black text-gray-800">
                        {chunk.text ||
                          chunk.key_point ||
                          `Chunk ${
                            index + 1
                          }`}
                      </p>


                      {/* Slogan */}

                      {chunk.slogan && (

                        <p className="mt-3 text-orange-600 font-black">
                          ✨ {chunk.slogan}
                        </p>

                      )}


                      {/* Description */}

                      {chunk.description && (

                        <p className="mt-4 text-gray-600 font-semibold leading-relaxed">
                          {chunk.description}
                        </p>

                      )}


                      {/* Audio */}

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


                      {/* Action buttons */}

                      <div className="grid grid-cols-2 gap-3 mt-5">

                        <button
                          type="button"
                          className="py-2.5 rounded-xl bg-orange-50 text-orange-700 font-bold flex justify-center items-center gap-2 opacity-70 cursor-not-allowed"
                          title="Editing will be added next"
                        >
                          <Pencil
                            size={16}
                          />
                          Edit
                        </button>

                        <button
                          type="button"
                          className="py-2.5 rounded-xl bg-blue-50 text-blue-700 font-bold flex justify-center items-center gap-2 opacity-70 cursor-not-allowed"
                          title="Image regeneration will be added next"
                        >
                          <RefreshCw
                            size={16}
                          />
                          Regenerate
                        </button>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>


            {/* No chunks */}

            {(!result?.chunks ||
              result.chunks.length === 0) && (

              <div className="bg-white rounded-3xl border-2 border-red-100 p-8 text-center text-red-500 font-bold">
                No visual chunks were returned
                by the backend.
              </div>

            )}

          </div>


          {/* ==================================================
              BOTTOM ACTIONS
          =================================================== */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <button
              type="button"
              className="py-4 bg-gray-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 opacity-70 cursor-not-allowed"
              title="Library save will be added next"
            >
              <Save size={20} />
              Save to Library
            </button>


            <button
              type="button"
              className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 opacity-70 cursor-not-allowed"
              title="AMIVI to AMICO connection will be added next"
            >
              Send to AMICO
              <ArrowRight size={20} />
            </button>


            <button
              type="button"
              onClick={resetAmivi}
              className="py-4 bg-white border-2 border-blue-200 text-blue-700 rounded-2xl font-black text-lg hover:bg-blue-50 transition"
            >
              Start New AMIVI
            </button>

          </div>

        </div>

      )}


      {/* ======================================================
          FULLSCREEN VISUAL VIEWER
      ======================================================= */}

      {fullscreenChunk && (

        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center p-4 md:p-8"
          onClick={closeFullscreen}
        >

          {/* Viewer container */}

          <div
            className="relative w-full h-full max-w-[1500px] max-h-[95vh] flex flex-col lg:flex-row gap-6 items-center justify-center"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Close button */}

            <button
              type="button"
              onClick={closeFullscreen}
              className="absolute top-2 right-2 lg:-top-3 lg:-right-3 z-50 w-12 h-12 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-all hover:scale-110 shadow-xl"
              title="Close fullscreen"
              aria-label="Close fullscreen"
            >
              <X size={26} />
            </button>


            {/* ==================================================
                LARGE IMAGE
            =================================================== */}

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
                  className="max-w-full max-h-[82vh] lg:max-h-[92vh] object-contain rounded-2xl shadow-2xl"
                />

              ) : (

                <div className="text-white font-bold text-xl">
                  Image unavailable
                </div>

              )}

            </div>


            {/* ==================================================
                INFORMATION PANEL
            =================================================== */}

            <div className="w-full lg:w-[390px] max-h-[82vh] lg:max-h-[90vh] overflow-y-auto bg-white rounded-3xl p-7 shadow-2xl flex-shrink-0">

              {/* Number */}

              <div className="flex items-center justify-between mb-4">

                <span className="px-4 py-2 rounded-full bg-red-500 text-white font-black">
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


              {/* Text */}

              <h2 className="text-2xl font-black text-gray-800">
                {fullscreenChunk.text ||
                  fullscreenChunk.key_point ||
                  'AMIVI Visual'}
              </h2>


              {/* Slogan */}

              {fullscreenChunk.slogan && (

                <p className="mt-4 text-orange-600 font-black text-lg">
                  ✨{' '}
                  {fullscreenChunk.slogan}
                </p>

              )}


              {/* Description */}

              {fullscreenChunk.description && (

                <p className="mt-5 text-gray-600 font-semibold leading-relaxed">
                  {fullscreenChunk.description}
                </p>

              )}


              {/* Audio */}

              {fullscreenChunk.audio_url && (

                <div className="mt-6">

                  <p className="text-sm font-black text-gray-700 mb-2">
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

    </div>
  );
}