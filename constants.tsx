
import { Counselor, SessionPackage, TimeSlot, SpaceItem, Transaction, IntakePackage } from './types';

const generateMockSlots = (): TimeSlot[] => {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const times: string[] = [];
  // 生成 09:00 到 22:00 的整点和半点
  for (let h = 9; h <= 21; h++) {
    const hour = h.toString().padStart(2, '0');
    times.push(`${hour}:00`);
    times.push(`${hour}:30`);
  }
  
  return days.flatMap((day) => 
    times.map((time) => ({
      id: `${day}-${time}`,
      day,
      time,
      isBooked: false // 默认全部在线 (Available)
    }))
  );
};

export const PACKAGES: SessionPackage[] = [
  { count: 1, label: 'Single Session / 首次联结', discount: 0, description: '建立安全感，明确初步咨询目标', type: 'short' },
  { count: 10, label: 'Focus / 焦点方案', discount: 0.05, description: '针对特定议题或困扰的聚焦工作', type: 'short' },
  { count: 20, label: 'Short-term / 短程方案', discount: 0.1, description: '探索行为模式，缓解核心症状', type: 'medium' },
  { count: 40, label: 'Medium-term / 中程方案', discount: 0.15, description: '深层情感整合，重塑人格结构', type: 'long' },
  { count: 100, label: 'Long-term / 长程方案', discount: 0.2, description: '无意识的深度探索与核心自我的转化', type: 'custom' },
];

export const COUNSELORS: Counselor[] = [
  {
    id: '1',
    serialNumber: 'BY-001',
    name: 'Sienna 郭',
    title: '咨询师',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    experience: 8,
    sessionHours: 1200,
    supervisionReceivedHours: 350,
    // Added personalTherapyHours to fix Counselor interface error
    personalTherapyHours: 150,
    supervisionGivenHours: 0,
    specialties: ['深度陪伴', '动力学取向', '天赋赋能'],
    tags: ['严选录入'],
    training: [
      'IPA(国际精神分析协会)候选人培训项目',
      '中德精神分析连续培训项目',
      '心理动力学夫妻咨询专项培训',
      '复杂性创伤(C-PTSD)临床干预认证'
    ],
    bio: '咨询的艺术，在于对‘时机、策略与剂量’的精准裁量。改变的过程需要力量，也需要克制。过度的冲击会带来瓦解，过轻的触碰无法撼动顽疾。',
    education: '华师大硕士',
    price: 600,
    trialPrice: 199,
    rating: 5.0,
    available: true,
    availableSlots: generateMockSlots(),
    auditStatus: {
      backgroundChecked: true,
      ethicalInterviewed: true,
      clinicalAssessed: true
    }
  },
  {
    id: '6',
    serialNumber: 'BY-006',
    name: '沈知秋',
    title: '资深硕博专家',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    experience: 12,
    sessionHours: 2500,
    supervisionReceivedHours: 600,
    // Added personalTherapyHours to fix Counselor interface error
    personalTherapyHours: 200,
    supervisionGivenHours: 150,
    specialties: ['复杂性创伤', '自我同一性', '情绪调节'],
    tags: ['严选录入'],
    training: [
      'CAPA(中美精神分析联盟)高级组毕业',
      '徐钧自体心理学连续培训',
      'DBT(辩证行为疗法)临床应用培训',
      '自体心理学临床案例督导班'
    ],
    bio: '专注于在稳定的咨询框架中，提供最有力量的陪伴。理解潜意识的运作，是为了在现实中获得更大的自由度。',
    education: '中大硕士',
    price: 800,
    trialPrice: 299,
    rating: 4.9,
    available: true,
    availableSlots: generateMockSlots(),
    auditStatus: {
      backgroundChecked: true,
      ethicalInterviewed: true,
      clinicalAssessed: true
    }
  }
];

export const SPACE_ITEMS: SpaceItem[] = [
  {
    id: 's1',
    title: '职场精英的“隐形焦虑”：为何你越成功越孤独？',
    excerpt: '在高度逻辑化的职场背面，是一颗颗长期被理性压抑的感性心灵。我们该如何识别那些微小的裂缝...',
    authorId: '1',
    authorName: 'Sienna郭',
    date: '2024.03.15',
    category: '咨询感悟',
    readTime: '6 min',
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 's2',
    title: '动力学取向：探寻童年如何塑造了今天的决策模型',
    excerpt: '我们的商业策略、领导风格，往往藏着童年时应对不安全感的潜意识投影...',
    authorId: '7',
    authorName: '韩墨',
    date: '2024.03.10',
    category: '深度科普',
    readTime: '12 min',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600'
  }
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TX001', clientName: '李先生', counselorName: 'Sienna 郭', amount: 800, date: '2024.03.20', status: 'paid' },
  { id: 'TX002', clientName: '王女士', counselorName: '沈知秋', amount: 600, date: '2024.03.19', status: 'paid' }
];

export const MOCK_INTAKE_PACKAGES: IntakePackage[] = [
  {
    id: 'pkg_9281',
    clientName: '赵晓萌',
    counselorId: '1',
    counselorName: 'Sienna 郭',
    createdAt: '2024.03.22',
    status: 'pending'
  }
];
