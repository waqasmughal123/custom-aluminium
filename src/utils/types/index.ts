import { ReactNode } from 'react';

// Base component types
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// Common data types
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

// Form state management
export interface FormState<T> {
  values: T;
  errors: Record<keyof T, string>;
  isValid: boolean;
  isDirty: boolean;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Pagination
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationState & {
    totalPages: number;
  };
}

// Export all API types
export * from './api'; 