# Custom Aluminium Frontend

A modern, enterprise-grade Next.js application for Custom Aluminium's business management system, built with TypeScript and following MVVM architecture patterns.

## 🏗️ Architecture Overview

This project follows a **Model-View-ViewModel (MVVM)** architectural pattern for optimal separation of concerns, maintainability, and scalability.

## 📁 Project Structure

```
custom-aluminium-frontend/
├── 📂 assets/                    # Static assets (images, icons, etc.)
│   └── 📂 images/               # Application images and logos
├── 📂 public/                   # Public static files
│   ├── 📂 images/              # Public images (background.jpg, etc.)
│   └── *.svg                   # Next.js default assets
├── 📂 src/                      # Source code
│   ├── 📂 app/                 # Next.js App Router
│   │   ├── 📂 home/            # Home page route
│   │   ├── 📂 login/           # Login page route
│   │   ├── 📂 users/           # Users management route
│   │   ├── layout.tsx          # Root layout with providers
│   │   └── page.tsx            # Landing page
│   ├── 📂 components/          # Page-specific components
│   │   ├── 📂 login/           # Login page components
│   │   │   ├── LoginInputs.tsx # Login input fields component
│   │   │   ├── page.tsx        # Complete login page
│   │   │   └── index.ts        # Clean exports
│   │   └── 📂 dashboard/       # Dashboard components (Future)
│   ├── 📂 models/              # Data models and entities
│   │   ├── User.ts             # User entity and types
│   │   └── index.ts            # Common model interfaces
│   ├── 📂 services/            # External services and APIs
│   │   ├── 📂 api/             # API clients and endpoints
│   │   │   ├── client.ts       # Axios client configuration
│   │   │   ├── userApi.ts      # User API methods
│   │   │   └── index.ts        # API exports
│   │   ├── 📂 auth/            # Authentication services
│   │   │   ├── nextauth.config.ts  # NextAuth configuration
│   │   │   ├── types.ts        # Auth type definitions
│   │   │   └── index.ts        # Auth exports
│   │   └── index.ts            # Service exports
│   ├── 📂 viewmodels/          # Business logic layer
│   │   ├── 📂 hooks/           # Custom React hooks
│   │   │   ├── useApi.ts       # Generic API hooks
│   │   │   ├── useAuth.ts      # Authentication hooks
│   │   │   ├── useUsers.ts     # User management hooks
│   │   │   ├── useEntityCrud.ts # Generic CRUD hooks
│   │   │   ├── useLoader.ts    # Loading state management
│   │   │   └── index.ts        # Hook exports
│   │   └── 📂 stores/          # State management (Future)
│   ├── 📂 views/               # UI layer (Reusable components)
│   │   ├── 📂 components/      # Shared UI components
│   │   │   ├── 📂 common/      # Common components
│   │   │   │   ├── Button.tsx   # Custom button component
│   │   │   │   ├── Card.tsx     # Card component
│   │   │   │   ├── Loader.tsx   # Loading component
│   │   │   │   ├── Toast.tsx    # Toast notifications
│   │   │   │   ├── EmailField.tsx # Reusable email input
│   │   │   │   ├── PasswordField.tsx # Reusable password input
│   │   │   │   └── index.ts     # Component exports
│   │   │   ├── 📂 forms/       # Form components
│   │   │   │   └── README.md   # Form organization guide
│   │   │   ├── 📂 layout/      # Layout components
│   │   │   │   ├── Header.tsx   # Application header
│   │   │   │   ├── Footer.tsx   # Application footer
│   │   │   │   ├── MainLayout.tsx # Main layout wrapper
│   │   │   │   ├── ConditionalLayout.tsx # Route-based layout
│   │   │   │   └── ThemeProvider.tsx # Material-UI theme
│   │   │   ├── 📂 providers/   # Context providers
│   │   │   │   ├── QueryProvider.tsx # React Query provider
│   │   │   │   ├── SessionProvider.tsx # NextAuth provider
│   │   │   │   ├── I18nProvider.tsx # Internationalization
│   │   │   │   ├── ToastProvider.tsx # Toast notifications
│   │   │   │   └── index.ts     # Provider exports
│   │   │   └── 📂 examples/    # Example components
│   │   └── 📂 pages/           # Page-specific components (Future)
│   ├── 📂 utils/               # Utilities and helpers
│   │   ├── 📂 constants/       # Application constants
│   │   │   └── theme.ts        # Theme constants
│   │   ├── 📂 helpers/         # Helper functions
│   │   ├── 📂 locales/         # Internationalization
│   │   │   ├── en.json         # English translations
│   │   │   ├── index.ts        # Locale configuration
│   │   │   └── README.md       # Localization guide
│   │   ├── 📂 types/           # TypeScript definitions
│   │   │   ├── api.ts          # API-related types
│   │   │   └── index.ts        # Common types
│   │   └── 📂 validators/      # Data validation schemas
│   └── 📂 types/               # Additional type definitions
├── 📂 environment/             # Environment configurations
│   ├── .env.dev                # Development environment
│   └── .env.prod               # Production environment
├── 📄 middleware.ts            # NextAuth middleware
├── 📄 package.json             # Dependencies and scripts
├── 📄 tsconfig.json            # TypeScript configuration
├── 📄 next.config.ts           # Next.js configuration
├── 📄 eslint.config.mjs        # ESLint configuration
├── 📄 API.md                   # API documentation
├── 📄 REACT-QUERY-COMPLETE-GUIDE.md # React Query guide
├── 📄 QUICK-ENTITY-SETUP-GUIDE.md   # Entity setup guide
└── 📄 GENERIC-HOOKS-EXAMPLES.md     # Hooks examples
```

