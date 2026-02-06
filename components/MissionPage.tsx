
import React from 'react';

interface MissionPageProps {
  onClose: () => void;
}

const MissionPage: React.FC<MissionPageProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] bg-white overflow-y-auto no-scrollbar animate-in fade-in duration-700">
      {/* 顶部固定导航浮层 */}
      <nav className="sticky top-0 z-[160] bg-white/80 backdrop-blur-xl px-8 md:px-24 py-8 flex justify-between items-center border-b border-stone-50">
        <div className="flex items-center gap-4">
           <div className="w-8 h-8 bg-[#B87333] rounded-full flex items-center justify-center text-white font-serif text-sm">伴</div>
           <span className="text-[11px] font-black text-stone-300 uppercase tracking-[0.4em]">Brand Mission / 品牌使命</span>
        </div>
        <button onClick={onClose} className="group flex items-center gap-3 text-stone-400 hover:text-[#1A1412] transition-colors">
          <span className="text-[10px] font-black uppercase tracking-widest">Close / 关闭</span>
          <div className="w-10 h-10 rounded-full border border-stone-100 flex items-center justify-center group-hover:bg-stone-50 transition-colors">✕</div>
        </button>
      </nav>

      {/* 文章主体 */}
      <article className="max-w-[900px] mx-auto px-8 py-24 md:py-40">
        {/* 标题区 */}
        <header className="mb-24 space-y-8">
           <div className="flex items-center gap-4 text-[#B87333]">
              <span className="text-2xl">📝</span>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight">品牌使命 (About Us / 我们的初衷)：</h3>
           </div>
           <h1 className="text-4xl md:text-6xl font-serif font-black text-[#1A1412] leading-[1.2] tracking-tighter">
             伴言：一场不带功利心的深度同行
           </h1>
           <div className="flex items-center gap-6 pt-4">
              <div className="w-12 h-[2px] bg-[#B87333]"></div>
              <h2 className="text-2xl md:text-3xl font-serif text-[#1A1412]/80 italic">
                我们的初衷：是容器，亦是归处
              </h2>
           </div>
        </header>

        {/* 正文内容 */}
        <div className="space-y-12 text-[17px] md:text-[19px] leading-[2.2] text-[#1A1412]/80 font-serif">
          <p className="indent-8">
            在“伴言”，我们深知：当你开始审视、挑选一位咨询师时，咨询的齿轮就已经在你的经验、标准与投射中悄然转动。这不仅是一次选择，更是一次<span className="text-[#1A1412] font-bold border-b-2 border-[#B87333]/20">交付</span>。
          </p>

          <section className="bg-[#FAF8F6] p-10 md:p-16 rounded-[48px] border border-stone-100 space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#B87333]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
             
             <div className="space-y-6 relative z-10">
                <p>
                  <strong className="text-[#1A1412] text-xl block mb-4">这里，是来访者的容器。</strong>
                  我们深谙心理行业的丛林法则，所以更有意愿去开辟一片净土。在这里，你无需担心被销售话术诱导，无需面对冰冷的KPI。我们深耕心理学多年，曾在“负收入前行”的岁月里守望相助。这些经历淬炼出的，是不被生计裹挟的定力，和一种近乎执拗的专业纯粹。
                </p>
                
                <p>
                  <strong className="text-[#1A1412] text-xl block mb-4">这里，也是咨询师的容器。</strong>
                  “伴言”源于创始人的理想主义灵魂——我们深知咨询师在职业路上的孤独与不易。因此，我们构建这个空间，是为了服务来访者，也为了承载咨询师的专业理想。因为咨询师只有拥有了“不被生活压力逼迫”的职业底气，才能在咨询室内，给予你最真实、最客观、不带迎合的专业回应。
                </p>
             </div>
          </section>

          <div className="pt-20 space-y-16">
            <div className="flex items-center gap-4">
               <span className="text-3xl font-serif italic text-[#B87333]">##</span>
               <h2 className="text-3xl md:text-4xl font-serif font-black text-[#1A1412]">我们的坚持</h2>
            </div>

            <ul className="space-y-16">
               <li className="group flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0 mt-1">
                     <div className="w-2 h-2 bg-[#B87333] rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-xl md:text-2xl font-bold text-[#1A1412]">非销售，唯专业</h4>
                     <p className="text-stone-500 leading-relaxed">
                       我们拒绝套路，只交付技术的淬炼。我们的团队由一群真正的理想主义者组成，他们对心理学的热爱，早已在行业寒冬中证明过。
                     </p>
                  </div>
               </li>

               <li className="group flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0 mt-1">
                     <div className="w-2 h-2 bg-[#B87333] rounded-full"></div>
                  </div>
                  <div className="space-y-6">
                     <h4 className="text-xl md:text-2xl font-bold text-[#1A1412]">以伴为爱，以言为镜</h4>
                     <div className="space-y-4 text-stone-500 italic">
                        <p>在“伴言”，“伴”是无条件的爱与接纳。我们深知，唯有在全然的宽厚中，灵魂才敢于袒露；</p>
                        <p>“言”是精准的观察与真实。我们交付经由硕博训练的理性，拒绝廉价的安慰，只为在言语的流淌中，陪你照见那个最透彻的自我。</p>
                        <p className="text-[#1A1412] font-bold not-italic pt-2">这不仅是知识的交付，更是两个生命在真实中的深度共振。</p>
                     </div>
                  </div>
               </li>

               <li className="group flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0 mt-1">
                     <div className="w-2 h-2 bg-[#B87333] rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                     <h4 className="text-xl md:text-2xl font-bold text-[#1A1412]">极致的筛选，纯粹的交付</h4>
                     <p className="text-stone-500 leading-relaxed">
                       每一位咨询师的入驻，都经过3年以上的背景追溯、伦理审核与临床考核。
                     </p>
                     <p className="text-[#B87333] font-bold text-xl md:text-2xl pt-4 font-serif">
                       我们负责为您筛选灵魂的同行者，您负责交付信任
                     </p>
                  </div>
               </li>
            </ul>
          </div>
        </div>

        {/* 文章结尾装饰 */}
        <footer className="mt-40 pt-16 border-t border-stone-100 flex flex-col items-center gap-8">
           <div className="w-1 h-20 bg-gradient-to-b from-[#B87333] to-transparent opacity-30"></div>
           <p className="text-[10px] font-black text-stone-300 uppercase tracking-[0.8em]">Banyan Psychology Presence</p>
        </footer>
      </article>
    </div>
  );
};

export default MissionPage;
