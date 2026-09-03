import { useState } from 'react';
import { MapPin, Stethoscope, ArrowLeft, ArrowRight, ExternalLink, RotateCcw, Trophy, Layers } from 'lucide-react';
import indiaQuestions from '../data/quizDecks/india.json';
import medicalQuestions from '../data/quizDecks/medical.json';

const DECKS = [
  {
    id: 'india',
    name: 'The India Quiz',
    description: 'Geography, history, culture and famous firsts — how well do you know India?',
    icon: MapPin,
    questions: indiaQuestions,
    banner: 'bg-cyan-400 text-slate-900',
    option: 'bg-cyan-400 text-slate-900',
    tint: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    accent: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'medical',
    name: 'Medical Quiz',
    description: 'Anatomy, specialists, vital signs and medical terms — test your medical knowledge.',
    icon: Stethoscope,
    questions: medicalQuestions,
    banner: 'bg-yellow-300 text-slate-900',
    option: 'bg-yellow-300 text-slate-900',
    tint: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    accent: 'from-amber-500 to-orange-600',
  },
];

function DeckPicker({ onSelect }) {
  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-8" style={{ minHeight: 160, background: '#eef2ff' }}>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-200 rounded-full px-4 py-1.5 text-xs font-bold mb-4 text-indigo-700">
            <Layers className="w-3.5 h-3.5" /> {DECKS.length} quiz decks
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight text-slate-900">
            Quiz Decks
          </h1>
          <p className="text-slate-500 font-medium max-w-lg">
            Click-through picture quizzes — pick a deck, choose your answer, and see the explanation instantly.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {DECKS.map(deck => {
          const Icon = deck.icon;
          return (
            <button
              key={deck.id}
              onClick={() => onSelect(deck)}
              className="text-left bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
            >
              <div className={`h-32 ${deck.tint} flex items-center justify-center relative`}>
                <Icon className={`w-14 h-14 ${deck.iconColor}`} />
                <div className="absolute top-3 right-3 bg-white/90 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                  {deck.questions.length} questions
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-slate-900 text-lg mb-1.5 group-hover:text-indigo-700 transition-colors">{deck.name}</h3>
                <p className="text-sm text-slate-500 font-medium mb-4 leading-relaxed">{deck.description}</p>
                <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${deck.accent}`}>
                  Start Quiz <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuizPlayer({ deck, onExit }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const questions = deck.questions;
  const q = questions[index];
  const answered = selected !== null;

  const handleSelect = (i) => {
    if (answered) return;
    setSelected(i);
    if (i === q.correctIndex) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex(i => i + 1);
    setSelected(null);
  };

  const handleRestart = () => {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 mx-auto rounded-full bg-indigo-50 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Quiz complete!</h2>
        <p className="text-slate-500 font-medium">
          You scored <span className="font-bold text-slate-900">{score}</span> out of <span className="font-bold text-slate-900">{questions.length}</span> on {deck.name}.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Play again
          </button>
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
          >
            Back to decks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to decks
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400">Question {index + 1} of {questions.length}</span>
          <span className="text-xs font-bold text-indigo-600">Score: {score}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${deck.accent} transition-all duration-500`}
          style={{ width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="p-6 md:p-8 space-y-6">
          {/* Banner */}
          <div className={`${deck.banner} rounded-xl px-6 py-4 text-center font-extrabold text-lg md:text-xl`}>
            {q.question}
          </div>

          {/* Options */}
          <div className={`grid gap-3 ${q.options.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}`}>
            {q.options.map((opt, i) => {
              let cls = deck.option;
              if (answered) {
                if (i === q.correctIndex) cls = 'bg-green-600 text-white';
                else if (i === selected) cls = 'bg-red-600 text-white';
                else cls = 'bg-slate-100 text-slate-400';
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                  className={`${cls} rounded-xl px-4 py-3.5 font-bold text-sm md:text-base text-center transition-all ${!answered ? 'hover:-translate-y-0.5 hover:shadow-md cursor-pointer' : 'cursor-default'}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Image */}
          {q.image && (
            <div className="flex justify-center">
              <img
                src={q.image}
                alt=""
                className="max-h-72 w-auto rounded-xl border border-slate-200 shadow-sm object-contain"
              />
            </div>
          )}

          {/* Prompt / Explanation */}
          {!answered ? (
            <div className="bg-yellow-100 text-slate-800 text-center font-bold text-sm rounded-xl px-4 py-3">
              Click the box with the correct answer choice
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 animate-in fade-in duration-300">
              {q.explainImage && (
                <div className="flex justify-center">
                  <img
                    src={q.explainImage}
                    alt=""
                    className="max-h-56 w-auto rounded-lg border border-slate-200 object-contain"
                  />
                </div>
              )}
              {q.explanation && (
                <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-line text-center">
                  {q.explanation}
                </p>
              )}
              {q.videoUrl && (
                <div className="flex justify-center">
                  <a
                    href={q.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" /> Click to view
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer nav */}
        {answered && (
          <div className="border-t border-slate-100 px-6 md:px-8 py-4 flex justify-end">
            <button
              onClick={handleNext}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${deck.accent} hover:-translate-y-0.5 transition-all`}
            >
              {index + 1 >= questions.length ? 'See results' : 'Next question'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuizDecks() {
  const [activeDeck, setActiveDeck] = useState(null);

  if (!activeDeck) {
    return <DeckPicker onSelect={setActiveDeck} />;
  }

  return <QuizPlayer key={activeDeck.id} deck={activeDeck} onExit={() => setActiveDeck(null)} />;
}
