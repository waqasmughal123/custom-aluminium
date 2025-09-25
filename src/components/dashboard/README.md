# Dashboard Components

This directory contains the dashboard page and its modular components.

## Structure

```
src/components/dashboard/
├── page.tsx                    # Main dashboard page (now simplified)
├── components/
│   ├── DashboardHeader.tsx     # Welcome header with user name
│   ├── DashboardStats.tsx      # Statistics cards grid
│   ├── RecentJobsTable.tsx     # Recent jobs table with status
│   ├── LoadingState.tsx        # Loading spinner with message
│   ├── ErrorState.tsx          # Error display with retry button
│   └── index.ts               # Component exports
└── README.md                  # This documentation
```

## Components

### DashboardHeader
- Displays welcome message with user name
- Responsive layout for mobile/desktop
- Uses session data from NextAuth

### DashboardStats
- Grid of 6 statistical cards
- Animated card appearance with framer-motion
- Icons and color-coded backgrounds
- Responsive grid layout (1/2/3 columns)

### RecentJobsTable
- DataTable showing recent jobs
- Status badges with dynamic colors
- Formatted dates and customer info
- Empty state handling

### LoadingState
- Centered loading spinner
- Localized loading message
- Full viewport height

### ErrorState
- Error icon and message
- Retry button functionality
- Localized error messages
- Graceful error handling

## Usage

The main dashboard page (`page.tsx`) now imports and uses these components:

```tsx
import { 
  DashboardHeader, 
  DashboardStats, 
  RecentJobsTable, 
  LoadingState, 
  ErrorState 
} from './components';

// Simplified component logic
if (isLoading) return <LoadingState />;
if (error) return <ErrorState error={error} onRetry={refetch} />;

return (
  <Box>
    <DashboardHeader />
    <DashboardStats stats={dashboardData.stats} />
    <RecentJobsTable jobs={dashboardData.recent_jobs} />
  </Box>
);
```

## Benefits

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Components can be used in other parts of the app
3. **Testability**: Individual components are easier to test
4. **Readability**: Main dashboard page is much cleaner
5. **Performance**: Components can be optimized individually

## API Integration

All components are integrated with the dashboard API (`/api/dashboard/overview/`) and use:
- React Query for data fetching
- i18next for localization
- Material-UI for styling
- TypeScript for type safety

