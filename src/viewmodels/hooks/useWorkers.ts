import { useQuery, useMutation } from '@tanstack/react-query';
import type { Worker } from '@/models/job';
import { workersApiService, type WorkerFilters, type WorkersApiResponse } from '@/services/api/workersApi';
import type { QueryParams, ApiError } from '@/utils/types/api';
import { useInvalidateQuery, useApiQuery } from './useApi';

// Query keys
export const workerQueryKeys = {
  all: ['workers'] as const,
  list: (filters?: WorkerFilters & QueryParams) => [...workerQueryKeys.all, 'list', filters] as const,
  detail: (id: string) => [...workerQueryKeys.all, 'detail', id] as const,
};

/**
 * Hook to fetch workers with pagination and filters
 */
export function useWorkers(filters?: WorkerFilters & QueryParams) {
  return useApiQuery<WorkersApiResponse, ApiError>(
    workerQueryKeys.list(filters),
    () => workersApiService.getWorkers(filters),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: true,
    }
  );
}

/**
 * Hook to fetch all workers (simple list without pagination)
 */
export const useAllWorkers = () => {
  return useQuery({
    queryKey: [...workerQueryKeys.all, 'simple'],
    queryFn: () => workersApiService.getAllWorkers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes,
  });
};

/**
 * Hook to fetch a single worker by ID
 */
export const useWorker = (id: string) => {
  return useQuery({
    queryKey: workerQueryKeys.detail(id),
    queryFn: () => workersApiService.getWorkerById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to create a new worker
 */
export const useCreateWorker = () => {
  const { invalidateQuery } = useInvalidateQuery();

  return useMutation({
    mutationFn: (workerData: Omit<Worker, 'id' | 'created_at' | 'updated_at'>) => 
      workersApiService.createWorker(workerData),
    onSuccess: () => {
      // Invalidate workers list to refetch
      invalidateQuery(workerQueryKeys.all);
    },
  });
};

/**
 * Hook to update an existing worker
 */
export const useUpdateWorker = () => {
  const { invalidateQuery } = useInvalidateQuery();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Worker> }) => 
      workersApiService.updateWorker(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate workers list and specific worker
      invalidateQuery(workerQueryKeys.all);
      invalidateQuery(workerQueryKeys.detail(id));
    },
  });
};

/**
 * Hook to delete a worker
 */
export const useDeleteWorker = () => {
  const { invalidateQuery } = useInvalidateQuery();

  return useMutation({
    mutationFn: (id: string) => workersApiService.deleteWorker(id),
    onSuccess: (_, id) => {
      // Invalidate workers list and remove specific worker from cache
      invalidateQuery(workerQueryKeys.all);
      invalidateQuery(workerQueryKeys.detail(id));
    },
  });
};