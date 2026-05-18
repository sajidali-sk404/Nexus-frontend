export type UserRole = 'entrepreneur' | 'investor';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  
  // Profile
  avatarUrl?: string;
  profilePic?: string;
  bio?: string;
  location?: string;
  phone?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };

  // Status
  isOnline?: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  lastSeen?: string;

  // Entrepreneur specific
  startupName?: string;
  startupStage?: string;
  industry?: string;
  fundingNeeded?: number;
  fundingStage?: string;
  pitchSummary?: string;
  foundedYear?: number;
  teamSize?: number;
  startupHistory?: {
    company: string;
    role: string;
    from: string;
    to: string;
    description: string;
  }[];

  // Investor specific
  investmentFocus?: string[];
  investmentInterests?: string[];
  investmentStage?: string[];
  portfolioSize?: number;
  totalInvestments?: number;
  minInvestment?: number;
  maxInvestment?: number;
  minimumInvestment?: string;
  maximumInvestment?: string;
  portfolioCompanies?: string[];
  investmentHistory?: {
    company: string;
    amount: number;
    year: number;
    outcome: string;
  }[];

  // Notification preferences
  notificationPreferences?: {
    emailNotifications?: boolean;
    messageNotifications?: boolean;
    collaborationNotifications?: boolean;
    investmentNotifications?: boolean;
  };

  // Security
  twoFactorEnabled?: boolean;

  createdAt: string;
  updatedAt?: string;
}

export interface Entrepreneur extends User {
  role: 'entrepreneur';
  startupName: string;
  pitchSummary: string;
  fundingNeeded: number;
  industry: string;
  location: string;
  foundedYear: number;
  teamSize: number;
}

export interface Investor extends User {
  role: 'investor';
  investmentInterests: string[];
  investmentStage: string[];
  portfolioCompanies: string[];
  totalInvestments: number;
  minimumInvestment: string;
  maximumInvestment: string;
}

export interface Message {
  _id: string;
  senderId:
    | string
    | {
        _id: string;
        name?: string;
        avatarUrl?: string;
        profilePic?: string;
      };
  receiverId: string;
  content: string;
  timestamp?: string;
  isRead?: boolean;
  read?: boolean;
  createdAt?: string;
}

export interface ChatConversation {
  _id?: string;
  id?: string;
  participants?: User[];
  partner?: User;
  lastMessage?: {
    _id?: string;
    content: string;
    senderId: string;
    timestamp?: string;
    createdAt?: string;
    isRead?: boolean;
    read?: boolean;
  };
  unreadCount?: number;
  updatedAt?: string;
}

export interface CollaborationRequest {
  _id: string;
  investorId: string | User;
  entrepreneurId: string | User;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Document {
  _id: string;
  name: string;
  fileName?: string;
  type: string;
  size: number;
  fileSize?: number;
  fileUrl?: string;
  lastModified?: string;
  shared?: boolean;
  sharedWith?: string[];
  signed?: boolean;
  url?: string;
  ownerId?: string;
  uploadedBy?: string;
  owner?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  _id: string;
  userId: string;
  fromUserId: string | User;
  type: 'message' | 'connection' | 'investment' | string;
  content: string;
  isRead: boolean;
  readAt?: string;
  refId?: string;
  refModel?: string;
  createdAt: string;
}

export interface Transaction {
  _id: string;
  from?: string | User;
  to?: string | User;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: any) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  changePassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}