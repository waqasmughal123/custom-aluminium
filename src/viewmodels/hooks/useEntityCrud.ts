'use client';

import type { PaginatedResponse, QueryParams, ApiError } from '../../utils/types/api';
import { useApiQuery, useApiMutation, useInvalidateQuery } from './useApi';

// Base entity interface
interface BaseEntity {
  id: string;
}

// Generic API Service Interface
export interface EntityApiService<TEntity, TCreateRequest, TUpdateRequest, TFilters> {
  getAll: (filters?: TFilters & QueryParams) => Promise<PaginatedResponse<TEntity>>;
  getById: (id: string) => Promise<TEntity>;
  create: (data: TCreateRequest) => Promise<TEntity>;
  update: (id: string, data: TUpdateRequest) => Promise<TEntity>;
  delete: (id: string) => Promise<void>;
  // Optional methods
  activate?: (id: string) => Promise<TEntity>;
  deactivate?: (id: string) => Promise<TEntity>;
  resetPassword?: (id: string) => Promise<void>;
}

// Generic Query Keys Factory
export function createEntityQueryKeys<TFilters = unknown>(entityName: string) {
  return {
    all: [entityName] as const,
    lists: () => [...createEntityQueryKeys(entityName).all, 'list'] as const,
    list: (filters?: TFilters & QueryParams) => [...createEntityQueryKeys(entityName).lists(), filters] as const,
    details: () => [...createEntityQueryKeys(entityName).all, 'detail'] as const,
    detail: (id: string) => [...createEntityQueryKeys(entityName).details(), id] as const,
    current: () => [...createEntityQueryKeys(entityName).all, 'current'] as const,
  };
}

// Generic CRUD Hooks Factory
export function createEntityCrudHooks<
  TEntity extends BaseEntity,
  TCreateRequest,
  TUpdateRequest,
  TFilters = unknown
