import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Models } from 'appwrite';
import { authService } from '@/services/appwrite';

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const result = await authService.getCurrentUser();
      if (result.success && result.data) {
        setUser(result.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success) {
      await checkAuth();
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const register = async (email: string, password: string, name: string) => {
    const result = await authService.register(email, password, name);
    if (result.success) {
      await checkAuth();
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const loginWithGoogle = () => {
    authService.loginWithGoogle();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