## 🚀 Tech Stack

### **Core Technologies**
- **[Next.js 15.5.0](https://nextjs.org)** - React framework with App Router
- **[React 19](https://react.dev)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org)** - Type safety
- **[Material-UI (MUI) 7](https://mui.com)** - UI component library

### **State Management & Data Fetching**
- **[TanStack Query 5](https://tanstack.com/query)** - Server state management
- **[Axios](https://axios-http.com)** - HTTP client
- **[NextAuth 5](https://next-auth.js.org)** - Authentication

### **Development & Quality**
- **[ESLint](https://eslint.org)** - Code linting
- **[React Hook Form](https://react-hook-form.com)** - Form management
- **[i18next](https://www.i18next.com)** - Internationalization

## 🎯 Key Features

### **🔐 Authentication System**
- JWT-based authentication with NextAuth
- Django backend integration
- Protected routes with middleware
- Session management with refresh tokens

### **🎨 Modern UI/UX**
- Material-UI design system
- Custom toast notification system
- Responsive design for all devices
- Dark/light theme support
- Professional login interface

### **📊 Data Management**
- React Query for server state
- Generic CRUD hooks for rapid development
- Optimistic updates for better UX
- Automatic cache invalidation
- Type-safe API calls

### **🏗️ Architecture Benefits**
- **MVVM Pattern**: Clear separation of concerns
- **Dual-Component Structure**: Page-specific vs. reusable components
- **Reusable Components**: EmailField, PasswordField, LoginInputs, etc.
- **Type Safety**: Zero `any` types throughout
- **Scalable**: Easy to add new features
- **Maintainable**: Well-organized codebase

## 🛠️ Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Django backend running on configured URL

### **Installation**

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd custom-aluminium-frontend
npm install
```

2. **Environment setup:**
```bash
# Copy and configure environment files
cp environment/.env.example environment/.env.dev
cp environment/.env.example environment/.env.prod

# Edit environment files with your configuration:
# - NEXT_PUBLIC_DJANGO_API_URL (your Django backend URL)
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - NEXTAUTH_URL (your frontend URL)
```

3. **Run development server:**
```bash
npm run dev        # Development with .env.dev
npm run prod       # Production mode with .env.prod
```

4. **Open application:**
Navigate to [http://localhost:3000](http://localhost:3000)

### **Available Scripts**

```bash
npm run dev        # Development server with Turbopack
npm run prod       # Production development server
npm run build      # Production build
npm run build:dev  # Development build
npm run start      # Start production server
npm run lint       # Run ESLint
```

## 📚 Documentation

- **[API Documentation](./API.md)** - Complete API integration guide
- **[React Query Guide](./REACT-QUERY-COMPLETE-GUIDE.md)** - Data management patterns
- **[Entity Setup Guide](./QUICK-ENTITY-SETUP-GUIDE.md)** - Add new entities quickly
- **[Generic Hooks Examples](./GENERIC-HOOKS-EXAMPLES.md)** - Reusable hook patterns
- **[Component Organization](./src/COMPONENT-ORGANIZATION.md)** - Component structure guidelines
- **[Project Structure Rules](./.cursor/rules/project-structure.md)** - Complete development guidelines
- **[Docker Documentation](./README-DOCKER.md)** - Container deployment guide
- **[Localization Guide](./src/utils/locales/README.md)** - Internationalization setup

## 🔧 Development Guidelines

### **Adding New Features**
1. Define models in `src/models/`
2. Create API services in `src/services/api/`
3. Build hooks in `src/viewmodels/hooks/`
4. Create page-specific components in `src/components/`
5. Create reusable UI components in `src/views/components/`

### **Component Development**
- **NEVER use Grid or Grid2 components** for page layouts
- **ALWAYS use Box + flexbox** for complex layouts  
- **Use Stack component** for simple vertical/horizontal arrangements
- **Use Container component** for page-level wrappers
- **Page Components**: Place in `src/components/[page-name]/` for page-specific components (e.g., `LoginInputs`)
- **Shared Components**: Place in `src/views/components/` for reusable components (e.g., `EmailField`, `PasswordField`)
- Use `'use client'` for interactive components (Material UI requires this)
- Follow strict MVVM patterns for separation of concerns
- Always use clean exports with `index.ts` files
- Use TypeScript path mapping for cleaner imports (`@/components/login`, `@/views/components/common`)

### **API Integration**
- Use the generic CRUD hooks for rapid development
- Follow the established patterns in `useEntityCrud.ts`
- Implement proper error handling with toast notifications

## 🎨 UI Components

### **Reusable Form Components**
```typescript
// Using relative imports (from page components)
import { EmailField, PasswordField } from '../../views/components/common';

// Using TypeScript path mapping (recommended)
import { EmailField, PasswordField } from '@/views/components/common';

// Usage
<EmailField value={email} onChange={setEmail} />
<PasswordField value={password} onChange={setPassword} />
```

### **Toast Notifications**
```typescript
// Using relative imports
import { useToastActions } from '../../views/components/providers';

// Using TypeScript path mapping (recommended)
import { useToastActions } from '@/views/components/providers';

const { showSuccess, showError, showWarning, showInfo } = useToastActions();

// Usage
showSuccess('Operation completed!');
showError('Something went wrong!');
```

## 🌐 Django Integration

This frontend is designed to work with a Django backend:
- **Authentication**: `/api/auth/login/` endpoint
- **User Management**: RESTful user endpoints
- **Token-based**: JWT access/refresh token flow

## 🚢 Deployment

### **Environment Variables**
```bash
NEXT_PUBLIC_DJANGO_API_URL=https://your-api-domain.com
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-frontend-domain.com
```

### **Build Commands**
```bash
npm run build      # Build for production
npm run start      # Start production server
```

## 🤝 Contributing

### **Critical Rules**
1. **NEVER use Grid or Grid2** - Use Box + flexbox instead
2. **Follow dual-component structure** - Page-specific vs reusable components
3. **Use strict MVVM patterns** - Clear separation of concerns
4. **TypeScript everywhere** - Zero `any` types allowed
5. **Clean imports** - Use TypeScript path mapping (`@/`)
6. **Toast notifications** - For all user feedback
7. **Reusable components** - EmailField, PasswordField, etc.

### **Development Workflow**
1. Check `.cursor/rules/project-structure.md` for complete guidelines
2. Use proper component placement (page-specific vs reusable)
3. Implement MVVM layers correctly (Model → ViewModel → View)
4. Add proper error handling with toast notifications
5. Update documentation for new features

## 📄 License

This project is proprietary software for Custom Aluminium business operations.
