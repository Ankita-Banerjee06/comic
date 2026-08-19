import { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, ChevronRight, BrainCircuit } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const passedQuiz = location.state?.quiz;
  const isValidPassedQuiz = passedQuiz && passedQuiz.title && passedQuiz.questions && Array.isArray(passedQuiz.questions);

  const fallbackQuizEn = {
    title: "Photosynthesis Masterclass",
    questions: [
      {
        q: "What is the primary function of chlorophyll in photosynthesis?",
        options: [
          "To absorb water from the soil",
          "To capture light energy from the sun",
          "To convert glucose into ATP",
          "To release oxygen into the atmosphere"
        ],
        correct: 1,
        explanation: "Chlorophyll is the green pigment in plants that absorbs light energy, primarily in the blue and red wavelengths, which is necessary to drive the photosynthesis process."
      }
    ]
  };

  const fallbackQuizEs = {
    title: "Clase Magistral de Fotosíntesis",
    questions: [
      {
        q: "¿Cuál es la función principal de la clorofila en la fotosíntesis?",
        options: [
          "Absorber agua del suelo",
          "Capturar energía luminosa del sol",
          "Convertir glucosa en ATP",
          "Liberar oxígeno a la atmósfera"
        ],
        correct: 1,
        explanation: "La clorofila es el pigmento verde de las plantas que absorbe la energía luminosa, principalmente en las longitudes de onda azul y roja, lo cual es necesario para impulsar el proceso de fotosíntesis."
      }
    ]
  };

  const fallbackQuiz = language === 'es' ? fallbackQuizEs : fallbackQuizEn;
  const quizData = isValidPassedQuiz ? passedQuiz : fallbackQuiz;

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in-95 duration-500 py-12">
        <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-purple-400/40 animate-float">
          <span className="text-6xl">🧩</span>
        </div>
        <h1 className="text-5xl font-black text-purple-700 mb-4">{t('Quiz')} Time! 🎉</h1>
        <p className="text-gray-600 font-bold text-xl max-w-md mb-8 leading-relaxed">
          {t('Test your knowledge on')} <strong className="text-purple-600">{quizData.title}</strong>.<br />
          {quizData.questions.length} {t('Question').toLowerCase()}s!
        </p>
        <div className="flex gap-4 justify-center mb-8">
          {['⭐ Earn Points', '🏆 Win Badges', '🔥 Keep Streak'].map((t) => (
            <div key={t} className="bg-purple-100 text-purple-700 rounded-2xl px-4 py-2 font-black text-sm">{t}</div>
          ))}
        </div>
        <button
          onClick={() => setStarted(true)}
          className="px-10 py-5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black rounded-3xl text-2xl hover:scale-105 transition-transform shadow-[0_12px_30px_rgba(124,58,237,0.4)]"
        >
          🚀 {t('Start Quiz')}!
        </button>
      </div>
    );
  }

  if (finished) {
    const percentage = Math.round((score / quizData.questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in-95 duration-500 py-12">
        <div className="text-8xl mb-8 animate-float">
          {percentage >= 80 ? '🏆' : percentage >= 60 ? '⭐' : '💪'}
        </div>
        <h1 className="text-5xl font-black text-purple-700 mb-4">
          {percentage >= 80 ? 'Amazing! 🎉' : percentage >= 60 ? 'Well Done! ⭐' : 'Keep Going! 💪'}
        </h1>
        <div className="bg-white rounded-4xl border-2 border-purple-200 shadow-2xl p-8 mb-8 max-w-sm">
          <div className={`text-6xl font-black mb-2 ${percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-orange-600'}`}>
            {score}/{quizData.questions.length}
          </div>
          <div className="text-gray-600 font-bold text-xl">{percentage}% {t('Score')}</div>
          <div className="w-full h-4 bg-gray-100 rounded-full mt-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => { setStarted(false); setCurrentQuestion(0); setScore(0); setSelectedAnswer(null); setFinished(false); }}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black rounded-3xl text-lg hover:scale-105 transition-transform shadow-lg"
          >
            🔄 {t('Retake Quiz')}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-white border-2 border-purple-300 text-purple-700 font-black rounded-3xl text-lg hover:scale-105 transition-transform shadow-lg"
          >
            🏠 {t('Home')}
          </button>
        </div>
      </div>
    );
  }

  const q = quizData.questions[currentQuestion];
  const isAnswered = selectedAnswer !== null;

  const handleNext = () => {
    if (selectedAnswer === q.correct) setScore(s => s + 1);
    if (currentQuestion === quizData.questions.length - 1) {
      setFinished(true);
    } else {
      setSelectedAnswer(null);
      setCurrentQuestion(c => c + 1);
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="bg-purple-100 text-purple-700 rounded-2xl px-5 py-2.5 font-black text-lg">
          {t('Question')} {currentQuestion + 1}/{quizData.questions.length}
        </div>
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-2xl px-5 py-2.5 font-black text-lg shadow-lg">
          ⭐ {t('Score')}: {score}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-4 bg-purple-100 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700 shadow-md"
          style={{ width: `${((currentQuestion) / quizData.questions.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-white rounded-4xl border-2 border-purple-100 shadow-2xl p-8 mb-6">
        <h3 className="text-2xl md:text-3xl font-black text-gray-800 leading-tight">
          {q.q}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-4 mb-6">
        {q.options.map((opt, idx) => {
          let cls = "bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-400 hover:bg-purple-50";
          if (isAnswered) {
            if (idx === q.correct) cls = "bg-green-50 border-2 border-green-400 text-green-700";
            else if (idx === selectedAnswer) cls = "bg-red-50 border-2 border-red-400 text-red-600";
            else cls = "bg-gray-50 border-2 border-gray-200 text-gray-400 opacity-60";
          } else if (selectedAnswer === idx) {
            cls = "bg-purple-50 border-2 border-purple-500 text-purple-700";
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => setSelectedAnswer(idx)}
              className={`w-full text-left px-6 py-4 rounded-3xl transition-all duration-200 flex justify-between items-center ${cls} font-bold text-lg shadow-sm hover:shadow-md`}
            >
              <span className="flex items-center gap-4">
                <span className="w-9 h-9 rounded-full bg-current/10 flex items-center justify-center font-black text-base shrink-0" style={{ backgroundColor: isAnswered && idx === q.correct ? '#dcfce7' : isAnswered && idx === selectedAnswer ? '#fee2e2' : '#f3e8ff', color: 'currentColor' }}>
                  {optionLabels[idx]}
                </span>
                {opt}
              </span>
              {isAnswered && idx === q.correct && <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />}
              {isAnswered && idx === selectedAnswer && idx !== q.correct && <XCircle className="w-6 h-6 text-red-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Explanation + Next */}
      {isAnswered && (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
          <div className="p-6 bg-blue-50 rounded-3xl border-2 border-blue-200">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="text-blue-800 font-black mb-2 text-lg">{t('Explanation')}</h4>
                <p className="text-blue-700 font-semibold leading-relaxed">{q.explanation}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className={`font-black px-4 py-2 rounded-2xl ${selectedAnswer === q.correct ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {selectedAnswer === q.correct ? '✅ ' + t('Correct Answer') : '❌ ' + t('Wrong Answer')}
            </span>
            <button
              onClick={handleNext}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-black rounded-3xl hover:scale-105 transition-transform shadow-lg flex items-center gap-2 text-lg"
            >
              {currentQuestion === quizData.questions.length - 1 ? '🏆 ' + t('Final Score') : t('Next') + ' →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
