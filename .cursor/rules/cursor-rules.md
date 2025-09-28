# Cursor Rules - Custom Aluminium Project

You are an expert developer for the Custom Aluminium project, a Next.js application built with TypeScript, Material UI, and following MVVM architecture patterns.

## Project Overview

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **UI Library**: Material UI v6
- **Architecture**: MVVM (Model-View-ViewModel)
- **Styling**: Material UI's `sx` prop, no CSS modules
- **State Management**: React hooks + custom hooks
- **Authentication**: JWT-based with protected routes
- **Environment**: Development and production configs

## Code Generation Rules

### 1. Always Follow MVVM Structure
```
src/
├── app/              # Next.js App Router (routing only)
├── views/            # UI Components (View layer)
├── viewmodels/       # Business logic, hooks (ViewModel layer)
├── models/           # Data entities (Model layer)
├── services/         # API calls, external services
└── utils/            # Utilities, types, constants
```

### 2. Component Creation Standards

**Client Components** (interactive):
```typescript
'use client';

import React, { useState } from 'react';
import { Material UI imports } from '@mui/material';
import { Local component imports } from '../path';
import type { Type imports } from '../../utils/types';

interface ComponentProps extends BaseComponentProps {
  // Props definition with proper types
}

export const ComponentName: React.FC<ComponentProps> = ({
  prop1,
  prop2 = 'defaultValue'
}) => {
  // State and hooks
  const [state, setState] = useState<StateType>(initialValue);
  
  // Event handlers with proper typing
  const handleEvent = (param: ParamType): void => {
    // Implementation
  };
  
  return (
    <Box sx={{ /* Material UI styling */ }}>
      {/* JSX content */}
    </Box>
  );
};
```

**Server Components** (static):
```typescript
import React from 'react';
import { ComponentImports } from '../path';
import type { TypeImports } from '../types';

interface PageProps {
  // Props from Next.js routing
}

export default function PageName({ params }: PageProps) {
  return (
    <Container maxWidth="lg">
      {/* Static content */}
    </Container>
  );
}
```

### 3. Styling Standards

**Use Material UI's sx prop exclusively**:
```typescript
// ✅ Correct styling approach
<Box
  sx={{
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: { xs: 2, md: 3 },
    p: 3,
    backgroundColor: 'background.paper',
    borderRadius: 2,
    '&:hover': {
      backgroundColor: 'grey.50',
    },
  }}
>

// ✅ Theme-aware responsive design
<Typography
  variant="h1"
  sx={{
    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
    color: 'primary.main',
    fontWeight: 700,
  }}
>
```

**Never use**:
- CSS modules or separate CSS files
- Inline `style` props
- `className` for styling (only for integration)

### 4. Layout Standards (CRITICAL)

**NEVER use Grid or Grid2 components for page layouts!**

#### ✅ Use Box + Flexbox
```typescript
// Complex responsive layouts
<Box
  sx={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: 3,
    '& > *': {
      flex: {
        xs: '1 1 100%',           // Mobile: full width
        sm: '1 1 calc(50% - 12px)', // Tablet: half width
        md: '1 1 calc(25% - 18px)', // Desktop: quarter width
      },
    },
  }}
>
  <Box>Card 1</Box>
  <Box>Card 2</Box>
  <Box>Card 3</Box>
  <Box>Card 4</Box>
</Box>
```

#### ✅ Use Stack for Simple Layouts
```typescript
// Vertical/horizontal arrangements
<Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
  <Box sx={{ flex: 1 }}>
    <Typography variant="h4">Main Content</Typography>
  </Box>
  <Box sx={{ width: { xs: '100%', md: 300 } }}>
    <Typography variant="h6">Sidebar</Typography>
  </Box>
</Stack>
```

#### ✅ Use Container for Page Wrappers
```typescript
// Page-level containers
<Container maxWidth="lg" sx={{ py: 4 }}>
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <Typography variant="h1">Page Title</Typography>
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={4}>
      {/* Content sections */}
    </Stack>
  </Box>
</Container>
```

#### ❌ FORBIDDEN
```typescript
// DON'T DO THIS - Grid components are forbidden for layouts
<Grid container spacing={2}>          // ❌ FORBIDDEN
<Grid2 container spacing={2}>         // ❌ FORBIDDEN
<Grid item xs={12} md={6}>            // ❌ FORBIDDEN
<Grid2 size={{ xs: 12, md: 6 }}>     // ❌ FORBIDDEN
```

### 5. Form Patterns

