// API Response Types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    pageSize: number;
  };
}

export interface ApiError {
  message: string;
  code?: string | number;
  details?: Record<string, string[]>;
  status?: number;
}

// Request Types
export interface ApiRequestConfig {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API Client Types
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface RequestOptions {
  params?: QueryParams;
  headers?: Record<string, string>;
  timeout?: number;
}

// React Query Types
export interface UseQueryOptions<TData = unknown, TError = ApiError> {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: boolean | number;
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
}

export interface UseMutationOptions<TData = unknown, TVariables = unknown, TError = ApiError> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
} 