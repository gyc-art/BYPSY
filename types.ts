
export interface TimeSlot {
  id: string;
  day: string;
  time: string;
  isBooked: boolean;
}

export interface BookingRecord {
  id: string;
  counselorName: string;
  date: string;
  time: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface GlobalCharityProject {
  id: string;
  enabled: boolean;
  name: string;
  price: number;
  sessionCount: number;
  usageLimitPerClient: number; // 单个来访者限购总次数
  description: string;
  participatingCounselorIds: string[];
  maxClientsPerCounselor: number;
  charityUsage: Record<string, number>;
  shareUrl?: string;
}

export interface Counselor {
  id: string;
  serialNumber: string;
  name: string;
  title: string;
  avatar: string;
  experience: number; 
  sessionHours: number;
  supervisionReceivedHours: number;
  personalTherapyHours: number;
  supervisionGivenHours: number;
  specialties: string[];
  tags: string[];
  training: string[];
  bio: string;
  education: string;
  price: number;
  trialPrice?: number;
  rating: number;
  available: boolean;
  availableSlots: TimeSlot[];
  password?: string;
  auditStatus: {
    backgroundChecked: boolean;
    ethicalInterviewed: boolean;
    clinicalAssessed: boolean;
  };
}

export interface FinanceRow {
  counselorId: string;
  counselorName: string;
  totalRevenue: number;
  serviceFeeRate: number; // 20%
  otherExpenses: number; 
  monthlyPaid: number;
  yearlyPaid: number;
}

export interface RefundRequest {
  id: string;
  clientName: string;
  counselorName: string;
  amount: number;
  reason: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PaymentConfig {
  qrCodeUrl: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
}

export interface SpaceItem {
  id: string;
  title: string;
  excerpt: string;
  content?: string; // 新增正文字段
  authorId: string;
  authorName: string;
  date: string;
  category: string;
  readTime: string;
  coverImage: string;
  isDraft?: boolean;
}

export interface MatchingResult {
  reason: string;
  counselorIds: string[];
}

export interface SessionPackage {
  count: number;
  label: string;
  description: string;
  milestone?: string;
  discount: number;
  type: string;
}

export interface Transaction {
  id: string;
  clientName: string;
  counselorName: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'refunded';
}

export interface IntakeFormResponse {
  realName: string;
  gender: '男' | '女' | '多元' | '未选择';
  age: string;
  education: string;
  phone: string;
  emergencyContact: string;
  emergencyRelation: string;
  emergencyPhone: string;
  isVoluntary: '是' | '否';
  hasKnowledge: '是' | '否';
  hasExperience: '是' | '否';
  helpTopics: string[];
  extremeThoughts: '无' | '有过想法' | '有过行为';
  medicalHistory: string;
  agreedConfidentiality: boolean;
  agreedEthical: boolean;
  signatureData: string;
  submittedAt: string;
  hash: string;
}

export interface IntakePackage {
  id: string;
  clientName: string;
  counselorId: string;
  counselorName: string;
  createdAt: string;
  status: 'pending' | 'completed';
  formData?: IntakeFormResponse;
}

export interface CaseNote {
  id: string;
  counselorId: string;
  clientName: string;
  type: string;
  content: string;
  date: string;
}

export interface GrowthEvent {
  id: string;
  title: string;
  type: string;
  organizerName: string;
  date: string;
  timeRange: string;
  location: string;
  description: string;
  participants: string[];
}
