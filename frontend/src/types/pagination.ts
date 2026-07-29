
export interface PageRequestParams {
  page?: number;  
  size?: number; 
  sort?: string;  
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}