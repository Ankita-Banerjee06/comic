import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  Upload,
  Shuffle,
  RotateCcw,
  Home as HomeIcon,
  Archive,
  Clock,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import FileUpload from '../components/ui/FileUpload';
import {
  generateQuiz,
  mediaUrl,
  saveWrongAnswer,
  listWrongAnswers,
  deleteWrongAnswer,
} from '../services/api';

// ============================================================
// HELPERS
// ============================================================

const optionLabel = (idx) => String.fromCharCode(65 + idx);

// Fisher-Yates shuffle of a question's options, remapping the
// `correct` index to wherever the right option lands.
function shuffleQuestion(question) {
  const correctText = question.options[question.correct];
  const options = [...question.options];

  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return {
    ...question,
    options,
    correct: options.indexOf(correctText),
  };
}

// "3 days ago" / "2 months ago" / "1 year ago" — so a teacher
// coming back later can see how long something has been sitting
// in the Wrong Answers bank.
function timeAgo(isoString, t) {
  if (!isoString) return '';

  const diffMs = Date.now() - new Date(isoString).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return t('today');
  if (days === 1) return `1 ${t('day ago')}`;
  if (days < 30) return `${days} ${t('days ago')}`;

  const months = Math.floor(days / 30);
  if (months < 12) {
    return months === 1 ? `1 ${t('month ago')}` : `${months} ${t('months ago')}`;
  }

  const years = Math.floor(months / 12);
  return years === 1 ? `1 ${t('year ago')}` : `${years} ${t('years ago')}`;
}

