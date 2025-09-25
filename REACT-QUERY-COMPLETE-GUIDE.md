# React Query Complete Guide
*A comprehensive guide to React Query implementation in the Custom Aluminium project*

## 📖 Table of Contents
1. [Project Architecture](#project-architecture)
2. [API Client Setup](#api-client-setup)
3. [Generic Hooks Pattern](#generic-hooks-pattern)
4. [Query Patterns](#query-patterns)
5. [Mutation Patterns](#mutation-patterns)
6. [Cache Management](#cache-management)
7. [Error Handling](#error-handling)
8. [Real-world Examples](#real-world-examples)
9. [Best Practices](#best-practices)

---

## 🏗️ Project Architecture

### MVVM Structure
```
src/
├── models/           # Data entities and types
├── services/         # API clients and external services
├── viewmodels/       # Business logic and React Query hooks
└── views/            # UI components
```

### Data Flow
```
UI Component → ViewModel Hook → API Service → Django Backend
     ↓              ↓              ↓
   Display ← React Query Cache ← Response
```

---

## 🔌 API Client Setup

### Base API Client (`src/services/api/client.ts`)
```typescript
import axios, { AxiosInstance } from 'axios';
import { getSession } from 'next-auth/react';

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add auth token
    this.client.interceptors.request.use(async (config) => {
      const session = await getSession();
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
      return config;
    });

    // Response interceptor - Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: unknown): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data;
  }
}

export const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000'
);
```

---

## 🔄 Generic Hooks Pattern

### Base Hooks (`src/viewmodels/hooks/useApi.ts`)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

// Generic Query Hook
export function useApiQuery<TData, TError = Error>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  });
}

// Generic Mutation Hook
export function useApiMutation<TData, TVariables, TError = Error>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, TError, TVariables>
) {
  return useMutation({
    mutationFn,
    ...options,
  });
}

// Query Invalidation Helper
export function useInvalidateQuery() {
  const queryClient = useQueryClient();

  const invalidateQuery = (queryKey: unknown[]) => {
    queryClient.invalidateQueries({ queryKey });
  };

  const setQueryData = <T>(queryKey: unknown[], data: T) => {
    queryClient.setQueryData(queryKey, data);
  };

  const removeQuery = (queryKey: unknown[]) => {
    queryClient.removeQueries({ queryKey });
  };

  return {
    invalidateQuery,
    setQueryData,
    removeQuery,
  };
}

// Optimistic Update Helper
export function useOptimisticUpdate<T>() {
  const queryClient = useQueryClient();

  const optimisticUpdate = (
    queryKey: unknown[],
    updateFn: (old: T | undefined) => T
  ) => {
    queryClient.setQueryData(queryKey, updateFn);
  };

  return { optimisticUpdate };
}
```

---

## 📊 Query Patterns

### 1. Simple Data Fetching
```typescript
// Fetch all users
export function useUsers(filters?: UserFilters) {
  return useApiQuery<PaginatedResponse<User>, ApiError>(
    ['users', 'list', filters],
    () => userApiService.getUsers(filters),
    {
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
      enabled: true, // Query runs automatically
      retry: 3, // Retry failed requests 3 times
    }
  );
}

// Usage in component
function UsersList() {
  const { data, isLoading, error, refetch } = useUsers({ status: 'active' });

  if (isLoading) return <Loader />;
  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Box>
      {data?.results.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </Box>
  );
}
```

### 2. Conditional Queries
```typescript
// Fetch user only when ID is available
export function useUser(id: string, options?: { enabled?: boolean }) {
  return useApiQuery<User, ApiError>(
    ['users', 'detail', id],
    () => userApiService.getUserById(id),
    {
      enabled: options?.enabled !== false && Boolean(id),
      staleTime: 10 * 60 * 1000,
    }
  );
}

// Usage in component
function UserDetail({ userId }: { userId?: string }) {
  const { data: user } = useUser(userId!, { enabled: !!userId });
  
  return user ? <UserProfile user={user} /> : null;
}
```

### 3. Dependent Queries
```typescript
// Fetch user's orders after user is loaded
function useUserOrders(userId?: string) {
  const { data: user } = useUser(userId!);
  
  return useApiQuery<Order[]>(
    ['orders', 'user', userId],
    () => orderApiService.getUserOrders(userId!),
    {
      enabled: !!user && !!userId,
    }
  );
}
```

### 4. Infinite Queries
```typescript
export function useInfiniteUsers() {
  return useInfiniteQuery({
    queryKey: ['users', 'infinite'],
    queryFn: ({ pageParam = 1 }) => 
      userApiService.getUsers({ page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

// Usage
function InfiniteUsersList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteUsers();

  return (
    <Box>
      {data?.pages.map((group, i) => (
        <Fragment key={i}>
          {group.results.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </Fragment>
      ))}
      
      <Button 
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? 'Loading...' : 'Load More'}
      </Button>
    </Box>
  );
}
```

---

## 🔄 Mutation Patterns

### 1. Basic Mutations
```typescript
// Create user mutation
export function useCreateUser() {
  const { invalidateQuery } = useInvalidateQuery();

  return useApiMutation<User, CreateUserRequest, ApiError>(
    (userData) => userApiService.createUser(userData),
    {
      onSuccess: (newUser) => {
        // Invalidate users list to refetch
        invalidateQuery(['users', 'list']);
        
        // Add to cache immediately
        queryClient.setQueryData(['users', 'detail', newUser.id], newUser);
      },
      onError: (error) => {
        console.error('Failed to create user:', error.message);
      },
    }
  );
}

// Usage in component
function CreateUserForm() {
  const createUser = useCreateUser();

  const handleSubmit = (userData: CreateUserRequest) => {
    createUser.mutate(userData, {
      onSuccess: () => {
        toast.success('User created successfully!');
        router.push('/users');
      },
      onError: (error) => {
        toast.error(`Failed to create user: ${error.message}`);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button 
        type="submit" 
        loading={createUser.isPending}
        disabled={createUser.isPending}
      >
        Create User
      </Button>
    </form>
  );
}
```

### 2. Optimistic Updates
```typescript
export function useUpdateUser() {
  const { invalidateQuery } = useInvalidateQuery();
  const queryClient = useQueryClient();

  return useApiMutation<User, { id: string; data: UpdateUserRequest }>(
    ({ id, data }) => userApiService.updateUser(id, data),
    {
      onMutate: async ({ id, data }) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['users', 'detail', id] });

        // Snapshot current value
        const previousUser = queryClient.getQueryData(['users', 'detail', id]);

        // Optimistically update
        queryClient.setQueryData(['users', 'detail', id], (old: User) => ({
          ...old,
          ...data,
        }));

        return { previousUser, id };
      },
      onError: (err, variables, context) => {
        // Rollback on error
        if (context?.previousUser) {
          queryClient.setQueryData(
            ['users', 'detail', context.id], 
            context.previousUser
          );
        }
      },
      onSettled: (data, error, { id }) => {
        // Always refetch after error or success
        invalidateQuery(['users', 'detail', id]);
        invalidateQuery(['users', 'list']);
      },
    }
  );
}
```

### 3. Bulk Operations
```typescript
export function useBulkUserOperations() {
  const { invalidateQuery } = useInvalidateQuery();

  const bulkDelete = useApiMutation<void, string[]>(
    async (userIds) => {
      // Parallel execution for better performance
      await Promise.all(
        userIds.map(id => userApiService.deleteUser(id))
      );
    },
    {
      onSuccess: () => {
        invalidateQuery(['users', 'list']);
      },
    }
  );

  const bulkUpdate = useApiMutation<User[], { ids: string[]; data: Partial<User> }>(
    async ({ ids, data }) => {
      const results = await Promise.all(
        ids.map(id => userApiService.updateUser(id, data))
      );
      return results;
    },
    {
      onSuccess: () => {
        invalidateQuery(['users', 'list']);
      },
    }
  );

  return { bulkDelete, bulkUpdate };
}
```

---

## 🗄️ Cache Management

### Query Keys Strategy
```typescript
// Hierarchical query keys
export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...userQueryKeys.lists(), filters] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...userQueryKeys.details(), id] as const,
  current: () => [...userQueryKeys.all, 'current'] as const,
};

// Cache invalidation patterns
const invalidateAllUsers = () => invalidateQuery(userQueryKeys.all);
const invalidateUserLists = () => invalidateQuery(userQueryKeys.lists());
const invalidateSpecificUser = (id: string) => invalidateQuery(userQueryKeys.detail(id));
```

### Cache Time Configuration
```typescript
const cacheConfig = {
  // How long data stays in cache when unused
  gcTime: 24 * 60 * 60 * 1000, // 24 hours
  
  // How long data is considered fresh
  staleTime: 5 * 60 * 1000, // 5 minutes
  
  // Retry configuration
  retry: (failureCount, error) => {
    if (error.status === 404) return false; // Don't retry 404s
    return failureCount < 3;
  },
  
  // Refetch configuration
  refetchOnWindowFocus: false, // Don't refetch on window focus
  refetchOnReconnect: true, // Refetch when reconnecting
};
```

---

## ⚠️ Error Handling

### Global Error Boundary
```typescript
// Error types
interface ApiError {
  message: string;
  status: number;
  details?: Record<string, string[]>;
}

// Error handling in hooks
export function useUsers() {
  return useApiQuery<User[], ApiError>(
    userQueryKeys.lists(),
    userApiService.getUsers,
    {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      onError: (error) => {
        // Global error handling
        if (error.status === 401) {
          // Redirect to login
          window.location.href = '/login';
        } else {
          // Show error toast
          toast.error(error.message);
        }
      },
    }
  );
}
```

### Component Error Handling
```typescript
function UsersList() {
  const { data, isLoading, error } = useUsers();

  if (isLoading) return <Loader />;
  
  if (error) {
    return (
      <Alert severity="error">
        <AlertTitle>Error loading users</AlertTitle>
        {error.message}
        <Button onClick={() => refetch()}>Try Again</Button>
      </Alert>
    );
  }

  return (
    <Box>
      {data?.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </Box>
  );
}
```

---

## 🏠 Real-world Examples

### Complete User Management Flow
```typescript
// 1. List Users with Filters
function UserManagement() {
  const [filters, setFilters] = useState<UserFilters>({});
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Queries
  const { data: users, isLoading } = useUsers(filters);
  const { data: currentUser } = useCurrentUser();
  
  // Mutations
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const { bulkDelete, bulkUpdate } = useBulkUserOperations();

  // Handlers
  const handleCreateUser = (userData: CreateUserRequest) => {
    createUser.mutate(userData, {
      onSuccess: () => toast.success('User created successfully!'),
    });
  };

  const handleUpdateUser = (id: string, data: UpdateUserRequest) => {
    updateUser.mutate({ id, data }, {
      onSuccess: () => toast.success('User updated successfully!'),
    });
  };

  const handleDeleteUser = (id: string) => {
    deleteUser.mutate(id, {
      onSuccess: () => toast.success('User deleted successfully!'),
    });
  };

  const handleBulkDelete = () => {
    bulkDelete.mutate(selectedUsers, {
      onSuccess: () => {
        toast.success(`${selectedUsers.length} users deleted!`);
        setSelectedUsers([]);
      },
    });
  };

  return (
    <Container>
      {/* Filters */}
      <UserFilters filters={filters} onChange={setFilters} />
      
      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Button 
            onClick={handleBulkDelete}
            loading={bulkDelete.isPending}
          >
            Delete Selected ({selectedUsers.length})
          </Button>
        </Box>
      )}
      
      {/* Users List */}
      {isLoading ? (
        <Loader />
      ) : (
        <DataGrid
          rows={users?.results || []}
          onSelectionChange={setSelectedUsers}
          onEdit={handleUpdateUser}
          onDelete={handleDeleteUser}
        />
      )}
      
      {/* Create User Dialog */}
      <CreateUserDialog 
        onSubmit={handleCreateUser}
        loading={createUser.isPending}
      />
    </Container>
  );
}
```

---

## 📋 Best Practices

### 1. Query Key Organization
```typescript
// ✅ Good - Hierarchical and predictable
const queryKeys = {
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: UserFilters) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
};

// ❌ Bad - Inconsistent and hard to invalidate
const badQueryKeys = {
  usersList: ['users-list'],
  userDetail: (id: string) => [`user-${id}`],
  currentUser: ['current-user'],
};
```

### 2. Loading States
```typescript
// ✅ Good - Granular loading states
function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading: userLoading } = useUser(userId);
  const { data: orders, isLoading: ordersLoading } = useUserOrders(userId);
  const updateUser = useUpdateUser();

  if (userLoading) return <UserSkeleton />;

  return (
    <Box>
      <UserInfo user={user} />
      
      {ordersLoading ? (
        <OrdersSkeleton />
      ) : (
        <OrdersList orders={orders} />
      )}
      
      <Button 
        loading={updateUser.isPending}
        onClick={() => updateUser.mutate({ id: userId, data: {...} })}
      >
        Update User
      </Button>
    </Box>
  );
}
```

### 3. Error Boundaries
```typescript
// Error boundary for React Query
function QueryErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary }) => (
            <Alert severity="error">
              <AlertTitle>Something went wrong</AlertTitle>
              <Button onClick={resetErrorBoundary}>Try again</Button>
            </Alert>
          )}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

