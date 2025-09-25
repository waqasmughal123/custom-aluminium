# Component Organization Guide

This document explains the component organization strategy in the Custom Aluminium frontend project.

## 📁 Component Structure Overview

We use a **dual-component structure** to maintain clear separation between page-specific and reusable components:

```
src/
├── 📂 components/              # Page-specific components
│   ├── 📂 login/              # Login page components
│   │   └── page.tsx           # Login page component
│   ├── 📂 dashboard/          # Dashboard page components
│   └── 📂 [page-name]/        # Other page-specific components
│
└── 📂 views/                  # Reusable UI components
    └── 📂 components/         # Shared component library
        ├── 📂 common/         # Basic reusable components
        ├── 📂 forms/          # Form-related components
        ├── 📂 layout/         # Layout components
        └── 📂 providers/      # Context providers
```

## 🎯 Component Organization Rules

### **1. Page-Specific Components** → `src/components/`
Use this for components that are **specific to a particular page** or feature:

```typescript
// ✅ Good: Page-specific login component
src/components/login/page.tsx

// ✅ Good: Dashboard-specific widgets
src/components/dashboard/MetricsWidget.tsx
src/components/dashboard/RecentOrders.tsx

// ✅ Good: User management page components  
src/components/users/UsersList.tsx
src/components/users/UserForm.tsx
```

### **2. Reusable Components** → `src/views/components/`
Use this for components that are **shared across multiple pages**:

```typescript
// ✅ Good: Shared form components
src/views/components/common/EmailField.tsx
src/views/components/common/PasswordField.tsx
src/views/components/common/Button.tsx

// ✅ Good: Layout components
src/views/components/layout/Header.tsx
src/views/components/layout/Sidebar.tsx

// ✅ Good: Providers used globally
src/views/components/providers/ToastProvider.tsx
```

## 📦 Import Path Strategy

### **Recommended Import Patterns**

```typescript
// ✅ From page components - import shared components
import { EmailField, PasswordField } from '../../views/components/common';
import { useToastActions } from '../../views/components/providers';

// ✅ Use TypeScript path mapping for cleaner imports
import { EmailField, PasswordField } from '@/views/components/common';
import { useToastActions } from '@/views/providers';

// ✅ Import assets with absolute paths
import logo from '@/assets/images/logo.png';
```

### **TypeScript Path Mapping**

We've configured TypeScript path mapping for cleaner imports:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/components/*": ["./src/components/*"],
    "@/views/*": ["./src/views/*"],
    "@/services/*": ["./src/services/*"],
    "@/models/*": ["./src/models/*"],
    "@/viewmodels/*": ["./src/viewmodels/*"],
    "@/utils/*": ["./src/utils/*"],
    "@/types/*": ["./src/types/*"],
    "@/assets/*": ["./assets/*"]
  }
}
```

## 🏗️ Component Development Guidelines

### **When to Create Page-Specific Components**

Create in `src/components/[page]/` when:
- Component is only used on one specific page
- Component contains page-specific business logic
- Component is tightly coupled to page requirements
- Component is unlikely to be reused elsewhere

**Example:**
```typescript
// src/components/login/page.tsx
// This is specific to the login page only
export const LoginInputs = ({ email, password, onEmailChange, onPasswordChange }) => {
  // Login-specific input fields logic
  return (
    <Stack spacing={3}>
      <EmailField value={email} onChange={onEmailChange} />
      <PasswordField value={password} onChange={onPasswordChange} />
    </Stack>
  );
};
```

### **When to Create Reusable Components**

Create in `src/views/components/` when:
- Component can be used across multiple pages
- Component provides general UI functionality
- Component is a basic building block (buttons, inputs, etc.)
- Component is a layout or structural element

**Example:**
```typescript
// src/views/components/common/EmailField.tsx  
// This can be used in login, registration, profile, etc.
export const EmailField = ({ value, onChange, ...props }) => {
  // Reusable email input logic
};
```

## 🔄 Migration Strategy

### **Moving Components Between Categories**

If a component grows from page-specific to reusable:

1. **Identify reusability potential**
2. **Extract reusable parts** to `src/views/components/`
3. **Keep page-specific wrapper** in `src/components/`
4. **Update imports** accordingly

**Example:**
```typescript
// Before: Page-specific only
src/components/login/LoginInputs.tsx

// After: Split into reusable + page-specific
src/views/components/forms/AuthForm.tsx        // Reusable auth logic
src/components/login/page.tsx                  // Page-specific wrapper
```

## 🛠️ Development Workflow

### **Creating New Components**

1. **Determine component type:**
   - Page-specific → `src/components/[page]/`
   - Reusable → `src/views/components/[category]/`

2. **Use proper imports:**
   - Prefer TypeScript path mapping (`@/`)
   - Import shared components from `@/views/components/`
   - Import page components from `@/components/`

3. **Follow naming conventions:**
   - PascalCase for component names
   - Descriptive folder names
   - Export from index files

### **Adding New Pages**

1. **Create page directory:** `src/components/[new-page]/`
2. **Add page component:** `page.tsx` or `[ComponentName].tsx`
3. **Import reusable components** from `@/views/components/`
4. **Update routing** in `src/app/` if needed

## 📋 ESLint Rules

We've configured ESLint rules to help maintain this organization:

```javascript
{
  rules: {
    // Organize imports properly
    "import/order": ["error", { /* ... */ }],
    
    // Prevent deep relative imports
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["../../../*"],
            message: "Avoid deep relative imports. Use absolute imports."
          }
        ]
      }
    ]
  }
}
```

## 🎯 Benefits

This dual-component structure provides:

1. **Clear Separation**: Page-specific vs reusable components
2. **Better Maintainability**: Easy to find and modify components
3. **Improved Reusability**: Shared components are easily discoverable
4. **Scalability**: Structure supports growth and team collaboration
5. **Type Safety**: TypeScript path mapping for better imports

## 📚 Examples

### **Good Component Organization**

```
src/
├── components/
│   ├── login/
│   │   └── page.tsx              # Login page component
│   ├── dashboard/
│   │   ├── MetricsWidget.tsx     # Dashboard-specific widget
│   │   └── RecentOrders.tsx      # Dashboard-specific component
│   └── users/
│       ├── UsersList.tsx         # Users page list
│       └── UserForm.tsx          # Users page form
│
└── views/components/
    ├── common/
    │   ├── EmailField.tsx         # Reusable across forms
    │   ├── PasswordField.tsx      # Reusable across forms
    │   └── Button.tsx             # Reusable UI element
    ├── layout/
    │   ├── Header.tsx             # Global header
    │   └── Sidebar.tsx            # Global sidebar
    └── providers/
        └── ToastProvider.tsx      # Global provider
```

This organization ensures clear boundaries, better maintainability, and optimal code reuse across the Custom Aluminium frontend application. 