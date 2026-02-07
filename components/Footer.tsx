
import React from 'react';

interface FooterProps {
  onAdminPortal?: () => void;
  onPractitionerPortal?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminPortal, onPractitionerPortal }) => {
  return (
    <footer id="footer" className="bg-[#FCFAF8] pt-24 pb-16 border-t border-stone-50">
      <div className="max-w-[1400px] mx-auto px-8 md:px-16">
        
        {/* Top Section: Identity & Core Tagline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20 pb-16 border-b border-stone-100/60">
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-3 overflow-hidden">
              {/* 创始人入口：左侧极简灰色点 */}
              <button 
                onDoubleClick={onAdminPortal} 
                className="w-1.5 h-1.5 rounded-full bg-stone-200 hover:bg-[#B87333] transition-colors cursor-default shrink-0"
                title=""
              />
              
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-[#1A1412] tracking-wider font-medium whitespace-nowrap">
                深圳市伴言心理有限责任公司
              </h2>

              {/* 咨询师入口：右侧极简灰色点 */}
              <button 
                onDoubleClick={onPractitionerPortal} 
                className="w-1.5 h-1.5 rounded-full bg-stone-200 hover:bg-[#B87333] transition-colors cursor-default shrink-0"
                title=""
              />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* 核心微调：移除 whitespace-nowrap 并增加 max-w 确保移动端两行显示不截断 */}
              <p className="text-[14px] md:text-[16px] text-stone-300 font-serif italic leading-relaxed tracking-wider max-w-[260px] md:max-w-none">
                “做一家能听到灵魂回响的公司”
              </p>
            </div>
          </div>
          
          <div className="hidden lg:block lg:col-span-1 h-12 border-l border-stone-100"></div>
          
          <div className="lg:col-span-3 flex gap-12">
            <div className="space-y-2">
              <span className="text-[9px] font-black text-stone-200 uppercase tracking-[0.4em] block">CONNECT</span>
              <p className="text-[13px] font-medium text-stone-400 font-serif">care@banyanpsych.com</p>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] font-black text-stone-200 uppercase tracking-[0.4em] block">LOCATION</span>
              <p className="text-[13px] font-medium text-stone-400 font-serif">深圳 · 福田区深南中路1002号</p>
            </div>
          </div>
        </div>

        {/* Middle Section: Refined Two Columns Grid (Removed Base Office & Ethical Code) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div className="space-y-6">
            <span className="text-[10px] font-black text-[#B87333]/60 uppercase tracking-[0.4em] block">ORIENTATION</span>
            <div className="flex flex-col gap-2 text-[13px] font-medium text-stone-400 font-serif">
              <span>严选硕博专家团队</span>
              <span>3年以上背景追溯</span>
              <span>伦理审查、临床考核</span>
            </div>
          </div>
          
          <div className="space-y-6">
            <span className="text-[10px] font-black text-[#B87333]/60 uppercase tracking-[0.4em] block">LEGAL INFO</span>
            <div className="flex flex-col gap-2 text-[13px] font-medium text-stone-400 font-serif">
              <span>粤ICP备 2024032101号-1</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Legal & Rights */}
        <div className="pt-12 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[9px] font-black text-stone-200 uppercase tracking-[0.6em] text-center md:text-left">
            SHENZHEN BANYAN PSYCHOLOGY CO., LTD.
          </p>
          <p className="text-[9px] font-black text-stone-200 uppercase tracking-[0.2em]">
            © 2024 ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
