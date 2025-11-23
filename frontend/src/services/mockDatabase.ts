import { Contract, Task, Transaction, WalletData, ChatThread, ChatMessage, Proposal, Review, User } from '../types';

const API_URL = 'http://localhost:4000/api';
export const CURRENT_USER_ID = 2; // Logic handled on backend, but kept for type consistency if needed

async function fetchAPI<T>(endpoint: string): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    // Return empty structure to prevent frontend crash, or rethrow if strictly needed
    throw error; 
  }
}

export const getCurrentUser = async (): Promise<User | null> => {
  return fetchAPI<User>('/users/me');
};

export const getWalletData = async (): Promise<WalletData> => {
  return fetchAPI<WalletData>('/wallet');
};

export const getMyTransactions = async (): Promise<Transaction[]> => {
  return fetchAPI<Transaction[]>('/transactions');
};

export const getMyTasks = async (): Promise<Task[]> => {
  return fetchAPI<Task[]>('/tasks/my');
};

export const getAllTasks = async (): Promise<Task[]> => {
  return fetchAPI<Task[]>('/tasks');
};

export const getTaskById = async (id: number): Promise<Task | null> => {
  return fetchAPI<Task>(`/tasks/${id}`);
};

export const getMyContracts = async (): Promise<Contract[]> => {
  return fetchAPI<Contract[]>('/contracts');
};

export const getContractById = async (id: number): Promise<Contract | null> => {
  return fetchAPI<Contract>(`/contracts/${id}`);
};

export const getMyProposals = async (): Promise<Proposal[]> => {
  return fetchAPI<Proposal[]>('/proposals/my');
};

export const getProposalsForTask = async (taskId: number): Promise<Proposal[]> => {
  return fetchAPI<Proposal[]>(`/proposals/task/${taskId}`);
};

export const getMyThreads = async (): Promise<ChatThread[]> => {
  return fetchAPI<ChatThread[]>('/threads');
};

export const getThreadMessages = async (threadId: number): Promise<ChatMessage[]> => {
  return fetchAPI<ChatMessage[]>(`/threads/${threadId}/messages`);
};

export const getReviewsForUser = async (userId: number): Promise<Review[]> => {
  return fetchAPI<Review[]>(`/reviews/user/${userId}`);
};
