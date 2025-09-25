'use client';

import type { Job, CreateJobRequest, UpdateJobRequest, JobFilters, JobsApiResponse, JobProcess } from '../../models/job';
import { jobApiService } from '../../services/api/jobApi';
import type { QueryParams, ApiError } from '../../utils/types/api';
import { useApiQuery, useApiMutation, useInvalidateQuery } from './useApi';

// Query keys for jobs
export const jobQueryKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobQueryKeys.all, 'list'] as const,
  list: (filters?: JobFilters & QueryParams) => [...jobQueryKeys.lists(), filters] as const,
  details: () => [...jobQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobQueryKeys.details(), id] as const,
  processes: (jobId: string) => [...jobQueryKeys.detail(jobId), 'processes'] as const,
  documents: (jobId: string) => [...jobQueryKeys.detail(jobId), 'documents'] as const,
};

// Hook to fetch jobs list
export function useJobs(filters?: JobFilters & QueryParams) {
  return useApiQuery<JobsApiResponse, ApiError>(
    jobQueryKeys.list(filters),
    () => jobApiService.getJobs(filters),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: true,
    }
  );
}

// Hook to fetch single job
export function useJob(id: string, options?: { enabled?: boolean }) {
  return useApiQuery<Job, ApiError>(
    jobQueryKeys.detail(id),
    () => jobApiService.getJobById(id),
    {
      enabled: options?.enabled !== false && Boolean(id),
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

// Hook to create job
export function useCreateJob() {
  const { invalidateQuery } = useInvalidateQuery();

  return useApiMutation<Job, CreateJobRequest, ApiError>(
    (data) => jobApiService.createJob(data),
    {
      onSuccess: () => {
        invalidateQuery(jobQueryKeys.lists());
      },
      onError: (error) => {
        console.error('Failed to create job:', error);
        // Error handling is done in the component using the hook
      },
    }
  );
}

// Hook to update job
export function useUpdateJob() {
  const { invalidateQuery } = useInvalidateQuery();

  return useApiMutation<Job, { id: string; data: UpdateJobRequest }, ApiError>(
    ({ id, data }) => jobApiService.updateJob(id, data),
    {
      onSuccess: (data) => {
        invalidateQuery(jobQueryKeys.lists());
        invalidateQuery(jobQueryKeys.detail(data.id));
      },
      onError: (error) => {
        console.error('Failed to update job:', error);
        // Error handling is done in the component using the hook
      },
    }
  );
}

// Hook to delete job
export function useDeleteJob() {
  const { invalidateQuery } = useInvalidateQuery();

  return useApiMutation<void, string, ApiError>(
    (id) => jobApiService.deleteJob(id),
    {
      onSuccess: () => {
        invalidateQuery(jobQueryKeys.lists());
      },
      onError: (error) => {
        console.error('Failed to delete job:', error);
        // Error handling is done in the component using the hook
      },
    }
  );
}

// Hook to duplicate job
export function useDuplicateJob() {
  const { invalidateQuery } = useInvalidateQuery();

  return useApiMutation<Job, string, ApiError>(
    (id) => jobApiService.duplicateJob(id),
    {
      onSuccess: () => {
        invalidateQuery(jobQueryKeys.lists());
      },
      onError: (error) => {
        console.error('Failed to duplicate job:', error);
        // Error handling is done in the component using the hook
      },
    }
  );
}

// Hook to fetch job processes
export function useJobProcesses(jobId: string, options?: { enabled?: boolean }) {
  return useApiQuery<JobProcess[], ApiError>(
    jobQueryKeys.processes(jobId),
    () => jobApiService.getJobProcesses(jobId),
    {
      enabled: options?.enabled !== false && Boolean(jobId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

// Note: useJobDocuments is available from ./useDocuments
// to avoid naming conflicts and maintain separation of concerns
