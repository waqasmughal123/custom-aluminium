'use client';

import { Box } from '@mui/material';
import React from 'react';
import { useDashboardOverview } from '@/viewmodels/hooks';
import { 
  DashboardHeader, 
  DashboardStats, 
  RecentJobsTable, 
  LoadingState, 
  ErrorState 
} from './components';

export default function DashboardPage() {
  const { 
    data: dashboardData, 
    isLoading, 
    error,
    refetch
  } = useDashboardOverview();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (!dashboardData) {
    return null;
  }


  return (
    <Box sx={{ p: 8, '& > * + *': { mt: 8 } }}>
      {/* Header */}
      <DashboardHeader />
      
      {/* Stats Grid */}
      <DashboardStats stats={dashboardData.stats} />

      {/* Recent Jobs Table */}
      <RecentJobsTable jobs={dashboardData.recent_jobs} />
    </Box>
  );
} 