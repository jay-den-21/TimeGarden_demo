const API_URL = 'http://localhost:4000/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  displayName: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
}

/**
 * Login user
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.error || data.message || 'Login failed',
      };
    }

    return {
      success: true,
      token: data.token,
      user: data.user,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Network error occurred',
    };
  }
};

/**
 * Register new user
 */
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.error || data.message || 'Registration failed',
      };
    }

    return {
      success: true,
      token: data.token,
      user: data.user,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Network error occurred',
    };
  }
};

/**
 * Logout user
 */
export const logout = (): void => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

/**
 * Get authentication token
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

