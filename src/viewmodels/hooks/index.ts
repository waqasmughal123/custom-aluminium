// Generic CRUD Hooks Pattern
export { createEntityCrudHooks, createEntityQueryKeys } from './useEntityCrud';
export type { EntityApiService, EntityCrudHooks } from './useEntityCrud';

// Base API Hooks
export { useApiQuery, useApiMutation, useInvalidateQuery, useOptimisticUpdate } from './useApi';
export type { UseApiQueryOptions, UseApiMutationOptions } from './useApi';

// Authentication Hooks
export { useAuth } from './useAuth';
export type { UseAuthResult } from './useAuth';

// UI State Hooks
export { useLoader } from './useLoader';
export type { UseLoaderResult } from './useLoader';
export { useGlobalLoading } from './useGlobalLoading';
export type { UseGlobalLoadingReturn } from './useGlobalLoading';

// Toast Notification Hooks (re-exported for convenience)
export { useToast, useToastActions } from '../../views/components/providers';

// Entity-Specific Hooks
export * from './useUsers';
export * from './useJobs';
export * from './useProcesses';
export * from './useDocuments';
export * from './useDashboard';

// TODO: Add other entity hooks as you create them
// export * from './useProducts';
// export * from './useOrders';
// export * from './useCategories';

// Common hook types
export interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseFormResult<T> {
  values: T;
  errors: Record<keyof T, string>;
  handleChange: (field: keyof T, value: unknown) => void;
  handleSubmit: (onSubmit: (values: T) => void) => void;
  reset: () => void;
  isValid: boolean;
  isDirty: boolean;
} 