import { Contract, Task, Transaction, WalletData, ChatThread, ChatMessage, Proposal, Review, User } from '../types';

const API_URL = 'http://localhost:4000/api';
import { getUser } from './authService';

// Remove the old CURRENT_USER_ID export, now using getUser() from authService

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    // Get current user ID from localStorage
    const user = getUser();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers as HeadersInit,
    };
    
    // Add user ID to headers if user is logged in
    if (user && user.id) {
      headers['X-User-Id'] = user.id.toString();
    }
    
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!res.ok) {
      // Try to extract error message from response body
      let errorMessage = `API Error: ${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If response isn't JSON, use the status text
      }
      throw new Error(errorMessage);
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

/**
 * Send a message to a thread
 */
export const sendMessage = async (threadId: number, text: string): Promise<ChatMessage> => {
  const user = getUser();
  if (!user || !user.id) {
    throw new Error('User not logged in');
  }

  const message = await fetchAPI<ChatMessage>(`/threads/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  
  // Set isMe flag
  message.isMe = message.senderId === user.id;
  
  return message;
};

export const getReviewsForUser = async (userId: number): Promise<Review[]> => {
  return fetchAPI<Review[]>(`/reviews/user/${userId}`);
};

export const createTask = async (taskData: {
  title: string;
  description: string;
  budget: number;
  deadline?: string;
  category: string;
  skills: string[];
}): Promise<Task> => {
  return fetchAPI<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
};

export const createProposal = async (proposalData: {
  taskId: number;
  amount: number;
  message: string;
}): Promise<Proposal> => {
  return fetchAPI<Proposal>('/proposals', {
    method: 'POST',
    body: JSON.stringify(proposalData),
  });
};