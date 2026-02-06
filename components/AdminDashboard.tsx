
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Counselor, GlobalCharityProject, FinanceRow, RefundRequest, PaymentConfig, TimeSlot } from '../types';

interface AdminDashboardProps {
  onClose: () => void;
  allCounselors: Counselor[];
  onUpdateCounselors: (counselors: Counselor[]) => void;
}

const SPECIALTY_OPTIONS = ['恋爱心理', '婚姻家庭', '青少年心理', '情绪调节', '职场压力', '个人成长', '原生家庭', '深度陪伴', '动力学取向', '人际关系', '自我同一性', '复杂性创伤'];

// 助手函数：生成初始排班（默认全部下线/已占用状态，待咨询师激活）
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
      isBooked: true // 初始设为 true (即 Offline/不可约)，咨询师需在工作台点亮
    }))
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose, allCounselors, onUpdateCounselors }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ phone: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'brand' | 'staff' | 'finance'>('brand');
  const [financeSubTab, setFinanceSubTab] = useState<'ledger' | 'pending' | 'payment_config'>('ledger');
  const [editingCounselor, setEditingCounselor] = useState<Counselor | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  const [trainingInput, setTrainingInput] = useState('');
  const [showTrainingInput, setShowTrainingInput] = useState(false);

  // --- 品牌管理：公益项目状态 ---
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
          showToast('✓ 图片已读取');
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
    showToast('✓ 品牌配置已实时生效');
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
      availableSlots: generateInitialSlots(), // 核心修复：初始化排班数组
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
            <input type="text" placeholder="手机号" value={loginForm.phone} onChange={e => setLoginForm({...loginForm, phone: e.target.value})} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none" />
            <input type="password" placeholder="密码" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none" />
            <button type="submit" className="w-full bg-[#1A1412] text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px]">创始人验证进入</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-[#FAF8F6] flex flex-col p-4 md:p-12 overflow-hidden animate-in fade-in">
      {toast && <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[400] bg-[#1A1412] text-white px-8 py-4 rounded-full shadow-2xl text-[11px] font-black uppercase tracking-widest">{toast}</div>}

      <div className="flex justify-between items-center mb-12 px-6 shrink-0">
        <h2 className="text-2xl font-black text-[#1A1412] tracking-tighter uppercase">伴言 · 创始人总控台</h2>
        <button onClick={onClose} className="w-12 h-12 rounded-full bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:rotate-90 transition-all">✕</button>
      </div>

      <div className="flex flex-1 overflow-hidden rounded-[48px] bg-white shadow-2xl border border-stone-50 flex-col md:flex-row">
        <aside className="w-full md:w-72 bg-[#FAF8F6]/40 border-r border-stone-50 p-10 flex flex-row md:flex-col gap-10 overflow-x-auto no-scrollbar">
          {[
            { id: 'brand', zh: '品牌管理', en: 'BRANDING' },
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
          {activeTab === 'brand' && (
            <div className="space-y-16 animate-in fade-in">
              <header className="space-y-4">
                 <h3 className="text-4xl font-serif text-[#1A1412]">品牌资产与公益配置</h3>
                 <p className="text-stone-400 font-serif italic text-sm">在此设定全局规则。发布后可生成分发二维码。</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                 <div className="lg:col-span-8 space-y-10">
                   <div className="bg-[#FAF8F6] p-10 rounded-[40px] border border-stone-50 space-y-10">
                      <div className="flex justify-between items-center px-2">
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-[#1A1412] uppercase tracking-widest">公益直通计划 (GLOBAL ACTIVE)</label>
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
                      <button onClick={handleSaveCharity} className="w-full py-6 bg-[#1A1412] text-white rounded-full font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-[#B87333] transition-all">发布并同步品牌配置</button>
                   </div>
                 </div>

                 <div className="lg:col-span-4 space-y-12">
                    <div className="bg-[#FAF8F6] p-10 rounded-[40px] border border-stone-50 space-y-10 text-center">
                       <h4 className="text-[10px] font-black text-[#1A1412] uppercase tracking-[0.4em]">分发获客入口</h4>
                       <div className="p-8 bg-white rounded-[32px] border border-stone-100 shadow-sm relative group">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(charityShareUrl)}`} 
                            className="w-full aspect-square object-contain rounded-xl grayscale group-hover:grayscale-0 transition-all duration-700" 
                          />
                          <div className="absolute inset-0 bg-white/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer" onClick={copyCharityLink}>
                             <span className="bg-[#1A1412] text-white px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">复制 URL</span>
                          </div>
                       </div>
                       <div className="space-y-4 pt-6 border-t border-stone-100">
                          <label className="text-[10px] font-black text-[#1A1412] uppercase tracking-widest block mb-4">小助理连接码 (ASSET)</label>
                          <div onDragOver={e => e.preventDefault()} onDrop={e => handleImageDrop(e, (b) => setAssistantQr(b))} className="aspect-square bg-white rounded-3xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center relative group overflow-hidden">
                             {assistantQr ? <img src={assistantQr} className="w-full h-full object-contain" /> : <span className="text-stone-200 text-[9px] font-black uppercase tracking-widest">拖入图片</span>}
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
                  <h3 className="text-4xl font-serif text-[#1A1412]">专家名录管理</h3>
                  <p className="text-stone-400 font-serif italic text-sm">严选专家入驻。档案同步后将公示于前端专家墙。</p>
                </div>
                <button onClick={handleOpenNewCounselor} className="px-10 py-4 bg-[#B87333] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">新增专家档案</button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-10">
                {allCounselors.map(c => (
                  <div key={c.id} className="p-10 bg-white rounded-[40px] border border-stone-100 hover:shadow-2xl transition-all flex flex-col gap-6">
                    <div className="flex gap-6 items-center">
                      <img src={c.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2'} className="w-20 h-20 rounded-2xl object-cover grayscale-[20%]" />
                      <div>
                        <h4 className="text-2xl font-serif">{c.name}</h4>
                        <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest">{c.serialNumber}</span>
                      </div>
                    </div>
                    <button onClick={() => setEditingCounselor(c)} className="w-full py-4 bg-[#1A1412] text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest">管理专家档案</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-12 animate-in fade-in">
              <header className="space-y-4">
                 <h3 className="text-4xl font-serif text-[#1A1412]">财务结算体系</h3>
                 <div className="flex gap-8 border-b border-stone-100 pb-2">
                    {[{ id: 'ledger', zh: '专家费用结算' }, { id: 'pending', zh: '退款审核' }, { id: 'payment_config', zh: '支付方式修改' }].map(sub => (
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
                          <th className="py-6 px-4">总收费</th>
                          <th className="py-6 px-4 text-[#B87333]">税/技费(20%)</th>
                          <th className="py-6 px-4 font-black">待发放</th>
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
                   <div onDragOver={e => e.preventDefault()} onDrop={e => handleImageDrop(e, (b) => setPaymentConfig({...paymentConfig, qrCodeUrl: b}))} className="aspect-square w-48 bg-white mx-auto rounded-3xl border-2 border-dashed border-stone-200 flex items-center justify-center relative group overflow-hidden">
                      {paymentConfig.qrCodeUrl ? <img src={paymentConfig.qrCodeUrl} className="w-full h-full object-contain" /> : <span className="text-stone-200 text-[10px] font-black">拖入收款码</span>}
                   </div>
                   <input type="text" placeholder="账户名称" value={paymentConfig.accountName} onChange={e => setPaymentConfig({...paymentConfig, accountName: e.target.value})} className="w-full p-4 bg-white border border-stone-100 rounded-2xl outline-none" />
                   <input type="text" placeholder="账号" value={paymentConfig.accountNumber} onChange={e => setPaymentConfig({...paymentConfig, accountNumber: e.target.value})} className="w-full p-4 bg-white border border-stone-100 rounded-2xl outline-none" />
                   <button onClick={handleSavePaymentConfig} className="w-full py-5 bg-[#1A1412] text-white rounded-full font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl">同步公司支付方式</button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {editingCounselor && (
        <div className="fixed inset-0 z-[300] bg-[#1A1412]/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12">
           <div className="bg-white w-full max-w-7xl h-full rounded-[64px] flex flex-col shadow-4xl relative overflow-hidden">
              <button onClick={() => setEditingCounselor(null)} className="absolute top-12 right-12 text-stone-400 w-12 h-12 flex items-center justify-center border border-stone-50 rounded-full">✕</button>
              <div className="flex-1 overflow-y-auto no-scrollbar p-12 md:p-24">
                <header className="mb-16"><h2 className="text-4xl md:text-6xl font-serif text-[#1A1412] tracking-tighter italic">专家档案编辑器</h2></header>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                   <div className="lg:col-span-5 space-y-12">
                      <div onDragOver={e => e.preventDefault()} onDrop={e => handleImageDrop(e, (b) => setEditingCounselor({...editingCounselor, avatar: b}))} className="aspect-[4/5] bg-stone-50 rounded-[48px] overflow-hidden border border-stone-100 relative group cursor-pointer">
                         {editingCounselor.avatar ? <img src={editingCounselor.avatar} className="w-full h-full object-cover transition-all group-hover:scale-105 duration-1000" /> : <div className="w-full h-full flex items-center justify-center text-stone-200">本地拖入照片</div>}
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">姓名 (NAME)</label>
                            <input type="text" value={editingCounselor.name} onChange={e => setEditingCounselor({...editingCounselor, name: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl outline-none font-serif text-xl" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">编号 (SERIAL)</label>
                            <input type="text" value={editingCounselor.serialNumber} onChange={e => setEditingCounselor({...editingCounselor, serialNumber: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl outline-none" />
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">最高学历 (EDUCATION)</label>
                            <input type="text" value={editingCounselor.education} onChange={e => setEditingCounselor({...editingCounselor, education: e.target.value})} className="w-full p-4 bg-stone-50 rounded-2xl outline-none" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">常规单价 (¥/次)</label>
                            <input type="number" value={editingCounselor.price} onChange={e => setEditingCounselor({...editingCounselor, price: parseInt(e.target.value)})} className="w-full p-4 bg-stone-50 rounded-2xl outline-none text-[#B87333] font-bold" />
                         </div>
                      </div>
                   </div>
                   <div className="lg:col-span-7 space-y-10">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {[
                          { label: '职业年限', key: 'experience' },
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
                        <div className="flex justify-between px-2">
                          <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest">咨询寄语 (150 字内)</label>
                        </div>
                        <textarea maxLength={150} value={editingCounselor.bio} onChange={e => setEditingCounselor({...editingCounselor, bio: e.target.value})} className="w-full h-32 p-8 bg-[#FAF8F6] rounded-[32px] font-serif italic text-lg outline-none resize-none" />
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                           <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest">受训背景 (TRAINING)</label>
                           <button onClick={() => setShowTrainingInput(true)} className="text-[10px] font-black text-[#B87333] border-b border-[#B87333]/20">＋ 增加经历项目</button>
                        </div>
                        <div className="space-y-3">
                           {showTrainingInput && (
                             <div className="flex gap-4 animate-in slide-in-from-top-2">
                                <input autoFocus value={trainingInput} onChange={e => setTrainingInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (()=>{ if(!trainingInput.trim()) return; setEditingCounselor({...editingCounselor, training: [...editingCounselor.training, trainingInput.trim()]}); setTrainingInput(''); setShowTrainingInput(false); })()} className="flex-1 p-5 bg-stone-50 rounded-2xl outline-none text-sm border border-[#B87333]/10" placeholder="例如：中德精神分析连续培训项目..." />
                             </div>
                           )}
                           {editingCounselor.training.map((t, i) => (
                             <div key={i} className="flex justify-between items-center p-5 bg-stone-50 rounded-2xl group hover:bg-white transition-all">
                                <span className="text-sm font-serif text-stone-600">· {t}</span>
                                <button onClick={() => setEditingCounselor({...editingCounselor, training: editingCounselor.training.filter((_, idx) => idx !== i)})} className="opacity-0 group-hover:opacity-100 text-stone-300">✕</button>
                             </div>
                           ))}
                        </div>
                      </div>
                   </div>
                </div>
              </div>
              <footer className="p-12 border-t border-stone-50 flex justify-end gap-6 bg-white/80 backdrop-blur-2xl rounded-b-[64px]">
                 <button onClick={() => setEditingCounselor(null)} className="px-12 py-5 text-[11px] font-black uppercase text-stone-300">取消</button>
                 <button onClick={handleSaveCounselor} disabled={isSaving} className="px-20 py-6 bg-[#1A1412] text-white rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-[#B87333] transition-all disabled:opacity-20">{isSaving ? '同步中...' : '保存并同步档案 SYNC'}</button>
              </footer>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