### 4. Performance Optimization
```typescript
// Memoize expensive selectors
const selectUserNames = useMemo(
  () => (users: User[]) => users.map(user => user.name),
  []
);

function UserNamesList() {
  const { data: users } = useUsers();
  const userNames = useMemo(
    () => users ? selectUserNames(users.results) : [],
    [users]
  );

  return (
    <List>
      {userNames.map(name => (
        <ListItem key={name}>{name}</ListItem>
      ))}
    </List>
  );
}
```

---

## 🎯 Quick Reference

### Common Patterns
```typescript
// 📊 Query Patterns
useQuery()          // Basic data fetching
useInfiniteQuery()  // Pagination
useQueries()        // Multiple queries
useSuspenseQuery()  // With Suspense

// 🔄 Mutation Patterns
useMutation()       // Basic mutation
optimistic updates  // Immediate UI updates
bulk operations     // Multiple operations

// 🗄️ Cache Patterns
invalidateQueries() // Refetch data
setQueryData()      // Update cache
removeQueries()     // Remove from cache
```

### Error Handling
```typescript
// Component level
{ error && <Alert>{error.message}</Alert> }

// Mutation level
onError: (error) => toast.error(error.message)

// Global level
defaultMutationOptions: { onError: globalErrorHandler }
```

### TypeScript Tips
```typescript
// Generic types for reusability
type ApiResponse<T> = { data: T; message: string };
type PaginatedResponse<T> = { results: T[]; count: number };

// Strict typing for mutations
useMutation<User, { id: string; data: UpdateUserRequest }>()
```

---

This guide provides a complete reference for implementing React Query in your Custom Aluminium project. Use it as a reference for building robust, type-safe API integrations with excellent user experience. 