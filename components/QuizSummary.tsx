
import React from 'react';
import { QuizResult, Question, AIAnalysisReport } from '../types';
import { analyzePerformance } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Trophy, RefreshCcw, LayoutDashboard, Search, AlertCircle, CheckCircle2, XCircle, BrainCircuit, Sparkles, X, Check, Target } from 'lucide-react';

interface QuizSummaryProps {
  result: QuizResult;
  questionsPool: Question[];
  onRetry: () => void;
  onBack: () => void;
}

export const QuizSummary: React.FC<QuizSummaryProps> = ({ result, questionsPool, onRetry, onBack }) => {
  const [showReview, setShowReview] = React.useState(false);
  const [analysis, setAnalysis] = React.useState<AIAnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const data = [
    { name: 'Correct', value: result.correctCount, color: '#10b981' },
    { name: 'Wrong', value: result.wrongCount, color: '#ef4444' },
    { name: 'Skipped', value: result.skippedCount, color: '#94a3b8' },
  ];

  const accuracy = Math.round((result.correctCount / result.totalQuestions) * 100);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    const relevantQuestions = questionsPool.filter(q => q.category === result.category || result.category === 'all');
    const report = await analyzePerformance(relevantQuestions, result.answers);
    setAnalysis(report);
    setIsAnalyzing(false);
  };

  if (showReview) {
    const relevantQuestions = questionsPool.filter(q => q.category === result.category || result.category === 'all').slice(0, result.totalQuestions);

    return (
      <div className="space-y-4 animate-in slide-in-from-right-10 duration-500 max-w-4xl mx-auto pb-24 px-4">
        <div className="flex justify-between items-center bg-white p-5 md:p-6 rounded-[2rem] border border-slate-200 sticky top-4 z-10 shadow-lg">
          <h3 className="text-lg font-black text-slate-800">Answer Review</h3>
          <button onClick={() => setShowReview(false)} className="bg-slate-900 text-white px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Close</button>
        </div>
        
        <div className="space-y-4">
          {relevantQuestions.map((q, idx) => {
            const userAns = result.answers.find(a => a.questionId === q.id);
            const isCorrect = userAns?.selectedOption === q.correctAnswer;
            const isSkipped = userAns?.selectedOption === null || userAns?.selectedOption === undefined;

            return (
              <div key={q.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm transition-all hover:border-blue-200">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${isCorrect ? 'bg-green-600 text-white' : isSkipped ? 'bg-slate-100 text-slate-400' : 'bg-red-500 text-white'}`}>
                      {idx + 1}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {idx + 1}</span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-800 leading-snug">{q.question}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {q.options.map((opt, i) => {
                      const isUserChoice = userAns?.selectedOption === i;
                      const isTheCorrectAns = q.correctAnswer === i;

                      return (
                        <div 
                          key={i} 
                          className={`p-4 rounded-2xl border-2 text-sm font-bold flex items-center justify-between transition-all ${
                            isTheCorrectAns 
                              ? 'bg-green-50 border-green-500 text-green-900 ring-2 ring-green-100 shadow-sm' 
                              : isUserChoice && !isCorrect 
                                ? 'bg-red-50 border-red-500 text-red-900' 
                                : 'bg-slate-50 border-slate-100 text-slate-500'
                          }`}
                        >
                          <span className="flex items-center gap-3 pr-2">
                            <span className={`shrink-0 w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${isTheCorrectAns ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="leading-tight">{opt}</span>
                          </span>
                          
                          {isTheCorrectAns && (
                            <div className="shrink-0 flex items-center gap-1.5 bg-green-200 text-green-800 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                              <Target size={12} /> Correct
                            </div>
                          )}
                          {isUserChoice && !isCorrect && (
                            <div className="shrink-0 flex items-center gap-1.5 bg-red-200 text-red-800 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                              <XCircle size={12} /> Yours
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-blue-50/70 p-5 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-2 text-blue-800 font-black text-[10px] uppercase tracking-widest">
                       <Sparkles size={14} className="text-blue-500" /> Explanation
                    </div>
                    <p className="text-blue-900 text-sm leading-relaxed font-medium">{q.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20 px-4">
      <div className="text-center pt-8">
        <div className="inline-block p-4 bg-yellow-100 text-yellow-600 rounded-full mb-4 animate-bounce">
          <Trophy size={48} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Session Over</h2>
        <p className="text-slate-500 font-bold text-sm tracking-wide">Analysis generated on {new Date(result.date).toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col items-center justify-center text-center">
          <div className="relative w-48 h-48 mb-6">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                   {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-4xl font-black text-slate-800">{accuracy}%</span>
               <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Accuracy</span>
             </div>
          </div>
          <div className="grid grid-cols-3 gap-6 w-full pt-6 border-t border-slate-100">
             <div>
               <div className="text-2xl font-black text-green-600">{result.correctCount}</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">CORRECT</div>
             </div>
             <div>
               <div className="text-2xl font-black text-red-500">{result.wrongCount}</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">WRONG</div>
             </div>
             <div>
               <div className="text-2xl font-black text-slate-500">{result.skippedCount}</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">SKIPPED</div>
             </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl flex flex-col justify-center gap-6">
           <div className="space-y-4">
               <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                 <span className="text-slate-600 font-bold uppercase text-xs tracking-widest">Total Points</span>
                 <span className="text-2xl font-black text-blue-700">{result.score}</span>
               </div>
               <div className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                 <span className="text-slate-600 font-bold uppercase text-xs tracking-widest">Time Invested</span>
                 <span className="text-xl font-black text-slate-800">{Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s</span>
               </div>
           </div>
           
           <button 
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 rounded-2xl font-black shadow-lg hover:shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
           >
             {isAnalyzing ? (
               <><BrainCircuit className="animate-spin" size={20} /> Decoding...</>
             ) : (
               <><BrainCircuit size={20} /> AI Diagnostic Report</>
             )}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
         <button onClick={() => setShowReview(true)} className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-5 rounded-2xl font-black text-slate-700 hover:bg-slate-50 transition-all active:scale-95">
           <Search size={20} /> Review Answers
         </button>
         <button onClick={onRetry} className="flex items-center justify-center gap-2 bg-white border border-slate-200 py-5 rounded-2xl font-black text-slate-700 hover:bg-slate-50 transition-all active:scale-95">
           <RefreshCcw size={20} /> Retake Quiz
         </button>
         <button onClick={onBack} className="flex items-center justify-center gap-2 bg-blue-700 py-5 rounded-2xl font-black text-white hover:bg-blue-800 transition-all active:scale-95 shadow-xl">
           <LayoutDashboard size={20} /> Back Home
         </button>
      </div>

      {/* AI Analysis Modal Improvements */}
      {analysis && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-blue-700 p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <Sparkles className="text-yellow-400" />
                <h3 className="text-lg font-black uppercase tracking-tight">AI Diagnostic</h3>
              </div>
              <button onClick={() => setAnalysis(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <Check className="text-green-500" size={14} /> Mastered
                  </h4>
                  {analysis.strengths.map((s, i) => (
                    <div key={i} className="bg-green-50 p-4 rounded-2xl text-xs font-bold text-green-800 border border-green-100">{s}</div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <AlertCircle className="text-red-500" size={14} /> Knowledge Gaps
                  </h4>
                  {analysis.weaknesses.map((w, i) => (
                    <div key={i} className="bg-red-50 p-4 rounded-2xl text-xs font-bold text-red-800 border border-red-100">{w}</div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Behavioral Patterns</h4>
                <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                  <p className="text-sm text-blue-900 leading-relaxed font-bold mb-4">"{analysis.timeManagement}"</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.patterns.map((p, i) => (
                      <span key={i} className="bg-white px-3 py-1.5 rounded-full text-[10px] font-black text-blue-700 border border-blue-200">{p}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-6 rounded-[2rem] text-center shadow-xl">
                <p className="font-black text-blue-400 mb-2 text-[10px] uppercase tracking-widest">Mentor's Verdict</p>
                <p className="text-lg font-bold leading-relaxed italic">"{analysis.motivationalMessage}"</p>
              </div>
            </div>
            
            <div className="p-6 md:p-8 pt-4 border-t border-slate-50 shrink-0">
              <button onClick={() => setAnalysis(null)} className="w-full bg-blue-700 text-white py-4 rounded-2xl font-black shadow-lg">CONTINUE STUDYING</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
