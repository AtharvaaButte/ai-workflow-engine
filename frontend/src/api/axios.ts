
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorResponse } from '../types/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

// Request Interceptor: Future JWT token insertion point
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Phase 7: Attach Authorization Header
    // const token = localStorage.getItem('jwt_token');
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize API error extraction
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      // Server responded with an error status (4xx, 5xx)
      const apiError: ApiErrorResponse = error.response.data || {
        message: 'An unexpected backend error occurred.',
        status: error.response.status,
        timestamp: new Date().toISOString(),
      };
      return Promise.reject(apiError);
    } else if (error.request) {
      // Request made but no response received (Backend down / CORS issue)
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