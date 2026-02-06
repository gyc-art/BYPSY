
import React from 'react';

interface ServiceProcessPageProps {
  onClose: () => void;
}

const ServiceProcessPage: React.FC<ServiceProcessPageProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] bg-white overflow-y-auto no-scrollbar animate-in fade-in duration-700 selection:bg-[#B87333]/10">
      {/* 顶部固定导航浮层 - 保持极简高感 */}
      <nav className="sticky top-0 z-[160] bg-white/90 backdrop-blur-2xl px-8 md:px-24 py-8 flex justify-between items-center border-b border-stone-100/60">
        <div className="flex items-center gap-5">
           <div className="w-9 h-9 bg-[#B87333] rounded-full flex items-center justify-center text-white font-serif text-lg shadow-lg shadow-[#B87333]/20">伴</div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-[#1A1412] uppercase tracking-[0.4em]">Service Flow</span>
              <span className="text-[9px] text-stone-300 font-bold uppercase tracking-[0.2em]">服务流程</span>
           </div>
        </div>
        <button onClick={onClose} className="group flex items-center gap-4 text-stone-400 hover:text-[#1A1412] transition-all duration-500">
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Close / 关闭</span>
          <div className="w-12 h-12 rounded-full border border-stone-100 flex items-center justify-center group-hover:bg-stone-50 group-hover:rotate-90 transition-all duration-700">✕</div>
        </button>
      </nav>

      {/* 沉浸式文章主体 */}
      <article className="max-w-[1000px] mx-auto px-8 py-24 md:py-48">
        <header className="mb-32 space-y-10 relative">
          {/* 装饰性背景 */}
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#B87333]/5 rounded-full blur-[100px] -z-10"></div>
          
          <div className="flex items-center gap-4 text-[#B87333]/40">
            <div className="w-12 h-[1px] bg-current"></div>
            <span className="text-[11px] font-black uppercase tracking-[0.8em]">Journey of Mind</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-black text-[#1A1412] leading-[1.1] tracking-tighter">
            你的安心咨询，只需<span className="text-[#B87333] italic ml-2">5步</span>
          </h1>
          
          <div className="max-w-2xl space-y-6 text-stone-400 font-serif text-xl md:text-2xl leading-relaxed italic">
            <p className="border-l-4 border-[#B87333]/20 pl-8">
              “在伴言，我们把繁琐留给自己，把轻松和专注留给你。从预约到首次对话，每一步都为你考虑周全。”
            </p>
          </div>
        </header>

        {/* 步骤列表 - 采用边框艺术与错落排版 */}
        <div className="space-y-40 relative">
          {/* 中轴虚线装饰 */}
          <div className="absolute left-[15px] top-10 bottom-10 w-[1px] bg-stone-100 hidden md:block"></div>

          {/* Step 1 */}
          <section className="relative group md:pl-20">
            <div className="absolute -left-4 md:-left-5 top-0 w-10 h-10 bg-white border-2 border-[#B87333] rounded-full flex items-center justify-center text-[#B87333] font-black text-sm shadow-xl shadow-[#B87333]/10 group-hover:scale-110 transition-transform duration-500">1</div>
            <div className="space-y-6">
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#1A1412] tracking-tight">查看咨询师可约时间</h2>
              <div className="space-y-4 text-stone-500 font-serif text-lg leading-[2] max-w-2xl">
                <p>浏览你心仪咨询师的实时排期，选择一个让你感到安心的时段。</p>
                <p className="text-sm font-bold text-[#B87333]/60 uppercase tracking-widest">REAL-TIME SCHEDULE · UPDATED BY SPECIALISTS</p>
              </div>
            </div>
          </section>

          {/* Step 2 */}
          <section className="relative group md:pl-20">
            <div className="absolute -left-4 md:-left-5 top-0 w-10 h-10 bg-white border-2 border-[#B87333] rounded-full flex items-center justify-center text-[#B87333] font-black text-sm shadow-xl shadow-[#B87333]/10 group-hover:scale-110 transition-transform duration-500">2</div>
            <div className="space-y-6">
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#1A1412] tracking-tight">确定咨询次数</h2>
              <div className="space-y-4 text-stone-500 font-serif text-lg leading-[2] max-w-2xl">
                <p>首次可单次体验，也可选择阶段陪伴（如20次、40次）。<span className="text-[#1A1412] font-bold">无捆绑消费</span>，按需选择，随时调整。</p>
              </div>
            </div>
          </section>

          {/* Step 3 */}
          <section className="relative group md:pl-20">
            <div className="absolute -left-4 md:-left-5 top-0 w-10 h-10 bg-white border-2 border-[#B87333] rounded-full flex items-center justify-center text-[#B87333] font-black text-sm shadow-xl shadow-[#B87333]/10 group-hover:scale-110 transition-transform duration-500">3</div>
            <div className="space-y-6">
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#1A1412] tracking-tight">安全完成支付</h2>
              <div className="space-y-4 text-stone-500 font-serif text-lg leading-[2] max-w-2xl">
                <p>通过平台加密通道支付，支持微信/支付宝。</p>
                <p className="bg-stone-50 p-6 rounded-3xl border border-stone-100 italic text-stone-400 text-sm">
                  资金由第三方托管，未履约可申请退款，保障你的权益。
                </p>
              </div>
            </div>
          </section>

          {/* Step 4 - 重点内容采用卡片与装饰点 */}
          <section className="relative group md:pl-20">
            <div className="absolute -left-4 md:-left-5 top-0 w-10 h-10 bg-white border-2 border-[#B87333] rounded-full flex items-center justify-center text-[#B87333] font-black text-sm shadow-xl shadow-[#B87333]/10 group-hover:scale-110 transition-transform duration-500">4</div>
            <div className="space-y-10">
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#1A1412] tracking-tight leading-snug">
                扫码添加小助理 <span className="text-stone-200 mx-2">+</span> 完成首次咨询准备
              </h2>
              
              <div className="space-y-8 text-stone-500 font-serif text-lg leading-[2] max-w-3xl">
                <p>支付成功后，请扫描页面二维码，添加<span className="text-[#1A1412] font-bold">「伴言小助理」</span>。</p>
                <p>同时，系统将自动弹出准备窗口，邀请你快速完成以下3项（约5分钟）：</p>
                
                <div className="grid grid-cols-1 gap-6 mt-12">
                  {[
                    { icon: '✅', title: '在线签署《保密协议》', desc: '你的隐私，是我们最坚定的守护。' },
                    { icon: '📝', title: '填写《来访者评估表》', desc: '帮助咨询师更懂你，让第一次对话直抵核心。' },
                    { icon: '📘', title: '浏览《咨询师伦理守则》', desc: '了解我们如何以专业与尊重，陪伴你的每一步。' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-8 p-8 rounded-[32px] border border-stone-100 hover:border-[#B87333]/20 hover:bg-stone-50/50 transition-all duration-500">
                      <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{item.icon}</span>
                      <div className="space-y-2">
                        <h4 className="font-bold text-[#1A1412] text-xl tracking-tight">{item.title}</h4>
                        <p className="text-stone-400 text-base italic">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-4 pt-6">
                   <div className="w-1.5 h-1.5 bg-[#B87333] rounded-full"></div>
                   <p className="font-bold text-[#B87333] text-base tracking-widest uppercase">
                     Digital & Seamless · 无需打印，手机端一键完成
                   </p>
                </div>
              </div>
            </div>
          </section>

          {/* Step 5 */}
          <section className="relative group md:pl-20">
            <div className="absolute -left-4 md:-left-5 top-0 w-10 h-10 bg-[#B87333] rounded-full flex items-center justify-center text-white font-black text-sm shadow-xl shadow-[#B87333]/30 group-hover:scale-110 transition-transform duration-500">5</div>
            <div className="space-y-8">
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#1A1412] tracking-tight">赴约，开启对话</h2>
              <div className="space-y-6 text-stone-500 font-serif text-xl leading-relaxed italic">
                <p className="text-[#1A1412] font-bold not-italic">“带上真实的自己，准时进入视频/腾讯会议/咨询室。”</p>
                <p>剩下的，交给我们。</p>
              </div>
            </div>
          </section>
        </div>

        {/* 底部人文提示 */}
        <footer className="mt-48 pt-20 border-t border-stone-100">
          <div className="bg-[#FAF8F6] p-10 md:p-16 rounded-[48px] border border-stone-50 flex flex-col md:flex-row items-center gap-12">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
               <span className="text-3xl">💬</span>
            </div>
            <div className="space-y-4 text-center md:text-left">
               <h5 className="text-[10px] font-black text-[#B87333] uppercase tracking-[0.6em]">Kind Reminders / 小提醒</h5>
               <p className="text-stone-400 font-serif text-lg leading-relaxed italic">
                 “若暂时未完成三项准备，也不用担心——首次咨询前，咨询师会温柔提醒你补全，确保你从容开始。”
               </p>
            </div>
          </div>
          
          <div className="mt-32 flex flex-col items-center gap-10">
            <div className="w-[1px] h-24 bg-gradient-to-b from-[#B87333] to-transparent opacity-20"></div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-[9px] font-black text-stone-200 uppercase tracking-[1em] pl-[1em]">Banyan Psychology Flow Control</p>
              <p className="text-[7px] text-stone-200 font-bold uppercase tracking-[0.2em]">© 2024 PRECISION & CARE</p>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
};

export default ServiceProcessPage;
