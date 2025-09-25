# Custom Aluminium API Documentation

Complete React Query setup with MVVM architecture for the Custom Aluminium project.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
- [API Client](#api-client)
- [Generic Hooks](#generic-hooks)
- [User API Example](#user-api-example)
- [Creating New APIs](#creating-new-apis)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)
- [Authentication](#authentication)
- [Caching Strategy](#caching-strategy)
- [Troubleshooting](#troubleshooting)

## Overview

This project uses **React Query (TanStack Query)** with **Axios** for data fetching, following **MVVM architecture** patterns with complete TypeScript support and zero `any` types.

### Key Features
- 🎯 **Type-safe** API calls with full TypeScript support
- 🔄 **Automatic caching** with smart invalidation
- ⚡ **Optimistic updates** for better UX
- 🛡️ **Error handling** with retry logic
- 🔐 **Authentication** token management
- 📊 **DevTools** integration for debugging
- 🏗️ **MVVM compliance** with proper separation of concerns

## Architecture

```
src/
├── services/api/          # API layer (Model)
│   ├── client.ts         # Axios client configuration
│   ├── userApi.ts        # User-specific API methods
│   └── index.ts          # API exports
├── viewmodels/hooks/      # Business logic (ViewModel)
│   ├── useApi.ts         # Generic React Query hooks
│   ├── useUsers.ts       # User-specific hooks
│   └── index.ts          # Hook exports
├── views/components/      # UI Components (View)
│   ├── examples/         # Example components
│   └── providers/        # React Query provider
├── models/               # Data models
│   └── User.ts           # User entity types
└── utils/types/          # Shared types
    └── api.ts            # API-related types
```

## Setup & Installation

### Dependencies
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools axios
```

### Provider Setup
The `QueryProvider` is already configured in `src/app/layout.tsx`:

```typescript
import { QueryProvider } from '../views/components/providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

## API Client

### Basic Usage

```typescript
import { apiClient } from '../services/api';

// GET request
const response = await apiClient.get<User[]>('/api/users');

// POST request
const newUser = await apiClient.post<User, CreateUserRequest>('/api/users', userData);

// Authentication
apiClient.setAuthToken('your-jwt-token');
apiClient.clearAuthToken();
```

### Configuration

The API client is pre-configured with:
- **Base URL**: `process.env.NEXT_PUBLIC_DJANGO_API_URL`
- **Timeout**: 30 seconds
- **Headers**: `Content-Type: application/json`
- **Auth**: Automatic Bearer token injection
- **Error handling**: Standardized error responses

## Generic Hooks

### useApiQuery

Generic hook for GET requests with caching:

```typescript
import { useApiQuery } from '../viewmodels/hooks';

function MyComponent() {
  const { data, isLoading, error, refetch } = useApiQuery<User[]>(
    ['users'], // Query key
    () => userApiService.getUsers(), // Query function
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: true,
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data?.map(user => <div key={user.id}>{user.name}</div>)}
    </div>
  );
}
```

### useApiMutation

Generic hook for POST/PUT/PATCH/DELETE requests:

```typescript
import { useApiMutation, useInvalidateQuery } from '../viewmodels/hooks';

function CreateUserForm() {
  const { invalidateQuery } = useInvalidateQuery();
  
  const createUser = useApiMutation<User, CreateUserRequest>(
    (userData) => userApiService.createUser(userData),
    {
      onSuccess: () => {
        // Refresh users list
        invalidateQuery(['users']);
      },
      onError: (error) => {
        console.error('Failed to create user:', error.message);
      },
    }
  );

  const handleSubmit = async (formData: CreateUserRequest) => {
    try {
      await createUser.mutateAsync(formData);
      // Handle success (form will auto-reset, cache will update)
    } catch (error) {
      // Error is already handled in onError callback
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={createUser.isPending}
      >
        {createUser.isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

## User API Example

### Query Keys Pattern

```typescript
export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...userQueryKeys.lists(), filters] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...userQueryKeys.details(), id] as const,
  current: () => [...userQueryKeys.all, 'current'] as const,
};
```

### Available User Hooks

```typescript
// Fetch users list with filters
const { data: usersData, isLoading } = useUsers({
  role: 'admin',
  search: 'john',
  page: 1,
  limit: 10
});

// Fetch single user
const { data: user } = useUser('user-id');

// Fetch current authenticated user
const { data: currentUser } = useCurrentUser();

// Create user
const createUser = useCreateUser();
await createUser.mutateAsync({
  email: 'john@example.com',
  username: 'john_doe',
  firstName: 'John',
  lastName: 'Doe',
  password: 'secure_password',
  role: 'employee'
});

// Update user
const updateUser = useUpdateUser();
await updateUser.mutateAsync({
  id: 'user-id',
  data: { firstName: 'Johnny' }
});

// Delete user
const deleteUser = useDeleteUser();
await deleteUser.mutateAsync('user-id');

// Toggle user status
const { activateUser, deactivateUser } = useToggleUserStatus();
await activateUser.mutateAsync('user-id');
```

## Creating New APIs

### Step 1: Define Types

Create `src/models/Product.ts`:

```typescript
import { BaseModel } from './index';

export interface Product extends BaseModel {
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  inStock?: boolean;
}

export interface ProductFilters {
  category?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
}
```

### Step 2: Create API Service

Create `src/services/api/productApi.ts`:

```typescript
import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse, QueryParams } from '../../utils/types/api';
import type { Product, CreateProductRequest, UpdateProductRequest, ProductFilters } from '../../models/Product';

export class ProductApiService {
  private readonly basePath = '/api/products';

  async getProducts(filters?: ProductFilters & QueryParams): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<PaginatedResponse<Product>>(
      this.basePath,
      { params: filters }
    );
    return response.data;
  }

  async getProductById(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`${this.basePath}/${id}`);
    return response.data;
  }

  async createProduct(productData: CreateProductRequest): Promise<Product> {
    const response = await apiClient.post<Product, CreateProductRequest>(
      this.basePath,
      productData
    );
    return response.data;
  }

  async updateProduct(id: string, productData: UpdateProductRequest): Promise<Product> {
    const response = await apiClient.patch<Product, UpdateProductRequest>(
      `${this.basePath}/${id}`,
      productData
    );
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete<void>(`${this.basePath}/${id}`);
  }
}

export const productApiService = new ProductApiService();
```

### Step 3: Create Hooks

Create `src/viewmodels/hooks/useProducts.ts`:

```typescript
import { useApiQuery, useApiMutation, useInvalidateQuery } from './useApi';
import { productApiService } from '../../services/api/productApi';
import type { Product, CreateProductRequest, UpdateProductRequest, ProductFilters } from '../../models/Product';
import type { PaginatedResponse, QueryParams, ApiError } from '../../utils/types/api';

// Query Keys
export const productQueryKeys = {
  all: ['products'] as const,
  lists: () => [...productQueryKeys.all, 'list'] as const,
  list: (filters?: ProductFilters & QueryParams) => [...productQueryKeys.lists(), filters] as const,
  details: () => [...productQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...productQueryKeys.details(), id] as const,
};

// Hooks
export function useProducts(filters?: ProductFilters & QueryParams) {
  return useApiQuery<PaginatedResponse<Product>, ApiError>(
    productQueryKeys.list(filters),
    () => productApiService.getProducts(filters),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useProduct(id: string) {
  return useApiQuery<Product, ApiError>(
    productQueryKeys.detail(id),
    () => productApiService.getProductById(id),
    {
      enabled: Boolean(id),
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

export function useCreateProduct() {
  const { invalidateQuery } = useInvalidateQuery();

  return useApiMutation<Product, CreateProductRequest, ApiError>(
    (productData) => productApiService.createProduct(productData),
    {
      onSuccess: () => {
        invalidateQuery(productQueryKeys.lists());
      },
    }
  );
}

export function useUpdateProduct() {
  const { invalidateQuery } = useInvalidateQuery();

  return useApiMutation<Product, { id: string; data: UpdateProductRequest }, ApiError>(
    ({ id, data }) => productApiService.updateProduct(id, data),
    {
      onSuccess: (updatedProduct) => {
        invalidateQuery(productQueryKeys.detail(updatedProduct.id));
        invalidateQuery(productQueryKeys.lists());
      },
    }
  );
}

export function useDeleteProduct() {
  const { invalidateQuery } = useInvalidateQuery();

  return useApiMutation<void, string, ApiError>(
    (id) => productApiService.deleteProduct(id),
    {
      onSuccess: () => {
        invalidateQuery(productQueryKeys.lists());
      },
    }
  );
}
```

### Step 4: Export New APIs

Update `src/services/api/index.ts`:
```typescript
export { productApiService } from './productApi';
```

Update `src/viewmodels/hooks/index.ts`:
```typescript
export { useProducts, useProduct, useCreateProduct, useUpdateProduct, useDeleteProduct } from './useProducts';
```

## Best Practices

### 1. Query Key Patterns
```typescript
// ✅ Good - Hierarchical and specific
const queryKeys = {
  all: ['users'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filters) => [...queryKeys.lists(), filters] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id) => [...queryKeys.details(), id] as const,
};

// ❌ Bad - Flat and non-specific
const queryKeys = {
  users: ['users'],
  user: (id) => ['user', id],
};
```

### 2. Cache Invalidation
```typescript
// ✅ Good - Specific invalidation
onSuccess: (updatedUser) => {
  invalidateQuery(userQueryKeys.detail(updatedUser.id));
  invalidateQuery(userQueryKeys.lists());
}

// ❌ Bad - Over-invalidation
onSuccess: () => {
  invalidateQuery(); // Invalidates ALL queries
}
```

### 3. Error Handling
```typescript
// ✅ Good - Proper error handling
const { data, error, isLoading } = useUsers();

if (error) {
  return <Alert severity="error">Failed to load users: {error.message}</Alert>;
}

// ✅ Good - Mutation error handling
const createUser = useCreateUser();

const handleSubmit = async (data) => {
  try {
    await createUser.mutateAsync(data);
    // Success handling
  } catch (error) {
    // Error is already handled in mutation onError
    // Optional: Additional error handling
  }
};
```

### 4. Loading States
```typescript
// ✅ Good - Specific loading states
function UserList() {
  const { data: users, isLoading } = useUsers();
  const deleteUser = useDeleteUser();

  return (
    <div>
      {isLoading ? (
        <CircularProgress />
      ) : (
        users?.data.map(user => (
          <UserCard 
            key={user.id} 
            user={user}
            onDelete={() => deleteUser.mutate(user.id)}
            isDeleting={deleteUser.isPending}
          />
        ))
      )}
    </div>
  );
}
```

## Error Handling

### API Client Errors
The API client automatically handles common error scenarios:

```typescript
interface ApiError {
  message: string;        // Human-readable error message
  code?: string | number; // Error code from server
  details?: Record<string, string[]>; // Validation errors
  status?: number;        // HTTP status code
}
```

### React Query Error Handling
```typescript
// Global error handling in QueryProvider
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3, // Retry failed requests 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Component-level error handling
const { data, error, isError } = useUsers();

if (isError) {
  // Handle specific error types
  if (error.status === 401) {
    // Redirect to login
  } else if (error.status === 403) {
    // Show access denied message
  } else {
    // Show generic error message
  }
}
```

## Authentication

### Setting Auth Token
```typescript
import { apiClient } from '../services/api';

// After successful login
const loginResult = await login(credentials);
if (loginResult.success && loginResult.token) {
  apiClient.setAuthToken(loginResult.token);
}

// On logout
const logout = () => {
  apiClient.clearAuthToken();
  queryClient.clear(); // Clear all cached data
};
```

### Auth Integration with NextAuth
```typescript
// In your auth hook
export const useAuth = () => {
  const { data: session } = useSession();
  
  useEffect(() => {
    if (session?.accessToken) {
      apiClient.setAuthToken(session.accessToken);
    } else {
      apiClient.clearAuthToken();
    }
  }, [session]);
  
  // ... rest of auth logic
};
```

## Caching Strategy

### Default Cache Times
- **Stale Time**: 5 minutes (data considered fresh)
- **GC Time**: 10 minutes (cached data disposal)
- **Retry**: 3 attempts for queries, 1 for mutations

### Cache Invalidation Patterns
```typescript
// Invalidate all user-related queries
invalidateQuery(userQueryKeys.all);

// Invalidate only user lists
invalidateQuery(userQueryKeys.lists());

// Invalidate specific user
invalidateQuery(userQueryKeys.detail('user-id'));

// Remove query from cache entirely
removeQuery(userQueryKeys.detail('user-id'));
```

### Optimistic Updates
```typescript
const updateUser = useApiMutation(
  ({ id, data }) => userApiService.updateUser(id, data),
  {
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userQueryKeys.detail(id) });
      
      // Snapshot previous value
      const previousUser = queryClient.getQueryData(userQueryKeys.detail(id));
      
      // Optimistically update
      queryClient.setQueryData(userQueryKeys.detail(id), old => ({
        ...old,
        ...data
      }));
      
      return { previousUser };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(
          userQueryKeys.detail(variables.id), 
          context.previousUser
        );
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      invalidateQuery(userQueryKeys.detail(id));
    },
  }
);
```

## Troubleshooting

### Common Issues

#### 1. "Query key not found" Error
```typescript
// ❌ Problem: Inconsistent query keys
const { data } = useApiQuery(['user', id], () => getUser(id));
invalidateQuery(['users', id]); // Different key!

// ✅ Solution: Use consistent query key patterns
const { data } = useApiQuery(userQueryKeys.detail(id), () => getUser(id));
invalidateQuery(userQueryKeys.detail(id));
```

#### 2. Stale Data After Mutations
```typescript
// ❌ Problem: Not invalidating related queries
const createUser = useApiMutation(createUserApi, {
  onSuccess: () => {
    // Only invalidates current query, not lists
  }
});

// ✅ Solution: Invalidate related queries
const createUser = useApiMutation(createUserApi, {
  onSuccess: () => {
    invalidateQuery(userQueryKeys.lists()); // Refresh all user lists
  }
});
```

#### 3. Memory Leaks from Unmounted Components
```typescript
// ✅ Solution: React Query handles this automatically
// No manual cleanup needed for queries/mutations
```

#### 4. Type Errors with Generic Hooks
```typescript
// ❌ Problem: Missing type parameters
const { data } = useApiQuery(
  ['users'],
  () => userApiService.getUsers()
); // data is unknown

// ✅ Solution: Provide type parameters
const { data } = useApiQuery<PaginatedResponse<User>>(
  ['users'],
  () => userApiService.getUsers()
); // data is properly typed
```

### Debug Tools

#### 1. React Query DevTools
Available in development mode at bottom-right of screen.

#### 2. Console Logging
```typescript
// Enable query logging
const queryClient = new QueryClient({
  logger: {
    log: console.log,
    warn: console.warn,
    error: console.error,
  },
});
```

#### 3. Network Inspection
Check browser DevTools Network tab for:
- Request/response payloads
- HTTP status codes
- Response times
- Failed requests

### Performance Tips

#### 1. Use Selective Queries
```typescript
// ✅ Good - Only fetch what you need
const { data: userName } = useUser(id, {
  select: (user) => user.name, // Only subscribe to name changes
});

// ❌ Bad - Fetching full object when only name is needed
const { data: user } = useUser(id);
const userName = user?.name;
```

#### 2. Implement Pagination
```typescript
const [page, setPage] = useState(1);
const { data: users } = useUsers({ page, limit: 20 });

// Keep previous data while loading next page
const { data: users, isPreviousData } = useUsers(
  { page, limit: 20 },
  { keepPreviousData: true }
);
```

#### 3. Use Parallel Queries Wisely
```typescript
// ✅ Good - Independent parallel queries
const user = useUser(userId);
const permissions = useUserPermissions(userId);

// ❌ Bad - Dependent queries running in parallel
const user = useUser(userId);
const profile = useUserProfile(user.data?.profileId); // Will fail if user not loaded
```

---

## 🚀 Ready to Use!

Your React Query setup is production-ready with:
- ✅ Type safety throughout
- ✅ Optimized caching
- ✅ Error handling
- ✅ Loading states
- ✅ MVVM compliance

**Demo**: Visit `/users` to see the complete implementation in action.

**Need help?** Check the example files in `src/views/components/examples/` for complete implementations. 