
import React from 'react';
import { Question, UserAnswer, QuizResult, QuizSettings } from '../types';
import { AlertCircle, ChevronLeft, ChevronRight, Flag, LayoutGrid, Timer } from 'lucide-react';

interface QuizEngineProps {
  category: string;
  type?: string | null;
  settings: QuizSettings;
  questionsPool: Question[];
  categories?: any[];
  onComplete: (result: QuizResult) => void;
  onExit: () => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({ category, type, settings, questionsPool, categories, onComplete, onExit }) => {
  const [questions] = React.useState(() => {
    let filtered = questionsPool.filter(q => q.category === category || category === 'all');
    if (type) filtered = filtered.filter(q => q.type === type);
    return [...filtered].sort(() => Math.random() - 0.5).slice(0, settings.questionsPerQuiz);
  });
  
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState<UserAnswer[]>([]);
  const [totalElapsed, setTotalElapsed] = React.useState(0);
  
  const [countdown, setCountdown] = React.useState(() => {
    if (settings.timerMode === 'per_question') return settings.timerValue;
    if (settings.timerMode === 'total_quiz') return settings.timerValue * 60;
    return 0;
  });

  const currentQuestion = questions[currentIdx];
  const activeAnswer = userAnswers.find(ua => ua.questionId === currentQuestion?.id);

  const [showConfirm, setShowConfirm] = React.useState(false);
  const [markedForReview, setMarkedForReview] = React.useState<Set<number>>(new Set());

  const isLastQuestion = currentIdx === questions.length - 1;

  React.useEffect(() => {
    const interval = setInterval(() => setTotalElapsed(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (settings.timerMode === 'none') return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (settings.timerMode === 'per_question') {
            if (isLastQuestion) { submitQuiz(); return 0; }
            else { handleNext(); return settings.timerValue; }
          } else {
            submitQuiz();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIdx, settings.timerMode, isLastQuestion]);

  React.useEffect(() => {
    if (settings.timerMode === 'per_question') {
      setCountdown(settings.timerValue);
    }
  }, [currentIdx, settings.timerMode, settings.timerValue]);

  const handleSelect = (optionIdx: number | null) => {
    const existingIdx = userAnswers.findIndex(ua => ua.questionId === currentQuestion.id);
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOption: optionIdx,
      timeTaken: 0
    };

    if (existingIdx >= 0) {
      const updated = [...userAnswers];
      updated[existingIdx] = newAnswer;
      setUserAnswers(updated);
    } else {
      setUserAnswers([...userAnswers, newAnswer]);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setShowConfirm(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const submitQuiz = () => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    questions.forEach(q => {
      const ans = userAnswers.find(ua => ua.questionId === q.id);
      if (!ans || ans.selectedOption === null) skipped++;
      else if (ans.selectedOption === q.correctAnswer) correct++;
      else wrong++;
    });

    onComplete({
      id: Math.random().toString(36).substr(2, 9),
      quizId: category,
      category,
      score: correct * 2,
      totalQuestions: questions.length,
      correctCount: correct,
      wrongCount: wrong,
      skippedCount: skipped,
      timeSpent: totalElapsed,
      date: new Date().toISOString(),
      answers: userAnswers,
      settings: settings
    });
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl border border-slate-200">
        <AlertCircle size={64} className="text-blue-500 mb-6" />
        <h3 className="text-2xl font-bold text-slate-800">No content available</h3>
        <button onClick={onExit} className="mt-8 bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg">Return Home</button>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const timerProgress = settings.timerMode === 'per_question' 
    ? (countdown / settings.timerValue) * 100 
    : settings.timerMode === 'total_quiz' 
      ? (countdown / (settings.timerValue * 60)) * 100 
      : 100;

  return (
    <div className="max-w-4xl mx-auto min-h-screen flex flex-col">
      {/* Fixed Height Header */}
      <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md pt-4 pb-2 px-4 shrink-0 h-[72px]">
        <div className="flex justify-between items-center bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-sm h-full">
          <button onClick={onExit} className="text-slate-500 hover:text-red-600 flex items-center gap-1 font-bold text-sm transition-colors">
            <ChevronLeft size={18} /> <span className="hidden sm:inline">Exit</span>
          </button>
          
          <div className="flex items-center gap-2">
            {settings.timerMode !== 'none' && (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border-2 transition-all ${
                countdown < 10 ? 'bg-red-500 border-red-700 text-white animate-pulse' : 'bg-white border-slate-100 text-blue-600'
              }`}>
                <Timer size={14} />
                <span className="font-mono font-black text-sm">{formatTime(countdown)}</span>
              </div>
            )}
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100 font-black text-xs">
              {currentIdx + 1} / {questions.length}
            </div>
          </div>

          <button 
            onClick={() => setShowConfirm(true)}
            className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-tight shadow-sm transition-all ${isLastQuestion ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-400'}`}
          >
            {isLastQuestion ? 'Finish' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Main Question Area - Optimized for scrolling on mobile */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden mb-6">
          {settings.timerMode !== 'none' && (
            <div className="w-full h-1.5 bg-slate-100">
              <div 
                className={`h-full transition-all duration-1000 ease-linear ${countdown < 10 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${timerProgress}%` }}
              />
            </div>
          )}

          <div className="p-6 md:p-10">
            <div className="mb-6 flex justify-between items-start gap-4">
              <h2 className="text-lg md:text-2xl font-black text-slate-800 leading-snug">
                {currentQuestion.question}
              </h2>
              {markedForReview.has(currentIdx) && <Flag className="text-yellow-500 shrink-0" fill="currentColor" size={20} />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`
                    p-4 md:p-5 text-left rounded-2xl border-2 transition-all group flex items-center gap-4
                    ${activeAnswer?.selectedOption === idx 
                      ? 'border-blue-600 bg-blue-50 shadow-sm' 
                      : 'border-slate-100 hover:border-blue-200 bg-white'}
                  `}
                >
                  <span className={`
                    shrink-0 w-10 h-10 flex items-center justify-center rounded-xl font-black
                    ${activeAnswer?.selectedOption === idx ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}
                  `}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className={`text-sm md:text-lg font-bold ${activeAnswer?.selectedOption === idx ? 'text-blue-900' : 'text-slate-700'}`}>
                    {option}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stabilized Footer - Fixed height prevents shifting */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 p-4 shrink-0 pb-safe">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-3">
          <button 
            onClick={() => {
              const newSet = new Set(markedForReview);
              if (newSet.has(currentIdx)) newSet.delete(currentIdx);
              else newSet.add(currentIdx);
              setMarkedForReview(newSet);
            }}
            className={`flex-1 md:flex-none px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-2 ${
              markedForReview.has(currentIdx) ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : 'bg-white border-slate-100 text-slate-400'
            }`}
          >
            <Flag size={14} fill={markedForReview.has(currentIdx) ? 'currentColor' : 'none'} />
            {markedForReview.has(currentIdx) ? 'Review List' : 'Mark Review'}
          </button>
          
          <div className="flex gap-2 flex-1 h-[56px]">
            <button 
              onClick={handlePrev} 
              disabled={currentIdx === 0} 
              className="w-16 flex items-center justify-center rounded-2xl bg-white border-2 border-slate-100 disabled:opacity-20 active:bg-slate-50 transition-colors"
            >
              <ChevronLeft />
            </button>
            <button 
              onClick={handleNext} 
              className="flex-1 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.1em] shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isLastQuestion ? 'Review All' : 'Next MCQ'}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutGrid size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Ready to finish?</h3>
            <p className="text-slate-500 font-medium mb-6">You've answered {userAnswers.filter(a => a.selectedOption !== null).length} of {questions.length} MCQs.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-400 active:bg-slate-50 transition-colors">Back</button>
              <button onClick={submitQuiz} className="flex-1 py-4 bg-blue-700 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
