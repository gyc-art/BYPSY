
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Counselor, MatchingResult, TimeSlot, IntakeFormResponse, SessionPackage, GlobalCharityProject, BookingRecord, PaymentConfig } from './types';
import { COUNSELORS } from './constants';
import CounselorCard from './components/CounselorCard';
import AIMatcher from './components/AIMatcher';
import Footer from './components/Footer';
import BanyanSpace from './components/BanyanSpace';
import AdminDashboard from './components/AdminDashboard';
import PractitionerDashboard from './components/PractitionerDashboard';
import MissionPage from './components/MissionPage';
import ServiceProcessPage from './components/ServiceProcessPage';
import IntakeForm from './components/IntakeForm';
import RecruitmentPage from './components/RecruitmentPage';

type BookingStage = 'profile' | 'packages' | 'payment' | 'assistant' | 'intake' | 'success' | 'crisis';

const MainSite: React.FC = () => {
  const [allCounselors, setAllCounselors] = useState<Counselor[]>(() => {
    return COUNSELORS.map(c => ({ ...c, password: c.password || '888111' }));
  });
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null);
  
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [bookingStep, setBookingStep] = useState<BookingStage>('profile');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isPractitionerOpen, setIsPractitionerOpen] = useState(false);
  const [isClientProfileOpen, setIsClientProfileOpen] = useState(false);
  
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [showMissionPage, setShowMissionPage] = useState(false);
  const [showServiceProcess, setShowServiceProcess] = useState(false);
  const [showRecruitmentPage, setShowRecruitmentPage] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [sessionCount, setSessionCount] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'transfer'>('qr');

  // --- 支付加固状态 ---
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState('');
  const pollingRef = useRef<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(() => {
    const saved = localStorage.getItem('banyan_payment_config');
    return saved ? JSON.parse(saved) : {
      qrCodeUrl: '',
      accountName: '深圳市伴言心理咨询有限责任公司',
      bankName: '招商银行股份有限公司深圳南山支行',
      accountNumber: '7559 5218 0510 101'
    };
  });

  const [assistantQr, setAssistantQr] = useState<string>(() => {
    return localStorage.getItem('banyan_assistant_qr') || '';
  });

  // 支付轮询逻辑
  useEffect(() => {
    if (bookingStep === 'payment') {
      const orderId = `BY-${Date.now()}`;
      setCurrentOrderId(orderId);
      setIsPaymentVerified(false);

      // 启动轮询：每3秒检查一次
      pollingRef.current = window.setInterval(async () => {
        try {
          const res = await fetch('/api/check-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, phone: clientPhone })
          });
          const data = await res.json();
          if (data.success) {
            setIsPaymentVerified(true);
            if (pollingRef.current) clearInterval(pollingRef.current);
            showToast('✓ 系统已确认您的支付');
          }
        } catch (e) {
          console.error('Payment poll failed');
        }
      }, 3000);
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [bookingStep]);

  // 手动点击“我已完成支付”时的最终校验
  const handleFinalPaymentCheck = async () => {
    if (isPaymentVerified) {
      setBookingStep('assistant');
      setClientSessions(clientSessions + sessionCount);
      return;
    }

    setIsCheckingPayment(true);
    showToast('支付确认中，请稍后...');

    try {
      const res = await fetch('/api/check-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: currentOrderId, phone: clientPhone })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsPaymentVerified(true);
        setBookingStep('assistant');
        setClientSessions(clientSessions + sessionCount);
      } else {
        // 未检测到支付，优雅提示
        setTimeout(() => {
          showToast('尚未检测到到账信息，请确认支付成功后重试');
          setIsCheckingPayment(false);
        }, 1500);
      }
    } catch (error) {
      showToast('通讯异常，请联系伴言小助理手动核实');
      setIsCheckingPayment(false);
    }
  };

  useEffect(() => {
    const updatePaymentConfig = () => {
      const saved = localStorage.getItem('banyan_payment_config');
      if (saved) setPaymentConfig(JSON.parse(saved));
    };
    const updateAssistantQr = () => {
      const saved = localStorage.getItem('banyan_assistant_qr') || '';
      setAssistantQr(saved);
    };
    window.addEventListener('banyan_payment_config_updated', updatePaymentConfig);
    window.addEventListener('banyan_assistant_updated', updateAssistantQr);
    return () => {
      window.removeEventListener('banyan_payment_config_updated', updatePaymentConfig);
      window.removeEventListener('banyan_assistant_updated', updateAssistantQr);
    };
  }, []);

  const categories = ['全部', '恋爱心理', '婚姻家庭', '青少年心理', '情绪调节', '职场压力'];

  const [isCharityMode, setIsCharityMode] = useState(false);
  const [globalCharity, setGlobalCharity] = useState<GlobalCharityProject | null>(null);
  const [charityBookingStep, setCharityBookingStep] = useState<'invite' | 'pay' | 'select_counselor' | 'select_time' | 'done'>('invite');

  const [clientPhone, setClientPhone] = useState<string>(localStorage.getItem('banyan_client_phone') || '');
  const [clientSessions, setClientSessions] = useState<number>(Number(localStorage.getItem('banyan_client_sessions') || '0'));
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [changePasswordForm, setChangePasswordForm] = useState({ phone: '', oldPass: '', newPass: '' });
  const [clientProfileTab, setClientProfileTab] = useState<'status' | 'history' | 'settings'>('status');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'charity') {
      setIsCharityMode(true);
    }
    
    const updateCharityConfig = () => {
      const saved = localStorage.getItem('banyan_global_charity');
      if (saved) setGlobalCharity(JSON.parse(saved));
    };
    
    updateCharityConfig();
    window.addEventListener('charity_project_updated', updateCharityConfig);
    return () => window.removeEventListener('charity_project_updated', updateCharityConfig);
  }, []);

  useEffect(() => {
    if (selectedCounselor || isAdminOpen || isPractitionerOpen || showMissionPage || showServiceProcess || showRecruitmentPage || isClientProfileOpen || isLoginModalOpen || isChangePasswordModalOpen || isCharityMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedCounselor, isAdminOpen, isPractitionerOpen, showMissionPage, showServiceProcess, showRecruitmentPage, isClientProfileOpen, isLoginModalOpen, isChangePasswordModalOpen, isCharityMode]);

  const handleOpenDetail = (c: Counselor) => {
    if (isCharityMode) {
      const used = globalCharity?.charityUsage[c.id] || 0;
      if (used >= (globalCharity?.maxClientsPerCounselor || 0)) {
        return;
      }
    }
    
    if (isCharityMode && charityBookingStep === 'select_counselor') {
      setSelectedCounselor(c);
      setCharityBookingStep('select_time');
      return;
    }
    setSelectedCounselor(c);
    setBookingStep('profile');
    setSelectedSlot(null);
  };

  const handleAIMatched = (result: MatchingResult) => {
    setAiMatchedIds(result.counselorIds);
    document.getElementById('counselors-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  const counselorsToDisplay = useMemo(() => {
    let list = allCounselors;
    if (aiMatchedIds) list = list.filter(c => aiMatchedIds.includes(c.id));
    if (activeCategory !== '全部') list = list.filter(c => c.specialties.includes(activeCategory));
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.serialNumber.toLowerCase().includes(term)
      );
    }
    return list;
  }, [allCounselors, aiMatchedIds, activeCategory, searchTerm]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPhone.length === 11) {
      const savedPass = localStorage.getItem(`client_pass_${loginPhone}`) || '888666';
      if (loginPassword !== savedPass) {
        alert('登录密码不正确。');
        return;
      }
      setClientPhone(loginPhone);
      localStorage.setItem('banyan_client_phone', loginPhone);
      const savedSessions = localStorage.getItem(`sessions_${loginPhone}`) || '0';
      setClientSessions(Number(savedSessions));
      setIsLoginModalOpen(false);
      setLoginPassword('');
    }
  };

  const handleLogout = () => {
    setClientPhone('');
    setClientSessions(0);
    localStorage.removeItem('banyan_client_phone');
    setIsClientProfileOpen(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const currentPass = localStorage.getItem(`client_pass_${changePasswordForm.phone}`) || '888666';
    if (changePasswordForm.oldPass !== currentPass) {
      alert('原密码错误。');
      return;
    }
    if (changePasswordForm.newPass.length < 6) {
      alert('新密码长度需不少于6位。');
      return;
    }
    localStorage.setItem(`client_pass_${changePasswordForm.phone}`, changePasswordForm.newPass);
    alert('密码修改成功，请使用新密码登录。');
    setIsChangePasswordModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const packageLogic = useMemo(() => {
    let discount = 0;
    let label = '自定义方案';
    let milestone = '';
    
    if (sessionCount < 10) {
      discount = 0;
      label = sessionCount === 1 ? '首次联结 First Contact' : '自定义方案 Custom';
      milestone = sessionCount === 1 ? '开启初步的心理探索' : '根据您的节奏灵活安排';
    } else if (sessionCount <= 19) {
      discount = 0.05;
      label = '焦点方案 Focus';
      milestone = '针对具体议题的快速干预';
    } else if (sessionCount <= 39) {
      discount = 0.10;
      label = '短程方案 Short-term';
      milestone = '症状缓解与行为重塑';
    } else if (sessionCount <= 99) {
      discount = 0.15;
      label = '中程方案 Medium-term';
      milestone = '情感模式与人格初步整合';
    } else {
      discount = 0.20;
      label = '长程方案 Long-term';
      milestone = '自我重构与无意识探索';
    }

    const unitPrice = selectedCounselor?.price || 0;
    const originalTotal = unitPrice * sessionCount;
    const finalTotal = originalTotal * (1 - discount);

    return { discount, label, milestone, originalTotal, finalTotal };
  }, [sessionCount, selectedCounselor]);

  const navItems = [
    { zh: '首页', en: 'HOME', action: () => { window.scrollTo({top: 0, behavior: 'smooth'}); setActiveSubMenu(activeSubMenu === '首页' ? null : '首页'); }, subs: [{ label: '品牌使命', action: () => setShowMissionPage(true) }, { label: '服务流程', action: () => setShowServiceProcess(true) }] },
    { zh: '伴言空间', en: 'INSIGHTS', action: () => { document.getElementById('space')?.scrollIntoView({ behavior: 'smooth' }); setActiveSubMenu(activeSubMenu === '伴言空间' ? null : '伴言空间'); }, subs: [] },
    { zh: '专家团队', en: 'SPECIALISTS', action: () => { document.getElementById('counselors-grid')?.scrollIntoView({ behavior: 'smooth' }); setActiveSubMenu(activeSubMenu === '专家团队' ? null : '专家团队'); }, subs: [] },
    { zh: '智能导诊', en: 'CONCIERGE', action: () => { document.getElementById('ai-guide')?.scrollIntoView({ behavior: 'smooth' }); setActiveSubMenu(activeSubMenu === '智能导诊' ? null : '智能导诊'); }, subs: [] },
    { 
      zh: '联系我们', 
      en: 'CONTACT', 
      action: () => { setActiveSubMenu(activeSubMenu === '联系我们' ? null : '联系我们'); }, 
      subs: [
        { label: '咨询师招募', action: () => { setShowRecruitmentPage(true); setActiveSubMenu(null); } }, 
        { label: '投诉建议', action: () => { window.location.href = 'mailto:yanchen.guo@qq.com?subject=伴言心理·投诉与建议反馈'; setActiveSubMenu(null); } }
      ] 
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-[#B87333]/20">
      {/* Toast 提示浮层 */}
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[9999] bg-[#1A1412] text-white px-8 py-4 rounded-full shadow-2xl animate-in slide-in-from-top-4 flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-[#B87333] rounded-full"></div>
          <span className="text-[10px] font-black tracking-widest uppercase">{toast}</span>
        </div>
      )}

      <header className="sticky top-0 z-[60] bg-white/95 backdrop-blur-3xl border-b border-stone-100">
        <nav className="px-6 md:px-20 py-4 md:py-8 flex flex-col items-center">
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => { window.scrollTo({top: 0, behavior: 'smooth'}); setActiveSubMenu(null); }}>
              <div className="w-10 h-10 md:w-11 md:h-11 bg-[#B87333] rounded-full flex items-center justify-center text-white font-serif text-lg md:text-xl transition-all duration-700 group-hover:shadow-[0_15px_40px_-5px_rgba(184,115,51,0.5)]">伴</div>
              <div className="flex flex-col">
                <h1 className="text-[15px] md:text-[16px] font-serif font-black text-[#1A1412] tracking-widest leading-none">伴言心理</h1>
                <span className="text-[7px] md:text-[8px] text-stone-200 font-black uppercase tracking-[0.4em] mt-1.5">Presence & Dialogue</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-12 relative">
              {navItems.map((item, i) => (
                <div key={i} className="flex flex-col items-center group/nav">
                  <button onClick={item.action} className={`flex flex-col items-center gap-1.5 transition-all ${activeSubMenu === item.zh ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}>
                    <span className={`text-[13px] font-bold ${activeSubMenu === item.zh ? 'text-[#1A1412]' : 'text-stone-400'}`}>{item.zh}</span>
                    <span className="text-[8px] font-black tracking-widest text-stone-200 uppercase">{item.en}</span>
                    <div className={`h-[2px] bg-[#B87333] transition-all duration-500 rounded-full mt-1 ${activeSubMenu === item.zh ? 'w-full' : 'w-0'}`}></div>
                  </button>
                  {activeSubMenu === item.zh && item.subs.length > 0 && (
                    <div className="absolute top-[120%] left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-3xl border border-stone-50 rounded-2xl p-4 min-w-[160px] shadow-2xl animate-in fade-in slide-in-from-top-2">
                       <div className="flex flex-col gap-3">
                          {item.subs.map((sub, idx) => (
                            <button key={idx} onClick={sub.action} className="text-[11px] font-bold text-stone-400 hover:text-[#1A1412] tracking-widest uppercase transition-colors text-center py-1">
                              {sub.label}
                            </button>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <button onClick={() => clientPhone ? setIsClientProfileOpen(true) : setIsLoginModalOpen(true)} className="group flex flex-col items-end opacity-60 hover:opacity-100 transition-opacity">
                <span className="text-[11px] font-bold text-[#1A1412] tracking-widest">{clientPhone ? '我的空间' : '登录'}</span>
                <span className="text-[8px] font-black text-stone-200 uppercase tracking-widest">Login</span>
              </button>
              <button onClick={() => document.getElementById('counselors-grid-anchor')?.scrollIntoView({behavior:'smooth'})} className="bg-[#1A1412] text-white px-8 py-2.5 rounded-full text-[11px] font-black tracking-[0.2em] hover:bg-[#B87333] transition-all duration-500 shadow-md">立即预约</button>
            </div>
          </div>
        </nav>
      </header>

      {showMissionPage && <MissionPage onClose={() => setShowMissionPage(false)} />}
      {showServiceProcess && <ServiceProcessPage onClose={() => setShowServiceProcess(false)} />}
      {showRecruitmentPage && <RecruitmentPage onClose={() => setShowRecruitmentPage(false)} />}

      <header className="relative w-full h-[calc(100vh-140px)] min-h-[750px] flex flex-col items-center justify-center bg-white overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] animate-soft-glow -z-10 rounded-full"></div>
        <div className="w-full max-w-[1200px] px-10 relative flex flex-col items-center">
          <div className="flex flex-col items-center justify-center space-y-24">
            <div className="flex items-center justify-center gap-10 md:gap-20 relative">
               <h2 className="hero-title-pillar font-serif select-none">伴</h2>
               <div className="flex flex-col items-center justify-center space-y-6 md:space-y-12 shrink-0">
                  <span className="font-serif text-[24px] md:text-[54px] text-[#1A1412]/50 tracking-[0.8em] whitespace-nowrap opacity-80">爱与在场</span>
                  <div className="w-32 md:w-64 h-[1px] bg-stone-100/60 shadow-sm"></div>
                  <span className="font-serif text-[24px] md:text-[54px] text-[#1A1412]/50 tracking-[0.8em] whitespace-nowrap opacity-80">观察解析</span>
               </div>
               <h2 className="hero-title-pillar font-serif select-none">言</h2>
            </div>
            <div className="flex flex-col items-center space-y-16">
              <div className="flex items-center gap-8 text-stone-300 font-serif">
                 <span className="text-[10px] md:text-sm">●</span>
                 <span className="text-[16px] md:text-[22px] tracking-[0.5em] font-medium text-stone-400">全员心理学硕博背景</span>
                 <span className="text-[10px] md:text-sm">●</span>
              </div>
              <div className="flex flex-wrap justify-center gap-6 md:gap-10">
                <button onClick={() => setShowMissionPage(true)} className="hero-pill-btn group px-12 md:px-20 py-4 md:py-6 rounded-full text-[12px] md:text-[14px] font-bold text-[#1A1412]/50 tracking-[0.2em] flex items-center gap-4 hover:text-[#1A1412] transition-all">
                   <span className="text-[#B87333] transition-transform group-hover:scale-125">●</span> 品牌使命
                </button>
                <button onClick={() => setShowServiceProcess(true)} className="hero-pill-btn group px-12 md:px-20 py-4 md:py-6 rounded-full text-[12px] md:text-[14px] font-bold text-[#1A1412]/50 tracking-[0.2em] flex items-center gap-4 hover:text-[#1A1412] transition-all">
                   <span className="text-[#B87333] transition-transform group-hover:scale-125">●</span> 服务流程
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <BanyanSpace />

      <section id="counselors-grid" className="w-full pt-48 pb-64 bg-white">
        <div id="counselors-grid-anchor" className="max-w-[1500px] mx-auto px-6 md:px-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-12">
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <span className="text-[11px] text-[#B87333] font-black uppercase tracking-[0.8em]">Professionalism</span>
                <div className="w-12 h-[1px] bg-[#B87333]/30"></div>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-6xl md:text-8xl font-serif text-[#1A1412] tracking-tighter italic leading-none">
                  潜流之下
                </h3>
                <p className="text-xl md:text-3xl font-serif text-[#1A1412]/60 tracking-[0.1em] leading-snug">
                  以真实在场 <span className="text-[#B87333]/30 mx-2">·</span> 重塑根本
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-center border-b border-stone-100 pb-4 w-full md:w-auto">
               <div className="flex flex-wrap gap-x-8 gap-y-4 items-center">
                  {categories.map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveCategory(tab)}
                      className={`flex flex-col items-center transition-all duration-500 group ${activeCategory === tab ? 'text-[#1A1412]' : 'text-stone-300 hover:text-stone-500'}`}
                    >
                      <span className={`text-[12px] font-bold tracking-widest ${activeCategory === tab ? 'scale-110' : ''} transition-transform`}>{tab}</span>
                      <div className={`h-1 w-4 bg-[#B87333] mt-2 rounded-full transition-all duration-700 ${activeCategory === tab ? 'opacity-100 scale-x-150' : 'opacity-0 scale-x-0'}`}></div>
                    </button>
                  ))}
               </div>
               <div className="relative group w-full md:w-64">
                  <input 
                    type="text" 
                    placeholder="搜索专家姓名或编号..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="w-full bg-stone-50/50 border border-stone-100 rounded-full px-6 py-3 text-[11px] font-bold text-[#1A1412] outline-none focus:border-[#B87333]/30 transition-all placeholder:text-stone-200" 
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-200 group-hover:text-[#B87333] transition-colors">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </div>
               </div>
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 md:gap-20">
            {counselorsToDisplay.map(c => <CounselorCard key={c.id} counselor={c} onSelect={handleOpenDetail} />)}
          </div>
        </div>
      </section>

      <section id="ai-guide" className="w-full py-32 bg-[#FAF8F6]">
        <div className="max-w-[1400px] mx-auto px-6">
          <AIMatcher onMatched={handleAIMatched} />
        </div>
      </section>

      {selectedCounselor && !isCharityMode && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-[#1A1412]/90 backdrop-blur-xl">
          <div className="bg-white w-full max-w-5xl h-[95vh] md:h-[92vh] rounded-t-[40px] md:rounded-[60px] shadow-4xl overflow-hidden relative flex flex-col animate-in slide-in-from-bottom-12">
            <div className="h-32 md:h-56 relative shrink-0">
               <img src={selectedCounselor.avatar} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent"></div>
               <div className="absolute bottom-4 left-6 md:bottom-6 md:left-12 flex justify-between items-end w-[calc(100%-48px)]">
                  <div className="space-y-1"><h2 className="text-2xl md:text-5xl font-serif text-[#1A1412]">{selectedCounselor.name}</h2><span className="text-[10px] font-black text-stone-300 uppercase tracking-[0.5em]">{selectedCounselor.title}</span></div>
                  <button onClick={() => setSelectedCounselor(null)} className="w-12 h-12 rounded-full bg-white border border-stone-100 flex items-center justify-center text-stone-400">✕</button>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-16 no-scrollbar">
               {bookingStep === 'profile' && (
                 <div className="space-y-12">
                    <h3 className="text-3xl font-serif">预订咨询时刻</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       {selectedCounselor.availableSlots.filter(s => !s.isBooked).map(slot => (
                         <button key={slot.id} onClick={() => setSelectedSlot(slot)} className={`p-8 rounded-[40px] border transition-all text-left ${selectedSlot?.id === slot.id ? 'bg-[#1A1412] text-white shadow-xl' : 'bg-white border-stone-100'}`}><span className="text-[8px] font-black block opacity-40 mb-1 tracking-widest uppercase">{slot.day}</span><span className="text-2xl font-serif">{slot.time}</span></button>
                       ))}
                    </div>
                    <button disabled={!selectedSlot} onClick={() => setBookingStep('packages')} className="w-full py-5 bg-[#1A1412] text-white rounded-full font-black uppercase tracking-widest disabled:opacity-20 shadow-xl mt-8">下一步 CONTINUE</button>
                 </div>
               )}
               {bookingStep === 'packages' && (
                 <div className="space-y-16 animate-in fade-in">
                    <div className="space-y-4">
                      <h3 className="text-4xl font-serif">选择咨询方案</h3>
                      <p className="text-stone-400 font-serif italic">“深度咨询是一场马拉松。选择适合您当下身心状态的节奏。”</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {[1, 10, 20, 40, 100].map((count) => {
                        const isSelected = sessionCount === count;
                        const depthLevel = count / 10;
                        const shadowIntensity = isSelected ? Math.min(depthLevel * 10, 60) : 0;
                        
                        return (
                          <button 
                            key={count} 
                            onClick={() => setSessionCount(count)} 
                            className={`relative p-8 rounded-[40px] border text-center transition-all duration-700 flex flex-col justify-between h-48 md:h-56 ${
                              isSelected 
                                ? 'bg-[#1A1412] text-white border-transparent' 
                                : 'bg-white border-stone-100 hover:border-[#B87333]/30'
                            }`}
                            style={{
                              boxShadow: isSelected ? `0 ${shadowIntensity}px ${shadowIntensity * 2}px -10px rgba(26,20,18,0.4)` : 'none',
                              transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                            }}
                          >
                             <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase tracking-widest block opacity-40">Sessions</span>
                                <h4 className="text-3xl font-serif">{count} 次</h4>
                             </div>
                             {count > 1 && (
                               <div className="mt-4 pt-4 border-t border-white/10">
                                  <span className="text-[10px] font-bold block leading-tight">{count === 10 ? '焦点方案' : count === 20 ? '短程方案' : count === 40 ? '中程方案' : '长程方案'}</span>
                               </div>
                             )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="bg-[#FAF8F6] rounded-[50px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 border border-stone-100">
                       <div className="space-y-2">
                          <h4 className="text-xl font-serif text-[#1A1412]">{packageLogic.label}</h4>
                          <p className="text-[13px] text-stone-400 font-serif italic">{packageLogic.milestone || '开启一段改变生命轨迹的对话。'}</p>
                       </div>
                       <div className="flex items-center gap-6">
                          <button onClick={() => setSessionCount(prev => Math.max(1, prev - 1))} className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-[#1A1412] hover:bg-white transition-all">－</button>
                          <div className="flex flex-col items-center">
                             <input 
                               type="number" 
                               value={sessionCount} 
                               onChange={(e) => setSessionCount(Math.max(1, parseInt(e.target.value) || 1))}
                               className="w-20 bg-transparent text-center text-4xl font-serif text-[#1A1412] outline-none"
                             />
                             <span className="text-[8px] font-black text-stone-300 uppercase tracking-widest mt-1">Total Count</span>
                          </div>
                          <button onClick={() => setSessionCount(prev => Math.min(200, prev + 1))} className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:text-[#1A1412] hover:bg-white transition-all">＋</button>
                       </div>
                    </div>

                    <div className="flex justify-between items-end pt-8 border-t border-stone-50">
                       <div className="space-y-3">
                          <span className="text-[9px] font-black text-stone-300 uppercase tracking-widest block">Total Investment</span>
                          <div className="flex items-baseline gap-4">
                             <div className="text-5xl font-serif text-[#1A1412]">¥{packageLogic.finalTotal.toFixed(0)}</div>
                             {packageLogic.discount > 0 && (
                               <div className="text-xl font-serif text-stone-200 line-through">¥{packageLogic.originalTotal.toFixed(0)}</div>
                             )}
                          </div>
                          {packageLogic.discount > 0 && (
                            <span className="px-3 py-1 bg-[#B87333]/10 text-[#B87333] text-[9px] font-black rounded-lg uppercase tracking-widest">
                               Applied {(packageLogic.discount * 100).toFixed(0)}% Milestone Discount
                            </span>
                          )}
                       </div>
                       <button onClick={() => setBookingStep('payment')} className="px-16 py-6 bg-[#1A1412] text-white rounded-full font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-[#B87333] transition-all">确认方案 PAY NOW</button>
                    </div>
                 </div>
               )}
               {bookingStep === 'payment' && (
                 <div className="flex flex-col items-center py-10 space-y-12 animate-in zoom-in h-full overflow-y-auto no-scrollbar">
                    <div className="max-w-xl w-full text-center space-y-10">
                       <div className="space-y-4 px-6">
                          <h4 className="text-2xl font-serif text-[#1A1412]">开启一段勇敢的旅程</h4>
                          <p className="text-sm text-stone-400 font-serif leading-relaxed italic">
                            “承认脆弱并寻求专业支持，是生命中最具勇气的决定之一。我们在此，确保这份信任得到最严谨的守护。”
                          </p>
                       </div>
                       
                       <div className="flex justify-center mb-4">
                          <div className="inline-flex bg-stone-50 p-1.5 rounded-full border border-stone-100">
                             <button 
                               onClick={() => setPaymentMethod('qr')}
                               className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'qr' ? 'bg-[#1A1412] text-white shadow-lg' : 'text-stone-300 hover:text-[#1A1412]'}`}
                             >
                               二维码支付 / QR CODE
                             </button>
                             <button 
                               onClick={() => setPaymentMethod('transfer')}
                               className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'transfer' ? 'bg-[#1A1412] text-white shadow-lg' : 'text-stone-300 hover:text-[#1A1412]'}`}
                             >
                               对公转账 / TRANSFER
                             </button>
                          </div>
                       </div>

                       {paymentMethod === 'qr' ? (
                         <div className="w-56 h-56 bg-white mx-auto rounded-[40px] border-2 border-dashed border-stone-100 flex items-center justify-center text-stone-200 relative group overflow-hidden shadow-sm animate-in fade-in">
                            {paymentConfig.qrCodeUrl ? (
                              <img src={paymentConfig.qrCodeUrl} className="w-full h-full object-contain rounded-[32px]" />
                            ) : (
                              <span className="group-hover:opacity-10 transition-opacity">支付二维码 (待上传)</span>
                            )}
                            <div className="absolute inset-0 bg-[#B87333]/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                               <span className="text-[9px] font-black text-[#B87333] tracking-[0.3em] uppercase">Scan to Secure</span>
                            </div>
                         </div>
                       ) : (
                         <div className="bg-white border border-stone-100 rounded-[40px] p-8 space-y-6 text-left shadow-sm animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-4 border-b border-stone-50 pb-4">
                               <div className="w-10 h-10 bg-[#B87333]/10 rounded-full flex items-center justify-center text-xl">🏛️</div>
                               <span className="text-[10px] font-black text-[#1A1412] uppercase tracking-[0.2em]">公司银行转账信息</span>
                            </div>
                            <div className="space-y-4 font-serif">
                               <div className="space-y-1">
                                  <label className="text-[8px] font-black text-stone-300 uppercase tracking-widest">账户名称 (Account Name)</label>
                                  <p className="text-sm font-bold text-[#1A1412]">{paymentConfig.accountName}</p>
                               </div>
                               <div className="space-y-1">
                                  <label className="text-[8px] font-black text-stone-300 uppercase tracking-widest">开户银行 (Bank Name)</label>
                                  <p className="text-sm font-bold text-[#1A1412]">{paymentConfig.bankName}</p>
                               </div>
                               <div className="space-y-1">
                                  <label className="text-[8px] font-black text-stone-300 uppercase tracking-widest">银行账号 (Account Number)</label>
                                  <p className="text-lg font-bold text-[#B87333] tracking-wider select-all">{paymentConfig.accountNumber}</p>
                               </div>
                               <p className="text-[10px] text-stone-400 italic bg-stone-50 p-4 rounded-2xl">转账时请备注“姓名+咨询费”，转账完成后请点击下方确认按钮。</p>
                            </div>
                         </div>
                       )}

                       <div className="bg-[#FAF8F6] p-8 rounded-[40px] border border-[#B87333]/10 space-y-6 text-left relative overflow-hidden group mx-4">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-[#B87333]/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                          <div className="flex items-start gap-4 relative z-10">
                             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shrink-0 shadow-sm">🛡️</div>
                             <div className="space-y-1">
                                <h5 className="text-[12px] font-black text-[#1A1412] uppercase tracking-widest">伴言 · 守护契约</h5>
                                <p className="text-[11px] text-stone-400 leading-relaxed font-serif">
                                   通过公司平台支付是保障您合法权益的<span className="text-[#B87333] font-bold">唯一专业途径</span>。这不仅是资金的存管，更是确保咨询契约在法律与伦理监管下进行的基石。
                                </p>
                             </div>
                          </div>
                          <div className="flex items-start gap-4 pt-4 border-t border-stone-100 relative z-10">
                             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shrink-0 shadow-sm">🌱</div>
                             <div className="space-y-1">
                                <h5 className="text-[12px] font-black text-[#B87333] uppercase tracking-widest">维护咨询的纯粹性</h5>
                                <p className="text-[11px] text-stone-400 leading-relaxed font-serif">
                                   我们倡导专业的边界感，请避免与咨询师进行任何私下资金往来。私下交易将使咨询关系复杂化，且一旦产生争议，公司将无法为您提供临床考核支持及伦理仲裁。
                                </p>
                             </div>
                          </div>
                       </div>
                    </div>

                    <button 
                      onClick={handleFinalPaymentCheck}
                      disabled={isCheckingPayment}
                      className={`px-24 py-5 rounded-full font-black uppercase tracking-[0.3em] text-[11px] transition-all shadow-2xl mb-12 flex items-center gap-4 ${
                        isPaymentVerified 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-[#1A1412] text-white hover:bg-[#B87333]'
                      }`}
                    >
                      {isPaymentVerified ? '✓ 支付已确认 CONTINUE' : isCheckingPayment ? '正在核对订单...' : '我已完成支付 I PAID'}
                    </button>
                 </div>
               )}
               {bookingStep === 'assistant' && (
                 <div className="flex flex-col items-center justify-center py-20 animate-in fade-in text-center space-y-12 h-full">
                   <div className="space-y-6 max-w-lg">
                      <div className="flex items-center justify-center gap-3">
                         <span className="text-2xl">✨</span>
                         <h3 className="text-4xl font-serif text-[#1A1412]">已为您预留这段时光</h3>
                      </div>
                      <p className="text-stone-400 font-serif text-lg leading-relaxed italic px-6">
                        “您的决定已得到珍视。现在，请与伴言小助理建立联结，她将为您提供进入咨询室的‘钥匙’（会议码），并陪您处理好每一个细节。”
                      </p>
                   </div>
                   
                   <div className="relative group">
                     <div className="absolute -inset-10 bg-[#B87333]/5 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                     <div className="p-10 bg-white rounded-[60px] border border-[#B87333]/20 shadow-2xl relative z-10">
                        <div className="w-56 h-56 bg-stone-50 rounded-3xl flex items-center justify-center text-stone-200 text-xs font-bold relative overflow-hidden transition-all group-hover:shadow-lg">
                           {assistantQr ? (
                             <img src={assistantQr} className="w-full h-full object-contain rounded-3xl scale-95 hover:scale-100 transition-transform duration-700" alt="Banyan Assistant QR" />
                           ) : (
                             <div className="text-center px-6">
                               <p className="mb-2">📸</p>
                               <p className="text-[10px] uppercase tracking-widest opacity-40">二维码 (待创始人上传)</p>
                             </div>
                           )}
                           <div className="absolute bottom-4 left-0 right-0 text-[9px] font-black uppercase text-stone-300 tracking-[0.3em] text-center">Add Assistant</div>
                        </div>
                     </div>
                   </div>

                   <div className="flex flex-col items-center gap-6">
                      <button onClick={() => setBookingStep('intake')} className="px-16 py-5 bg-[#B87333] text-white rounded-full font-bold text-[11px] tracking-[0.3em] uppercase shadow-2xl hover:scale-105 transition-all">开启前置评估 START INTAKE</button>
                      <span className="text-[10px] text-stone-300 font-serif italic max-w-xs leading-relaxed">获得小助理支持后，您的咨询旅程将正式启航。请点击按钮完成最后的专业准入评估。</span>
                   </div>
                 </div>
               )}
               {bookingStep === 'intake' && <div className="animate-in fade-in duration-1000"><IntakeForm packageId="new_booking_temp" onComplete={() => setBookingStep('success')} /></div>}
               {bookingStep === 'success' && <div className="flex flex-col items-center justify-center py-20 space-y-12 animate-in zoom-in text-center"><div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 text-5xl">✓</div><h3 className="text-5xl font-serif text-[#1A1412]">预约成功</h3><button onClick={() => {setSelectedCounselor(null); setIsCharityMode(false);}} className="px-16 py-5 border border-stone-200 rounded-full text-[11px] font-black uppercase tracking-[0.4em]">返回首页 RETURN HOME</button></div>}
            </div>
          </div>
        </div>
      )}

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[300] bg-[#1A1412]/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-md rounded-[50px] p-12 relative overflow-hidden">
             <div className="text-center mb-10">
                <div className="w-12 h-12 bg-[#B87333] rounded-2xl flex items-center justify-center text-white font-serif text-2xl mx-auto mb-6">伴</div>
                <h3 className="text-2xl font-serif text-[#1A1412]">来访者登录</h3>
             </div>
             <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <input type="tel" maxLength={11} required placeholder="手机号码" value={loginPhone} onChange={e => setLoginPhone(e.target.value)} className="w-full bg-stone-50 border border-stone-100 p-5 rounded-2xl outline-none" />
                  <input type="password" required placeholder="登录密码" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-stone-50 border border-stone-100 p-5 rounded-2xl outline-none" />
                </div>
                <button type="submit" className="w-full bg-[#1A1412] text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl">确认进入</button>
             </form>
             <div className="mt-8 text-center">
                <button onClick={() => { setIsLoginModalOpen(false); setIsChangePasswordModalOpen(true); }} className="text-[10px] text-stone-300 hover:text-[#B87333] font-bold tracking-widest uppercase transition-colors">
                  修改密码 Change Password
                </button>
             </div>
             <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-8 right-8 text-stone-300 hover:rotate-90 transition-all">✕</button>
          </div>
        </div>
      )}

      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-[310] bg-[#1A1412]/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in zoom-in">
          <div className="bg-white w-full max-md rounded-[50px] p-12 relative overflow-hidden">
             <div className="text-center mb-10">
                <div className="w-12 h-12 bg-[#B87333] rounded-2xl flex items-center justify-center text-white font-serif text-2xl mx-auto mb-6">伴</div>
                <h3 className="text-2xl font-serif text-[#1A1412]">修改执业密码</h3>
                <p className="text-[9px] text-stone-300 font-bold uppercase tracking-widest mt-2">Reset Account Security</p>
             </div>
             <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="space-y-4">
                  <input type="tel" maxLength={11} required placeholder="手机号码" value={changePasswordForm.phone} onChange={e => setChangePasswordForm({...changePasswordForm, phone: e.target.value})} className="w-full bg-stone-50 border border-stone-100 p-5 rounded-2xl outline-none" />
                  <input type="password" required placeholder="原密码" value={changePasswordForm.oldPass} onChange={e => setChangePasswordForm({...changePasswordForm, oldPass: e.target.value})} className="w-full bg-stone-50 border border-stone-100 p-5 rounded-2xl outline-none" />
                  <input type="password" required placeholder="新密码 (不少于6位)" value={changePasswordForm.newPass} onChange={e => setChangePasswordForm({...changePasswordForm, newPass: e.target.value})} className="w-full bg-stone-50 border border-stone-100 p-5 rounded-2xl outline-none" />
                </div>
                <button type="submit" className="w-full bg-[#1A1412] text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl">确认修改</button>
                <button type="button" onClick={() => { setIsChangePasswordModalOpen(false); setIsLoginModalOpen(true); }} className="w-full text-[10px] text-stone-300 font-bold uppercase tracking-widest">返回登录</button>
             </form>
             <button onClick={() => setIsChangePasswordModalOpen(false)} className="absolute top-8 right-8 text-stone-300 hover:rotate-90 transition-all">✕</button>
          </div>
        </div>
      )}

      {isClientProfileOpen && (
        <div className="fixed inset-0 z-[250] bg-[#FAF8F6] flex flex-col p-6 md:p-12 overflow-hidden animate-in slide-in-from-right">
           <header className="flex justify-between items-center mb-16 px-6 shrink-0">
              <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-[#B87333] rounded-2xl flex items-center justify-center text-white font-serif text-3xl shadow-xl shadow-[#B87333]/20">伴</div>
                 <div className="flex flex-col">
                    <h2 className="text-2xl font-serif text-[#1A1412]">我的治愈空间</h2>
                    <span className="text-[9px] font-black text-stone-300 tracking-widest uppercase">{clientPhone}</span>
                 </div>
              </div>
              <button onClick={() => setIsClientProfileOpen(false)} className="w-14 h-14 rounded-full border border-stone-100 flex items-center justify-center text-stone-400 hover:text-[#1A1412] transition-all hover:rotate-90">✕</button>
           </header>
           
           <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col md:flex-row gap-12 overflow-hidden">
              <aside className="w-full md:w-64 flex flex-row md:flex-col gap-8 shrink-0 pb-4 overflow-x-auto no-scrollbar border-b md:border-b-0 md:border-r border-stone-100">
                {[
                  { id: 'status', zh: '咨询状态', en: 'STATUS' },
                  { id: 'history', zh: '预约记录', en: 'HISTORY' },
                  { id: 'settings', zh: '账户设置', en: 'SETTINGS' }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setClientProfileTab(tab.id as any)} className={`text-left flex flex-col gap-1 transition-all ${clientProfileTab === tab.id ? 'text-[#B87333]' : 'text-stone-300 hover:text-stone-500'}`}>
                    <span className="text-md font-bold">{tab.zh}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest">{tab.en}</span>
                    {clientProfileTab === tab.id && <div className="h-1 w-6 bg-[#B87333] mt-2 rounded-full"></div>}
                  </button>
                ))}
              </aside>

              <main className="flex-1 overflow-y-auto no-scrollbar py-2">
                {clientProfileTab === 'status' && (
                  <div className="space-y-12 animate-in fade-in">
                    <div className="bg-white rounded-[60px] p-12 shadow-2xl space-y-10 border border-stone-50">
                       <div className="space-y-4">
                          <span className="text-[10px] font-black text-[#B87333] uppercase tracking-widest block">Session Balance / 可用次数</span>
                          <div className="flex items-baseline gap-4">
                             <h3 className="text-8xl font-serif text-[#1A1412] tracking-tighter">{clientSessions}</h3>
                             <span className="text-2xl font-serif text-stone-300 italic">Sessions Left</span>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
                {clientProfileTab === 'history' && (
                  <div className="space-y-8 animate-in fade-in">
                    <h3 className="text-2xl font-serif text-[#1A1412]">最近咨询轨迹</h3>
                    <p className="text-stone-300 italic">暂无咨询记录。</p>
                  </div>
                )}
                {clientProfileTab === 'settings' && (
                  <div className="space-y-12 animate-in fade-in text-center">
                    <button onClick={handleLogout} className="text-[10px] font-black text-stone-200 uppercase tracking-[0.4em] hover:text-red-400 transition-colors">退出登录 Logout</button>
                  </div>
                )}
              </main>
           </div>
        </div>
      )}

      {isAdminOpen && <AdminDashboard onClose={() => setIsAdminOpen(false)} allCounselors={allCounselors} onUpdateCounselors={setAllCounselors} />}
      {isPractitionerOpen && <PractitionerDashboard onClose={() => setIsPractitionerOpen(false)} allCounselors={allCounselors} onUpdateCounselors={setAllCounselors} />}
      <Footer onAdminPortal={() => setIsAdminOpen(true)} onPractitionerPortal={() => setIsPractitionerOpen(true)} />
    </div>
  );
};

const App: React.FC = () => { return ( <Router> <Routes> <Route path="/" element={<MainSite />} /> </Routes> </Router> ); };
export default App;
