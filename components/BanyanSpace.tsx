
import React, { useState, useEffect } from 'react';
import { SPACE_ITEMS } from '../constants';

const BanyanSpace: React.FC = () => {
  const [activeTab, setActiveTab] = useState('全部');
  const tabs = ['全部', '咨询感悟', '深度科普', '关系洞察'];

  useEffect(() => {
    const handleSetTab = (e: any) => {
      if (tabs.includes(e.detail)) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener('setSpaceTab', handleSetTab);
    return () => window.removeEventListener('setSpaceTab', handleSetTab);
  }, []);

  const handleOpenPortal = () => {
    window.dispatchEvent(new CustomEvent('togglePractitionerPortal'));
  };

  const filteredItems = activeTab === '全部' 
    ? SPACE_ITEMS 
    : SPACE_ITEMS.filter(item => item.category === activeTab);

  return (
    <section id="space" className="py-32 md:py-48 bg-[#FDFBF9]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-12">
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <span className="text-[11px] text-[#B87333] font-black uppercase tracking-[0.8em]">The Resonance</span>
              <div className="w-12 h-[1px] bg-[#B87333]/30"></div>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-6xl md:text-8xl font-serif text-[#1A1412] tracking-tighter italic leading-none">
                潜流之上
              </h3>
              <p className="text-xl md:text-3xl font-serif text-[#1A1412]/60 tracking-[0.1em] leading-snug">
                思绪的锚点 
                <span 
                  onDoubleClick={handleOpenPortal}
                  className="text-[#B87333]/40 mx-2 cursor-pointer hover:text-[#B87333] transition-colors"
                  title="双击进入专业工作台"
                >·</span> 
                行动的罗盘
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-x-12 gap-y-6 items-center border-b border-stone-100 pb-4">
            {tabs.map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col items-center transition-all duration-500 group ${activeTab === tab ? 'text-[#1A1412]' : 'text-stone-300 hover:text-stone-500'}`}
              >
                <span className={`text-[13px] font-bold tracking-widest ${activeTab === tab ? 'scale-110' : ''} transition-transform`}>{tab}</span>
                <div className={`h-1 w-4 bg-[#B87333] mt-2 rounded-full transition-all duration-700 ${activeTab === tab ? 'opacity-100 scale-x-150' : 'opacity-0 scale-x-0'}`}></div>
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-16 md:gap-x-12">
            <div className="md:col-span-7 group cursor-pointer">
              <div className="relative aspect-[16/11] rounded-[48px] md:rounded-[56px] overflow-hidden mb-8 border border-stone-100 shadow-sm">
                <img 
                  src={filteredItems[0].coverImage} 
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2s] ease-out" 
                  alt={filteredItems[0].title} 
                />
                <div className="absolute top-8 left-8 bg-white/80 backdrop-blur px-4 py-1.5 rounded-full">
                  <span className="text-[10px] font-black text-[#B87333] uppercase tracking-[0.3em]">{filteredItems[0].category}</span>
                </div>
              </div>
              <div className="space-y-4 pr-12">
                <div className="flex items-center gap-4 text-stone-300 text-[10px] font-bold tracking-widest uppercase">
                  <span>By {filteredItems[0].authorName}</span>
                  <div className="w-1 h-1 bg-stone-200 rounded-full"></div>
                  <span>{filteredItems[0].date}</span>
                </div>
                <h4 className="text-3xl font-serif text-[#1A1412] group-hover:text-[#B87333] transition-colors leading-tight tracking-tighter">
                  {filteredItems[0].title}
                </h4>
                <p className="text-[14px] text-stone-400 font-serif leading-relaxed line-clamp-2 italic">
                  “{filteredItems[0].excerpt}”
                </p>
              </div>
            </div>

            <div className="md:col-span-5 flex flex-col gap-16 md:pt-12">
              {filteredItems.slice(1, 3).map((item) => (
                <div key={item.id} className="group cursor-pointer flex gap-6 items-start">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-[28px] md:rounded-[32px] overflow-hidden border border-stone-100">
                    <img 
                      src={item.coverImage} 
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s]" 
                      alt={item.title} 
                    />
                  </div>
                  <div className="space-y-2 py-1 flex-1">
                    <span className="text-[8px] font-black text-[#B87333] uppercase tracking-[0.4em]">{item.category}</span>
                    <h4 className="text-[16px] font-bold text-[#1A1412] group-hover:text-[#B87333] transition-colors leading-tight tracking-tight">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-stone-400 font-medium line-clamp-2 leading-relaxed italic">
                      {item.excerpt}
                    </p>
                  </div>
                </div>
              ))}
              <div className="mt-auto border-t border-stone-100 pt-8">
                <button className="group flex items-center gap-4 text-[9px] font-black text-[#1A1412] uppercase tracking-[0.4em] hover:text-[#B87333] transition-all">
                  <span>Explore All Insights</span>
                  <div className="w-8 h-[1px] bg-[#1A1412] group-hover:w-16 group-hover:bg-[#B87333] transition-all"></div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-stone-200 text-sm italic font-serif">该分类内容正在精心筹备中...</div>
        )}
      </div>
    </section>
  );
};

export default BanyanSpace;
