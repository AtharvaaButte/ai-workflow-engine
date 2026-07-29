export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
  timestamp?: string;
}

export interface ApiErrorResponse {
  message: string;
  status: number;
  timestamp: string;
  path?: string;
  errors?: Record<string, string>;
}