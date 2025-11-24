// frontend/src/services/mockDatabase.ts

import { Contract, Task, Transaction, WalletData, ChatThread, ChatMessage, Proposal, Review, User } from '../types';
import { getUser } from './authService';

const API_URL = 'http://localhost:4000/api';

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    // Get current user ID from localStorage
    const user = getUser();
    
    // Record<string, string>，use ['key'] set value
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
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

export const getMyTasks = async (sortBy?: string, order?: string): Promise<Task[]> => {
  const params = new URLSearchParams();
  if (sortBy) params.append('sortBy', sortBy);
  if (order) params.append('order', order);
  const queryString = params.toString();
  return fetchAPI<Task[]>(`/tasks/my${queryString ? `?${queryString}` : ''}`);
};

export const getAllTasks = async (sortBy?: string, order?: string): Promise<Task[]> => {
  const params = new URLSearchParams();
  if (sortBy) params.append('sortBy', sortBy);
  if (order) params.append('order', order);
  const queryString = params.toString();
  return fetchAPI<Task[]>(`/tasks${queryString ? `?${queryString}` : ''}`);
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

export const getReceivedProposals = async (): Promise<Proposal[]> => {
  return fetchAPI<Proposal[]>('/proposals/received');
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
export const sendMessage = async (threadId: number, text: string, attachment?: File | null): Promise<ChatMessage> => {
  const user = getUser();
  if (!user || !user.id) {
    throw new Error('User not logged in');
  }

  const formData = new FormData();
  formData.append('text', text);
  if (attachment) {
    formData.append('attachment', attachment);
  }

  const res = await fetch(`${API_URL}/threads/${threadId}/messages`, {
    method: 'POST',
    headers: {
      'X-User-Id': user.id.toString(),
    },
    body: formData,
  });

  if (!res.ok) {
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

  const message = await res.json();
  
  // Set isMe flag
  message.isMe = message.senderId === user.id;
  
  return message;
};

/**
 * Delete a message
 */
export const deleteMessage = async (messageId: number): Promise<{ success: boolean; message: string }> => {
  return fetchAPI(`/messages/${messageId}`, {
    method: 'DELETE',
  });
};

/**
 * Delete entire conversation (all messages in a thread)
 */
export const deleteThread = async (threadId: number): Promise<{ success: boolean; message: string }> => {
  return fetchAPI(`/threads/${threadId}`, {
    method: 'DELETE',
  });
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

/**
 * Delete a task
 */
export const deleteTask = async (taskId: number): Promise<{ success: boolean; message: string }> => {
  return fetchAPI(`/tasks/${taskId}`, {
    method: 'DELETE',
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

/**
 * Update the status of a proposal (accept/reject)
 */
export const updateProposalStatus = async (id: number, status: 'accepted' | 'rejected'): Promise<any> => {
  return fetchAPI(`/proposals/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

/**
 * Delete a proposal
 */
export const deleteProposal = async (proposalId: number): Promise<{ success: boolean; message: string }> => {
  return fetchAPI(`/proposals/${proposalId}`, {
    method: 'DELETE',
  });
};

/**
 * Update contract status (delivered/completed)
 */
export const updateContractStatus = async (id: number, status: string): Promise<any> => {
  return fetchAPI(`/contracts/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

/**
 * Initiate a new chat thread or get existing one
 */
export const initiateThread = async (taskId: number, partnerId: number): Promise<{ threadId: number, isNew: boolean }> => {
  return fetchAPI('/threads/initiate', {
    method: 'POST',
    body: JSON.stringify({ taskId, partnerId }),
  });
};

export const exportTransactions = async (format: 'json' | 'csv' = 'json'): Promise<Blob> => {
  const user = getUser();
  if (!user || !user.id) {
    throw new Error('User not logged in');
  }

  const response = await fetch(`${API_URL}/transactions/export?format=${format}`, {
    method: 'GET',
    headers: {
      'X-User-Id': user.id.toString(),
    },
  });

  if (!response.ok) {
    throw new Error(`Export failed: ${response.status} ${response.statusText}`);
  }

  return await response.blob();
};
