
import React from 'react';

interface FooterProps {
  onAdminPortal?: () => void;
  onPractitionerPortal?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminPortal, onPractitionerPortal }) => {
  return (
    <footer id="footer" className="bg-[#FCFAF8] pt-32 pb-16 border-t border-stone-50">
      <div className="max-w-[1400px] mx-auto px-8 md:px-16">
        
        {/* Top Section: Identity & Quick Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24 pb-16 border-b border-stone-100/60">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              {/* 创始人入口：左侧极简灰色点，需双击触发 */}
              <button 
                onDoubleClick={onAdminPortal} 
                className="w-1.5 h-1.5 rounded-full bg-stone-200 hover:bg-[#B87333] transition-colors cursor-default"
                title=""
              />
              
              <h2 className="text-2xl md:text-3xl font-serif text-[#1A1412] tracking-wider font-medium">
                深圳市伴言心理咨询有限责任公司
              </h2>

              {/* 咨询师入口：右侧极简灰色点，需双击触发 */}
              <button 
                onDoubleClick={onPractitionerPortal} 
                className="w-1.5 h-1.5 rounded-full bg-stone-200 hover:bg-[#B87333] transition-colors cursor-default"
                title=""
              />
            </div>
            
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-[#B87333] uppercase tracking-[0.3em]">
                BANYAN PSYCHOLOGY
              </span>
              <div className="w-12 h-[1px] bg-stone-100"></div>
              <p className="text-[13px] text-stone-300 font-serif italic">
                “做一家能听到灵魂回响的公司”
              </p>
            </div>
          </div>
          
          <div className="hidden lg:block lg:col-span-1 h-12 border-l border-stone-100"></div>
          
          <div className="lg:col-span-2 space-y-2">
            <span className="text-[9px] font-black text-stone-300 uppercase tracking-[0.4em] block">CONNECT</span>
            <p className="text-[14px] font-medium text-stone-500 font-serif tracking-tight">care@banyanpsych.com</p>
          </div>
          
          <div className="lg:col-span-2 space-y-2">
            <span className="text-[9px] font-black text-stone-300 uppercase tracking-[0.4em] block">LOCATION</span>
            <p className="text-[14px] font-medium text-stone-500 font-serif tracking-tight">深圳 · 南山粤海街道</p>
          </div>
        </div>

        {/* Middle Section: Four Columns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-32">
          <div className="space-y-6">
            <span className="text-[10px] font-black text-[#B87333]/60 uppercase tracking-[0.4em] block">BASE OFFICE</span>
            <div className="flex flex-col gap-2 text-[13px] font-medium text-stone-400 font-serif">
              <span>深圳市南山区粤海街道</span>
              <span>伴言心理深圳区</span>
            </div>
          </div>
          
          <div className="space-y-6">
            <span className="text-[10px] font-black text-[#B87333]/60 uppercase tracking-[0.4em] block">ETHICAL CODE</span>
            <div className="flex flex-col gap-2 text-[13px] font-medium text-stone-400 font-serif">
              <a href="#" className="hover:text-[#B87333] transition-colors">咨询师执业操守</a>
              <a href="#" className="hover:text-[#B87333] transition-colors">数据隐私保护协议</a>
            </div>
          </div>
          
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

        {/* Bottom Bar: Professional Tagline & Rights */}
        <div className="pt-12 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[9px] font-black text-stone-200 uppercase tracking-[0.6em] text-center md:text-left">
            SHENZHEN BANYAN PSYCHOLOGY COUNSELING CO., LTD.
          </p>
          <p className="text-[9px] font-black text-stone-200 uppercase tracking-[0.2em]">
            © 2024 BANYAN PSYCHOLOGY. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
