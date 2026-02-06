
import React from 'react';

interface RecruitmentPageProps {
  onClose: () => void;
}

const RecruitmentPage: React.FC<RecruitmentPageProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] bg-white overflow-y-auto no-scrollbar animate-in fade-in duration-700 selection:bg-[#B87333]/10">
      {/* 顶部固定导航 */}
      <nav className="sticky top-0 z-[160] bg-white/90 backdrop-blur-2xl px-8 md:px-24 py-8 flex justify-between items-center border-b border-stone-100/60">
        <div className="flex items-center gap-5">
           <div className="w-9 h-9 bg-[#B87333] rounded-full flex items-center justify-center text-white font-serif text-lg shadow-lg shadow-[#B87333]/20">伴</div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-[#1A1412] uppercase tracking-[0.4em]">Recruitment</span>
              <span className="text-[9px] text-stone-300 font-bold uppercase tracking-[0.2em]">咨询师招募</span>
           </div>
        </div>
        <button onClick={onClose} className="group flex items-center gap-4 text-stone-400 hover:text-[#1A1412] transition-all duration-500">
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Close / 关闭</span>
          <div className="w-12 h-12 rounded-full border border-stone-100 flex items-center justify-center group-hover:bg-stone-50 group-hover:rotate-90 transition-all duration-700">✕</div>
        </button>
      </nav>

      {/* 沉浸式内容主体 */}
      <article className="max-w-[900px] mx-auto px-8 py-24 md:py-40">
        <header className="mb-24 space-y-10 relative">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#B87333]/5 rounded-full blur-[100px] -z-10"></div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-serif font-black text-[#1A1412] leading-[1.1] tracking-tighter">
              加入伴言
            </h1>
            <h2 className="text-2xl md:text-4xl font-serif text-[#1A1412]/70 italic tracking-tight">
              与一群不带功利心的心理工作者同行
            </h2>
          </div>
          
          <div className="max-w-2xl space-y-6 text-[#1A1412]/80 font-serif text-lg md:text-xl leading-relaxed">
            <p className="indent-8">
              伴言始终相信：<span className="text-[#1A1412] font-bold border-b-2 border-[#B87333]/20">真正的疗愈，始于咨询师自身的完整与专业。</span>
            </p>
            <p className="indent-8">
              我们正在寻找那些深耕临床、敬畏伦理、愿以真诚陪伴他人的同行者。
            </p>
          </div>

          <div className="pt-8 flex flex-wrap gap-6">
            {['拥有扎实的受训背景', '坚守心理咨询的伦理底线', '在实践中持续反思与成长'].map((text, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#FAF8F6] px-6 py-3 rounded-full border border-stone-100">
                <span className="text-[#B87333]">✓</span>
                <span className="text-sm font-bold text-stone-500 tracking-tight">{text}</span>
              </div>
            ))}
          </div>
        </header>

        {/* 核心板块 */}
        <div className="space-y-24">
          
          {/* 基本准入 */}
          <section className="space-y-10">
            <div className="flex items-center gap-4">
              <span className="text-2xl">📌</span>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#1A1412]">基本准入要求</h3>
            </div>
            <ul className="space-y-6 pl-10 border-l border-stone-100">
              {[
                { label: '学历背景', content: '心理学、临床心理学、咨询心理学等相关专业 硕士及以上学历；' },
                { label: '伦理承诺', content: '认同并愿意遵守《中国心理学会临床与咨询心理学工作伦理守则》；' },
                { label: '伦理认证', content: '通过专业伦理考试凭证；' },
                { label: '实践经验', content: '具备一定个体咨询经验，能提供真实、可验证的执业记录。' }
              ].map((item, i) => (
                <li key={i} className="group">
                  <span className="text-stone-400 font-bold mr-3 transition-colors group-hover:text-[#B87333]">●</span>
                  <span className="font-bold text-[#1A1412] mr-2">{item.label}：</span>
                  <span className="text-stone-500 font-serif leading-relaxed">{item.content}</span>
                </li>
              ))}
              <p className="pt-4 text-stone-300 font-serif italic text-sm">“我们不唯头衔，但重胜任力；不求流量，但求真诚。”</p>
            </ul>
          </section>

          {/* 简历信息 */}
          <section className="bg-[#FAF8F6] p-10 md:p-16 rounded-[48px] border border-stone-100 space-y-10">
            <div className="flex items-center gap-4">
              <span className="text-2xl">📄</span>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#1A1412]">简历请包含以下信息</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {[
                { id: '01', title: '受训经历', desc: '学历教育（学校、专业、学位）及系统培训项目（如中德班、CAPA等）。' },
                { id: '02', title: '个人体验', desc: 'Personal Therapy 时长、流派、是否完成。' },
                { id: '03', title: '咨询小时数', desc: '累计个体咨询小时数（请注明是否包含实习期）。' },
                { id: '04', title: '督导时长', desc: '接受个体/团体督导的总时长及当前督导安排。' },
                { id: '05', title: '擅长领域', desc: '情绪困扰、亲密关系、创伤疗愈、青少年发展、职场压力等。' },
                { id: '06', title: '执业取向', desc: '精神动力学、人本主义、CBT、家庭治疗等。' }
              ].map(item => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-[10px] font-black text-[#B87333] tracking-widest">{item.id}</span>
                    <h4 className="font-bold text-[#1A1412]">{item.title}</h4>
                  </div>
                  <p className="text-sm text-stone-400 font-serif leading-relaxed pl-7">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-stone-200/50 flex items-center gap-4">
               <span className="text-xl">💡</span>
               <p className="text-stone-400 font-serif italic text-sm">温馨提示：完整、真实的履历，是对专业最好的尊重。</p>
            </div>
          </section>

          {/* 投递方式 */}
          <section className="space-y-10">
            <div className="flex items-center gap-4">
              <span className="text-2xl">📩</span>
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#1A1412]">投递方式</h3>
            </div>
            <div className="space-y-8 pl-10 border-l-4 border-[#B87333]/10">
              <div className="space-y-2">
                <p className="text-stone-500 font-serif">请将简历（PDF格式）发送至：</p>
                <a href="mailto:yanchen.guo@qq.com" className="text-2xl md:text-3xl font-serif text-[#B87333] hover:underline transition-all">yanchen.guo@qq.com</a>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-black text-stone-300 uppercase tracking-widest">邮件标题格式</p>
                <p className="text-[#1A1412] font-serif font-bold text-lg">BY简历-姓名 <span className="text-stone-300 font-normal text-sm ml-2">（e.g. BY简历-张三）</span></p>
              </div>
              <div className="p-8 bg-stone-50 rounded-[32px] border border-stone-100 italic text-stone-400 text-sm leading-relaxed">
                “我们将在 <span className="text-[#1A1412] font-bold">7个工作日内</span> 审核并邮件回复初筛结果。通过初筛者，将进入伴言的 <span className="text-[#1A1412] font-bold">三重审核流程</span>（背景追溯 + 伦理评估 + 临床考核）。”
              </div>
            </div>
          </section>

        </div>

        {/* 结尾 */}
        <footer className="mt-40 pt-20 border-t border-stone-100 text-center space-y-12">
           <div className="space-y-4">
              <p className="text-2xl font-serif italic text-[#1A1412]/60">
                “在伴言，你不是‘入驻者’，而是共同守护专业火种的同行者。”
              </p>
              <p className="text-[#B87333] font-serif font-bold text-xl">期待与你，在深度与真实中相遇。</p>
           </div>
           
           <div className="flex flex-col items-center gap-6 pt-12">
             <div className="w-[1px] h-20 bg-gradient-to-b from-[#B87333] to-transparent opacity-20"></div>
             <p className="text-[9px] font-black text-stone-200 uppercase tracking-[0.8em] pl-[0.8em]">Banyan Psychology Recruitment</p>
           </div>
        </footer>
      </article>
    </div>
  );
};

export default RecruitmentPage;