export default function Quiz() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // --------------------------------------------------------
  // GENERATION FORM STATE
  // --------------------------------------------------------

  const [view, setView] = useState('setup'); // 'setup' | 'bank'
  const [inputMode, setInputMode] = useState('topic'); // 'topic' | 'material'
  const [topic, setTopic] = useState('');
  const [materialText, setMaterialText] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState(null);

  // --------------------------------------------------------
  // WRONG ANSWERS BANK STATE (persists on the server)
  // --------------------------------------------------------

  const [wrongBank, setWrongBank] = useState([]);
  const [isLoadingBank, setIsLoadingBank] = useState(false);
  const [bankError, setBankError] = useState(null);
  const [isBankSession, setIsBankSession] = useState(false);
  const [masteredBankIds, setMasteredBankIds] = useState([]);

  // --------------------------------------------------------
  // QUIZ PLAY STATE
  // --------------------------------------------------------

  const [quiz, setQuiz] = useState(null);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const [isRetake, setIsRetake] = useState(false);

  // ============================================================
  // WRONG ANSWERS BANK — LOAD / SAVE / RETAKE
  // ============================================================

  const fetchWrongBank = async () => {
    setIsLoadingBank(true);
    setBankError(null);

    try {
      const data = await listWrongAnswers();
      setWrongBank(data.items || []);
    } catch (err) {
      console.error('Failed to load wrong answers bank:', err);
      setBankError(err?.message || t('Failed to load wrong answers.'));
    } finally {
      setIsLoadingBank(false);
    }
  };

  // Load the bank (for the tab badge count) as soon as the page
  // opens, and again whenever a quiz run finishes.
  useEffect(() => {
    fetchWrongBank();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (finished) fetchWrongBank();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  // Once a Wrong Answers bank session finishes, remove every
  // question the teacher got right this time — they're mastered.
  useEffect(() => {
    if (!finished || !isBankSession || masteredBankIds.length === 0) return;

    const ids = masteredBankIds;
    setMasteredBankIds([]);

    Promise.all(ids.map((id) => deleteWrongAnswer(id).catch(() => {}))).then(
      fetchWrongBank
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished, isBankSession]);

  const startBankRetake = () => {
    if (!wrongBank.length) return;

    const questions = wrongBank.map((item) =>
      shuffleQuestion({
        q: item.q,
        options: item.options,
        correct: item.correct,
        explanation: item.explanation,
        image_id: item.image_id,
        image_url: item.image_url,
        video_id: item.video_id,
        video_url: item.video_url,
        _bankId: item.id,
      })
    );

    setQuiz({
      title: t('Wrong Answers Retake'),
      quizId: null,
      questions,
    });

    setIsBankSession(true);
    setIsRetake(true);
    setMasteredBankIds([]);
    setStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
    setWrongQuestions([]);
  };

  // ============================================================
  // GENERATE QUIZ
  // ============================================================

  const handleGenerateQuiz = async () => {
    setGenError(null);

    if (inputMode === 'topic' && !topic.trim()) {
      setGenError(t('Please enter a topic.'));
      return;
    }

    if (inputMode === 'material' && !materialText.trim() && !uploadedFile) {
      setGenError(t('Please paste or upload some material.'));
      return;
    }

    setIsGenerating(true);

    try {
      const data = await generateQuiz({
        mode: inputMode,
        topic,
        materialText,
        file: uploadedFile,
        numQuestions,
      });

      if (!data?.quiz?.questions?.length) {
        throw new Error(t('No quiz questions were generated.'));
      }

      setQuiz({ ...data.quiz, quizId: data.quiz_id || null });
      setIsRetake(false);
      setIsBankSession(false);
      setMasteredBankIds([]);
      setStarted(false);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setScore(0);
      setFinished(false);
      setWrongQuestions([]);
    } catch (err) {
      console.error('Quiz generation error:', err);
      setGenError(err?.message || t('Failed to generate quiz.'));
    } finally {
      setIsGenerating(false);
    }
  };

  const startNewQuiz = () => {
    setQuiz(null);
    setStarted(false);
    setFinished(false);
    setGenError(null);
    setView('setup');
  };

  // ============================================================
  // ANSWERING
  // ============================================================

  const q = quiz?.questions?.[currentQuestion];
  const isAnswered = selectedAnswer !== null;

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);

    if (idx !== q.correct) {
      setWrongQuestions((prev) => [...prev, q]);

      // Only persist it if it isn't already sitting in the bank
      // (a bank-session question already has one).
      if (!q._bankId) {
        saveWrongAnswer({
          quizId: quiz.quizId || null,
          quizTitle: quiz.title,
          q: q.q,
          options: q.options,
          correct: q.correct,
          explanation: q.explanation,
          imageId: q.image_id,
          videoId: q.video_id,
        }).catch((err) => console.error('Failed to save wrong answer:', err));
      }
    }
  };

  const handleNext = () => {
    if (selectedAnswer === q.correct) {
      setScore((s) => s + 1);

      if (isBankSession && q._bankId) {
        setMasteredBankIds((prev) => [...prev, q._bankId]);
      }
    }

    if (currentQuestion === quiz.questions.length - 1) {
      setFinished(true);
    } else {
      setSelectedAnswer(null);
      setCurrentQuestion((c) => c + 1);
    }
  };

  const retakeFullQuiz = () => {
    setStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
    setWrongQuestions([]);
    setMasteredBankIds([]);
    setIsRetake(false);
  };

  const retakeWrongAnswers = () => {
    const shuffled = wrongQuestions.map(shuffleQuestion);

    setQuiz({
      ...quiz,
      title: `${quiz.title} — ${t('Retake')}`,
      questions: shuffled,
    });

    setIsRetake(true);
    setMasteredBankIds([]);
    setStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
    setWrongQuestions([]);
  };

  // ============================================================
  // RENDER: GENERATION FORM
  // ============================================================

  if (!quiz) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200" style={{ minHeight: 240, background: '#f5f3ff' }}>
          <img
            src="/vlq-gen-quiz.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(100deg, rgba(49,27,110,0.85) 0%, rgba(49,27,110,0.55) 50%, rgba(49,27,110,0.15) 100%)' }}
          />
          <div className="relative z-10 p-8 sm:p-10 max-w-2xl">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4 text-white"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              QUIZ
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{t('Quiz')}</h1>
            <p className="text-white/90 font-medium max-w-xl">
              {t(
                'Pick a topic, or upload / paste your own learning material, and generate a quiz with pictures and answer explanations.'
              )}
            </p>
          </div>
        </div>

        {/* SECTION TABS: New Quiz / Wrong Answers Bank */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setView('setup')}
            className={`flex-1 py-4 rounded-3xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md ${
              view === 'setup'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-purple-600 border-2 border-purple-100 hover:bg-purple-50'
            }`}
          >
            <Sparkles size={20} />
            {t('New Quiz')}
          </button>
          <button
            type="button"
            onClick={() => setView('bank')}
            className={`flex-1 py-4 rounded-3xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md ${
              view === 'bank'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-orange-600 border-2 border-orange-100 hover:bg-orange-50'
            }`}
          >
            <Archive size={20} />
            {t('Wrong Answers')}
            {wrongBank.length > 0 && (
              <span
                className={`ml-1 px-2.5 py-0.5 rounded-full text-sm ${
                  view === 'bank' ? 'bg-white/25' : 'bg-orange-100 text-orange-700'
                }`}
              >
                {wrongBank.length}
              </span>
            )}
          </button>
        </div>

        {view === 'bank' ? (
          <div className="bg-white rounded-4xl border-2 border-orange-100 shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              📕 {t('Wrong Answers')}
            </h2>
            <p className="text-gray-500 font-bold mb-6">
              {t(
                'Every question missed across every quiz collects here and stays until it’s answered correctly — come back and retake it whenever, even months or a year from now.'
              )}
            </p>

            {isLoadingBank && (
              <p className="text-gray-500 font-bold text-center py-8">
                {t('Loading...')}
              </p>
            )}

            {bankError && (
              <p className="text-red-500 font-bold text-center py-4">{bankError}</p>
            )}

            {!isLoadingBank && !bankError && wrongBank.length === 0 && (
              <div className="text-center py-12">
                <span className="text-5xl block mb-4">🎉</span>
                <p className="text-gray-500 font-bold text-lg">
                  {t('No wrong answers stored. Nice work!')}
                </p>
              </div>
            )}

            {wrongBank.length > 0 && (
              <>
                <div className="space-y-3 mb-6 max-h-[420px] overflow-y-auto pr-1">
                  {wrongBank.map((item) => (
                    <div
                      key={item.id}
                      className="bg-orange-50 border-2 border-orange-100 rounded-2xl p-4 flex gap-4"
                    >
                      {item.image_url && (
                        <img
                          src={mediaUrl(item.image_url)}
                          alt={item.q}
                          className="w-20 h-20 object-cover rounded-xl border-2 border-orange-200 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        {item.quiz_title && (
                          <span className="inline-block text-xs font-bold text-orange-500 bg-orange-100 rounded-full px-3 py-1 mb-1">
                            {item.quiz_title}
                          </span>
                        )}
                        <p className="font-bold text-gray-800">{item.q}</p>
                        <p className="text-green-700 font-semibold text-sm mt-1">
                          ✅ {item.options?.[item.correct]}
                        </p>
                        <p className="text-gray-400 font-semibold text-xs mt-2 flex items-center gap-1">
                          <Clock size={12} />
                          {t('Added')} {timeAgo(item.created_at, t)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={startBankRetake}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl transition-all text-xl hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(249,115,22,0.4)] flex items-center justify-center gap-3 shadow-lg"
                >
                  <Shuffle className="w-6 h-6" />
                  {t('Retake All Wrong Answers')} ({wrongBank.length})
                </button>
              </>
            )}
          </div>
        ) : (
        <div className="bg-white rounded-4xl border-2 border-purple-100 shadow-xl p-8">
          {/* TABS */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setInputMode('topic')}
              className={`flex-1 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                inputMode === 'topic'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              }`}
            >
              <Sparkles size={20} />
              {t('Topic')}
            </button>
            <button
              type="button"
              onClick={() => setInputMode('material')}
              className={`flex-1 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                inputMode === 'material'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              }`}
            >
              <Upload size={20} />
              {t('Upload / Paste Material')}
            </button>
          </div>

          {inputMode === 'topic' ? (
            <div className="space-y-2 mb-6">
              <label className="block text-sm font-bold text-gray-700">
                {t('Topic')}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t(
                  'e.g. World Geography, Photosynthesis, The Solar System...'
                )}
                className="w-full p-5 bg-purple-50 border-2 border-purple-200 rounded-2xl text-gray-700 font-semibold focus:ring-4 focus:ring-purple-300 focus:border-purple-400 focus:outline-none text-lg transition-all"
              />
            </div>
          ) : (
            <div className="space-y-5 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('Paste Material')}
                </label>
                <textarea
                  value={materialText}
                  onChange={(e) => setMaterialText(e.target.value)}
                  placeholder={t('Paste the material to quiz on...')}
                  className="w-full min-h-[160px] p-5 bg-purple-50 border-2 border-purple-200 rounded-2xl text-gray-700 font-semibold resize-none focus:ring-4 focus:ring-purple-300 focus:border-purple-400 focus:outline-none text-lg transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {t('Or Upload a File')}
                </label>
                <FileUpload
                  accept=".pdf,.docx,.txt"
                  label={t('Upload learning material')}
                  onUpload={setUploadedFile}
                />
              </div>
            </div>
          )}

          {/* QUESTION COUNT */}
          <div className="flex items-center gap-3 mb-6">
            <span className="font-bold text-gray-700">{t('Questions')}:</span>
            {[5, 10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNumQuestions(n)}
                className={`px-5 py-2 rounded-xl font-bold transition-all ${
                  numQuestions === n
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={isGenerating}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all text-xl hover:scale-[1.02] hover:shadow-[0_10px_25px_rgba(124,58,237,0.4)] flex items-center justify-center gap-3 shadow-lg"
          >
            <BookOpen className="w-6 h-6" />
            {isGenerating ? t('Generating Quiz...') : t('Generate Quiz')} ✨
          </button>

          {genError && (
            <p className="text-red-500 mt-4 font-bold text-center whitespace-pre-wrap">
              {genError}
            </p>
          )}
        </div>
        )}
      </div>
    );
  }

  // ============================================================
  // RENDER: START SCREEN
  // ============================================================

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in-95 duration-500 py-12">
        <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-purple-400/40 animate-float">
          <span className="text-6xl">🧩</span>
        </div>
        <h1 className="text-5xl font-bold text-purple-700 mb-4">{t('Quiz')} Time! 🎉</h1>
        <p className="text-gray-600 font-bold text-xl max-w-md mb-8 leading-relaxed">
          {t('Test your knowledge on')} <strong className="text-purple-600">{quiz.title}</strong>.<br />
          {quiz.questions.length} {t('Question').toLowerCase()}s!
        </p>
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => setStarted(true)}
            className="px-10 py-5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-3xl text-2xl hover:scale-105 transition-transform shadow-[0_12px_30px_rgba(124,58,237,0.4)]"
          >
            🚀 {t('Start Quiz')}!
          </button>
        </div>
        <button
          onClick={startNewQuiz}
          className="text-sm font-bold text-purple-500 hover:text-purple-700 underline"
        >
          {t('Build a Different Quiz')}
        </button>
      </div>
    );
  }

  // ============================================================
  // RENDER: FINISHED SCREEN
  // ============================================================

  if (finished) {
    const percentage = Math.round((score / quiz.questions.length) * 100);

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in-95 duration-500 py-12">
        <div className="text-8xl mb-8 animate-float">
          {percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '💪'}
        </div>
        <h1 className="text-5xl font-bold text-purple-700 mb-4">
          {percentage >= 80 ? 'Amazing! 🎉' : percentage >= 60 ? 'Well Done! ⭐' : 'Keep Going! 💪'}
        </h1>
        <div className="bg-white rounded-4xl border-2 border-purple-200 shadow-lg p-8 mb-8 max-w-sm w-full">
          <div className={`text-6xl font-bold mb-2 ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-orange-600'}`}>
            {score}/{quiz.questions.length}
          </div>
          <div className="text-gray-600 font-bold text-xl">{percentage}% {t('Score')}</div>
          <div className="w-full h-4 bg-gray-100 rounded-full mt-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* MISSED QUESTIONS REVIEW */}
        {wrongQuestions.length > 0 && (
          <div className="bg-white rounded-4xl border-2 border-red-100 shadow-xl p-6 mb-8 max-w-xl w-full text-left">
            <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
              <XCircle size={20} />
              {t('Questions to Review')} ({wrongQuestions.length})
            </h3>
            <div className="space-y-3">
              {wrongQuestions.map((wq, i) => (
                <div key={i} className="bg-red-50 rounded-2xl p-4">
                  <p className="font-bold text-gray-800">{wq.q}</p>
                  <p className="text-green-700 font-semibold text-sm mt-1">
                    ✅ {wq.options[wq.correct]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center">
          {wrongQuestions.length > 0 && (
            <button
              onClick={retakeWrongAnswers}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-3xl text-lg hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
            >
              <Shuffle size={20} />
              {t('Retake Wrong Answers')}
            </button>
          )}
          <button
            onClick={retakeFullQuiz}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-3xl text-lg hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
          >
            <RotateCcw size={20} />
            {t('Retake Quiz')}
          </button>
          <button
            onClick={startNewQuiz}
            className="px-8 py-4 bg-white border-2 border-purple-300 text-purple-700 font-bold rounded-3xl text-lg hover:scale-105 transition-transform shadow-lg"
          >
            {t('New Quiz')}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-600 font-bold rounded-3xl text-lg hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
          >
            <HomeIcon size={18} />
            {t('Home')}
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: QUESTION
  // ============================================================

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-purple-100 text-purple-700 rounded-2xl px-5 py-2.5 font-bold text-lg">
          {isRetake && `🔀 ${t('Retake')} · `}
          {t('Question')} {currentQuestion + 1}/{quiz.questions.length}
        </div>
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-2xl px-5 py-2.5 font-bold text-lg shadow-lg">
          ⭐ {t('Score')}: {score}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-4 bg-purple-100 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700 shadow-md"
          style={{ width: `${(currentQuestion / quiz.questions.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-white rounded-4xl border-2 border-purple-100 shadow-lg p-8 mb-6">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight mb-5">
          {q.q}
        </h3>

        {q.image_url && (
          <img
            src={mediaUrl(q.image_url)}
            alt={q.q}
            className="w-full max-h-80 object-contain rounded-2xl border-2 border-purple-50"
          />
        )}
      </div>

      {/* Options */}
      <div className="space-y-4 mb-6">
        {q.options.map((opt, idx) => {
          let cls = 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-400 hover:bg-purple-50';
          if (isAnswered) {
            if (idx === q.correct) cls = 'bg-green-50 border-2 border-green-400 text-green-700';
            else if (idx === selectedAnswer) cls = 'bg-red-50 border-2 border-red-400 text-red-600';
            else cls = 'bg-gray-50 border-2 border-gray-200 text-gray-400 opacity-60';
          } else if (selectedAnswer === idx) {
            cls = 'bg-purple-50 border-2 border-purple-500 text-purple-700';
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left px-6 py-4 rounded-3xl transition-all duration-200 flex justify-between items-center ${cls} font-bold text-lg shadow-sm hover:shadow-md`}
            >
              <span className="flex items-center gap-4">
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-base shrink-0"
                  style={{
                    backgroundColor:
                      isAnswered && idx === q.correct
                        ? '#dcfce7'
                        : isAnswered && idx === selectedAnswer
                        ? '#fee2e2'
                        : '#f3e8ff',
                  }}
                >
                  {optionLabel(idx)}
                </span>
                {opt}
              </span>
              {isAnswered && idx === q.correct && <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />}
              {isAnswered && idx === selectedAnswer && idx !== q.correct && <XCircle className="w-6 h-6 text-red-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Explanation + Video + Next */}
      {isAnswered && (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
          <div className="p-6 bg-blue-50 rounded-3xl border-2 border-blue-200">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <h4 className="text-blue-800 font-bold mb-2 text-lg">{t('Explanation')}</h4>
                <p className="text-blue-700 font-semibold leading-relaxed">{q.explanation}</p>

                {q.video_url && (
                  <video
                    controls
                    className="w-full mt-4 rounded-2xl border-2 border-blue-200 bg-black"
                    src={mediaUrl(q.video_url)}
                  >
                    {t('Your browser does not support the video element.')}
                  </video>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center flex-wrap gap-3">
            <span className={`font-bold px-4 py-2 rounded-2xl ${selectedAnswer === q.correct ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {selectedAnswer === q.correct ? '✅ ' + t('Correct Answer') : '❌ ' + t('Wrong Answer')}
            </span>
            <button
              onClick={handleNext}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-3xl hover:scale-105 transition-transform shadow-lg flex items-center gap-2 text-lg"
            >
              {currentQuestion === quiz.questions.length - 1 ? '🏆 ' + t('Final Score') : t('Next') + ' →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
