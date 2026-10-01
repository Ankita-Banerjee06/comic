import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button
        type="button"
        onClick={() => navigate('/explore')}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-5 sm:p-8" style={{ minHeight: 160, background: '#eef2ff' }}>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-600/10 border border-indigo-200 rounded-full px-4 py-1.5 text-xs font-bold mb-4 text-indigo-700">
            <Layers className="w-3.5 h-3.5" /> Essential Learning Quizzes
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2 tracking-tight text-slate-900">
            Generate Quiz
          </h1>
          <p className="text-slate-500 font-medium max-w-lg">
            Select an existing learning material deck to configure and generate your targeted quiz.
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
                  {deck.questions.length} Concepts
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-slate-900 text-lg mb-1.5 group-hover:text-indigo-700 transition-colors">{deck.name}</h3>
                <p className="text-sm text-slate-500 font-medium mb-4 leading-relaxed">{deck.description}</p>
                <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${deck.accent}`}>
                  Configure Quiz <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ESSENTIAL LEARNING */}
      <div className="text-center max-w-2xl mx-auto space-y-1">
        <p className="text-slate-500 font-medium">Focuses learning on what is genuinely important.</p>
        <p className="text-slate-500 font-medium">Key ideas, relationships and understanding replace unnecessary trivia.</p>
        <p className="text-slate-500 font-medium">Learners concentrate on knowledge worth remembering.</p>
      </div>

      {/* 4-Step Flowchart */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 bg-slate-50 py-6 rounded-2xl border border-slate-200">
        <div className="px-4 py-2 bg-indigo-100 rounded-xl shadow-sm border border-indigo-200 font-bold text-indigo-700">Identify</div>
        <ArrowRight className="w-5 h-5 text-slate-400 rotate-90 sm:rotate-0" />
        <div className="px-4 py-2 bg-cyan-100 rounded-xl shadow-sm border border-cyan-200 font-bold text-cyan-700">Understand</div>
        <ArrowRight className="w-5 h-5 text-slate-400 rotate-90 sm:rotate-0" />
        <div className="px-4 py-2 bg-amber-100 rounded-xl shadow-sm border border-amber-200 font-bold text-amber-700">Apply</div>
        <ArrowRight className="w-5 h-5 text-slate-400 rotate-90 sm:rotate-0" />
        <div className="px-4 py-2 bg-indigo-600 rounded-xl shadow-sm border border-indigo-600 font-bold text-white">Retain</div>
      </div>
    </div>
  );
}

function QuizConfig({ deck, onStart, onBack }) {
  const [qType, setQType] = useState('MCQ');
  const [qCount, setQCount] = useState('5');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [audience, setAudience] = useState('Individual');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      onStart();
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-indigo-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Materials
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Configure Quiz: {deck.name}</h2>
          <p className="text-slate-500 font-medium">Define your parameters before generating the quiz from this material.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Question Type</label>
            <select value={qType} onChange={e => setQType(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>MCQ</option>
              <option>True-False</option>
              <option>Mixed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Number of Questions</label>
            <select value={qCount} onChange={e => setQCount(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>5</option>
              <option>10</option>
              <option>Custom</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Difficulty Level</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Basic</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Audience</label>
            <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Individual</option>
              <option>Group</option>
              <option>Class</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white bg-gradient-to-r ${deck.accent} hover:shadow-lg transition-all ${isGenerating ? 'opacity-80' : ''}`}
        >
          {isGenerating ? 'Generating Quiz...' : 'Generate & Take Quiz'}
        </button>
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
    alert("Generating new questions based on the same Essential Learning concepts...");
    setIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const scorePercent = score / questions.length;
    let gaps = scorePercent === 1 ? "None! You mastered it." : "Review concepts from Question " + (questions.length - score);

    return (
      <div className="max-w-2xl mx-auto py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-indigo-50 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Quiz Complete</h2>
          <p className="text-slate-500 font-medium text-lg">
            Score: <span className="font-bold text-slate-900">{score}</span> / {questions.length}
          </p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
          <h3 className="text-red-800 font-bold mb-1">Identified Gaps</h3>
          <p className="text-red-600 font-medium">{gaps}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => alert("Taking you to AMIVI to reinforce these concepts...")}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all"
          >
            Reinforce
          </button>
          <button
            onClick={handleRestart}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md"
          >
            <RotateCcw className="w-4 h-4" /> Retake (New Questions)
          </button>
          <button
            onClick={() => alert("Comparing your results with the Group average...")}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all"
          >
            Compare
          </button>
          <button
            onClick={() => alert("Mastery recorded in your VLQ Analytics!")}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-sm bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all"
          >
            Mastery
          </button>
        </div>

        <div className="text-center pt-4 border-t border-slate-200">
          <button
            onClick={onExit}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Return to Materials
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
  const [isConfiguring, setIsConfiguring] = useState(false);

  if (!activeDeck) {
    return <DeckPicker onSelect={(deck) => { setActiveDeck(deck); setIsConfiguring(true); }} />;
  }

  if (isConfiguring) {
    return (
      <QuizConfig
        deck={activeDeck}
        onStart={() => setIsConfiguring(false)}
        onBack={() => setActiveDeck(null)}
      />
    );
  }

  return <QuizPlayer key={activeDeck.id} deck={activeDeck} onExit={() => setActiveDeck(null)} />;
}
