'use client';

import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
  QueryKey
} from '@tanstack/react-query';
import type { ApiError } from '../../utils/types/api';

// Generic Query Hook
export interface UseApiQueryOptions<TData = unknown, TError = ApiError> {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: boolean | number;
  onSuccess?: (data: TData) => void;
  onError?: (error: TError) => void;
}

export function useApiQuery<TData = unknown, TError = ApiError>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: UseApiQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    enabled: options?.enabled,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
    retry: options?.retry,
  });
}

// Generic Mutation Hook
export interface UseApiMutationOptions<TData = unknown, TVariables = unknown, TError = ApiError> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: TError, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: TError | null, variables: TVariables) => void;
  onMutate?: (variables: TVariables) => Promise<unknown> | unknown;
}

export function useApiMutation<TData = unknown, TVariables = unknown, TError = ApiError>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseApiMutationOptions<TData, TVariables, TError>
): UseMutationResult<TData, TError, TVariables> {
  useQueryClient();

  return useMutation<TData, TError, TVariables>({
    mutationFn,
    onSuccess: (data, variables) => {
      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      options?.onError?.(error, variables);
    },
    onSettled: (data, error, variables) => {
      options?.onSettled?.(data, error, variables);
    },
    onMutate: options?.onMutate,
  });
}

// Query invalidation helpers
export function useInvalidateQuery() {
  const queryClient = useQueryClient();

  const invalidateQuery = (queryKey: QueryKey) => {
    return queryClient.invalidateQueries({ queryKey });
  };

  const invalidateAllQueries = () => {
    return queryClient.invalidateQueries();
  };

  const removeQuery = (queryKey: QueryKey) => {
    return queryClient.removeQueries({ queryKey });
  };

  const resetQueries = (queryKey?: QueryKey) => {
    if (queryKey) {
      return queryClient.resetQueries({ queryKey });
    }
    return queryClient.resetQueries();
  };

  return {
    invalidateQuery,
    invalidateAllQueries,
    removeQuery,
    resetQueries,
  };
}

// Optimistic updates helper
export function useOptimisticUpdate() {
  const queryClient = useQueryClient();

  const updateQueryData = <TData>(
    queryKey: QueryKey,
    updater: (oldData: TData | undefined) => TData
  ) => {
    queryClient.setQueryData<TData>(queryKey, updater);
  };

  const getQueryData = <TData>(queryKey: QueryKey): TData | undefined => {
    return queryClient.getQueryData<TData>(queryKey);
  };

  return {
    updateQueryData,
    getQueryData,
  };
} 