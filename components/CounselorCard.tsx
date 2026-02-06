
import React from 'react';
import { Counselor } from '../types';

interface CounselorCardProps {
  counselor: Counselor;
  onSelect: (c: Counselor) => void;
}

const CounselorCard: React.FC<CounselorCardProps> = ({ counselor, onSelect }) => {
  return (
    <div 
      className="group cursor-pointer relative bg-white rounded-[40px] md:rounded-[64px] overflow-hidden border border-stone-100 hover:border-[#B87333]/30 transition-all duration-1000 hover:shadow-[0_40px_80px_-20px_rgba(184,115,51,0.12)] flex flex-col md:flex-row min-h-auto md:min-h-[580px] h-full"
      onClick={() => onSelect(counselor)}
    >
      {/* 肖像区 */}
      <div className="relative w-full md:w-[45%] aspect-[5/4] md:aspect-auto overflow-hidden bg-[#F9F8F6] shrink-0 border-r border-stone-50">
        <img 
          src={counselor.avatar} 
          alt={counselor.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[3s] ease-out"
        />
        {/* 左上角学历标签（红框对应处） */}
        <div className="absolute top-6 left-6 md:top-10 md:left-10">
          <span className="px-5 py-2 md:px-6 md:py-2.5 bg-[#1A1412]/90 backdrop-blur-2xl text-[9px] md:text-[11px] font-black text-white uppercase tracking-[0.25em] rounded-full shadow-2xl border border-white/5">
            {counselor.education || '资深专家'}
          </span>
        </div>
      </div>
      
      {/* 叙事区 */}
      <div className="flex-1 p-6 md:p-14 flex flex-col">
        <div className="flex justify-between items-start mb-6 md:mb-10">
          <div className="space-y-1.5 md:space-y-2">
            <h3 className="text-2xl md:text-4xl font-serif text-[#1A1412] tracking-tighter flex items-baseline gap-3 md:gap-4">
              {counselor.name}
              <span className="text-[10px] md:text-[11px] font-black text-[#B87333] uppercase tracking-[0.3em] font-sans">
                {counselor.title}
              </span>
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {counselor.specialties.map((s, i) => (
                <span key={i} className="text-[10px] md:text-[11px] text-stone-300 font-bold uppercase tracking-wider">#{s}</span>
              ))}
            </div>
          </div>
          <div className="text-right shrink-0 border-l border-stone-50 pl-4 md:pl-6">
            <span className="text-[8px] md:text-[9px] font-black text-stone-200 uppercase tracking-[0.4em] block mb-0.5 md:mb-1">Practice</span>
            <span className="text-xl md:text-2xl font-serif text-[#1A1412] italic">{counselor.experience}Y+</span>
          </div>
        </div>

        <div className="mb-6 md:mb-10 relative">
          <span className="absolute -top-4 -left-2 text-4xl text-[#B87333]/10 font-serif italic select-none">“</span>
          <p className="text-[14px] md:text-[16px] text-[#1A1412]/70 font-serif leading-relaxed italic pr-4 relative z-10">
            {counselor.bio}
          </p>
        </div>

        <div className="mb-8 md:mb-10 space-y-3 md:space-y-4 py-4 md:py-6 border-y border-stone-50">
           <span className="text-[8px] md:text-[9px] font-black text-[#B87333]/60 uppercase tracking-[0.6em] block">Training Background</span>
           <div className="grid grid-cols-1 gap-2">
              {counselor.training.slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#B87333]/30 mt-1.5 shrink-0"></div>
                  <span className="text-[11px] md:text-[12px] text-stone-400 font-medium leading-tight tracking-tight">{item}</span>
                </div>
              ))}
           </div>
        </div>

        {/* 底部动作区 */}
        <div className="mt-auto pt-6 flex items-end justify-between">
          <div className="space-y-0.5 md:space-y-1">
            <span className="text-[8px] md:text-[9px] font-black text-stone-300 uppercase tracking-[0.6em] block">Consultation Fee</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[#B87333] font-serif text-lg">¥</span>
              <span className="text-2xl md:text-4xl font-serif text-[#1A1412] tracking-tighter">{counselor.price}</span>
              <span className="text-[9px] text-stone-300 ml-1.5 font-bold uppercase tracking-widest">/ Session</span>
            </div>
          </div>
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#1A1412] text-white flex items-center justify-center group-hover:bg-[#B87333] group-hover:rotate-45 transition-all duration-700 shadow-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M7 17l10-10M7 7h10v10" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounselorCard;
