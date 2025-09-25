import type { JobDocument, CreateJobDocument } from '../../models/job';
import { documentApiService } from '../../services/api/documentApi';
import type { ApiError } from '../../utils/types/api';
import { useApiQuery, useApiMutation, useInvalidateQuery } from './useApi';

// Query keys for documents
export const documentQueryKeys = {
  all: ['documents'] as const,
  lists: () => [...documentQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...documentQueryKeys.lists(), { filters }] as const,
  details: () => [...documentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentQueryKeys.details(), id] as const,
  byJob: (jobId: string) => [...documentQueryKeys.all, 'job', jobId] as const,
};

// Hook to get a single document
export function useDocument(id: string) {
  return useApiQuery<JobDocument, ApiError>(
    documentQueryKeys.detail(id),
    () => documentApiService.getDocument(id),
    {
      enabled: !!id,
    }
  );
}

// Hook to get documents by job ID
export function useJobDocuments(jobId: string) {
  return useApiQuery<JobDocument[], ApiError>(
    documentQueryKeys.byJob(jobId),
    () => documentApiService.getJobDocuments(jobId),
    {
      enabled: !!jobId,
    }
  );
}

// Hook to delete a document
export function useDeleteDocument() {
  const { invalidateQuery } = useInvalidateQuery();

  return useApiMutation<void, string, ApiError>(
    (id) => documentApiService.deleteDocument(id),
    {
      onSuccess: (_, documentId) => {
        console.log('Document deleted successfully:', documentId);
        
        // Invalidate all document queries to refresh the UI
        invalidateQuery(documentQueryKeys.all);
        
        // Also invalidate job queries since documents are part of jobs
        invalidateQuery(['jobs']);
      },
      onError: (error, documentId) => {
        console.error('Failed to delete document:', documentId, error);
        // Error handling is done in the component using the hook
      },
    }
  );
}

// Hook to update a document
export function useUpdateDocument() {
  const { invalidateQuery } = useInvalidateQuery();

  return useApiMutation<JobDocument, { id: string; data: Partial<JobDocument> }, ApiError>(
    ({ id, data }) => documentApiService.updateDocument(id, data),
    {
      onSuccess: (updatedDocument) => {
        console.log('Document updated successfully:', updatedDocument);
        
        // Invalidate related queries
        invalidateQuery(documentQueryKeys.detail(updatedDocument.id));
        invalidateQuery(documentQueryKeys.byJob(updatedDocument.job));
        invalidateQuery(['jobs']);
      },
      onError: (error) => {
        console.error('Failed to update document:', error);
        // Error handling is done in the component using the hook
      },
    }
  );
}

// Hook to create a new document
export function useCreateDocument() {
  const { invalidateQuery } = useInvalidateQuery();

  return useApiMutation<JobDocument, CreateJobDocument & { job: string }, ApiError>(
    (documentData) => documentApiService.createDocument(documentData),
    {
      onSuccess: (newDocument) => {
        console.log('Document created successfully:', newDocument);
        
        // Invalidate related queries
        invalidateQuery(documentQueryKeys.byJob(newDocument.job));
        invalidateQuery(['jobs']);
      },
      onError: (error) => {
        console.error('Failed to create document:', error);
        // Error handling is done in the component using the hook
      },
    }
  );
}
