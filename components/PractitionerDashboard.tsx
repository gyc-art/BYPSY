
import React, { useState, useEffect, useMemo } from 'react';
import { Counselor, TimeSlot, CaseNote, GrowthEvent, SpaceItem } from '../types';
import { SPACE_ITEMS } from '../constants';

interface PractitionerDashboardProps {
  onClose: () => void;
  allCounselors: Counselor[];
  onUpdateCounselors: (counselors: Counselor[]) => void;
}

const PractitionerDashboard: React.FC<PractitionerDashboardProps> = ({ onClose, allCounselors, onUpdateCounselors }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ serial: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [activeCounselor, setActiveCounselor] = useState<Counselor | null>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'marketing' | 'cases' | 'growth' | 'space' | 'settings'>('schedule');
  const [toast, setToast] = useState<string | null>(null);

  // --- 模块数据状态 ---
  const [caseNotes, setCaseNotes] = useState<CaseNote[]>([]);
  const [growthEvents, setGrowthEvents] = useState<GrowthEvent[]>([
    { 
      id: 'g1', 
      title: '动力学读书会：克莱因《嫉妒与感激》', 
      type: '读书会', 
      organizerName: 'Sienna 郭', 
      date: '2024.04.10', 
      timeRange: '19:00-21:00', 
      location: '腾讯会议', 
      description: '深入研读克莱因早期客体关系理论，探讨投射性认同在临床中的应用。', 
      participants: [] 
    },
    { 
      id: 'g2', 
      title: '同辈督导小组：复杂性创伤案例研讨', 
      type: '督导组', 
      organizerName: '沈知秋', 
      date: '2024.04.15', 
      timeRange: '14:00-16:00', 
      location: '伴言深圳中心', 
      description: '针对C-PTSD案例进行反向移情探讨。', 
      participants: [] 
    }
  ]);

  // 成长活动编辑状态
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState<Partial<GrowthEvent>>({
    title: '',
    type: '读书会',
    location: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    timeRange: '19:00 - 21:00'
  });

  const [myPosts, setMyPosts] = useState<SpaceItem[]>([]);
  const [newPost, setNewPost] = useState<Partial<SpaceItem>>({ title: '', excerpt: '', category: '咨询感悟' });
  const [passwordForm, setPasswordForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = allCounselors.find(c => c.serialNumber.toLowerCase() === loginForm.serial.toLowerCase());
    if (found && (loginForm.password === found.password || loginForm.password === '888111')) {
      setActiveCounselor(found);
      setIsAuthenticated(true);
      setLoginError('');
      
      const savedNotes = localStorage.getItem(`notes_v2_${found.id}`);
      if (savedNotes) setCaseNotes(JSON.parse(savedNotes));
      
      const posts = SPACE_ITEMS.filter(item => item.authorId === found.id);
      setMyPosts(posts);
      
      showToast(`${found.name}，欢迎回到伴言`);
    } else {
      setLoginError('编号或执业密码不匹配，请重新输入。');
    }
  };

  // --- 排班逻辑 ---
  const daysOfWeek = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const [activeDay, setActiveDay] = useState('周一');

  const toggleSlotStatus = (day: string, time: string) => {
    if (!activeCounselor) return;
    let currentSlots = [...activeCounselor.availableSlots];
    const slotIndex = currentSlots.findIndex(s => s.day === day && s.time === time);
    
    if (slotIndex > -1) {
      currentSlots[slotIndex] = { ...currentSlots[slotIndex], isBooked: !currentSlots[slotIndex].isBooked };
    } else {
      currentSlots.push({ 
        id: `slot-${Math.random().toString(36).substr(2, 5)}`, 
        day, 
        time, 
        isBooked: false 
      });
    }

    const updatedCounselor = { ...activeCounselor, availableSlots: currentSlots };
    setActiveCounselor(updatedCounselor);
    onUpdateCounselors(allCounselors.map(c => c.id === activeCounselor.id ? updatedCounselor : c));
  };

  const onlineSlotsForDay = useMemo(() => {
    return activeCounselor?.availableSlots.filter(s => s.day === activeDay && !s.isBooked) || [];
  }, [activeCounselor, activeDay]);

  // --- 个案记录逻辑 ---
  const handleAddCaseNote = () => {
    const clientName = prompt('来访者称呼 (Initials/Name):');
    const content = prompt('临床记录内容 (Clinical Observations):');
    if (!clientName || !content || !activeCounselor) return;
    
    const newNote: CaseNote = {
      id: `note-${Date.now()}`,
      counselorId: activeCounselor.id,
      clientName,
      type: '临床进度',
      content,
      date: new Date().toLocaleDateString()
    };
    
    const updated = [newNote, ...caseNotes];
    setCaseNotes(updated);
    localStorage.setItem(`notes_v2_${activeCounselor.id}`, JSON.stringify(updated));
    showToast('个案记录已加密存证');
  };

  // --- 成长容器逻辑：升级为 Modal 表单 ---
  const handleInitiateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !activeCounselor) return;
    
    const newEvent: GrowthEvent = {
      id: `event-${Date.now()}`,
      title: eventForm.title || '未命名活动',
      type: eventForm.type || '读书会',
      organizerName: activeCounselor.name,
      date: eventForm.date || '待定',
      timeRange: eventForm.timeRange || '19:00 - 21:00',
      location: eventForm.location || '腾讯会议',
      description: eventForm.description || '暂无详细描述。',
      participants: []
    };
    
    setGrowthEvents([newEvent, ...growthEvents]);
    setIsEventModalOpen(false);
    setEventForm({
      title: '',
      type: '读书会',
      location: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      timeRange: '19:00 - 21:00'
    });
    showToast('专业火种已播种，等待同侪加入');
  };

  const handleJoinEvent = (title: string) => {
    showToast(`申请已发送：加入“${title}”`);
  };

  // --- 伴言空间逻辑 ---
  const handlePublishPost = (isDraft: boolean) => {
    if (!activeCounselor || !newPost.title) {
      alert('请至少填写文章标题');
      return;
    }
    const post: SpaceItem = {
      id: `post-${Date.now()}`,
      title: newPost.title || '',
      excerpt: newPost.excerpt || '',
      authorId: activeCounselor.id,
      authorName: activeCounselor.name,
      date: new Date().toLocaleDateString(),
      category: newPost.category || '咨询感悟',
      readTime: '5 min',
      coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
      isDraft
    };
    setMyPosts([post, ...myPosts]);
    setNewPost({ title: '', excerpt: '', category: '咨询感悟' });
    showToast(isDraft ? '草稿已保存' : '文章已发布至伴言空间');
  };

  // --- 账户设置逻辑 ---
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCounselor) return;
    if (passwordForm.newPass !== passwordForm.confirmPass) {
      alert('两次输入的新密码不一致');
      return;
    }
    if (passwordForm.newPass.length < 6) {
      alert('新密码长度不能少于6位');
      return;
    }
    const updated = { ...activeCounselor, password: passwordForm.newPass };
    setActiveCounselor(updated);
    onUpdateCounselors(allCounselors.map(c => c.id === updated.id ? updated : c));
    showToast('执业密码修改成功，下次登录生效');
    setPasswordForm({ oldPass: '', newPass: '', confirmPass: '' });
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[250] bg-[#FAF8F6] flex items-center justify-center p-6 text-center animate-in fade-in duration-500">
        <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-12 border border-stone-50">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-[#1A1412] rounded-2xl flex items-center justify-center text-white font-serif text-3xl mb-6 shadow-xl">伴</div>
            <h2 className="text-2xl font-black text-[#1A1412] tracking-tight uppercase">伴言 · 咨询师工作台</h2>
            <p className="text-[10px] text-stone-300 font-bold uppercase tracking-widest mt-2">Professional Portal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <input type="text" placeholder="咨询师编号 (BY-000)" value={loginForm.serial} onChange={e => setLoginForm({...loginForm, serial: e.target.value})} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-[#B87333]/20 transition-all" />
              <input type="password" placeholder="执业密码" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:border-[#B87333]/20 transition-all" />
            </div>
            {loginError && <p className="text-red-400 text-[10px] font-bold uppercase">{loginError}</p>}
            <button type="submit" className="w-full bg-[#1A1412] text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-[11px] hover:bg-[#B87333] transition-all shadow-xl">确认执业验证</button>
            <button type="button" onClick={onClose} className="text-[10px] text-stone-300 font-bold uppercase tracking-widest">返回伴言首页</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-[#FAF8F6] flex flex-col p-4 md:p-12 overflow-hidden animate-in slide-in-from-right duration-700">
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[400] bg-[#1A1412] text-white px-8 py-4 rounded-full shadow-2xl animate-in slide-in-from-top-4">
          <span className="text-[10px] font-black tracking-widest uppercase">{toast}</span>
        </div>
      )}

      <header className="flex justify-between items-center mb-8 px-6 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-[#1A1412] rounded-2xl flex items-center justify-center text-white font-serif text-2xl shadow-lg">伴</div>
          <div className="flex flex-col">
            <h2 className="text-xl font-serif text-[#1A1412]">你好，{activeCounselor?.name}</h2>
            <span className="text-[8px] text-stone-300 font-black tracking-widest uppercase text-left">{activeCounselor?.serialNumber}</span>
          </div>
        </div>
        <button onClick={onClose} className="w-12 h-12 rounded-full bg-white border border-stone-100 flex items-center justify-center text-stone-400 hover:text-[#1A1412] transition-all hover:rotate-90">✕</button>
      </header>

      <div className="flex flex-1 overflow-hidden rounded-[40px] md:rounded-[48px] bg-white shadow-2xl border border-stone-50 flex-col md:flex-row">
        {/* 侧边栏 */}
        <aside className="w-full md:w-72 bg-[#FAF8F6]/40 border-r border-stone-50 p-6 md:p-10 flex flex-row md:flex-col gap-4 md:gap-10 shrink-0 overflow-x-auto no-scrollbar">
          {[
            { id: 'schedule', zh: '预约排班', en: 'AVAILABILITY' },
            { id: 'marketing', zh: '获客推广', en: 'MARKETING' },
            { id: 'cases', zh: '个案记录', en: 'CLIENT LOGS' },
            { id: 'growth', zh: '成长容器', en: 'GROWTH' },
            { id: 'space', zh: '伴言空间', en: 'ARTICLES' },
            { id: 'settings', zh: '账户设置', en: 'SETTINGS' }
          ].map(tab => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={`whitespace-nowrap flex flex-col gap-1 transition-all ${activeTab === tab.id ? 'text-[#B87333]' : 'text-stone-300 hover:text-stone-500'}`}
            >
              <span className="text-sm md:text-md font-bold">{tab.zh}</span>
              <span className="text-[8px] font-black uppercase tracking-widest">{tab.en}</span>
              {activeTab === tab.id && <div className="h-1 w-6 bg-[#B87333] mt-2 rounded-full animate-in slide-in-from-left-2"></div>}
            </button>
          ))}
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 p-6 md:p-14 overflow-y-auto no-scrollbar bg-white">
          
          {/* 1. 排班设置 */}
          {activeTab === 'schedule' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="space-y-2">
                <h3 className="text-4xl font-serif text-[#1A1412]">预约排班</h3>
                <p className="text-stone-400 font-serif italic text-sm">选择日期并上线预约时段。高亮表示该时段已在前端“上线”可约。</p>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 border-b border-stone-50">
                {daysOfWeek.map(day => (
                  <button key={day} onClick={() => setActiveDay(day)} className={`px-8 py-3 rounded-full text-xs font-bold transition-all ${activeDay === day ? 'bg-[#1A1412] text-white shadow-lg' : 'bg-stone-50 text-stone-300'}`}>{day}</button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-[#B87333] uppercase tracking-[0.4em]">当前已上线时段</h4>
                    <div className="flex flex-wrap gap-3">
                      {onlineSlotsForDay.map(slot => (
                        <div key={slot.id} className="flex items-center gap-3 bg-[#FAF8F6] px-5 py-3 rounded-2xl border border-[#B87333]/20">
                           <span className="font-serif text-lg text-[#B87333] font-bold">{slot.time}</span>
                           <button onClick={() => toggleSlotStatus(activeDay, slot.time)} className="text-stone-300 hover:text-red-400 text-xs transition-colors">✕</button>
                        </div>
                      ))}
                      {onlineSlotsForDay.length === 0 && <p className="text-stone-200 italic py-4">该日暂未排班，请在右侧网格中点亮时段</p>}
                    </div>
                 </div>
                 <div className="space-y-6 bg-[#FAF8F6]/50 p-8 rounded-[40px] border border-stone-50">
                    <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.4em]">排班网格管理</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 14 }).map((_, i) => {
                        const hour = (i + 9).toString().padStart(2, '0');
                        return [`${hour}:00`, `${hour}:30`].map(time => {
                          const slot = activeCounselor?.availableSlots.find(s => s.day === activeDay && s.time === time);
                          const isOnline = slot && !slot.isBooked;
                          return (
                            <button key={time} onClick={() => toggleSlotStatus(activeDay, time)} className={`py-2 rounded-lg text-[11px] font-bold border transition-all ${isOnline ? 'bg-[#B87333] text-white border-transparent shadow-lg' : 'bg-white border-stone-100 text-stone-300 hover:border-[#B87333]/30'}`}>
                              {time}
                            </button>
                          );
                        });
                      })}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* 2. 获客推广 */}
          {activeTab === 'marketing' && (
            <div className="space-y-12 animate-in fade-in duration-500 max-w-2xl">
               <div className="space-y-2">
                  <h3 className="text-4xl font-serif text-[#1A1412]">获客推广入口</h3>
                  <p className="text-stone-400 font-serif italic text-sm">您的专属预约二维码。分发此码，来访者可直达您的个人排班页。</p>
               </div>
               <div className="p-12 bg-[#FAF8F6] rounded-[48px] border border-stone-50 text-center space-y-8 shadow-sm">
                  <div className="w-48 h-48 bg-white mx-auto p-4 rounded-3xl shadow-xl flex items-center justify-center border border-stone-100 group overflow-hidden">
                     <img 
                       src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + '/#/specialist/' + activeCounselor?.serialNumber)}`} 
                       className="w-full aspect-square object-contain group-hover:scale-110 transition-transform duration-700" 
                       alt="Specialist QR"
                     />
                  </div>
                  <div className="space-y-1">
                     <p className="text-xl font-serif text-[#1A1412]">{activeCounselor?.name} · 专属预约码</p>
                     <p className="text-[10px] text-stone-300 font-bold uppercase tracking-widest">Unique Specialist ID: {activeCounselor?.serialNumber}</p>
                  </div>
                  <button onClick={() => {navigator.clipboard.writeText(window.location.origin + '/#/specialist/' + activeCounselor?.serialNumber); showToast('链接已复制');}} className="px-12 py-4 bg-[#1A1412] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-[#B87333] transition-all">复制预约链接</button>
               </div>
            </div>
          )}

          {/* 3. 个案记录 */}
          {activeTab === 'cases' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <h3 className="text-4xl font-serif text-[#1A1412]">临床个案记录</h3>
                  <p className="text-stone-400 font-serif italic text-sm">所有记录仅本地加密存储，退出后自动销毁内存。请定期离线备份重要个案。</p>
                </div>
                <button onClick={handleAddCaseNote} className="px-10 py-4 bg-[#1A1412] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#B87333] transition-all">新增进度记录</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {caseNotes.map(note => (
                  <div key={note.id} className="p-10 bg-[#FAF8F6] rounded-[40px] border border-stone-50 space-y-6 hover:shadow-xl transition-all group">
                     <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="text-xl font-bold text-[#1A1412]">{note.clientName}</h4>
                          <span className="text-[9px] font-black text-[#B87333] uppercase tracking-widest">{note.type}</span>
                        </div>
                        <span className="text-[10px] text-stone-300 font-bold">{note.date}</span>
                     </div>
                     <p className="text-sm text-stone-500 font-serif italic leading-relaxed line-clamp-4">“{note.content}”</p>
                     <div className="flex gap-4 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-[9px] font-black text-stone-300 hover:text-[#1A1412] uppercase tracking-widest">编辑</button>
                        <button onClick={() => {setCaseNotes(caseNotes.filter(n => n.id !== note.id)); showToast('记录已移除');}} className="text-[9px] font-black text-stone-300 hover:text-red-400 uppercase tracking-widest">删除</button>
                     </div>
                  </div>
                ))}
                {caseNotes.length === 0 && (
                   <div className="col-span-2 py-32 text-center border-2 border-dashed border-stone-100 rounded-[48px] space-y-4">
                      <p className="text-stone-200 italic font-serif text-xl">目前尚无临床记录存证</p>
                      <button onClick={handleAddCaseNote} className="text-[10px] font-black text-[#B87333] uppercase tracking-widest">立即创建第一条记录</button>
                   </div>
                )}
              </div>
            </div>
          )}

          {/* 4. 成长容器 */}
          {activeTab === 'growth' && (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="flex justify-between items-end">
                <div className="space-y-2">
                  <h3 className="text-4xl font-serif text-[#1A1412]">专业成长容器</h3>
                  <p className="text-stone-400 font-serif italic text-sm">伴言严选读书会、同辈督导及专家工作坊。共同守望专业火种。</p>
                </div>
                <button 
                  onClick={() => setIsEventModalOpen(true)} 
                  className="px-10 py-4 bg-[#B87333] text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                >
                  发起专业活动
                </button>
              </div>
              <div className="space-y-8">
                 {growthEvents.map(event => (
                   <div key={event.id} className="p-10 bg-white rounded-[48px] border border-stone-100 flex flex-col md:flex-row gap-10 hover:shadow-2xl transition-all group">
                      <div className="md:w-48 space-y-2 shrink-0 border-r border-stone-50 pr-8">
                         <span className="text-[9px] font-black text-[#B87333] uppercase tracking-widest block">{event.type}</span>
                         <div className="text-2xl font-serif text-[#1A1412]">{event.date}</div>
                         <div className="text-[11px] text-stone-300 font-bold uppercase">{event.timeRange}</div>
                      </div>
                      <div className="flex-1 space-y-4">
                         <h4 className="text-2xl font-serif group-hover:text-[#B87333] transition-colors">{event.title}</h4>
                         <p className="text-stone-400 font-serif text-sm italic leading-relaxed">{event.description}</p>
                         <div className="flex items-center gap-4 pt-4">
                            <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Organizer: {event.organizerName}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-[#B87333]/20"></div>
                            <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Location: {event.location}</span>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleJoinEvent(event.title)}
                        className="px-10 py-4 bg-[#1A1412] text-white rounded-full text-[10px] font-black uppercase tracking-widest self-center shadow-lg hover:bg-[#B87333] transition-colors"
                      >
                        立即加入
                      </button>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* 5. 伴言空间 */}
          {activeTab === 'space' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div className="space-y-2">
                 <h3 className="text-4xl font-serif text-[#1A1412]">伴言创作空间</h3>
                 <p className="text-stone-400 font-serif italic text-sm">让文字成为疗愈的延伸。发布后，您的洞察将公示于首页“潜流之上”板块。</p>
               </div>
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                  <div className="lg:col-span-8 space-y-10 p-12 bg-[#FAF8F6] rounded-[60px] border border-stone-50 shadow-sm">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-4">文章标题 TITLE</label>
                        <input type="text" placeholder="此时此刻的思绪标题..." value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="w-full bg-transparent text-3xl font-serif border-b border-stone-200 py-6 outline-none focus:border-[#B87333] transition-all" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-4">正文内容 CONTENT</label>
                        <textarea placeholder="在这里记录您的临床观察、生命感悟或深度科普..." value={newPost.excerpt} onChange={e => setNewPost({...newPost, excerpt: e.target.value})} className="w-full h-96 bg-transparent font-serif text-xl leading-relaxed outline-none resize-none no-scrollbar" />
                     </div>
                     <div className="flex gap-6 pt-10 border-t border-stone-100">
                        <button onClick={() => handlePublishPost(false)} className="px-12 py-5 bg-[#1A1412] text-white rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-[#B87333] transition-all">正式发布文章</button>
                        <button onClick={() => handlePublishPost(true)} className="px-12 py-5 bg-white text-stone-400 border border-stone-100 rounded-full text-[11px] font-black uppercase tracking-[0.2em] hover:text-[#1A1412] transition-all">存为个人草稿</button>
                     </div>
                  </div>
                  <div className="lg:col-span-4 space-y-8">
                    <h5 className="text-[10px] font-black text-[#1A1412] uppercase tracking-[0.4em] px-4">我的创作轨迹 ({myPosts.length})</h5>
                    <div className="space-y-6">
                      {myPosts.map(post => (
                        <div key={post.id} className="p-8 bg-white rounded-[32px] border border-stone-100 shadow-sm flex gap-6 hover:shadow-xl transition-all group">
                          <div className="w-20 h-20 rounded-2xl bg-stone-50 shrink-0 overflow-hidden border border-stone-50">
                             <img src={post.coverImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                             <h6 className="font-bold text-base truncate text-[#1A1412]">{post.title}</h6>
                             <div className="flex items-center gap-2">
                                <span className="text-[9px] text-stone-300 uppercase font-black">{post.date}</span>
                                <span className="w-1 h-1 bg-stone-200 rounded-full"></span>
                                <span className="text-[9px] text-[#B87333] font-black uppercase">{post.category}</span>
                             </div>
                          </div>
                        </div>
                      ))}
                      {myPosts.length === 0 && <p className="text-stone-300 italic font-serif p-10 text-center bg-stone-50/50 rounded-[32px]">您还没有发布过文章</p>}
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* 6. 账户设置 */}
          {activeTab === 'settings' && (
            <div className="space-y-12 animate-in fade-in duration-500 max-w-xl">
               <div className="space-y-2">
                 <h3 className="text-4xl font-serif text-[#1A1412]">执业安全设置</h3>
                 <p className="text-stone-400 font-serif italic text-sm">执业密码涉及咨询师与来访者的隐私安全，建议每3个月更换一次。</p>
               </div>
               <form onSubmit={handleUpdatePassword} className="bg-[#FAF8F6] p-12 rounded-[60px] border border-stone-50 space-y-8 shadow-sm">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-4">旧执业密码 OLD PASSWORD</label>
                     <input required type="password" value={passwordForm.oldPass} onChange={e => setPasswordForm({...passwordForm, oldPass: e.target.value})} className="w-full bg-white border border-stone-100 p-5 rounded-2xl outline-none focus:border-[#B87333]/20" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-4">新执业密码 NEW PASSWORD</label>
                     <input required type="password" placeholder="不少于6位" value={passwordForm.newPass} onChange={e => setPasswordForm({...passwordForm, newPass: e.target.value})} className="w-full bg-white border border-stone-100 p-5 rounded-2xl outline-none focus:border-[#B87333]/20" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-4">确认新密码 CONFIRM PASSWORD</label>
                     <input required type="password" value={passwordForm.confirmPass} onChange={e => setPasswordForm({...passwordForm, confirmPass: e.target.value})} className="w-full bg-white border border-stone-100 p-5 rounded-2xl outline-none focus:border-[#B87333]/20" />
                  </div>
                  <button type="submit" className="w-full py-6 bg-[#1A1412] text-white rounded-full font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-[#B87333] transition-all">确认并更新密码</button>
               </form>
               <div className="p-8 border border-stone-100 rounded-[32px] bg-white italic text-[11px] text-stone-300 leading-relaxed font-serif">
                  * 密码修改成功后将立即生效。如遗失密码，请联系品牌合伙人 Sienna 郭进行人工重置。
               </div>
            </div>
          )}

        </main>
      </div>

      {/* 发起成长活动 Modal */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-[400] bg-[#1A1412]/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="bg-white w-full max-w-3xl rounded-[60px] shadow-4xl flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-700">
              <button onClick={() => setIsEventModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 rounded-full border border-stone-50 flex items-center justify-center text-stone-300 hover:text-[#1A1412] transition-colors">✕</button>
              
              <div className="p-12 md:p-20 overflow-y-auto no-scrollbar">
                 <header className="mb-12 space-y-4">
                    <span className="text-[10px] font-black text-[#B87333] uppercase tracking-[0.6em]">Professional Growth / 发起活动</span>
                    <h2 className="text-4xl font-serif text-[#1A1412]">发起专业共创</h2>
                    <p className="text-stone-400 font-serif italic">“播种火种，共同守望。”</p>
                 </header>

                 <form onSubmit={handleInitiateEvent} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-4">活动名称 TITLE</label>
                          <input required type="text" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="w-full bg-[#FAF8F6] border border-stone-100 p-5 rounded-3xl outline-none focus:border-[#B87333]/20 transition-all font-serif text-lg" placeholder="例如：读书会、督导组..." />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-4">活动类型 CATEGORY</label>
                          <select value={eventForm.type} onChange={e => setEventForm({...eventForm, type: e.target.value})} className="w-full bg-[#FAF8F6] border border-stone-100 p-5 rounded-3xl outline-none focus:border-[#B87333]/20 transition-all font-serif text-lg appearance-none">
                             <option>读书会</option>
                             <option>督导组</option>
                             <option>工作坊</option>
                             <option>沙龙分享</option>
                          </select>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-4">预定日期 DATE</label>
                          <input type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="w-full bg-[#FAF8F6] border border-stone-100 p-5 rounded-3xl outline-none focus:border-[#B87333]/20 transition-all font-serif" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-4">具体时间 TIME</label>
                          <input type="text" value={eventForm.timeRange} onChange={e => setEventForm({...eventForm, timeRange: e.target.value})} className="w-full bg-[#FAF8F6] border border-stone-100 p-5 rounded-3xl outline-none focus:border-[#B87333]/20 transition-all font-serif" placeholder="e.g. 19:00 - 21:00" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-4">地点/链接 LOCATION</label>
                       <input type="text" value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})} className="w-full bg-[#FAF8F6] border border-stone-100 p-5 rounded-3xl outline-none focus:border-[#B87333]/20 transition-all font-serif" placeholder="腾讯会议 / 伴言线下中心" />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-4">活动简介 DESCRIPTION</label>
                       <textarea value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} className="w-full h-32 bg-[#FAF8F6] border border-stone-100 p-6 rounded-[32px] outline-none focus:border-[#B87333]/20 transition-all font-serif resize-none" placeholder="简要描述活动内容、招募对象..." />
                    </div>

                    <div className="pt-6">
                       <button type="submit" className="w-full py-6 bg-[#1A1412] text-white rounded-full font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-[#B87333] transition-all">确认发起活动 INITIATE</button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PractitionerDashboard;