>(
  entityName: string,
  apiService: EntityApiService<TEntity, TCreateRequest, TUpdateRequest, TFilters>
) {
  const queryKeys = createEntityQueryKeys<TFilters>(entityName);

  // Fetch All Entities
  function useEntityList(filters?: TFilters & QueryParams) {
    return useApiQuery<PaginatedResponse<TEntity>, ApiError>(
      queryKeys.list(filters),
      () => apiService.getAll(filters),
      {
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: true,
      }
    );
  }

  // Fetch Single Entity
  function useEntity(id: string, options?: { enabled?: boolean }) {
    return useApiQuery<TEntity, ApiError>(
      queryKeys.detail(id),
      () => apiService.getById(id),
      {
        enabled: options?.enabled !== false && Boolean(id),
        staleTime: 10 * 60 * 1000, // 10 minutes
      }
    );
  }

  // Create Entity Mutation
  function useCreateEntity() {
    const { invalidateQuery } = useInvalidateQuery();

    return useApiMutation<TEntity, TCreateRequest, ApiError>(
      (data) => apiService.create(data),
      {
        onSuccess: () => {
          invalidateQuery(queryKeys.lists());
        },
        onError: (error) => {
          console.error(`Failed to create ${entityName}:`, error.message);
        },
      }
    );
  }

  // Update Entity Mutation
  function useUpdateEntity() {
    const { invalidateQuery } = useInvalidateQuery();

    return useApiMutation<TEntity, { id: string; data: TUpdateRequest }, ApiError>(
      ({ id, data }) => apiService.update(id, data),
      {
        onSuccess: (updatedEntity) => {
          invalidateQuery(queryKeys.detail(updatedEntity.id));
          invalidateQuery(queryKeys.lists());
          invalidateQuery(queryKeys.current());
        },
        onError: (error) => {
          console.error(`Failed to update ${entityName}:`, error.message);
        },
      }
    );
  }

  // Delete Entity Mutation
  function useDeleteEntity() {
    const { invalidateQuery } = useInvalidateQuery();

    return useApiMutation<void, string, ApiError>(
      (id) => apiService.delete(id),
      {
        onSuccess: (_, deletedId) => {
          invalidateQuery(queryKeys.detail(deletedId));
          invalidateQuery(queryKeys.lists());
        },
        onError: (error) => {
          console.error(`Failed to delete ${entityName}:`, error.message);
        },
      }
    );
  }

  // Toggle Entity Status (if supported)
  function useToggleEntityStatus() {
    const { invalidateQuery } = useInvalidateQuery();

    const activate = useApiMutation<TEntity, string, ApiError>(
      (id) => {
        if (!apiService.activate) {
          throw new Error(`Activation not supported for ${entityName}`);
        }
        return apiService.activate(id);
      },
      {
        onSuccess: (updatedEntity) => {
          invalidateQuery(queryKeys.detail(updatedEntity.id));
          invalidateQuery(queryKeys.lists());
        },
      }
    );

    const deactivate = useApiMutation<TEntity, string, ApiError>(
      (id) => {
        if (!apiService.deactivate) {
          throw new Error(`Deactivation not supported for ${entityName}`);
        }
        return apiService.deactivate(id);
      },
      {
        onSuccess: (updatedEntity) => {
          invalidateQuery(queryKeys.detail(updatedEntity.id));
          invalidateQuery(queryKeys.lists());
        },
      }
    );

    return {
      activate,
      deactivate,
      isSupported: !!(apiService.activate && apiService.deactivate),
    };
  }

  // Reset Password (if supported)
  function useResetEntityPassword() {
    return useApiMutation<void, string, ApiError>(
      (id) => {
        if (!apiService.resetPassword) {
          throw new Error(`Password reset not supported for ${entityName}`);
        }
        return apiService.resetPassword(id);
      },
      {
        onSuccess: () => {
          console.log(`${entityName} password reset email sent successfully`);
        },
        onError: (error) => {
          console.error(`Failed to send ${entityName} password reset email:`, error.message);
        },
      }
    );
  }

  // Bulk Operations
  function useBulkEntityOperations() {
    const { invalidateQuery } = useInvalidateQuery();

    const bulkDelete = useApiMutation<void, string[], ApiError>(
      async (ids) => {
        // Parallel execution for better performance
        await Promise.all(ids.map(id => apiService.delete(id)));
      },
      {
        onSuccess: () => {
          invalidateQuery(queryKeys.lists());
        },
      }
    );

    const bulkUpdate = useApiMutation<TEntity[], { ids: string[]; data: Partial<TUpdateRequest> }, ApiError>(
      async ({ ids, data }) => {
        const results: TEntity[] = [];
        for (const id of ids) {
          const result = await apiService.update(id, data as TUpdateRequest);
          results.push(result);
        }
        return results;
      },
      {
        onSuccess: () => {
          invalidateQuery(queryKeys.lists());
        },
      }
    );

    const bulkActivate = useApiMutation<TEntity[], string[], ApiError>(
      async (ids) => {
        if (!apiService.activate) {
          throw new Error(`Bulk activation not supported for ${entityName}`);
        }
        const results: TEntity[] = [];
        for (const id of ids) {
          const result = await apiService.activate(id);
          results.push(result);
        }
        return results;
      },
      {
        onSuccess: () => {
          invalidateQuery(queryKeys.lists());
        },
      }
    );

    return {
      bulkDelete,
      bulkUpdate,
      bulkActivate,
    };
  }

  return {
    // Query Keys
    queryKeys,
    
    // Query Hooks
    useEntityList,
    useEntity,
    
    // Mutation Hooks
    useCreateEntity,
    useUpdateEntity,
    useDeleteEntity,
    useToggleEntityStatus,
    useResetEntityPassword,
    useBulkEntityOperations,
  };
}

// Export types for better TypeScript support
export type EntityCrudHooks<
  TEntity extends BaseEntity,
  TCreateRequest,
  TUpdateRequest,
  TFilters = unknown
> = ReturnType<typeof createEntityCrudHooks<TEntity, TCreateRequest, TUpdateRequest, TFilters>>; 