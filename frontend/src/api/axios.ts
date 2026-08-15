// src/api/axios.ts

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from '../types/api';

let memoryAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  memoryAccessToken = token;
};

export const getAccessToken = () => memoryAccessToken;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach in-memory JWT Access Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (memoryAccessToken && config.headers) {
      config.headers.Authorization = `Bearer ${memoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Error extraction and 401 handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config;

    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Trigger session expiration event
      setAccessToken(null);
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }

    if (error.response) {
      const apiError: ApiErrorResponse = error.response.data || {
        message: 'An unexpected backend error occurred.',
        status: error.response.status,
        timestamp: new Date().toISOString(),
      };
      return Promise.reject(apiError);
    } else if (error.request) {
      return Promise.reject({
        message: 'Unable to connect to the backend server. Please verify Spring Boot is running.',
        status: 503,
        timestamp: new Date().toISOString(),
      } as ApiErrorResponse);
    }

    return Promise.reject({
      message: error.message || 'Request configuration error.',
      status: 500,
      timestamp: new Date().toISOString(),
    } as ApiErrorResponse);
  }
);

export default api;