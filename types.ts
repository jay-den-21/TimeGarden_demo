export enum UserRole {
  REQUESTER = 'REQUESTER',
  PROVIDER = 'PROVIDER'
}

export enum TaskStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ACTIVE = 'active',
  AWAITING_REVIEW = 'awaiting_review',
  DISPUTED = 'disputed'
}

export enum ContractStatus {
  AWAITING_ESCROW = 'awaiting_escrow',
  ACTIVE = 'active',
  DELIVERED = 'delivered', 
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
  IN_PROGRESS = 'in-progress',
  AWAITING_REVIEW = 'awaiting_review'
}

export interface User {
  id: number;
  name: string;
  email: string;
  displayName: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  posterId: number;
  publisherName: string;
  status: TaskStatus;
  skills: string[]; 
  category: string; 
  createdAt: string;
  proposalsCount?: number;
}

export interface Proposal {
  id: number;
  taskId: number;
  applicantId: number;
  applicantName?: string;
  amount: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: string;
  taskTitle?: string;
}

export interface Contract {
  id: number;
  proposalId: number;
  taskTitle: string;
  taskId: number;
  requesterId: number;
  requesterName: string;
  providerId: number;
  providerName: string;
  amount: number;
  status: ContractStatus;
  startDate: string; 
  endDate?: string; 
  phase?: string;
  taskDescription?: string;
  requesterEmail?: string;
  providerEmail?: string;
  deadline?: string;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number; 
  type: 'escrow_lock' | 'escrow_release' | 'refund' | 'debit' | 'credit' | 'deposit' | 'withdrawal';
  status: string;
}

export interface WalletData {
  balance: number;
  escrowBalance: number;
}

export interface ChatMessage {
  id: number;
  threadId?: number;
  senderId: number;
  senderName: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  attachments?: string;
}

export interface ChatThread {
  id: number;
  taskId: number;
  taskTitle: string;
  partnerName: string;
  partnerId: number;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Review {
  id: number;
  taskId: number;
  reviewerId: number;
  revieweeId: number;
  rating: number;
  comment: string;
  createdAt: string;
}