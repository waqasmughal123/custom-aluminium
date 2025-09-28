# Custom Aluminium - Project Structure Rules

## MVVM Architecture

This project follows a strict Model-View-ViewModel (MVVM) pattern with Next.js App Router and dual-component structure.

### Folder Structure

```
src/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout with ConditionalLayout
│   ├── page.tsx                   # Root page (redirects to /login)
│   ├── login/                     # Authentication routes
│   │   ├── layout.tsx             # Minimal layout (no header/footer)
│   │   └── page.tsx               # Login page
│   ├── home/                      # Main application routes
│   │   └── page.tsx               # Homepage with full layout
│   └── users/                     # User management routes
│       └── page.tsx               # Users page
├── components/                    # Page-specific components
│   ├── login/                     # Login page components
│   │   ├── LoginInputs.tsx        # Login input fields component
│   │   ├── page.tsx               # Complete login page
│   │   └── index.ts               # Clean exports
│   ├── dashboard/                 # Dashboard page components
│   └── [page-name]/               # Other page-specific components
├── views/                         # UI Layer (MVVM View) - Reusable components
│   └── components/
│       ├── common/                # Reusable UI components
│       │   ├── Button.tsx
│       │   ├── Card.tsx
│       │   ├── EmailField.tsx     # Reusable email input
│       │   ├── PasswordField.tsx  # Reusable password input
│       │   ├── Toast.tsx          # Toast notifications
│       │   └── Loader.tsx
│       ├── forms/                 # Form components by feature
│       │   └── README.md          # Form organization guide
│       ├── layout/                # Layout components
│       │   ├── Header.tsx
│       │   ├── Footer.tsx
│       │   ├── MainLayout.tsx
│       │   ├── ConditionalLayout.tsx
│       │   └── ThemeProvider.tsx
│       ├── providers/             # Context providers
│       │   ├── QueryProvider.tsx
│       │   ├── SessionProvider.tsx
│       │   ├── I18nProvider.tsx
│       │   ├── ToastProvider.tsx
│       │   └── index.ts
│       └── examples/              # Example components
├── viewmodels/                    # Business Logic Layer (MVVM ViewModel)
│   ├── hooks/                     # Custom React hooks
│   │   ├── useApi.ts             # Generic API hooks
│   │   ├── useAuth.ts            # Authentication hooks
│   │   ├── useUsers.ts           # User management hooks
│   │   ├── useEntityCrud.ts      # Generic CRUD hooks
│   │   ├── useLoader.ts          # Loading state management
│   │   └── index.ts
│   └── stores/                    # State management
├── models/                        # Data Layer (MVVM Model)
│   ├── User.ts                   # User entity and types
│   └── index.ts                  # Entity definitions
├── services/                      # External Services
│   ├── api/                       # API calls
│   │   ├── client.ts             # Axios client configuration
│   │   ├── userApi.ts            # User API methods
│   │   └── index.ts
│   ├── auth/                      # Authentication
│   │   ├── nextauth.config.ts    # NextAuth configuration
│   │   ├── types.ts              # Auth type definitions
│   │   └── index.ts
│   └── validation/                # Data validation
├── utils/                         # Utilities
│   ├── constants/
│   │   └── theme.ts              # Material UI theme
│   ├── helpers/
│   ├── locales/                  # Internationalization
│   │   ├── en.json               # English translations
│   │   └── index.ts
│   ├── types/
│   │   ├── api.ts                # API-related types
│   │   └── index.ts              # TypeScript definitions
│   └── validators/
└── types/                         # Additional type definitions
```

### Assets Structure

```
assets/                            # Static assets
└── images/                        # Application images
    └── logo.png                   # Company logo

public/                            # Public static files
├── images/                        # Public images
│   └── background.jpg             # Background images
└── *.svg                          # Next.js default assets
```

## File Naming Conventions

- **Components**: PascalCase (`LoginForm.tsx`, `CustomButton.tsx`)
- **Pages**: PascalCase (`page.tsx`, `layout.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`, `useApi.ts`)
- **Utilities**: camelCase (`formatDate.ts`, `validateEmail.ts`)
- **Types**: PascalCase (`UserType.ts`, `ApiResponse.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_ENDPOINTS.ts`)

## Import/Export Rules

### Always use index.ts for clean imports:
```typescript
// ✅ Good - Page-specific components
import { LoginInputs } from '@/components/login';
import { UsersList } from '@/components/users';

// ✅ Good - Reusable components
import { Button, Card, EmailField } from '@/views/components/common';

// ❌ Bad - Deep relative imports
import { LoginInputs } from '../../../components/login/LoginInputs';
```

### Export patterns:
```typescript
// Component exports
export { ComponentName } from './ComponentName';

// Type exports
export type { TypeName } from './types';

// Default exports for pages
export default function PageName() { }
```

## Component Organization Rules

### 1. Dual-Component Structure
- **Page Components** → `src/components/[page-name]/` for page-specific components
- **Shared Components** → `src/views/components/` for reusable components

### 2. Component Placement Rules
Use `src/components/` when:
- Component is only used on one specific page
- Component contains page-specific business logic
- Component is tightly coupled to page requirements

Use `src/views/components/` when:
- Component can be used across multiple pages
- Component provides general UI functionality
- Component is a basic building block (buttons, inputs, etc.)
- Component is a layout or structural element

