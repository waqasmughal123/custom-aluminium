'use client';

import {
  Box,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import { format } from 'date-fns';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { RecentJob } from '@/services/api/dashboardApi';
import { DataTable } from '@/views/components/common';

interface RecentJobsTableProps {
  jobs: RecentJob[];
  loading?: boolean;
}

export default function RecentJobsTable({ jobs, loading = false }: RecentJobsTableProps) {
  const { t } = useTranslation();

  // Helper to get status color based on the API color field
  const getStatusColor = (color: string): { background: string, text: string } => {
    switch (color.toLowerCase()) {
      case 'yellow':
        return { background: '#FFEB3B', text: '#000000' };
      case 'green':
        return { background: '#4CAF50', text: '#FFFFFF' };
      case 'red':
        return { background: '#F44336', text: '#FFFFFF' };
      case 'blue':
        return { background: '#2196F3', text: '#FFFFFF' };
      case 'orange':
        return { background: '#FF9800', text: '#000000' };
      case 'purple':
        return { background: '#9C27B0', text: '#FFFFFF' };
      case 'gray':
      case 'grey':
        return { background: '#9E9E9E', text: '#FFFFFF' };
      default:
        return { background: '#F5F5F5', text: '#000000' };
    }
  };

  // Define columns for the DataTable
  const columns = [
    {
      id: 'title' as keyof RecentJob,
      label: t('dashboard.table.jobTitle'),
      minWidth: 250,
      render: (value: unknown) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {value as string}
        </Typography>
      )
    },
    {
      id: 'customer' as keyof RecentJob,
      label: t('dashboard.table.customer'),
      minWidth: 200,
      render: (value: unknown) => (
        <Typography variant="body2" color="text.secondary">
          {value as string}
        </Typography>
      )
    },
    {
      id: 'progress' as keyof RecentJob,
      label: t('dashboard.table.progress'),
      minWidth: 150,
      render: (value: unknown, row: unknown) => {
        const job = row as RecentJob;
        const colors = getStatusColor(job.progress.color);
        return (
          <Box
            sx={{
              display: 'inline-flex',
              px: 2,
              py: 1,
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: colors.background,
              color: colors.text
            }}
          >
            {job.progress.label}
          </Box>
        );
      }
    },
    {
      id: 'worker' as keyof RecentJob,
      label: t('dashboard.table.worker'),
      minWidth: 150,
      render: (value: unknown) => (
        <Typography variant="body2" color="text.secondary">
          {value as string}
        </Typography>
      )
    },
    {
      id: 'date' as keyof RecentJob,
      label: t('dashboard.table.date'),
      minWidth: 120,
      render: (value: unknown) => (
        <Typography variant="body2" color="text.secondary">
          {format(new Date(value as string), 'MMM d, yyyy')}
        </Typography>
      )
    }
  ];

  return (
    <Card sx={{ 
      border: 'none',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      borderRadius: '0.5rem'
    }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 6, pb: 2 }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 600,
            color: 'text.primary',
            mb: 1
          }}>
            {t('dashboard.recentJobs.title')}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: 'text.secondary'
          }}>
            {t('dashboard.recentJobs.description')}
          </Typography>
        </Box>
        
        <Box sx={{ p: 6, pt: 2 }}>
          {jobs && jobs.length > 0 ? (
            <DataTable
              data={jobs}
              columns={columns}
              searchable={false}
              filterable={false}
              sortable={true}
              paginated={false}
              apiMode={false}
              loading={loading}
              getRowStyle={() => ({
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.hover'
                }
              })}
            />
          ) : (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              py: 4,
              flexDirection: 'column',
              gap: 1
            }}>
              <Typography variant="body1" color="text.secondary">
                {t('dashboard.recentJobs.noJobs')}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

