
import React, { useState, useEffect } from 'react';
import { IntakePackage, IntakeFormResponse } from '../types';
import SignaturePad from './SignaturePad';

interface IntakeFormProps {
  packageId: string;
  onComplete?: () => void;
}

const TOPICS = ['情绪管理', '亲密关系', '职场压力', '个人成长', '原生家庭', '青少年发展', '社交焦虑', '自尊自信', '其他'];

const IntakeForm: React.FC<IntakeFormProps> = ({ packageId, onComplete }) => {
  const [pkg, setPkg] = useState<IntakePackage | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // 伦理阅读计时逻辑
  const [readCountdown, setReadCountdown] = useState(10);
  const [canConfirmConfidentiality, setCanConfirmConfidentiality] = useState(false);

  const [form, setForm] = useState<Omit<IntakeFormResponse, 'submittedAt' | 'hash'>>({
    realName: '',
    gender: '未选择',
    age: '',
    education: '',
    phone: '',
    emergencyContact: '',
    emergencyRelation: '',
    emergencyPhone: '',
    isVoluntary: '是',
    hasKnowledge: '否',
    hasExperience: '否',
    helpTopics: [],
    extremeThoughts: '无',
    medicalHistory: '',
    agreedConfidentiality: false,
    agreedEthical: false,
    signatureData: ''
  });

  useEffect(() => {
    const stored = localStorage.getItem('banyan_packages');
    const packages: IntakePackage[] = stored ? JSON.parse(stored) : [];
    const found = packages.find(p => p.id === packageId);
    if (found) setPkg(found);
  }, [packageId]);

  // 处理计时器
  useEffect(() => {
    let timer: number;
    if (step === 5 && readCountdown > 0) {
      timer = window.setInterval(() => {
        setReadCountdown(prev => {
          if (prev <= 1) {
            setCanConfirmConfidentiality(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, readCountdown]);

  const toggleTopic = (topic: string) => {
    const current = form.helpTopics;
    setForm({
      ...form,
      helpTopics: current.includes(topic) ? current.filter(t => t !== topic) : [...current, topic]
    });
  };

  const handleSubmit = () => {
    if (!form.signatureData) {
      alert('请完成电子签名。');
      return;
    }

    const submission: IntakeFormResponse = {
      ...form,
      submittedAt: new Date().toLocaleString(),
      hash: 'BANYAN-E-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    };

    if (packageId !== 'new_booking_temp') {
      const stored = localStorage.getItem('banyan_packages');
      let packages: IntakePackage[] = stored ? JSON.parse(stored) : [];
      packages = packages.map(p => p.id === packageId ? { ...p, status: 'completed', formData: submission } : p);
      localStorage.setItem('banyan_packages', JSON.stringify(packages));
      window.dispatchEvent(new Event('package_updated'));
    }
    
    setIsSubmitted(true);
    if (onComplete) {
      setTimeout(() => onComplete(), 1500);
    }
  };

  if (isSubmitted && packageId !== 'new_booking_temp') {
    return (
      <div className="py-20 text-center space-y-8 animate-in fade-in zoom-in duration-700">
         <div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center text-emerald-500 text-3xl">✓</div>
         <h2 className="text-3xl font-serif text-[#1A1412]">评估资料已加密存档</h2>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-3xl mx-auto">
        {/* 步骤指示 */}
        <div className="mb-12 flex items-center gap-8">
           <div className="flex-1 h-0.5 bg-stone-100 relative">
              <div className="absolute top-0 left-0 h-full bg-[#B87333] transition-all duration-700" style={{ width: `${(step / 6) * 100}%` }}></div>
           </div>
           <span className="text-[10px] font-black text-[#B87333] uppercase tracking-[0.5em] shrink-0">Step {step} of 6</span>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Step 1-4 保持原样逻辑... */}
          {step === 1 && (
            <div className="space-y-12">
              <header className="space-y-4">
                <span className="text-[10px] font-black text-[#B87333] uppercase tracking-[0.8em]">Basic Profile / 基础背景</span>
                <h2 className="text-4xl font-serif text-[#1A1412]">来访基本信息评估</h2>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-stone-300 uppercase tracking-widest block">真实姓名 REAL NAME</label>
                  <input type="text" value={form.realName} onChange={e => setForm({...form, realName: e.target.value})} className="w-full bg-transparent border-b border-stone-200 py-4 font-serif text-xl outline-none focus:border-[#B87333]" />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-stone-300 uppercase tracking-widest block">性别 GENDER</label>
                  <div className="flex gap-6 py-4">
                    {['男', '女', '多元', '未选择'].map(g => (
                      <button key={g} onClick={() => setForm({...form, gender: g as any})} className={`text-sm font-serif ${form.gender === g ? 'text-[#B87333] border-b border-[#B87333]' : 'text-stone-300'}`}>{g}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-stone-300 uppercase tracking-widest block">年龄 AGE</label>
                  <input type="text" value={form.age} onChange={e => setForm({...form, age: e.target.value})} className="w-full bg-transparent border-b border-stone-200 py-4 font-serif outline-none focus:border-[#B87333]" />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-stone-300 uppercase tracking-widest block">学历 EDUCATION</label>
                  <input type="text" value={form.education} onChange={e => setForm({...form, education: e.target.value})} className="w-full bg-transparent border-b border-stone-200 py-4 font-serif outline-none focus:border-[#B87333]" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-12">
              <header className="space-y-4">
                <span className="text-[10px] font-black text-[#B87333] uppercase tracking-[0.8em]">Emergency / 联系与安全</span>
                <h2 className="text-4xl font-serif text-[#1A1412]">联系方式评估</h2>
              </header>
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-stone-300 uppercase tracking-widest block">本人联系电话 PERSONAL PHONE</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-transparent border-b border-stone-200 py-4 font-serif text-xl outline-none focus:border-[#B87333]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-stone-300 uppercase tracking-widest block">紧急联系人</label>
                    <input type="text" value={form.emergencyContact} onChange={e => setForm({...form, emergencyContact: e.target.value})} className="w-full bg-transparent border-b border-stone-200 py-4 font-serif outline-none focus:border-[#B87333]" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-stone-300 uppercase tracking-widest block">及其关系</label>
                    <input type="text" value={form.emergencyRelation} onChange={e => setForm({...form, emergencyRelation: e.target.value})} className="w-full bg-transparent border-b border-stone-200 py-4 font-serif outline-none focus:border-[#B87333]" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-stone-300 uppercase tracking-widest block">联系电话</label>
                    <input type="tel" value={form.emergencyPhone} onChange={e => setForm({...form, emergencyPhone: e.target.value})} className="w-full bg-transparent border-b border-stone-200 py-4 font-serif outline-none focus:border-[#B87333]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-12">
              <header className="space-y-4">
                <span className="text-[10px] font-black text-[#B87333] uppercase tracking-[0.8em]">Motivation / 咨询前哨</span>
                <h2 className="text-4xl font-serif text-[#1A1412]">咨询状态评估</h2>
              </header>
              <div className="space-y-10">
                <div className="flex justify-between items-center py-4 border-b border-stone-100">
                  <span className="text-stone-500 font-serif">是否主动前来咨询？</span>
                  <div className="flex gap-8">
                    {['是', '否'].map(opt => (
                      <button key={opt} onClick={() => setForm({...form, isVoluntary: opt as any})} className={`px-4 py-1 rounded-full text-xs font-bold ${form.isVoluntary === opt ? 'bg-[#1A1412] text-white' : 'text-stone-300 border border-stone-100'}`}>{opt}</button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-stone-100">
                  <span className="text-stone-500 font-serif">是否了解心理咨询？</span>
                  <div className="flex gap-8">
                    {['是', '否'].map(opt => (
                      <button key={opt} onClick={() => setForm({...form, hasKnowledge: opt as any})} className={`px-4 py-1 rounded-full text-xs font-bold ${form.hasKnowledge === opt ? 'bg-[#1A1412] text-white' : 'text-stone-300 border border-stone-100'}`}>{opt}</button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-stone-100">
                  <span className="text-stone-500 font-serif">有无咨询经验？</span>
                  <div className="flex gap-8">
                    {['是', '否'].map(opt => (
                      <button key={opt} onClick={() => setForm({...form, hasExperience: opt as any})} className={`px-4 py-1 rounded-full text-xs font-bold ${form.hasExperience === opt ? 'bg-[#1A1412] text-white' : 'text-stone-300 border border-stone-100'}`}>{opt}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-12">
              <header className="space-y-4">
                <span className="text-[10px] font-black text-[#B87333] uppercase tracking-[0.8em]">Clinical Focus / 临床评估</span>
                <h2 className="text-4xl font-serif text-[#1A1412]">救助主题与临床病史</h2>
              </header>
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-stone-300 uppercase tracking-widest block">救助主题（多选）HELP TOPICS</label>
                  <div className="flex flex-wrap gap-3">
                    {TOPICS.map(topic => (
                      <button key={topic} onClick={() => toggleTopic(topic)} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${form.helpTopics.includes(topic) ? 'bg-[#B87333] text-white' : 'bg-stone-50 text-stone-400 border border-stone-100'}`}>
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-stone-300 uppercase tracking-widest block">是否有极端行为/想法（自残自杀伤害他人） RISK ASSESSMENT</label>
                  <div className="flex gap-6">
                    {['无', '有过想法', '有过行为'].map(opt => (
                      <button key={opt} onClick={() => setForm({...form, extremeThoughts: opt as any})} className={`px-6 py-3 rounded-2xl text-xs font-bold ${form.extremeThoughts === opt ? 'bg-[#1A1412] text-white' : 'bg-stone-50 text-stone-400 border border-stone-100'}`}>{opt}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-stone-300 uppercase tracking-widest block">个人躯体化疾病、精神病史、家族精神病史 MEDICAL HISTORY</label>
                  <textarea value={form.medicalHistory} onChange={e => setForm({...form, medicalHistory: e.target.value})} className="w-full bg-[#FAF8F6] p-6 rounded-[32px] h-32 font-serif outline-none border border-transparent focus:border-[#B87333]/20" placeholder="请在此简要说明..." />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: 伦理签署 - 深度嵌入文档内容 */}
          {step === 5 && (
            <div className="space-y-12">
              <header className="space-y-4">
                <span className="text-[10px] font-black text-[#B87333] uppercase tracking-[0.8em]">Ethics & Standards / 伦理确认</span>
                <h2 className="text-4xl font-serif text-[#1A1412]">签署专业服务协议</h2>
                <p className="text-stone-400 font-serif italic text-lg leading-relaxed">
                   这是开启专业关系的起点。请务必完整阅读以下伦理准则，这事关您的基本权利与临床安全。
                </p>
              </header>

              <div className="space-y-10">
                {/* 1. 保密协议与中国心理学会守则 */}
                <div className="space-y-6">
                   <div className="flex justify-between items-center px-4">
                      <h4 className="text-[12px] font-black text-[#1A1412] uppercase tracking-[0.3em]">《中国心理学会临床与咨询心理学工作伦理守则（第二版）》摘要</h4>
                      <span className="text-[8px] font-black text-[#B87333] uppercase tracking-widest">必读文件 / 10s</span>
                   </div>
                   <div className="h-64 overflow-y-auto bg-[#FAF8F6] p-8 rounded-[40px] border border-stone-100 shadow-inner no-scrollbar">
                      <div className="text-[13px] font-serif leading-[2] text-stone-500 space-y-6">
                         <p className="font-bold text-[#1A1412]">一、总则</p>
                         <p>心理咨询师在工作中应尊重人权，尊重个体的尊严、自主权和隐私权。在专业服务中应保持公平、诚信、负责。</p>
                         <p className="font-bold text-[#1A1412]">二、专业关系</p>
                         <p>咨询师应清楚自己的专业界限。严禁与来访者建立非咨询性质的私人关系。咨询师承诺不对来访者进行任何形式的价值剥削。</p>
                         <p className="font-bold text-[#1A1412]">三、隐私与保密（核心提示）</p>
                         <p>1. 咨询师有责任保护来访者的隐私及咨询内容。在教学、研究、写作或其他形式的交流中，咨询师应隐去来访者的个人身份信息。<br/>2. 保密例外：(1) 咨询师发现来访者有伤害自身或伤害他人的严重威胁；(2) 未成年人受到性侵犯或虐待；(3) 法律规定必须披露的刑事案件。</p>
                         <p className="font-bold text-[#1A1412]">四、知情同意</p>
                         <p>来访者在咨询开始前有权了解咨询师的资历、咨询目标、技术手段、费用及保密限制。来访者有权随时中止咨询。</p>
                         <p className="text-[11px] text-stone-300 italic pt-10">（注：以上内容节选自《中国心理学会临床与咨询心理学工作伦理守则（第二版）》，全文可向小助理索取。）</p>
                      </div>
                   </div>
                   <label className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${canConfirmConfidentiality ? 'cursor-pointer hover:bg-stone-50' : 'opacity-40 cursor-not-allowed'}`}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.agreedConfidentiality ? 'bg-[#B87333] border-[#B87333]' : 'bg-white border-stone-200'}`}>
                        {form.agreedConfidentiality && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6L9 17L4 12"/></svg>}
                      </div>
                      <input type="checkbox" className="hidden" disabled={!canConfirmConfidentiality} checked={form.agreedConfidentiality} onChange={e => setForm({...form, agreedConfidentiality: e.target.checked})} />
                      <span className="text-sm font-bold text-[#1A1412]">
                         {canConfirmConfidentiality ? '我已完整阅读并知悉上述守则与保密协议' : `请阅读并稍候 (${readCountdown}s)`}
                      </span>
                   </label>
                </div>

                {/* 2. 伴言咨询师伦理守则 */}
                <div className="space-y-6">
                   <div className="flex justify-between items-center px-4">
                      <h4 className="text-[12px] font-black text-[#1A1412] uppercase tracking-[0.3em]">《伴言心理·咨询师伦理守则》</h4>
                      <span className="text-[8px] font-black text-stone-300 uppercase tracking-widest">信息透明 / 自愿阅读</span>
                   </div>
                   <div className="h-48 overflow-y-auto bg-white p-8 rounded-[40px] border border-stone-50 no-scrollbar">
                      <div className="text-[13px] font-serif leading-[2] text-stone-400 space-y-4">
                         <p>1. <span className="text-stone-500 font-bold">非评判立场：</span>咨询师致力于提供一个无条件的、非评判的安全空间。</p>
                         <p>2. <span className="text-stone-500 font-bold">胜任力保障：</span>咨询师承诺仅在自己专业受训范围内执业，并持续接受行业大咖督导。</p>
                         <p>3. <span className="text-stone-500 font-bold">拒绝过度医疗：</span>咨询师根据来访者的真实获益评估咨询频次，拒绝任何形式的过度推销。</p>
                         <p>4. <span className="text-stone-500 font-bold">数字化安全：</span>您的电子档案采用银行级加密存储，仅咨询师本人在咨询期间可调阅。</p>
                      </div>
                   </div>
                   <label className="flex items-center gap-4 p-4 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${form.agreedEthical ? 'bg-[#B87333] border-[#B87333]' : 'bg-white border-stone-200 group-hover:border-[#B87333]'}`}>
                        {form.agreedEthical && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6L9 17L4 12"/></svg>}
                      </div>
                      <input type="checkbox" className="hidden" checked={form.agreedEthical} onChange={e => setForm({...form, agreedEthical: e.target.checked})} />
                      <span className="text-sm font-bold text-[#1A1412]">我已了解《咨询师伦理守则》</span>
                   </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: 签名保持原样... */}
          {step === 6 && (
            <div className="space-y-12">
              <header className="space-y-4">
                <span className="text-[10px] font-black text-[#B87333] uppercase tracking-[0.8em]">Signature / 电子存证</span>
                <h2 className="text-4xl font-serif text-[#1A1412]">完成评估签署</h2>
                <p className="text-stone-400 font-serif italic text-lg leading-relaxed">
                   这一笔，标志着专业旅程的正式开启。<br/>请在下方虚线框内<span className="text-[#1A1412] font-bold">手写签署您的真实姓名</span>。
                </p>
              </header>
              <SignaturePad onSave={(data) => setForm({...form, signatureData: data})} onClear={() => setForm({...form, signatureData: ''})} />
            </div>
          )}

          {/* 控制与温情提醒 */}
          <div className="pt-20">
             <div className="flex justify-between items-center mb-10">
                {step > 1 ? (
                  <button onClick={() => setStep(step - 1)} className="text-[10px] font-black text-stone-300 uppercase tracking-widest hover:text-[#1A1412]">上一步 PREVIOUS</button>
                ) : <div />}
                
                {step < 6 ? (
                  <button onClick={() => setStep(step + 1)} className="px-16 py-5 bg-[#1A1412] text-white rounded-full font-bold text-[11px] tracking-[0.3em] uppercase hover:bg-[#B87333] transition-all shadow-2xl disabled:opacity-20 disabled:cursor-not-allowed" disabled={step === 5 && !canConfirmConfidentiality}>下一步 NEXT</button>
                ) : (
                  <button onClick={handleSubmit} disabled={!form.agreedConfidentiality || !form.agreedEthical || !form.signatureData} className="px-20 py-5 bg-[#B87333] text-white rounded-full font-bold text-[11px] tracking-[0.3em] uppercase shadow-2xl disabled:opacity-20 transition-all">提交存证 SUBMIT</button>
                )}
             </div>

             {/* 温柔提醒 */}
             <div className="p-8 bg-[#FAF8F6] rounded-[32px] border border-stone-100 flex items-center gap-6">
                <span className="text-2xl grayscale">🍃</span>
                <p className="text-stone-400 font-serif italic text-sm">
                  温柔提醒：暂时未完成也没关系，咨询时，咨询师会再次陪你补全。
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntakeForm;
