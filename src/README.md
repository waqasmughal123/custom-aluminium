# MVVM Architecture Structure

This project follows the Model-View-ViewModel (MVVM) architectural pattern for better separation of concerns and maintainability.

## Folder Structure

```
src/
├── app/                    # Next.js App Router (existing)
├── models/                 # Data models and entities
├── views/                  # UI Components and Pages
│   ├── components/         
│   │   ├── common/         # Reusable components
│   │   ├── forms/          # Form components
│   │   └── layout/         # Layout components
│   └── pages/              # Page-specific components
├── viewmodels/             # Business logic and state management
│   ├── hooks/              # Custom React hooks
│   └── stores/             # State management (Zustand/Redux)
├── services/               # External services and APIs
│   ├── api/                # API calls and endpoints
│   ├── auth/               # Authentication services
│   └── validation/         # Data validation schemas
└── utils/                  # Utilities and helpers
    ├── constants/          # Application constants
    ├── helpers/            # Helper functions
    └── types/              # TypeScript type definitions
```

## MVVM Pattern Benefits

- **Models**: Define data structure and business entities
- **Views**: Handle UI rendering and user interactions
- **ViewModels**: Manage business logic and state
- **Separation of Concerns**: Clear boundaries between layers
- **Testability**: Easier to test individual components
- **Maintainability**: Better code organization and reusability

## Usage Guidelines

1. **Models** should contain only data structures and interfaces
2. **Views** should be pure UI components with minimal logic
3. **ViewModels** should handle business logic, API calls, and state management
4. **Services** should handle external integrations and shared business logic
5. **Utils** should contain pure functions and reusable utilities 