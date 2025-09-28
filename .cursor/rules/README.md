# Cursor Rules - Custom Aluminium Project

This directory contains comprehensive coding rules and patterns for the Custom Aluminium Next.js project. These rules help Cursor understand your project structure and generate consistent, high-quality code.

## 📁 Rules Files Overview

| File | Purpose | When to Reference |
|------|---------|-------------------|
| `cursor-rules.md` | **Main rules file** - Overall guidelines | Always |
| `project-structure.md` | MVVM architecture and folder organization | Creating new files/folders |
| `frontend-components.md` | React/Material UI component patterns | Building UI components |
| `typescript-standards.md` | Type definitions and TypeScript patterns | Writing interfaces/types |
| `material-ui-patterns.md` | Material UI theming and component usage | Styling and UI components |
| `authentication-patterns.md` | Login, route protection, and auth patterns | Authentication features |

## 🚀 Quick Reference

### Creating New Components
```typescript
// 1. Follow MVVM structure
src/views/components/[category]/ComponentName.tsx

// 2. Use client directive for interactive components
'use client';

// 3. Extend BaseComponentProps
interface ComponentProps extends BaseComponentProps {
  // Your props
}

// 4. Use Material UI sx prop for styling
<Box sx={{ display: 'flex', gap: 2 }}>
```

### Adding New Pages
```typescript
// 1. Create in app directory
src/app/[route]/page.tsx

// 2. Check if needs authentication
// - Auth routes: minimal layout
// - Protected routes: full layout with header/footer

// 3. Import from views layer
import { ComponentName } from '../../views/components/[category]';
```

### Form Components
```typescript
// 1. Create in views/components/forms/[feature]/
// 2. Include validation, loading states, error handling
// 3. Use TextField with proper error display
// 4. Implement proper TypeScript types
```

### Environment Setup
```bash
# Development
npm run dev  # Uses environment/.env.dev

# Production
npm run build  # Uses environment/.env.prod
```

## 🎯 Key Principles

### 1. MVVM Architecture
- **Models** (`src/models/`): Data structures and entities
- **Views** (`src/views/`): UI components only
- **ViewModels** (`src/viewmodels/`): Business logic and state management
- **Services** (`src/services/`): API calls and external integrations

### 2. Material UI Standards
- Always use `sx` prop for styling
- Follow responsive breakpoints: `xs`, `sm`, `md`, `lg`, `xl`
- Use theme values: `primary.main`, `background.paper`, etc.
- Extend MUI components, don't replace them

### 3. TypeScript Standards
- Strict typing for all props and state
- Use `unknown` instead of `any`
- Proper type imports with `import type`
- Generic constraints where appropriate

### 4. Authentication Flow
- `/` → Redirects to `/login`
- `/login` → Minimal layout (no header/footer)
- `/home` and other routes → Full layout
- ConditionalLayout handles layout switching

## 🔧 How Cursor Uses These Rules

When you:
- **Create a new component** → Cursor references `frontend-components.md` and `material-ui-patterns.md`
- **Add authentication** → Cursor follows `authentication-patterns.md`
- **Define types** → Cursor uses `typescript-standards.md`
- **Organize files** → Cursor follows `project-structure.md`
- **Write any code** → Cursor always follows `cursor-rules.md`

## 📋 Checklist for New Features

When adding a new feature, ensure:

- [ ] Files follow MVVM structure
- [ ] Components use proper TypeScript interfaces
- [ ] Material UI styling uses `sx` prop
- [ ] Forms include validation and error handling
- [ ] Authentication is properly handled
- [ ] Responsive design is implemented
- [ ] Index files are created for clean imports
- [ ] Error boundaries are in place

## 🎨 Component Categories

### Common Components (`views/components/common/`)
- Reusable UI elements
- Button, Card, Modal, etc.
- Should be generic and configurable

### Form Components (`views/components/forms/[feature]/`)
- Feature-specific forms
- Include validation and error handling
- Group by functionality (login, contact, etc.)

### Layout Components (`views/components/layout/`)
- Header, Footer, MainLayout
- Navigation and structure
- Handle responsive design

## 🔍 Code Quality Standards

### Type Safety
```typescript
// ✅ Good
interface UserProps {
  user: User;
  onUpdate: (user: User) => void;
}

// ❌ Bad
interface UserProps {
  user: any;
  onUpdate: (user: any) => void;
}
```

### Error Handling
```typescript
// ✅ Good
try {
  await apiCall();
} catch (error) {
  setError(error instanceof Error ? error.message : 'Unknown error');
}

// ❌ Bad
try {
  await apiCall();
} catch (error) {
  setError(error.message);
}
```

### Responsive Design
```typescript
// ✅ Good
sx={{
  fontSize: { xs: '1rem', md: '1.25rem' },
  p: { xs: 2, md: 4 }
}}

// ❌ Bad
sx={{
  fontSize: '1.25rem',
  padding: '32px'
}}
```

## 🚦 Getting Started

1. **Read `cursor-rules.md`** for overall guidelines
2. **Review `project-structure.md`** to understand the architecture
3. **Check specific pattern files** when working on related features
4. **Follow the established patterns** in existing code
5. **Create index files** for clean imports

These rules ensure consistent, maintainable, and high-quality code throughout the Custom Aluminium project! 🎉 