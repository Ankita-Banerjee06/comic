import { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, ChevronRight, BrainCircuit } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use dynamically generated quiz if passed via routing state and valid, else fallback to mock
  const passedQuiz = location.state?.quiz;
  const isValidPassedQuiz = passedQuiz && passedQuiz.title && passedQuiz.questions && Array.isArray(passedQuiz.questions);
  
  const quizData = isValidPassedQuiz ? passedQuiz : {
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

  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/20 rotate-3">
          <BrainCircuit className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Quiz Time!</h1>
        <p className="text-gray-400 max-w-md mb-8">Test your knowledge on <strong>{quizData.title}</strong>. You have 10 minutes to complete {quizData.questions.length} questions.</p>
        <button onClick={() => setStarted(true)} className="px-8 py-3 bg-white text-gray-950 font-bold rounded-xl hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          Start Quiz
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Quiz Complete!</h1>
        <p className="text-gray-400 max-w-md mb-2">You scored {score} out of {quizData.questions.length}.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-8 px-8 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const q = quizData.questions[currentQuestion];
  const isAnswered = selectedAnswer !== null;

  const handleNext = () => {
    if (selectedAnswer === q.correct) {
      setScore(s => s + 1);
    }
    
    if (currentQuestion === quizData.questions.length - 1) {
      setFinished(true);
    } else {
      setSelectedAnswer(null);
      setCurrentQuestion(c => c + 1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 animate-in fade-in slide-in-from-right-8 duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-xl font-bold text-gray-400">{quizData.title}</h2>
        <div className="flex items-center space-x-4">
          <span className="text-gray-500 font-medium">Question {currentQuestion + 1} of {quizData.questions.length}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-800 rounded-full mb-12 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 transition-all duration-500" style={{ width: `${((currentQuestion) / quizData.questions.length) * 100}%` }}></div>
      </div>

      {/* Question */}
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
        {q.q}
      </h3>

      {/* Options */}
      <div className="space-y-4 mb-8">
        {q.options.map((opt, idx) => {
          let stateClass = "bg-gray-900 border-gray-800 hover:border-gray-600 text-gray-300";
          if (isAnswered) {
            if (idx === q.correct) stateClass = "bg-emerald-900/30 border-emerald-500 text-emerald-400";
            else if (idx === selectedAnswer) stateClass = "bg-red-900/30 border-red-500 text-red-400";
            else stateClass = "bg-gray-900 border-gray-800 opacity-50";
          } else if (selectedAnswer === idx) {
            stateClass = "bg-cyan-900/30 border-cyan-500 text-cyan-400";
          }

          return (
            <button
              key={idx}
              disabled={isAnswered}
              onClick={() => setSelectedAnswer(idx)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex justify-between items-center ${stateClass}`}
            >
              <span className="font-medium text-lg">{opt}</span>
              {isAnswered && idx === q.correct && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              {isAnswered && idx === selectedAnswer && idx !== q.correct && <XCircle className="w-6 h-6 text-red-500" />}
            </button>
          );
        })}
      </div>

      {/* Actions & Explanation */}
      {isAnswered && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="p-6 bg-gray-800/50 rounded-2xl border border-gray-700 mb-8">
            <div className="flex items-start space-x-3">
              <HelpCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-bold mb-2">AI Explanation</h4>
                <p className="text-gray-300 leading-relaxed">{q.explanation}</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleNext} className="px-8 py-3 bg-white text-gray-950 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center group">
              {currentQuestion === quizData.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
