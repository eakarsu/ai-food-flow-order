import apiRequest, { setTokens, clearTokens } from './config';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface Address {
  id: string;
  label: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  isDefault: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Register new user
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  });

  setTokens(response.accessToken, response.refreshToken);
  return response;
};

// Login
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    skipAuth: true,
  });

  setTokens(response.accessToken, response.refreshToken);
  return response;
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } catch {
    // Ignore errors on logout
  } finally {
    clearTokens();
  }
};

// Get current user
export const getCurrentUser = async (): Promise<{ user: User; addresses: Address[] }> => {
  return apiRequest('/auth/me');
};

// Update profile
export const updateProfile = async (data: Partial<User>): Promise<{ user: User }> => {
  return apiRequest('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// Update password
export const updatePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  return apiRequest('/users/password', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

// Address management
export const getAddresses = async (): Promise<{ addresses: Address[] }> => {
  return apiRequest('/users/addresses');
};

export const addAddress = async (data: Omit<Address, 'id'>): Promise<{ address: Address }> => {
  return apiRequest('/users/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateAddress = async (
  id: string,
  data: Partial<Address>
): Promise<{ address: Address }> => {
  return apiRequest(`/users/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteAddress = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/users/addresses/${id}`, { method: 'DELETE' });
};

export const setDefaultAddress = async (id: string): Promise<{ message: string }> => {
  return apiRequest(`/users/addresses/${id}/default`, { method: 'PATCH' });
};