### 3. Client vs Server Components
- Use `'use client'` for interactive components
- Server components for static content and layouts
- Material UI components MUST be client components

### 4. Layout Component Rules (CRITICAL)
- **NEVER use Grid or Grid2 components** for page layouts
- **ALWAYS use Box + flexbox** for complex layouts
- **Use Stack component** for simple vertical/horizontal arrangements
- **Use Container component** for page-level wrappers

```typescript
// ✅ Correct layout approach
<Container maxWidth="lg">
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
      <Box sx={{ flex: 1 }}>Main content</Box>
      <Box sx={{ width: { xs: '100%', md: 300 } }}>Sidebar</Box>
    </Stack>
  </Box>
</Container>

// ❌ FORBIDDEN - Never use Grid for layouts
<Grid container spacing={2}>     // DON'T USE
<Grid2 container spacing={2}>    // DON'T USE
```

### 5. Component Template:
```typescript
'use client'; // If interactive

import React from 'react';
import { Material UI imports } from '@mui/material';
import { Local imports } from '../relative/path';
import { Type imports } from '../../utils/types';

interface ComponentNameProps {
  // Props definition
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  prop1,
  prop2 = 'defaultValue'
}) => {
  // State and hooks
  
  // Event handlers
  
  // Render
  return (
    // JSX
  );
};
```

### 6. Import Path Strategy
- Use TypeScript path mapping for cleaner imports
- Prefer absolute imports over deep relative imports

```typescript
// ✅ Recommended: TypeScript path mapping
import { EmailField, PasswordField } from '@/views/components/common';
import { useToastActions } from '@/views/components/providers';
import logo from '@/assets/images/logo.png';

// ✅ Acceptable: Relative imports
import { EmailField, PasswordField } from '../../views/components/common';

// ❌ Avoid: Deep relative imports
import { EmailField } from '../../../views/components/common/EmailField';
```

## Route Organization

### Authentication Flow:
- `/` → Redirects to `/login`
- `/login` → Login form (no header/footer)
- `/home` → Main site (with header/footer)
- All other routes → Full layout

### Layout Strategy:
- `ConditionalLayout` determines layout based on route
- Auth routes (`/login`) get minimal layout
- App routes get full layout with header/footer

## Environment Structure

```
environment/
├── .env.dev      # Development variables
└── .env.prod     # Production variables
```

Scripts automatically load correct environment:
- `npm run dev` → loads .env.dev
- `npm run build` → loads .env.prod 

## Key Technologies & Dependencies

### Core Stack
- **Next.js 15.5.0** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript 5** - Type safety throughout
- **Material-UI (MUI) 7** - UI component library

### Data Management
- **TanStack Query 5** - Server state management
- **Axios** - HTTP client with interceptors
- **NextAuth 5** - Authentication with Django backend

### UI Features
- **Toast Notifications** - Global notification system
- **Reusable Form Components** - EmailField, PasswordField
- **Responsive Design** - Mobile-first approach
- **Theme Support** - Material-UI theming

### Development Tools
- **ESLint** - Code quality and import organization
- **TypeScript Path Mapping** - Clean import paths
- **Environment Management** - Separate dev/prod configs

## MVVM Implementation Guidelines

### Model Layer (`src/models/`)
```typescript
// User.ts - Data entities and types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}
```

### ViewModel Layer (`src/viewmodels/hooks/`)
```typescript
// useUsers.ts - Business logic and state management
export function useUsers() {
  return useApiQuery<User[]>(['users'], () => userApiService.getUsers());
}

export function useCreateUser() {
  const { showSuccess, showError } = useToastActions();
  
  return useApiMutation<User, CreateUserRequest>(
    (userData) => userApiService.createUser(userData),
    {
      onSuccess: () => showSuccess('User created successfully!'),
      onError: (error) => showError(`Failed to create user: ${error.message}`),
    }
  );
}
```

### View Layer (`src/views/components/` and `src/components/`)
```typescript
// Reusable component (src/views/components/common/)
export const EmailField = ({ value, onChange, ...props }) => {
  // Reusable email input with validation
};

// Page-specific component (src/components/login/)
export const LoginInputs = ({ email, password, onEmailChange, onPasswordChange }) => {
  // Login-specific input fields logic
};

// Page-specific component (src/components/users/)
export const UsersList = () => {
  const { data: users } = useUsers();
  const createUser = useCreateUser();
  
  // Page-specific UI logic
};
```

### Service Layer (`src/services/`)
```typescript
// userApi.ts - External API communication
export class UserApiService {
  async getUsers(): Promise<User[]> {
    return apiClient.get<User[]>('/api/users');
  }
  
  async createUser(userData: CreateUserRequest): Promise<User> {
    return apiClient.post<User>('/api/users', userData);
  }
}
```

## Best Practices Summary

### ✅ DO
- Use dual-component structure for clear separation
- Implement MVVM patterns strictly
- Use TypeScript path mapping for imports
- Use Box + flexbox for layouts (never Grid)
- Add toast notifications for user feedback
- Use reusable components (EmailField, PasswordField)
- Follow clean export patterns with index.ts
- Use 'use client' for interactive components

### ❌ DON'T
- Mix page-specific and reusable components
- Use Grid or Grid2 for layouts
- Use deep relative imports (../../../)
- Skip TypeScript typing
- Create components without considering reusability
- Forget to add proper error handling
- Mix business logic in UI components 