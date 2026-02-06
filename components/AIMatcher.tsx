
import React, { useState } from 'react';
import { getAIAssistance } from '../services/geminiService';
import { MatchingResult } from '../types';

interface AIMatcherProps {
  onMatched: (result: MatchingResult) => void;
}

const AIMatcher: React.FC<AIMatcherProps> = ({ onMatched }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMatch = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const result = await getAIAssistance(input);
    if (result) onMatched(result);
    setLoading(false);
  };

  const isEnabled = input.trim() && !loading;

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* 栏头新增人文感言 */}
      <div className="mb-8 md:mb-12 text-center space-y-3">
        <h4 className="text-xl md:text-3xl font-serif text-[#1A1412]/80 tracking-widest italic animate-in fade-in duration-1000">
          “专业的尽头，是温厚的人文理解。”
        </h4>
        <div className="w-12 h-[1px] bg-[#B87333]/30 mx-auto"></div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-4 md:-inset-8 bg-[#B87333]/5 rounded-[40px] md:rounded-[80px] blur-2xl md:blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-1000"></div>
        
        <div className="relative bg-white rounded-[32px] md:rounded-[56px] border border-stone-100 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 md:p-12">
            <div className="relative mb-6 md:mb-8">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此写下您的困扰。无需逻辑，只需流动..."
                className="w-full h-[160px] md:h-[220px] p-6 md:p-8 bg-[#F9F8F6] rounded-[24px] md:rounded-[28px] border border-stone-200/60 focus:bg-white focus:border-[#B87333]/40 text-[#1A1412] placeholder-stone-300 outline-none resize-none font-serif text-base md:text-xl leading-[1.8] transition-all"
              />
              
              <div className="absolute bottom-4 right-6 flex items-center gap-2 opacity-30">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#B87333]">Input Mindscape</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3 self-start md:self-center">
                <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center border border-stone-100">
                  <div className={`w-1 h-1 bg-[#B87333] rounded-full ${loading ? 'animate-pulse' : ''}`}></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-[#1A1412] uppercase tracking-[0.2em]">Resonance Engine</span>
                  <span className="text-[7px] text-stone-300 uppercase tracking-[0.1em] font-bold">SECURED</span>
                </div>
              </div>
              
              <button
                onClick={handleMatch}
                disabled={!isEnabled}
                className={`w-full md:w-auto relative px-10 py-4 rounded-full font-bold transition-all active:scale-95 ${
                  isEnabled 
                    ? 'bg-[#B87333] text-white shadow-lg' 
                    : 'bg-[#1A1412] text-white opacity-20'
                }`}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  <span className="text-[9px] tracking-[0.4em] uppercase">
                    {loading ? "正在解析..." : "开启匹配"}
                  </span>
                  {!loading && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMatcher;
