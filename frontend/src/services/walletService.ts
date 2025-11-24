import { getToken } from './authService';

const API_URL = 'http://localhost:4000/api';

export const getWalletData = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/wallet`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch wallet data');
  }
  return response.json();
};

export const getMyTransactions = async () => {
  const token = getToken();
  const response = await fetch(`${API_URL}/wallet/transactions`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return response.json();
};

export const exportTransactions = async (format: 'json' | 'csv') => {
  const token = getToken();
  const response = await fetch(`${API_URL}/wallet/export?format=${format}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Export failed with status: ${response.status}`);
  }

  return response;
};
