import api from '../api/axios';
import type { AuthResponse, LoginRequest, RegisterRequest, RefreshTokenRequest } from '../types/auth';

export const authService = {
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },

  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },

  refreshToken: async (payload: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh', payload);
    return response.data;
  },
};

export default authService;