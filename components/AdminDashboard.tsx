
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Counselor, GlobalCharityProject, FinanceRow, RefundRequest, PaymentConfig, TimeSlot } from '../types';

interface AdminDashboardProps {
  onClose: () => void;
  allCounselors: Counselor[];
  onUpdateCounselors: (counselors: Counselor[]) => void;
}

const SPECIALTY_OPTIONS = ['恋爱心理', '婚姻家庭', '青少年心理', '情绪调节', '职场压力', '个人成长', '原生家庭', '深度陪伴', '动力学取向', '人际关系', '自我同一性', '复杂性创伤'];

const generateInitialSlots = (): TimeSlot[] => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const times: string[] = [];
  for (let h = 9; h <= 21; h++) {
    const hour = h.toString().padStart(2, '0');
    times.push(`${hour}:00`, `${hour}:30`);
  }
  return days.flatMap((day) => 
    times.map((time) => ({
      id: `${Math.random().toString(36).substr(2, 5)}-${day}-${time}`,
      day,
      time,
      isBooked: true 
    }))
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, allCounselors, onUpdateCounselors }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ phone: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'charity' | 'staff' | 'finance'>('charity');
  const [financeSubTab, setFinanceSubTab] = useState<'ledger' | 'pending' | 'payment_config'>('ledger');
  const [editingCounselor, setEditingCounselor] = useState<Counselor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  const [trainingInput, setTrainingInput] = useState('');
  const [showTrainingInput, setShowTrainingInput] = useState(false);

  const [charityProject, setCharityProject] = useState<GlobalCharityProject>(() => {
    const saved = localStorage.getItem('banyan_global_charity');
    return saved ? JSON.parse(saved) : {
      id: 'charity_2024',
      enabled: false,
      name: '伴言 · 公益直通计划',
      price: 39.9,
      sessionCount: 1,
      usageLimitPerClient: 4, 
      description: '由创始人严选专家参与，旨在提供高质量的低门槛心理服务。为了确保资源的公平分配，每位来访者仅限享受有限次数。',
      participatingCounselorIds: [],
      maxClientsPerCounselor: 5,
      charityUsage: {}
    };
  });

  const [assistantQr, setAssistantQr] = useState<string>(() => {
    return localStorage.getItem('banyan_assistant_qr') || '';
  });

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(() => {
    const saved = localStorage.getItem('banyan_payment_config');
    return saved ? JSON.parse(saved) : {
      qrCodeUrl: '',
      accountName: '深圳市伴言心理咨询有限责任公司',
      bankName: '招商银行股份有限公司深圳南山支行',
      accountNumber: '7559 5218 0510 101'
    };
  });

  const [financeData, setFinanceData] = useState<FinanceRow[]>([]);

  useEffect(() => {
    setFinanceData(allCounselors.map(c => ({
      counselorId: c.id,
      counselorName: c.name,
      totalRevenue: 0,
      serviceFeeRate: 0.2,
      otherExpenses: 0,
      monthlyPaid: 0,
      yearlyPaid: 0,
    })));
  }, [allCounselors]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageDrop = useCallback((e: React.DragEvent, callback: (base64: string) => void) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          callback(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.phone === '18588206626' && loginForm.password === 'sienna13579') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('登录失败。');
    }
  };

  const handleSaveCharity = () => {
    localStorage.setItem('banyan_global_charity', JSON.stringify(charityProject));
    localStorage.setItem('banyan_assistant_qr', assistantQr);
    window.dispatchEvent(new Event('charity_project_updated'));
    window.dispatchEvent(new Event('banyan_assistant_updated'));
    showToast('✓ 公益配置已实时生效');
  };

  const charityShareUrl = useMemo(() => `${window.location.origin}${window.location.pathname}#/?mode=charity`, []);
  const copyCharityLink = () => {
    navigator.clipboard.writeText(charityShareUrl);
    showToast('✓ 公益链接已复制');
  };

  const handleOpenNewCounselor = () => {
    const newCounselor: Counselor = {
      id: Math.random().toString(36).substr(2, 9),
      serialNumber: `BY-${(allCounselors.length + 1).toString().padStart(3, '0')}`,
      name: '', title: '咨询师', avatar: '', experience: 0, sessionHours: 0, 
      supervisionReceivedHours: 0, personalTherapyHours: 0, supervisionGivenHours: 0,
      specialties: [], tags: ['严选录入'], training: [], bio: '', education: '', 
      price: 500, rating: 5.0, available: true, 
      availableSlots: generateInitialSlots(), 
      auditStatus: { backgroundChecked: true, ethicalInterviewed: true, clinicalAssessed: true }
    };
    setEditingCounselor(newCounselor);
    setShowTrainingInput(false);
  };

  const handleSaveCounselor = async () => {
    if (!editingCounselor) return;
    if (editingCounselor.specialties.length < 3 || editingCounselor.specialties.length > 5) {
      alert('擅长领域需选择 3-5 个。');
      return;
    }
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 800));
    const isNew = !allCounselors.find(c => c.id === editingCounselor.id);
    const updatedList = isNew ? [...allCounselors, editingCounselor] : allCounselors.map(c => c.id === editingCounselor.id ? editingCounselor : c);
    onUpdateCounselors(updatedList);
    setEditingCounselor(null);
    showToast("✓ 档案同步成功");
    setIsSaving(false);
  };

  const toggleSpecialty = (s: string) => {
    if (!editingCounselor) return;
    const current = editingCounselor.specialties;
    const next = current.includes(s) ? current.filter(i => i !== s) : [...current, s];
    if (next.length > 5) return;
    setEditingCounselor({ ...editingCounselor, specialties: next });
  };

  const handleAddTraining = () => {
    if (!editingCounselor || !trainingInput.trim()) return;
    setEditingCounselor({
      ...editingCounselor,
      training: [...editingCounselor.training, trainingInput.trim()]
    });
    setTrainingInput('');
    showToast('✓ 已添加经历');
  };

  const handleSavePaymentConfig = () => {
    localStorage.setItem('banyan_payment_config', JSON.stringify(paymentConfig));
    window.dispatchEvent(new Event('banyan_payment_config_updated'));
    showToast('✓ 收款配置已更新');
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[250] bg-[#1A1412] flex items-center justify-center p-6 animate-in fade-in">
        <div className="w-full max-w-sm bg-white rounded-[40px] shadow-2xl p-12 text-center">
          <div className="w-16 h-16 bg-[#B87333] rounded-2xl flex items-center justify-center text-white font-serif text-4xl mx-auto mb-8">伴</div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input type="text" placeholder="创始人手机号" value={loginForm.phone} onChange={e => setLoginForm({...loginForm, phone: e.target.value})} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-[#B87333]" />
            <input type="password" placeholder="创始人密码" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-[#B87333]" />
            <button type="submit" className="w-full bg-[#1A1412] text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-[#B87333] transition-all">创始人验证进入</button>
            <button type="button" onClick={onClose} className="text-[10px] text-stone-300 font-bold uppercase tracking-widest block w-full text-center">返回首页</button>
          </form>
          {loginError && <p className="mt-4 text-red-500 text-xs font-bold">{loginError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-[#FAF8F6] flex flex-col p-4 md:p-12 overflow-hidden animate-in fade-in">
      {toast && <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[400] bg-[#1A1412] text-white px-8 py-4 rounded-full shadow-2xl text-[11px] font-black uppercase tracking-widest">{toast}</div>}

      <div className="flex justify-between items-center mb-12 px-6 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-[#B87333] rounded-2xl flex items-center justify-center text-white font-serif text-2xl shadow-xl">伴</div>
          <h2 className="text-2xl font-black text-[#1A1412] tracking-tighter uppercase">伴言 · 创始人管理总台</h2>
        </div>
        <button onClick={onClose} className="w-12 h-12 rounded-full bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:rotate-90 transition-all">✕</button>
      </div>

      <div className="flex flex-1 overflow-hidden rounded-[48px] bg-white shadow-2xl border border-stone-50 flex-col md:flex-row">
        <aside className="w-full md:w-72 bg-[#FAF8F6]/40 border-r border-stone-50 p-10 flex flex-row md:flex-col gap-10 overflow-x-auto no-scrollbar">
          {[
            { id: 'charity', zh: '公益管理', en: 'CHARITY' },
            { id: 'staff', zh: '专家名录', en: 'DIRECTORY' },
            { id: 'finance', zh: '结算中心', en: 'FINANCE' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`text-left flex flex-col gap-1 transition-all ${activeTab === tab.id ? 'text-[#B87333]' : 'text-stone-300'}`}>
              <span className="text-md font-bold">{tab.zh}</span>
              <span className="text-[8px] font-black uppercase tracking-widest">{tab.en}</span>
              {activeTab === tab.id && <div className="h-1 w-6 bg-[#B87333] mt-2 rounded-full"></div>}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-8 md:p-16 overflow-y-auto no-scrollbar bg-white">
          {activeTab === 'charity' && (
            <div className="space-y-16 animate-in fade-in">
              <header className="space-y-4">
                 <h3 className="text-4xl font-serif text-[#1A1412]">公益管理</h3>
                 <p className="text-stone-400 font-serif italic text-sm">设定公益规则并发布。您可以将生成的公益二维码分发给需要的来访者。</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                 <div className="lg:col-span-8 space-y-10">
                   <div className="bg-[#FAF8F6] p-10 rounded-[40px] border border-stone-50 space-y-10">
                      <div className="flex justify-between items-center px-2">
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-[#1A1412] uppercase tracking-widest">公益项目开关 (GLOBAL STATUS)</label>
                         </div>
                         <button onClick={() => setCharityProject({...charityProject, enabled: !charityProject.enabled})} className={`w-14 h-8 rounded-full p-1 transition-all ${charityProject.enabled ? 'bg-[#B87333]' : 'bg-stone-200'}`}>
                            <div className={`w-6 h-6 bg-white rounded-full transition-all ${charityProject.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                         </button>
                      </div>

                      <div className="grid grid-cols-3 gap-8">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">单价 (¥)</label>
                           <input type="number" value={charityProject.price} onChange={e => setCharityProject({...charityProject, price: parseFloat(e.target.value)})} className="w-full p-5 bg-white border border-stone-100 rounded-3xl outline-none font-serif text-xl font-bold" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">单人次数限制</label>
                           <input type="number" value={charityProject.usageLimitPerClient} onChange={e => setCharityProject({...charityProject, usageLimitPerClient: parseInt(e.target.value)})} className="w-full p-5 bg-white border border-stone-100 rounded-3xl outline-none font-serif text-xl font-bold" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">专家承接上限</label>
                           <input type="number" value={charityProject.maxClientsPerCounselor} onChange={e => setCharityProject({...charityProject, maxClientsPerCounselor: parseInt(e.target.value)})} className="w-full p-5 bg-white border border-stone-100 rounded-3xl outline-none font-serif text-xl font-bold" />
                        </div>
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">项目图文简介</label>
                         <textarea value={charityProject.description} onChange={e => setCharityProject({...charityProject, description: e.target.value})} className="w-full h-32 p-6 bg-white border border-stone-100 rounded-[32px] outline-none font-serif text-sm italic leading-relaxed resize-none" />
                      </div>

                      <div className="space-y-6">
                        <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">参与专家</label>
                        <div className="flex flex-wrap gap-3">
                           {allCounselors.map(c => (
                             <button key={c.id} onClick={() => {
                               const current = charityProject.participatingCounselorIds;
                               const next = current.includes(c.id) ? current.filter(i => i !== c.id) : [...current, c.id];
                               setCharityProject({ ...charityProject, participatingCounselorIds: next });
                             }} className={`px-6 py-3 rounded-2xl border text-sm transition-all ${charityProject.participatingCounselorIds.includes(c.id) ? 'bg-[#1A1412] text-white border-transparent' : 'bg-white border-stone-100 text-stone-400'}`}>
                                {c.name} {charityProject.participatingCounselorIds.includes(c.id) && '✓'}
                             </button>
                           ))}
                        </div>
                      </div>
                      <button onClick={handleSaveCharity} className="w-full py-6 bg-[#1A1412] text-white rounded-full font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-[#B87333] transition-all">发布并同步公益配置</button>
                   </div>
                 </div>

                 <div className="lg:col-span-4 space-y-12">
                    <div className="bg-[#FAF8F6] p-10 rounded-[40px] border border-stone-50 space-y-10 text-center">
                       <h4 className="text-[10px] font-black text-[#1A1412] uppercase tracking-[0.4em]">公益分发二维码</h4>
                       <div className="p-8 bg-white rounded-[32px] border border-stone-100 shadow-sm relative group">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(charityShareUrl)}`} 
                            className="w-full aspect-square object-contain rounded-xl grayscale group-hover:grayscale-0 transition-all duration-700" 
                          />
                          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer" onClick={copyCharityLink}>
                             <span className="bg-[#1A1412] text-white px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">复制链接</span>
                          </div>
                       </div>
                       <div className="space-y-4 pt-6 border-t border-stone-100">
                          <label className="text-[10px] font-black text-[#1A1412] uppercase tracking-widest block mb-4">小助理微信码 (ASSET)</label>
                          <div onDragOver={e => e.preventDefault()} onDrop={e => handleImageDrop(e, (b) => {setAssistantQr(b); showToast('✓ 小助理码已更新');})} className="aspect-square bg-white rounded-3xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center relative group overflow-hidden">
                             {assistantQr ? <img src={assistantQr} className="w-full h-full object-contain" /> : <span className="text-stone-200 text-[9px] font-black uppercase tracking-widest">拖入小助理码</span>}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="space-y-12 animate-in fade-in">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <h3 className="text-4xl font-serif text-[#1A1412]">专家名录</h3>
                  <p className="text-stone-400 font-serif italic text-sm">严选专家入驻管理。直接拖入图片至卡片可快速修改头像。</p>
                </div>
                <button onClick={handleOpenNewCounselor} className="px-10 py-4 bg-[#B87333] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">新增专家档案</button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-10">
                {allCounselors.map(c => (
                  <div 
                    key={c.id} 
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => handleImageDrop(e, (base64) => {
                      const updatedList = allCounselors.map(item => item.id === c.id ? { ...item, avatar: base64 } : item);
                      onUpdateCounselors(updatedList);
                      showToast(`✓ ${c.name} 的头像已更新`);
                    })}
                    className="group/card relative p-10 bg-white rounded-[40px] border border-stone-100 hover:shadow-2xl transition-all flex flex-col gap-6"
                  >
                    {/* 拖拽上传覆盖层 */}
                    <div className="absolute inset-0 bg-[#B87333]/5 opacity-0 group-hover/card:opacity-100 border-2 border-dashed border-[#B87333]/20 rounded-[40px] pointer-events-none transition-opacity flex items-center justify-center z-10">
                       <span className="text-[9px] font-black text-[#B87333] uppercase tracking-widest bg-white/90 px-4 py-2 rounded-full shadow-sm">释放以更换头像</span>
                    </div>

                    <div className="flex gap-6 items-center relative z-0">
                      <div className="relative w-20 h-20 shrink-0">
                        <img src={c.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2'} className="w-full h-full rounded-2xl object-cover grayscale-[20%]" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="text-2xl font-serif text-[#1A1412]">{c.name}</h4>
                        <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">{c.serialNumber}</span>
                      </div>
                    </div>
                    <button onClick={() => setEditingCounselor(c)} className="w-full py-4 bg-[#1A1412] text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest relative z-20">编辑详细档案</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-12 animate-in fade-in">
              <header className="space-y-4">
                 <h3 className="text-4xl font-serif text-[#1A1412]">结算中心</h3>
                 <div className="flex gap-8 border-b border-stone-100 pb-2">
                    {[{ id: 'ledger', zh: '服务结算单' }, { id: 'pending', zh: '待审退款' }, { id: 'payment_config', zh: '支付方式配置' }].map(sub => (
                      <button key={sub.id} onClick={() => setFinanceSubTab(sub.id as any)} className={`pb-4 text-[13px] font-bold transition-all relative ${financeSubTab === sub.id ? 'text-[#B87333]' : 'text-stone-300'}`}>
                        {sub.zh}
                        {financeSubTab === sub.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#B87333]"></div>}
                      </button>
                    ))}
                 </div>
              </header>
              {financeSubTab === 'ledger' && (
                <div className="overflow-x-auto rounded-[32px] border border-stone-100 shadow-sm">
                   <table className="w-full text-left font-serif border-collapse">
                      <thead>
                        <tr className="bg-stone-50 text-[10px] font-black text-stone-300 uppercase tracking-widest">
                          <th className="py-6 px-6">专家姓名</th>
                          <th className="py-6 px-4">总营收</th>
                          <th className="py-6 px-4 text-[#B87333]">平台服务费(20%)</th>
                          <th className="py-6 px-4 font-black">专家待结算</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50 text-sm">
                        {financeData.map(row => (
                          <tr key={row.counselorId}>
                            <td className="py-6 px-6 font-bold">{row.counselorName}</td>
                            <td className="py-6 px-4">¥{row.totalRevenue}</td>
                            <td className="py-6 px-4 text-[#B87333]">¥{row.totalRevenue * 0.2}</td>
                            <td className="py-6 px-4 font-black">¥{row.totalRevenue * 0.8}</td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              )}
              {financeSubTab === 'payment_config' && (
                <div className="max-w-xl bg-[#FAF8F6] p-10 rounded-[40px] border border-stone-50 space-y-8">
                   <div onDragOver={e => e.preventDefault()} onDrop={e => handleImageDrop(e, (b) => {setPaymentConfig({...paymentConfig, qrCodeUrl: b}); showToast('✓ 收款码已读取');})} className="aspect-square w-48 bg-white mx-auto rounded-3xl border-2 border-dashed border-stone-200 flex items-center justify-center relative group overflow-hidden">
                      {paymentConfig.qrCodeUrl ? <img src={paymentConfig.qrCodeUrl} className="w-full h-full object-contain" /> : <span className="text-stone-200 text-[10px] font-black">拖入收款二维码</span>}
                   </div>
                   <input type="text" placeholder="对公账户名称" value={paymentConfig.accountName} onChange={e => setPaymentConfig({...paymentConfig, accountName: e.target.value})} className="w-full p-4 bg-white border border-stone-100 rounded-2xl outline-none" />
                   <input type="text" placeholder="对公银行账号" value={paymentConfig.accountNumber} onChange={e => setPaymentConfig({...paymentConfig, accountNumber: e.target.value})} className="w-full p-4 bg-white border border-stone-100 rounded-2xl outline-none" />
                   <button onClick={handleSavePaymentConfig} className="w-full py-5 bg-[#1A1412] text-white rounded-full font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl">更新公司支付信息</button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {editingCounselor && (
        <div className="fixed inset-0 z-[300] bg-[#1A1412]/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12">
           <div className="bg-white w-full max-w-7xl h-full rounded-[64px] flex flex-col shadow-4xl relative overflow-hidden">
              <button onClick={() => setEditingCounselor(null)} className="absolute top-12 right-12 text-stone-400 w-12 h-12 flex items-center justify-center border border-stone-50 rounded-full hover:bg-stone-50 transition-colors">✕</button>
              <div className="flex-1 overflow-y-auto no-scrollbar p-12 md:p-24">
                <header className="mb-16"><h2 className="text-4xl md:text-6xl font-serif text-[#1A1412] tracking-tighter italic">档案编辑器</h2></header>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                   <div className="lg:col-span-5 space-y-12">
                      <div onDragOver={e => e.preventDefault()} onDrop={e => handleImageDrop(e, (b) => {setEditingCounselor({...editingCounselor, avatar: b}); showToast('✓ 档案照片已更新');})} className="aspect-[4/5] bg-stone-50 rounded-[48px] overflow-hidden border border-stone-100 relative group cursor-pointer">
                         {editingCounselor.avatar ? <img src={editingCounselor.avatar} className="w-full h-full object-cover transition-all group-hover:scale-105 duration-1000" /> : <div className="w-full h-full flex items-center justify-center text-stone-200">拖入照片</div>}
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">姓名</label>
                            <input type="text" value={editingCounselor.name} onChange={e => setEditingCounselor({...editingCounselor, name: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl outline-none font-serif text-xl" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">编号</label>
                            <input type="text" value={editingCounselor.serialNumber} onChange={e => setEditingCounselor({...editingCounselor, serialNumber: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl outline-none" />
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">学历</label>
                            <input type="text" value={editingCounselor.education} onChange={e => setEditingCounselor({...editingCounselor, education: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl outline-none" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">单价 (¥/次)</label>
                            <input type="number" value={editingCounselor.price} onChange={e => setEditingCounselor({...editingCounselor, price: parseInt(e.target.value)})} className="w-full p-4 bg-stone-50 rounded-2xl outline-none text-[#B87333] font-bold" />
                         </div>
                      </div>
                   </div>
                   <div className="lg:col-span-7 space-y-10">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {[
                          { label: '执业年限', key: 'experience' },
                          { label: '个案时长', key: 'sessionHours' },
                          { label: '受督时长', key: 'supervisionReceivedHours' },
                          { label: '个人体验', key: 'personalTherapyHours' },
                          { label: '督导他人', key: 'supervisionGivenHours' }
                        ].map(item => (
                          <div key={item.key} className="space-y-2">
                             <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-1">{item.label}</label>
                             <input type="number" value={(editingCounselor as any)[item.key]} onChange={e => setEditingCounselor({...editingCounselor, [item.key]: parseInt(e.target.value)})} className="w-full p-4 bg-stone-50 rounded-2xl outline-none font-bold text-center" />
                          </div>
                        ))}
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest">擅长领域 (3-5 个必选)</label>
                        <div className="flex flex-wrap gap-2">
                           {SPECIALTY_OPTIONS.map(s => (
                             <button key={s} onClick={() => toggleSpecialty(s)} className={`px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${editingCounselor.specialties.includes(s) ? 'bg-[#1A1412] text-white border-transparent' : 'bg-white text-stone-400 border-stone-100 hover:border-[#B87333]'}`}>{s}</button>
                           ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest">咨询寄语</label>
                        <textarea maxLength={150} value={editingCounselor.bio} onChange={e => setEditingCounselor({...editingCounselor, bio: e.target.value})} className="w-full h-32 p-8 bg-[#FAF8F6] rounded-[32px] font-serif italic text-lg outline-none resize-none" />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                           <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest">受训背景 (TRAINING)</label>
                           <button onClick={() => setShowTrainingInput(!showTrainingInput)} className="text-[10px] font-black text-[#B87333] border-b border-[#B87333]/20 hover:text-[#1A1412] transition-colors">{showTrainingInput ? '✕ 关闭输入' : '＋ 增加经历'}</button>
                        </div>
                        <div className="space-y-3">
                           {showTrainingInput && (
                             <div className="flex gap-4 animate-in slide-in-from-top-2">
                                <input autoFocus value={trainingInput} onChange={e => setTrainingInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTraining()} className="flex-1 p-5 bg-stone-50 rounded-2xl outline-none text-sm border border-[#B87333]/10 focus:border-[#B87333]" placeholder="例如：中德精神分析连续培训项目..." />
                                <button onClick={handleAddTraining} className="w-14 h-14 bg-[#B87333] text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-[#1A1412] transition-all">＋</button>
                             </div>
                           )}
                           {editingCounselor.training.map((t, i) => (
                             <div key={i} className="flex justify-between items-center p-5 bg-stone-50 rounded-2xl group hover:bg-white transition-all border border-transparent hover:border-stone-100">
                                <span className="text-sm font-serif text-stone-600">· {t}</span>
                                <button onClick={() => setEditingCounselor({...editingCounselor, training: editingCounselor.training.filter((_, idx) => idx !== i)})} className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all">✕</button>
                             </div>
                           ))}
                        </div>
                      </div>
                   </div>
                </div>
              </div>
              <footer className="p-12 border-t border-stone-50 flex justify-end gap-6 bg-white/80 backdrop-blur-2xl rounded-b-[64px]">
                 <button onClick={() => setEditingCounselor(null)} className="px-12 py-5 text-[11px] font-black uppercase text-stone-300">取消</button>
                 <button onClick={handleSaveCounselor} disabled={isSaving} className="px-20 py-6 bg-[#1A1412] text-white rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-[#B87333] transition-all disabled:opacity-20">{isSaving ? '同步中...' : '保存并更新档案 SYNC'}</button>
              </footer>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
