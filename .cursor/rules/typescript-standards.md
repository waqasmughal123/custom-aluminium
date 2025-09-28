# TypeScript Standards

## Type Definition Patterns

### 1. Component Props
```typescript
// Base props that all components extend
interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
}

// Specific component props
interface LoginFormProps extends BaseComponentProps {
  onLogin?: (email: string, password: string) => void;
  initialEmail?: string;
  redirectPath?: string;
}

// Props with generic types
interface ListComponentProps<T> extends BaseComponentProps {
  data: T[];
  onItemSelect: (item: T) => void;
  keyExtractor: (item: T) => string;
  renderItem: (item: T) => ReactNode;
}
```

### 2. API Response Types
```typescript
// Generic API response wrapper
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Paginated responses
interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Specific API responses
interface LoginResponse {
  user: User;
  token: string;
  expiresAt: string;
}
```

### 3. Form Types
```typescript
// Form state management
interface FormState<T = Record<string, unknown>> {
  values: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
}

// Specific form types
interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  projectType: 'windows' | 'doors' | 'facades' | 'custom';
}
```

### 4. Entity Models
```typescript
// Base entity
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User model
interface User extends BaseEntity {
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'client';
  isActive: boolean;
  lastLoginAt?: Date;
}

// Project model
interface Project extends BaseEntity {
  title: string;
  description: string;
  clientId: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  budget?: number;
  deadline?: Date;
}
```

## Utility Types

### 1. Common Patterns
```typescript
// Optional except for specific fields
type CreateUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateUser = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

// Pick specific fields
type UserSummary = Pick<User, 'id' | 'name' | 'email' | 'role'>;

// Make specific fields required
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
type ProjectWithDeadline = RequiredFields<Project, 'deadline'>;
```

### 2. Event Handler Types
```typescript
// Common event handlers
type ChangeHandler<T = string> = (value: T) => void;
type SubmitHandler<T> = (data: T) => void | Promise<void>;
type ClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void;

// Form handlers
type FormChangeHandler<T> = (field: keyof T, value: unknown) => void;
type FormSubmitHandler<T> = (data: T) => Promise<void>;
```

### 3. Hook Return Types
```typescript
// API hook returns
interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Form hook returns
interface UseFormResult<T> {
  values: T;
  errors: Record<keyof T, string>;
  handleChange: FormChangeHandler<T>;
  handleSubmit: (onSubmit: FormSubmitHandler<T>) => void;
  reset: () => void;
  isValid: boolean;
  isDirty: boolean;
}
```

## Type Safety Rules

### 1. Strict Type Checking
```typescript
// ✅ Use strict types
interface StrictProps {
  status: 'loading' | 'success' | 'error';
  data: User[];
}

// ❌ Avoid any
interface LooseProps {
  status: any;
  data: any;
}

// ✅ Use unknown for uncertain types
function processData(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
  // Handle other cases
}
```

### 2. Null Safety
```typescript
// ✅ Handle null/undefined explicitly
interface SafeUser {
  id: string;
  name: string;
  email?: string; // Optional
  profile: UserProfile | null; // Explicitly nullable
}

// ✅ Use optional chaining
const userEmail = user.profile?.contact?.email ?? 'No email';

// ✅ Type guards
function isValidUser(user: unknown): user is User {
  return (
    typeof user === 'object' &&
    user !== null &&
    'id' in user &&
    'name' in user &&
    'email' in user
  );
}
```

### 3. Generic Constraints
```typescript
// ✅ Constrain generics appropriately
interface Repository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

// ✅ Use keyof for type-safe property access
function updateEntity<T, K extends keyof T>(
  entity: T,
  key: K,
  value: T[K]
): T {
  return { ...entity, [key]: value };
}
```

## Import/Export Standards

### 1. Type-only Imports
```typescript
// ✅ Separate type and value imports
import React from 'react';
import type { ComponentProps, ReactNode } from 'react';
import { Button } from '@mui/material';
import type { ButtonProps } from '@mui/material';
```

### 2. Type Exports
```typescript
// ✅ Export types explicitly
export type { User, Project, ApiResponse };
export type { LoginFormProps, ContactFormProps };

// ✅ Re-export from index files
// types/index.ts
export type * from './User';
export type * from './Project';
export type * from './ApiTypes';
```

## Error Handling Types

```typescript
// Custom error types
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Result type pattern
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };
``` 