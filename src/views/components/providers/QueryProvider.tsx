'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React from 'react';
import type { BaseComponentProps } from '@/utils/types';

interface QueryProviderProps extends BaseComponentProps {
  children: React.ReactNode;
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Time until data is considered stale (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Time until inactive queries are garbage collected (10 minutes)
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Don't refetch on window focus in development
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Time until mutation cache is garbage collected (5 minutes)
      gcTime: 5 * 60 * 1000,
    },
  },
});

export const QueryProvider: React.FC<QueryProviderProps> = ({ 
  children
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
        />
      )}
    </QueryClientProvider>
  );
}; 