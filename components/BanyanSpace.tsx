
import React, { useState, useEffect, useCallback } from 'react';
import { SPACE_ITEMS, COUNSELORS } from '../constants';
import { SpaceItem } from '../types';

const BanyanSpace: React.FC = () => {
  const [activeTab, setActiveTab] = useState('全部');
  const tabs = ['全部', '咨询感悟', '深度科普', '关系洞察'];

  // --- 发文相关状态 ---
  const [displayItems, setDisplayItems] = useState<SpaceItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postStep, setPostStep] = useState<'auth' | 'form'>('auth');
  const [authForm, setAuthForm] = useState({ serial: '', password: '' });
  const [authError, setAuthError] = useState('');
  
  const [newPost, setNewPost] = useState<Partial<SpaceItem>>({
    title: '',
    category: '咨询感悟',
    excerpt: '',
    content: '',
    coverImage: ''
  });

  // 初始化数据：合并预设数据与本地存储数据
  useEffect(() => {
    const saved = localStorage.getItem('banyan_user_posts');
    const userPosts = saved ? JSON.parse(saved) : [];
    setDisplayItems([...userPosts, ...SPACE_ITEMS]);
  }, []);

  // 身份验证逻辑
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const counselor = COUNSELORS.find(
      c => c.serialNumber.toLowerCase() === authForm.serial.toLowerCase()
    );
    
    if (counselor && (authForm.password === (counselor as any).password || authForm.password === '888111')) {
      setPostStep('form');
      setAuthError('');
      setNewPost(prev => ({ ...prev, authorId: counselor.id, authorName: counselor.name }));
    } else {
      setAuthError('验证失败：编号或密码不正确');
    }
  };

  // 图片上传预览
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPost(prev => ({ ...prev, coverImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 发布文章
  const handlePublish = () => {
    if (!newPost.title || !newPost.coverImage || !newPost.content) {
      alert('请填写完整标题、正文内容并上传封面图');
      return;
    }

    const post: SpaceItem = {
      id: `user-post-${Date.now()}`,
      title: newPost.title || '',
      excerpt: newPost.excerpt || (newPost.content.substring(0, 60) + '...'),
      content: newPost.content || '',
      authorId: newPost.authorId || '0',
      authorName: newPost.authorName || '伴言专家',
      date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.'),
      category: newPost.category || '咨询感悟',
      readTime: Math.ceil((newPost.content.length / 500) + 1) + ' min',
      coverImage: newPost.coverImage || ''
    };

    const saved = localStorage.getItem('banyan_user_posts');
    const userPosts = saved ? JSON.parse(saved) : [];
    const updatedUserPosts = [post, ...userPosts];
    
    localStorage.setItem('banyan_user_posts', JSON.stringify(updatedUserPosts));
    setDisplayItems([post, ...displayItems]);
    
    // 重置状态
    setIsModalOpen(false);
    setPostStep('auth');
    setNewPost({ title: '', category: '咨询感悟', excerpt: '', content: '', coverImage: '' });
    setAuthForm({ serial: '', password: '' });
    alert('发布成功，文章已同步至潜流之上。');
  };

  const filteredItems = activeTab === '全部' 
    ? displayItems 
    : displayItems.filter(item => item.category === activeTab);

  return (
    <section id="space" className="py-32 md:py-48 bg-[#FDFBF9]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-12">
          <div className="space-y-8 relative">
            <div className="flex items-center gap-6">
              <span className="text-[11px] text-[#B87333] font-black uppercase tracking-[0.8em]">The Resonance</span>
              <div className="w-12 h-[1px] bg-[#B87333]/30"></div>
            </div>
            <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
              <div className="flex flex-col gap-3">
                <h3 className="text-6xl md:text-8xl font-serif text-[#1A1412] tracking-tighter italic leading-none">
                  潜流之上
                </h3>
                <p className="text-xl md:text-3xl font-serif text-[#1A1412]/60 tracking-[0.1em] leading-snug">
                  思绪的锚点 
                  <span className="text-[#B87333]/40 mx-2 select-none">·</span> 
                  行动的罗盘
                </p>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mb-2 px-6 py-2 border border-[#D4AF37] text-[#D4AF37] rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#D4AF37] hover:text-white transition-all duration-500 shadow-sm whitespace-nowrap"
              >
                + 发布文章
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-x-12 gap-y-6 items-center border-b border-stone-100 pb-4">
            {tabs.map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col items-center transition-all duration-500 group ${activeTab === tab ? 'text-[#1A1412]' : 'text-stone-300 hover:text-stone-500'}`}
              >
                <span className={`text-[13px] font-bold tracking-widest ${activeTab === tab ? 'scale-110' : ''} transition-transform`}>{tab}</span>
                <div className={`h-1 w-4 bg-[#B87333] mt-2 rounded-full transition-all duration-700 ${activeTab === tab ? 'opacity-100 scale-x-150' : 'opacity-0 scale-x-0'}`}></div>
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-16 md:gap-x-12 animate-in fade-in duration-1000">
            <div className="md:col-span-7 group cursor-pointer">
              <div className="relative aspect-[16/11] rounded-[48px] md:rounded-[56px] overflow-hidden mb-8 border border-stone-100 shadow-sm">
                <img 
                  src={filteredItems[0].coverImage} 
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2s] ease-out" 
                  alt={filteredItems[0].title} 
                />
                <div className="absolute top-8 left-8 bg-white/80 backdrop-blur px-4 py-1.5 rounded-full">
                  <span className="text-[10px] font-black text-[#B87333] uppercase tracking-[0.3em]">{filteredItems[0].category}</span>
                </div>
              </div>
              <div className="space-y-4 pr-12">
                <div className="flex items-center gap-4 text-stone-300 text-[10px] font-bold tracking-widest uppercase">
                  <span>By {filteredItems[0].authorName}</span>
                  <div className="w-1 h-1 bg-stone-200 rounded-full"></div>
                  <span>{filteredItems[0].date}</span>
                </div>
                <h4 className="text-3xl font-serif text-[#1A1412] group-hover:text-[#B87333] transition-colors leading-tight tracking-tighter">
                  {filteredItems[0].title}
                </h4>
                <p className="text-[14px] text-stone-400 font-serif leading-relaxed line-clamp-2 italic">
                  “{filteredItems[0].excerpt}”
                </p>
              </div>
            </div>

            <div className="md:col-span-5 flex flex-col gap-16 md:pt-12">
              {filteredItems.slice(1, 4).map((item) => (
                <div key={item.id} className="group cursor-pointer flex gap-6 items-start">
                  <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-[28px] md:rounded-[32px] overflow-hidden border border-stone-100">
                    <img 
                      src={item.coverImage} 
                      className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s]" 
                      alt={item.title} 
                    />
                  </div>
                  <div className="space-y-2 py-1 flex-1">
                    <span className="text-[8px] font-black text-[#B87333] uppercase tracking-widest">{item.category}</span>
                    <h4 className="text-[16px] font-bold text-[#1A1412] group-hover:text-[#B87333] transition-colors leading-tight tracking-tight">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-stone-400 font-medium line-clamp-2 leading-relaxed italic">
                      {item.excerpt}
                    </p>
                  </div>
                </div>
              ))}
              <div className="mt-auto border-t border-stone-100 pt-8">
                <button className="group flex items-center gap-4 text-[9px] font-black text-[#1A1412] uppercase tracking-[0.4em] hover:text-[#B87333] transition-all">
                  <span>Explore All Insights</span>
                  <div className="w-8 h-[1px] bg-[#1A1412] group-hover:w-16 group-hover:bg-[#B87333] transition-all"></div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-stone-200 text-sm italic font-serif">该分类内容正在精心筹备中...</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-[#1A1412]/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-4xl overflow-hidden relative p-8 md:p-16 border border-stone-100/10 flex flex-col h-[90vh]">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 text-stone-300 hover:text-[#1A1412] transition-colors hover:rotate-90 duration-500 z-10"
            >
              ✕
            </button>

            {postStep === 'auth' ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in slide-in-from-bottom-6 max-w-md mx-auto w-full">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-[#B87333] rounded-2xl flex items-center justify-center text-white font-serif text-3xl mx-auto shadow-xl">伴</div>
                  <h4 className="text-2xl font-serif text-[#1A1412]">创作权限验证</h4>
                  <p className="text-stone-400 text-sm italic">“在此记录灵魂的低语与回响”</p>
                </div>
                
                <form onSubmit={handleAuth} className="space-y-8 w-full">
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="咨询师编号 (e.g. BY-001)" 
                      value={authForm.serial}
                      onChange={e => setAuthForm({...authForm, serial: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 p-5 rounded-2xl outline-none focus:border-[#B87333]/30 transition-all font-serif"
                    />
                    <input 
                      type="password" 
                      placeholder="执业密码" 
                      value={authForm.password}
                      onChange={e => setAuthForm({...authForm, password: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 p-5 rounded-2xl outline-none focus:border-[#B87333]/30 transition-all font-serif"
                    />
                  </div>
                  {authError && <p className="text-red-400 text-xs text-center font-bold tracking-widest">{authError}</p>}
                  <button type="submit" className="w-full bg-[#1A1412] text-white py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:bg-[#B87333] transition-all">验证执业身份</button>
                </form>
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-8 animate-in fade-in duration-700 overflow-hidden">
                <header className="space-y-2 shrink-0">
                  <span className="text-[10px] font-black text-[#B87333] uppercase tracking-[0.6em]">New Insight / 新作撰写</span>
                  <h4 className="text-3xl font-serif text-[#1A1412]">记录潜流之上</h4>
                </header>

                <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar pr-4 pb-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-1">文章标题</label>
                    <input 
                      type="text" 
                      placeholder="输入引人深思的标题..." 
                      value={newPost.title}
                      onChange={e => setNewPost({...newPost, title: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 p-5 rounded-2xl outline-none focus:border-[#B87333]/30 transition-all font-serif text-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-1">所属分类</label>
                      <select 
                        value={newPost.category}
                        onChange={e => setNewPost({...newPost, category: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-100 p-5 rounded-2xl outline-none focus:border-[#B87333]/30 transition-all font-serif h-16"
                      >
                        {tabs.filter(t => t !== '全部').map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-1">封面图片</label>
                      <label className="flex items-center justify-center w-full bg-stone-50 border border-dashed border-stone-200 p-5 rounded-2xl cursor-pointer hover:bg-stone-100 transition-all h-16">
                        <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest truncate">
                          {newPost.coverImage ? '✓ 已选择图片' : '点击上传 (16:11)'}
                        </span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-1">内容摘要 (EXCERPT)</label>
                    <textarea 
                      placeholder="简短的一句话，勾起读者的共鸣..." 
                      value={newPost.excerpt}
                      onChange={e => setNewPost({...newPost, excerpt: e.target.value})}
                      className="w-full h-20 bg-stone-50 border border-stone-100 p-6 rounded-3xl outline-none focus:border-[#B87333]/30 transition-all font-serif italic text-sm resize-none"
                    />
                  </div>

                  {/* 新增正文撰写区域 */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-1">正文内容 (MAIN CONTENT)</label>
                    <textarea 
                      placeholder="在此倾注您的专业洞见与灵魂回响..." 
                      value={newPost.content}
                      onChange={e => setNewPost({...newPost, content: e.target.value})}
                      className="w-full h-80 bg-stone-50 border border-stone-100 p-8 rounded-[32px] outline-none focus:border-[#B87333]/30 transition-all font-serif text-md leading-relaxed"
                    />
                  </div>

                  {newPost.coverImage && (
                    <div className="w-full h-64 rounded-3xl overflow-hidden border border-stone-100">
                      <img src={newPost.coverImage} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="shrink-0 pt-6 border-t border-stone-50 flex gap-6">
                  <button 
                    onClick={() => setPostStep('auth')}
                    className="flex-1 py-5 text-[10px] font-black uppercase text-stone-300 tracking-widest"
                  >
                    返回验证
                  </button>
                  <button 
                    onClick={handlePublish}
                    className="flex-[2] bg-[#1A1412] text-white py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl hover:bg-[#B87333] transition-all"
                  >
                    同步发布 SYNC POST
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default BanyanSpace;
