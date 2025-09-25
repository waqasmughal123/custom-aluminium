# Quick Entity Setup Guide
*Set up a new entity with full CRUD operations in under 5 minutes*

## 🚀 Quick Start Checklist

Follow these 4 simple steps to add a new entity with complete CRUD operations:

### ✅ Step 1: Define Your Entity (2 minutes)
Create `src/models/YourEntity.ts`:

```typescript
import type { BaseEntity } from '../utils/types';

// Main entity interface
export interface YourEntity extends BaseEntity {
  id: string;
  name: string;
  // Add your fields here
  createdAt: Date;
  updatedAt: Date;
}

// Create request (what you send to create new entity)
export interface CreateYourEntityRequest {
  name: string;
  // Add required fields for creation
}

// Update request (what you send to update entity)
export interface UpdateYourEntityRequest {
  name?: string;
  // Add optional fields for updates
}

// Filters for listing/searching
export interface YourEntityFilters {
  search?: string;
  // Add filter fields
}
```

### ✅ Step 2: Create API Service (2 minutes)
Create `src/services/api/yourEntityApi.ts`:

```typescript
import { ApiClient } from './client';
import type { 
  YourEntity, 
  CreateYourEntityRequest, 
  UpdateYourEntityRequest, 
  YourEntityFilters 
} from '../../models/YourEntity';
import type { PaginatedResponse, QueryParams } from '../../utils/types/api';

export class YourEntityApiService {
  constructor(private client: ApiClient) {}

  async getYourEntities(filters?: YourEntityFilters & QueryParams): Promise<PaginatedResponse<YourEntity>> {
    return this.client.get('/your-entities/', filters);
  }

  async getYourEntityById(id: string): Promise<YourEntity> {
    return this.client.get(`/your-entities/${id}/`);
  }

  async createYourEntity(data: CreateYourEntityRequest): Promise<YourEntity> {
    return this.client.post('/your-entities/', data);
  }

  async updateYourEntity(id: string, data: UpdateYourEntityRequest): Promise<YourEntity> {
    return this.client.put(`/your-entities/${id}/`, data);
  }

  async deleteYourEntity(id: string): Promise<void> {
    return this.client.delete(`/your-entities/${id}/`);
  }

  // Optional: Add entity-specific methods
  async activateYourEntity(id: string): Promise<YourEntity> {
    return this.client.post(`/your-entities/${id}/activate/`);
  }

  async deactivateYourEntity(id: string): Promise<YourEntity> {
    return this.client.post(`/your-entities/${id}/deactivate/`);
  }
}

export const yourEntityApiService = new YourEntityApiService(apiClient);
```

### ✅ Step 3: Generate Hooks (30 seconds)
Create `src/viewmodels/hooks/useYourEntities.ts`:

```typescript
'use client';

import { createEntityCrudHooks } from './useEntityCrud';
import { yourEntityApiService } from '../../services/api/yourEntityApi';
import type { 
  YourEntity, 
  CreateYourEntityRequest, 
  UpdateYourEntityRequest, 
  YourEntityFilters 
} from '../../models/YourEntity';
import type { EntityApiService } from './useEntityCrud';

// Adapt API service to generic interface
const yourEntityService: EntityApiService<YourEntity, CreateYourEntityRequest, UpdateYourEntityRequest, YourEntityFilters> = {
  getAll: yourEntityApiService.getYourEntities.bind(yourEntityApiService),
  getById: yourEntityApiService.getYourEntityById.bind(yourEntityApiService),
  create: yourEntityApiService.createYourEntity.bind(yourEntityApiService),
  update: yourEntityApiService.updateYourEntity.bind(yourEntityApiService),
  delete: yourEntityApiService.deleteYourEntity.bind(yourEntityApiService),
  activate: yourEntityApiService.activateYourEntity.bind(yourEntityApiService),
  deactivate: yourEntityApiService.deactivateYourEntity.bind(yourEntityApiService),
};

// Generate all CRUD hooks
const yourEntityCrudHooks = createEntityCrudHooks('yourEntities', yourEntityService);

// Export with descriptive names
export const yourEntityQueryKeys = yourEntityCrudHooks.queryKeys;
export const useYourEntities = yourEntityCrudHooks.useEntityList;
export const useYourEntity = yourEntityCrudHooks.useEntity;
export const useCreateYourEntity = yourEntityCrudHooks.useCreateEntity;
export const useUpdateYourEntity = yourEntityCrudHooks.useUpdateEntity;
export const useDeleteYourEntity = yourEntityCrudHooks.useDeleteEntity;
export const useToggleYourEntityStatus = yourEntityCrudHooks.useToggleEntityStatus;
export const useBulkYourEntityOperations = yourEntityCrudHooks.useBulkEntityOperations;
```

### ✅ Step 4: Use in Components (30 seconds)
```typescript
'use client';

import React from 'react';
import { 
  useYourEntities, 
  useCreateYourEntity, 
  useDeleteYourEntity 
} from '../../../viewmodels/hooks/useYourEntities';

export function YourEntityList() {
  const { data, isLoading, error } = useYourEntities();
  const createEntity = useCreateYourEntity();
  const deleteEntity = useDeleteYourEntity();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button 
        onClick={() => createEntity.mutate({ name: 'New Entity' })}
      >
        Create New
      </button>
      
      {data?.results.map((entity) => (
        <div key={entity.id}>
          <span>{entity.name}</span>
          <button 
            onClick={() => deleteEntity.mutate(entity.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 🎯 That's It!

You now have:
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ List with filters and pagination
- ✅ Individual entity fetching
- ✅ Optimistic updates
- ✅ Cache invalidation
- ✅ Error handling
- ✅ Loading states
- ✅ Bulk operations
- ✅ TypeScript support
- ✅ Consistent patterns

## 🔧 Common Customizations

### Add Custom Filters
```typescript
export interface YourEntityFilters {
  search?: string;
  category?: string;
  status?: 'active' | 'inactive';
  dateFrom?: Date;
  dateTo?: Date;
}
```

### Add Custom Hooks
```typescript
// Custom hook for active entities only
export function useActiveYourEntities() {
  return useYourEntities({ status: 'active' });
}

// Custom hook with search
export function useSearchYourEntities(searchTerm: string) {
  return useYourEntities({ search: searchTerm });
}
```

### Add Entity-Specific Operations
```typescript
export function useCustomYourEntityOperation() {
  const { invalidateQuery } = useInvalidateQuery();
  
  return useApiMutation<YourEntity, string>(
    (id) => yourEntityApiService.customOperation(id),
    {
      onSuccess: (updatedEntity) => {
        invalidateQuery(yourEntityQueryKeys.detail(updatedEntity.id));
        invalidateQuery(yourEntityQueryKeys.lists());
      },
    }
  );
}
```

## 📋 Update Exports

Don't forget to add your new hooks to `src/viewmodels/hooks/index.ts`:

```typescript
// Entity-Specific Hooks
export * from './useUsers';
export * from './useYourEntities'; // Add this line
```

---

**Total Time: ~5 minutes** ⏱️

You now have a fully functional entity with all CRUD operations, complete with React Query caching, optimistic updates, and TypeScript support! 