**Always implement this form structure**:
```typescript
export const FormComponent: React.FC<FormProps> = ({ onSubmit }) => {
  const [values, setValues] = useState<FormType>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    // Validation logic
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setErrors({ submit: 'Error message' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={3}>
      <TextField
        error={!!errors.fieldName}
        helperText={errors.fieldName}
        // ... other props
      />
      <Button type="submit" loading={loading}>
        Submit
      </Button>
    </Stack>
  );
};
```

### 6. Route Organization

**Authentication Flow**:
- `/` → Redirects to `/login`
- `/login` → Login form (minimal layout)
- `/home` → Main dashboard (full layout)
- Protected routes → Require authentication

**Layout Strategy**:
```typescript
// ConditionalLayout determines layout based on route
const authRoutes = ['/login'];
const isAuthRoute = authRoutes.includes(pathname);

return isAuthRoute ? (
  <MinimalLayout>{children}</MinimalLayout>
) : (
  <MainLayout>{children}</MainLayout>
);
```

### 7. Type Safety Requirements

**Always define proper types**:
```typescript
// API responses
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Component props
interface ComponentProps extends BaseComponentProps {
  data: DataType[];
  onAction: (item: DataType) => void;
  variant?: 'primary' | 'secondary';
}

// Form data
interface FormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

**Use proper imports**:
```typescript
// Type-only imports
import type { ComponentProps, ReactNode } from 'react';
import type { Theme } from '@mui/material/styles';

// Value imports
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
```

## File Organization Rules

### 1. Component Files
```
views/components/
├── common/           # Reusable components
│   ├── Button.tsx
│   ├── Card.tsx
│   └── index.ts      # Export all components
├── forms/           # Feature-grouped forms
│   └── login/
│       ├── LoginForm.tsx
│       ├── index.ts
│       └── README.md (if complex)
└── layout/          # Layout components
    ├── Header.tsx
    ├── Footer.tsx
    └── MainLayout.tsx
```

### 2. Export Patterns
```typescript
// index.ts files for clean imports
export { ComponentA } from './ComponentA';
export { ComponentB } from './ComponentB';
export type { ComponentAProps } from './ComponentA';

// Usage
import { ComponentA, ComponentB } from '../common';
import type { ComponentAProps } from '../common';
```

### 3. Folder Naming
- **Components**: PascalCase folders for complex features
- **Files**: PascalCase for components, camelCase for utilities
- **Index files**: Always include for clean imports

## Material UI Standards

### 1. Component Extensions
```typescript
// Extend MUI components, don't replace
import { Button as MuiButton, ButtonProps } from '@mui/material';

interface CustomButtonProps extends Omit<ButtonProps, 'className'> {
  loading?: boolean;
}

export const Button: React.FC<CustomButtonProps> = ({
  loading,
  disabled,
  children,
  ...props
}) => (
  <MuiButton disabled={disabled || loading} {...props}>
    {loading ? 'Loading...' : children}
  </MuiButton>
);
```

### 2. Responsive Design
```typescript
// Always use theme breakpoints
sx={{
  display: { xs: 'block', md: 'flex' },
  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
  p: { xs: 2, sm: 3, md: 4 },
}}
```

### 3. Theme Usage
```typescript
// Use theme values, not hardcoded colors
sx={{
  color: 'primary.main',
  backgroundColor: 'background.paper',
  borderColor: 'divider',
  '&:hover': {
    backgroundColor: 'action.hover',
  },
}}
```

## Error Handling Standards

### 1. Component Error Boundaries
```typescript
try {
  await apiCall();
  // Success handling
} catch (error) {
  setError(error instanceof Error ? error.message : 'Unknown error');
} finally {
  setLoading(false);
}
```

### 2. Form Validation
```typescript
const validateField = (value: string, rules: ValidationRule[]): string => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return '';
};
```

## Performance Guidelines

### 1. Code Splitting
- Use dynamic imports for large components
- Lazy load non-critical features
- Keep bundle sizes small

### 2. Re-renders
- Use `React.memo` for expensive components
- Memoize callbacks with `useCallback`
- Optimize state updates

### 3. Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
  priority={isAboveFold}
/>
```

## Security Rules

### 1. Input Validation
- Always validate user inputs
- Sanitize data before API calls
- Use TypeScript for compile-time safety

### 2. Authentication
- Store tokens securely
- Implement proper logout
- Handle token expiration

### 3. Environment Variables
- Use `.env.local` for secrets
- Prefix public vars with `NEXT_PUBLIC_`
- Never commit sensitive data

When generating code, always follow these patterns and ensure type safety, proper error handling, and Material UI best practices. 