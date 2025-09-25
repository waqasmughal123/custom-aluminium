'use client';

import type { WorkshopProcess, UpdateProcessRequest } from '../../models/job';
import { processApiService, type BulkUpdateProcessRequest } from '../../services/api/processApi';
import type { ApiError } from '../../utils/types/api';
import { useApiQuery, useApiMutation, useInvalidateQuery } from './useApi';

// Query keys for processes
export const processQueryKeys = {
  all: ['processes'] as const,
  lists: () => [...processQueryKeys.all, 'list'] as const,
  list: () => [...processQueryKeys.lists()] as const,
  details: () => [...processQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...processQueryKeys.details(), id] as const,
};

// Hook to fetch processes list
export function useProcesses() {
  return useApiQuery<WorkshopProcess[], ApiError>(
    processQueryKeys.list(),
    () => processApiService.getProcesses(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
      enabled: true,
    }
  );
}

// Hook to fetch single process
export function useProcess(id: string, options?: { enabled?: boolean }) {
  return useApiQuery<WorkshopProcess, ApiError>(
    processQueryKeys.detail(id),
    () => processApiService.getProcess(id),
    {
      enabled: options?.enabled !== false && Boolean(id),
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

// Hook to update process
export function useUpdateProcess() {
  const { invalidateQuery } = useInvalidateQuery();

  return useApiMutation<WorkshopProcess, { id: string; data: UpdateProcessRequest }, ApiError>(
    ({ id, data }) => processApiService.updateProcess(id, data),
    {
      onSuccess: (data) => {
        invalidateQuery(processQueryKeys.lists());
        invalidateQuery(processQueryKeys.detail(data.id));
      },
      onError: (error) => {
        console.error('Failed to update process:', error);
        // Error handling is done in the component using the hook
      },
    }
  );
}

// Hook to update multiple processes using bulk update
export function useUpdateMultipleProcesses() {
  const { invalidateQuery } = useInvalidateQuery();

  return useApiMutation<WorkshopProcess[], BulkUpdateProcessRequest, ApiError>(
    (processesData) => processApiService.bulkUpdateProcesses(processesData),
    {
      onSuccess: () => {
        invalidateQuery(processQueryKeys.lists());
      },
      onError: (error) => {
        console.error('Failed to bulk update processes:', error);
        // Error handling is done in the component using the hook
      },
    }
  );
}
