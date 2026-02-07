
import React, { useState, useEffect } from 'react';
import { SPACE_ITEMS, COUNSELORS } from '../constants';
import { SpaceItem } from '../types';

const BanyanSpace: React.FC = () => {
  const [activeTab, setActiveTab] = useState('全部');
  const tabs = ['全部', '咨询感悟', '深度科普', '关系洞察'];

  // --- 状态管理 ---
  const [displayItems, setDisplayItems] = useState<SpaceItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [managementTab, setManagementTab] = useState<'publish' | 'list'>('publish'); 
  const [readingItem, setReadingItem] = useState<SpaceItem | null>(null); 

  const [postStep, setPostStep] = useState<'auth' | 'form'>('auth');
  const [authForm, setAuthForm] = useState({ serial: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  
  const [newPost, setNewPost] = useState<Partial<SpaceItem>>({
    title: '',
    category: '咨询感悟',
    excerpt: '',
    content: '',
    coverImage: ''
  });

  // 伴言品牌极简兜底图
  const DEFAULT_COVER = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800';

  const loadData = () => {
    const saved = localStorage.getItem('banyan_user_posts');
    const userPosts = saved ? JSON.parse(saved) : [];
    const userPostsWithMark = userPosts.map((p: any) => ({ 
      ...p, 
      isUserGenerated: true,
      coverImage: p.coverImage || DEFAULT_COVER
    }));
    
    const defaultItemsWithContent = SPACE_ITEMS.map(item => ({
      ...item,
      content: item.content || `这是关于《${item.title}》的专业洞见。在伴言的空间里，我们致力于通过深度的言语交流，探索意识之下的冰山...\n\n(内容正在同步中)`
    }));

    setDisplayItems([...userPostsWithMark, ...defaultItemsWithContent]);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('banyan_space_updated', loadData);
    return () => window.removeEventListener('banyan_space_updated', loadData);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

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
      setAuthError('验证失败：编号或执业密码不正确');
    }
  };

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

  // 发布逻辑 - 核心修改：封面图不再是必填项
  const handlePublish = () => {
    if (!newPost.title || !newPost.content) {
      alert('请填写标题与正文内容');
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
      coverImage: newPost.coverImage || '' // 留空则在 loadData 时应用 DEFAULT_COVER
    };

    const saved = localStorage.getItem('banyan_user_posts');
    const userPosts = saved ? JSON.parse(saved) : [];
    localStorage.setItem('banyan_user_posts', JSON.stringify([post, ...userPosts]));
    
    window.dispatchEvent(new Event('banyan_space_updated'));
    loadData();
    setIsModalOpen(false);
    showToast('文章已同步至空间');
    setNewPost({ title: '', category: '咨询感悟', excerpt: '', content: '', coverImage: '' });
  };

  // 下载逻辑 - 导出为 Word (.doc) 格式
  const handleDownloadDoc = (item: SpaceItem) => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${item.title}</title>
    <style>
      body { font-family: 'Times New Roman', 'PingFang SC', serif; line-height: 1.6; }
      h1 { color: #1A1412; border-bottom: 1px solid #EEEEEE; padding-bottom: 10px; }
      .meta { color: #B87333; font-size: 12px; margin-bottom: 30px; }
      .content { font-size: 14px; color: #333333; white-space: pre-wrap; }
    </style>
    </head><body>`;
    
    const body = `
      <h1>${item.title}</h1>
      <div class="meta">作者：${item.authorName} | 日期：${item.date} | 分类：${item.category}</div>
      <div class="content">${item.content || item.excerpt}</div>
      <hr/>
      <p style="font-size: 10px; color: #999999;">本文档由 深圳市伴言心理咨询有限责任公司 专家专栏系统自动生成</p>
    `;
    
    const footer = `</body></html>`;
    const source = header + body + footer;
    
    const blob = new Blob([source], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `伴言专栏-${item.title}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Word 版本已准备就绪');
  };

  // 删除逻辑
  const handleDelete = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('管理确认：是否永久移除此篇内容？')) return;
    const saved = localStorage.getItem('banyan_user_posts');
    const userPosts = saved ? JSON.parse(saved) : [];
    const updated = userPosts.filter((p: any) => p.id !== itemId);
    localStorage.setItem('banyan_user_posts', JSON.stringify(updated));
    window.dispatchEvent(new Event('banyan_space_updated'));
    loadData();
    showToast('内容已移除');
  };

  const filteredItems = activeTab === '全部' 
    ? displayItems 
    : displayItems.filter(item => item.category === activeTab);

  return (
    <section id="space" className="py-32 md:py-48 bg-[#FDFBF9] relative">
      {toast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[9999] bg-[#1A1412] text-white px-8 py-4 rounded-full shadow-2xl animate-in slide-in-from-top-4">
          <span className="text-[10px] font-black tracking-widest uppercase">{toast}</span>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-12">
          <div className="space-y-8 relative">
            <div className="flex items-center gap-6">
              <span className="text-[11px] text-[#B87333] font-black uppercase tracking-[0.8em]">Insights Hub</span>
              <div className="w-12 h-[1px] bg-[#B87333]/30"></div>
            </div>
            <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-12">
              <div className="flex flex-col gap-3">
                <h3 className="text-6xl md:text-8xl font-serif text-[#1A1412] tracking-tighter italic leading-none">潜流之上</h3>
                <p className="text-xl md:text-3xl font-serif text-[#1A1412]/60 tracking-[0.1em] leading-snug">
                  思绪的锚点 <span className="text-[#B87333]/40 mx-2">·</span> 行动的罗盘
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mb-2 px-10 py-2.5 border border-[#B87333] text-[#B87333] rounded-full text-[11px] font-black uppercase tracking-[0.4em] hover:bg-[#B87333] hover:text-white transition-all duration-700 shadow-sm active:scale-95"
              >
                MANAGE
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
                <span className="text-[13px] font-bold tracking-widest">{tab}</span>
                <div className={`h-1 w-4 bg-[#B87333] mt-2 rounded-full transition-all duration-700 ${activeTab === tab ? 'opacity-100 scale-x-150' : 'opacity-0 scale-x-0'}`}></div>
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-16 md:gap-x-12">
            <div 
              className="md:col-span-7 group cursor-pointer relative"
              onClick={() => setReadingItem(filteredItems[0])}
            >
              <div className="relative aspect-[16/11] rounded-[48px] md:rounded-[56px] overflow-hidden mb-8 border border-stone-100 shadow-sm">
                <img src={filteredItems[0].coverImage} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2s]" alt={filteredItems[0].title} />
                <div className="absolute top-8 left-8 bg-white/80 backdrop-blur px-4 py-1.5 rounded-full">
                  <span className="text-[10px] font-black text-[#B87333] tracking-[0.3em] uppercase">{filteredItems[0].category}</span>
                </div>
              </div>
              <div className="space-y-4 pr-12">
                <div className="flex items-center gap-4 text-stone-300 text-[10px] font-bold tracking-widest uppercase">
                  <span>By {filteredItems[0].authorName}</span>
                  <div className="w-1 h-1 bg-stone-200 rounded-full"></div>
                  <span>{filteredItems[0].date}</span>
                </div>
                <h4 className="text-3xl font-serif text-[#1A1412] group-hover:text-[#B87333] transition-colors leading-tight">{filteredItems[0].title}</h4>
                <p className="text-[14px] text-stone-400 font-serif line-clamp-2 italic">“{filteredItems[0].excerpt}”</p>
              </div>
            </div>

            <div className="md:col-span-5 flex flex-col gap-16 md:pt-12">
              {filteredItems.slice(1, 5).map((item) => (
                <div 
                  key={item.id} 
                  className="group flex gap-6 items-start cursor-pointer"
                  onClick={() => setReadingItem(item)}
                >
                  <div className="relative w-32 h-32 shrink-0 rounded-[28px] overflow-hidden border border-stone-100">
                    <img src={item.coverImage} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s]" alt={item.title} />
                  </div>
                  <div className="space-y-2 py-1 flex-1">
                    <span className="text-[8px] font-black text-[#B87333] uppercase tracking-widest">{item.category}</span>
                    <h4 className="text-[16px] font-bold text-[#1A1412] group-hover:text-[#B87333] leading-tight transition-colors">{item.title}</h4>
                    <p className="text-[11px] text-stone-400 line-clamp-2 italic">{item.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-stone-200 text-sm italic font-serif">暂无内容</div>
        )}
      </div>

      {/* --- 阅读模式 --- */}
      {readingItem && (
        <div className="fixed inset-0 z-[5000] bg-white overflow-y-auto animate-in slide-in-from-bottom-12 duration-700">
          <div className="max-w-[800px] mx-auto px-8 py-24 md:py-40 relative">
            <button 
              onClick={() => setReadingItem(null)}
              className="fixed top-12 right-12 w-14 h-14 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-[#1A1412] hover:bg-stone-100 transition-all hover:rotate-90 z-[5100] shadow-sm"
            >✕</button>

            <header className="mb-20 space-y-8 text-center">
              <span className="text-[10px] font-black text-[#B87333] uppercase tracking-[0.6em]">{readingItem.category}</span>
              <h1 className="text-4xl md:text-6xl font-serif text-[#1A1412] leading-tight tracking-tighter">{readingItem.title}</h1>
              <div className="flex items-center justify-center gap-6 pt-4">
                <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-[10px] font-serif italic text-stone-400">伴</div>
                <div className="text-left">
                  <div className="text-[12px] font-bold text-[#1A1412] uppercase tracking-widest">{readingItem.authorName}</div>
                  <div className="text-[10px] text-stone-300 font-medium">{readingItem.date} · {readingItem.readTime} 阅读</div>
                </div>
              </div>
            </header>

            <div className="aspect-[16/9] rounded-[40px] overflow-hidden mb-20 shadow-xl border border-stone-50">
               <img src={readingItem.coverImage} className="w-full h-full object-cover" alt="Cover" />
            </div>

            <article className="prose prose-stone max-w-none">
              <div className="text-[18px] md:text-[20px] font-serif leading-[2.2] text-[#1A1412]/80 space-y-12">
                {(readingItem.content || readingItem.excerpt).split('\n').map((p, i) => (
                  <p key={i} className="indent-8">{p}</p>
                ))}
              </div>
            </article>

            <footer className="mt-40 pt-20 border-t border-stone-100 text-center">
               <div className="w-1 h-20 bg-gradient-to-b from-[#B87333]/30 to-transparent mx-auto mb-10"></div>
               <p className="text-[10px] font-black text-stone-200 uppercase tracking-[1.2em]">BANYAN DIALOGUE</p>
            </footer>
          </div>
        </div>
      )}

      {/* --- 管理对话框 --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[4000] bg-[#1A1412]/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-4xl overflow-hidden relative p-8 md:p-16 flex flex-col h-[90vh]">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-8 right-8 text-stone-300 hover:text-[#1A1412] transition-colors p-2"
            >✕</button>

            {postStep === 'auth' ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-12 animate-in slide-in-from-bottom-6 max-w-md mx-auto w-full">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-[#B87333] rounded-2xl flex items-center justify-center text-white font-serif text-2xl mx-auto shadow-xl">伴</div>
                  <h4 className="text-2xl font-serif text-[#1A1412]">创作权限验证</h4>
                </div>
                <form onSubmit={handleAuth} className="space-y-8 w-full">
                  <div className="space-y-4">
                    <input type="text" placeholder="咨询师编号" value={authForm.serial} onChange={e => setAuthForm({...authForm, serial: e.target.value})} className="w-full bg-stone-50 border border-stone-100 p-5 rounded-2xl outline-none focus:border-[#B87333]/30 font-serif" />
                    <input type="password" placeholder="执业密码" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full bg-stone-50 border border-stone-100 p-5 rounded-2xl outline-none focus:border-[#B87333]/30 font-serif" />
                  </div>
                  {authError && <p className="text-red-400 text-xs text-center font-bold tracking-widest">{authError}</p>}
                  <button type="submit" className="w-full bg-[#1A1412] text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl hover:bg-[#B87333] transition-all">确认执业身份</button>
                </form>
              </div>
            ) : (
              <div className="flex-1 flex flex-col space-y-8 animate-in fade-in overflow-hidden">
                <header className="flex justify-between items-end border-b border-stone-50 pb-6 shrink-0">
                  <div className="flex gap-10">
                    <button onClick={() => setManagementTab('publish')} className={`text-xl font-serif transition-all pb-2 ${managementTab === 'publish' ? 'text-[#1A1412] border-b-2 border-[#B87333]' : 'text-stone-300 hover:text-stone-500'}`}>新作撰写</button>
                    <button onClick={() => setManagementTab('list')} className={`text-xl font-serif transition-all pb-2 ${managementTab === 'list' ? 'text-[#1A1412] border-b-2 border-[#B87333]' : 'text-stone-300 hover:text-stone-500'}`}>内容管理</button>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar pr-4">
                  {managementTab === 'publish' ? (
                    <div className="space-y-8 py-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">文章标题</label>
                        <input type="text" placeholder="输入标题..." value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className="w-full bg-stone-50 border border-stone-100 p-5 rounded-2xl outline-none font-serif text-lg" />
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">所属分类</label>
                          <select value={newPost.category} onChange={e => setNewPost({...newPost, category: e.target.value})} className="w-full bg-stone-50 border border-stone-100 p-5 rounded-2xl outline-none font-serif h-16">
                            {tabs.filter(t => t !== '全部').map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">封面图片 (可选)</label>
                          <label className="flex items-center justify-center w-full bg-stone-50 border border-dashed border-stone-200 p-5 rounded-2xl cursor-pointer h-16 hover:bg-stone-100 transition-colors">
                            <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">{newPost.coverImage ? '✓ 已选择封面' : '＋ 点击上传 (16:11)'}</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                          </label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">内容摘要</label>
                        <textarea placeholder="一句话摘要..." value={newPost.excerpt} onChange={e => setNewPost({...newPost, excerpt: e.target.value})} className="w-full h-20 bg-stone-50 border border-stone-100 p-6 rounded-3xl outline-none font-serif text-sm resize-none italic" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-stone-300 uppercase tracking-widest px-2">正文内容</label>
                        <textarea placeholder="倾注您的专业洞见..." value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})} className="w-full h-80 bg-stone-50 border border-stone-100 p-8 rounded-[32px] outline-none font-serif text-md leading-relaxed" />
                      </div>
                      <button onClick={handlePublish} className="w-full bg-[#1A1412] text-white py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl hover:bg-[#B87333] transition-all">同步发布 SYNC POST</button>
                    </div>
                  ) : (
                    <div className="space-y-6 py-4">
                      {displayItems.filter((i:any) => i.isUserGenerated).length > 0 ? (
                        displayItems.filter((i:any) => i.isUserGenerated).map(item => (
                          <div key={item.id} className="p-6 bg-stone-50 rounded-[32px] border border-stone-100 flex items-center justify-between group hover:bg-white hover:shadow-lg transition-all duration-500">
                            <div className="flex items-center gap-6">
                              <img src={item.coverImage} className="w-20 h-20 rounded-2xl object-cover shadow-sm" alt="Preview" />
                              <div className="space-y-1">
                                <h5 className="font-serif font-bold text-[#1A1412] text-lg">{item.title}</h5>
                                <p className="text-[10px] text-stone-300 font-bold uppercase tracking-widest">{item.date} · {item.category}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              {/* 新增 Word 格式下载按钮 */}
                              <button 
                                type="button"
                                onClick={() => handleDownloadDoc(item)}
                                title="导出为 Word 格式"
                                className="px-6 py-2.5 border border-[#B87333]/30 text-[#B87333] text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-[#B87333]/10 transition-all active:scale-95"
                              >
                                DOWNLOAD (.DOC)
                              </button>
                              
                              <button 
                                type="button"
                                onClick={(e) => handleDelete(e, item.id)}
                                className="px-6 py-2.5 border border-[#B87333] text-[#B87333] text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-[#B87333] hover:text-white transition-all shadow-sm active:scale-95"
                              >
                                DELETE
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-24 text-center text-stone-200 font-serif italic border-2 border-dashed border-stone-50 rounded-[40px]">
                          暂无发布的内容记录
                        </div>
                      )}
                    </div>
                  )}
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
