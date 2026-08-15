
import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { authService } from '../services/authService';
import { setAccessToken } from '../api/axios';
import type { User, LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const handleAuthSuccess = (data: AuthResponse) => {
    setAccessToken(data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    const userData: User = { userId: data.userId, name: data.name, email: data.email };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = useCallback(() => {
    setAccessToken(null);
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const initAuth = async () => {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');

      if (storedRefreshToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          const data = await authService.refreshToken({ refreshToken: storedRefreshToken });
          handleAuthSuccess(data);
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    const handleSessionExpired = () => logout();
    window.addEventListener('auth:expired', handleSessionExpired);
    return () => window.removeEventListener('auth:expired', handleSessionExpired);
  }, [logout]);

  const login = async (credentials: LoginRequest) => {
    const data = await authService.login(credentials);
    handleAuthSuccess(data);
    navigate('/');
  };

  const register = async (payload: RegisterRequest) => {
    const data = await authService.register(payload);
    handleAuthSuccess(data);
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;