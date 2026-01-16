
import React from 'react';
import { UserProfile, Question, Category, QuizSettings, TimerMode } from '../types';
import { MOTIVATIONAL_QUOTES } from '../constants';
import { Flame, Award, X, Play, Clock, Settings2, Hash } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  categories: Category[];
  allQuestions: Question[];
  onSelectCategory: (catId: string, type: string | null, settings: QuizSettings) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, categories, allQuestions, onSelectCategory }) => {
  const [selectedCat, setSelectedCat] = React.useState<string | null>(null);
  const [selectedType, setSelectedType] = React.useState<string | null>(null);
  const [showConfig, setShowConfig] = React.useState(false);
  
  const [localSettings, setLocalSettings] = React.useState<QuizSettings>(() => {
    const saved = localStorage.getItem('gd_user_quiz_prefs');
    return saved ? JSON.parse(saved) : {
      questionsPerQuiz: 10,
      timerMode: 'per_question',
      timerValue: 30
    };
  });

  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  const getTypesForCategory = (catId: string) => {
    const questions = allQuestions.filter(q => q.category === catId);
    const types = new Set<string>();
    questions.forEach(q => {
      if (q.type) types.add(q.type);
    });
    return Array.from(types);
  };

  const handleCategoryStart = (catId: string) => {
    setSelectedCat(catId);
    setSelectedType(null);
    setShowConfig(true);
  };

  const startQuiz = () => {
    if (selectedCat) {
      localStorage.setItem('gd_user_quiz_prefs', JSON.stringify(localSettings));
      onSelectCategory(selectedCat, selectedType, localSettings);
      setShowConfig(false);
      setSelectedCat(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-[2rem] p-6 md:p-8 text-white shadow-xl">
        <h2 className="text-2xl md:text-3xl font-black">Namaste, {user.name}! 🙏</h2>
        <p className="mt-2 text-blue-100 italic text-sm md:text-lg max-w-2xl leading-snug">"{quote}"</p>
        <div className="flex flex-wrap gap-3 mt-6">
          <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 flex items-center gap-2 text-sm">
            <Flame className="text-orange-400" size={16} />
            <span className="font-bold">{user.streak} Day Streak</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 flex items-center gap-2 text-sm">
            <Award className="text-yellow-400" size={16} />
            <span className="font-bold">Rank #{user.rank}</span>
          </div>
        </div>
      </div>

      {/* Categories Grid - Optimized for Mobile */}
      <div>
        <h3 className="text-lg font-black text-slate-800 mb-4 px-1 uppercase tracking-wider">Practice Modules</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryStart(cat.id)}
              className="bg-white hover:bg-blue-50 p-5 md:p-6 rounded-3xl border border-slate-200 text-center transition-all group hover:border-blue-300 shadow-sm active:scale-95 flex flex-col items-center justify-center min-h-[140px]"
            >
              <div className="text-3xl md:text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <div className="font-bold text-slate-800 text-sm md:text-base leading-tight group-hover:text-blue-700">{cat.name}</div>
              <div className="text-[9px] text-slate-400 mt-2 uppercase font-black tracking-widest leading-none">
                {allQuestions.filter(q => q.category === cat.id).length} MCQs
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quiz Config Modal - Stabilized for Mobile */}
      {showConfig && selectedCat && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="bg-blue-700 p-5 md:p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <Settings2 className="text-blue-200" size={20} />
                <h3 className="text-lg font-black uppercase tracking-tight">Configuration</h3>
              </div>
              <button onClick={() => setShowConfig(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar">
              {/* Focus Topic */}
              {getTypesForCategory(selectedCat).length > 0 && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 ml-1">Focus Topic</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-blue-500 transition-all appearance-none"
                    value={selectedType || ''}
                    onChange={(e) => setSelectedType(e.target.value || null)}
                  >
                    <option value="">Full Category Mixed</option>
                    {getTypesForCategory(selectedCat).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Timer Mode */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 ml-1">Timer Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'Off', icon: <X size={16}/> },
                    { id: 'per_question', label: 'Per MCQ', icon: <Clock size={16}/> },
                    { id: 'total_quiz', label: 'Total', icon: <Hash size={16}/> },
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setLocalSettings({...localSettings, timerMode: mode.id as TimerMode, timerValue: mode.id === 'total_quiz' ? 10 : 30})}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                        localSettings.timerMode === mode.id 
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-sm' 
                          : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {mode.icon}
                      <span className="text-[10px] mt-1.5 uppercase font-black tracking-tighter">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer Value Slider - Stabilized height */}
              <div className="min-h-[70px]">
                {localSettings.timerMode !== 'none' && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {localSettings.timerMode === 'per_question' ? 'Seconds per question' : 'Total Quiz Minutes'}
                      </label>
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm">
                        {localSettings.timerValue} {localSettings.timerMode === 'per_question' ? 'SEC' : 'MIN'}
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min={localSettings.timerMode === 'per_question' ? 10 : 5} 
                      max={localSettings.timerMode === 'per_question' ? 120 : 60} 
                      step={localSettings.timerMode === 'per_question' ? 5 : 1}
                      value={localSettings.timerValue}
                      onChange={(e) => setLocalSettings({...localSettings, timerValue: parseInt(e.target.value)})}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                )}
              </div>

              {/* Question Count */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Count</label>
                  <span className="bg-slate-800 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm">{localSettings.questionsPerQuiz} MCQS</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  step="5"
                  value={localSettings.questionsPerQuiz}
                  onChange={(e) => setLocalSettings({...localSettings, questionsPerQuiz: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-slate-800"
                />
              </div>
            </div>

            <div className="p-6 md:p-8 pt-2 border-t border-slate-50 bg-white shrink-0">
              <button 
                onClick={startQuiz}
                className="w-full bg-blue-700 text-white py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-blue-800 transition-all active:scale-[0.98]"
              >
                <Play size={20} fill="currentColor" /> Let's Practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
