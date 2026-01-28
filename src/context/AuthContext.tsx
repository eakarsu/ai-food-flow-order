import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  Address,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  getCurrentUser,
  getAccessToken,
  clearTokens,
} from '@/services/api';

interface AuthContextType {
  user: User | null;
  addresses: Address[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName?: string; lastName?: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setAddresses([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await getCurrentUser();
      setUser(response.user);
      setAddresses(response.addresses);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      clearTokens();
      setUser(null);
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response = await apiLogin({ email, password });
    setUser(response.user);
    await refreshUser();
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string
  }) => {
    const response = await apiRegister(data);
    setUser(response.user);
    await refreshUser();
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    setAddresses([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        addresses,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        setAddresses,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
