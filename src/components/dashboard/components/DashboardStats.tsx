'use client';

import {
  People as PeopleIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { DashboardStats as DashboardStatsType } from '@/services/api/dashboardApi';

interface DashboardStatsProps {
  stats: DashboardStatsType;
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  // Navigation handlers for each metric card
  const handleCardClick = (cardType: string) => {
    switch (cardType) {
      case 'totalWorkers':
        // Navigate to workers page
        router.push('/worker/list');
        break;
      case 'activeJobs':
        // Navigate to jobs page with active status filter
        router.push('/job/list?status=IN_PROGRESS');
        break;
      case 'completedJobs':
        // Navigate to jobs page with completed status filter
        router.push('/job/list?status=COMPLETE');
        break;
      case 'pendingTasks':
        // Navigate to jobs page with pending status filter
        router.push('/job/list?status=NOT_STARTED');
        break;
      default:
        // For efficiency rate and issues, just navigate to jobs list
        router.push('/job/list');
        break;
    }
  };

  const statsConfig = [
    { 
      id: 'totalWorkers',
      name: t('dashboard.stats.totalWorkers'),
      value: stats.total_workers.toString(),
      change: t('dashboard.stats.activeWorkers', { count: stats.active_workers }),
      icon: <PeopleIcon sx={{ fontSize: 20 }} />,
      clickable: true,
    },
    {
      id: 'activeJobs',
      name: t('dashboard.stats.activeJobs'),
      value: stats.active_jobs.toString(),
      change: t('dashboard.stats.inProgress'),
      icon: <WorkIcon sx={{ fontSize: 20 }} />,
      clickable: true,
    },
    {
      id: 'completedJobs',
      name: t('dashboard.stats.completedJobs'),
      value: stats.completed_jobs.toString(),
      change: t('dashboard.stats.totalCompleted'),
      icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
      clickable: true,
    },
    {
      id: 'pendingTasks',
      name: t('dashboard.stats.pendingTasks'),
      value: stats.pending_tasks.toString(),
      change: t('dashboard.stats.awaitingAction'),
      icon: <ScheduleIcon sx={{ fontSize: 20 }} />,
      clickable: true,
    },
    {
      id: 'efficiencyRate',
      name: t('dashboard.stats.efficiencyRate'),
      value: `${stats.efficiency_rate}%`,
      change: t('dashboard.stats.completionRate'),
      icon: <TrendingUpIcon sx={{ fontSize: 20 }} />,
      clickable: false,
    },
    {
      id: 'issues',
      name: t('dashboard.stats.issues'),
      value: stats.issues.toString(),
      change: t('dashboard.stats.highPriority'),
      icon: <WarningIcon sx={{ fontSize: 20 }} />,
      clickable: false,
    },
  ];

  return (
    <Box sx={{ 
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        lg: 'repeat(3, 1fr)'
      },
      gap: 4
    }}>
      {statsConfig.map((stat, index) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card 
            onClick={stat.clickable ? () => handleCardClick(stat.id) : undefined}
            sx={{ 
              border: 'none',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
              borderRadius: '0.5rem',
              cursor: stat.clickable ? 'pointer' : 'default',
              transition: 'all 0.2s ease-in-out',
              '&:hover': stat.clickable ? {
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                transform: 'translateY(-2px)',
              } : {},
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                pb: 2,
                mb: 0
              }}>
                <Typography variant="h6" sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'text.primary'
                }}>
                  {stat.name}
                </Typography>
                <Box sx={{ 
                  borderRadius: '50%', 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  p: 1,
                  color: 'primary.main'
                }}>
                  {stat.icon}
                </Box>
              </Box>
              <Typography variant="h3" sx={{ 
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'text.primary',
                mb: 1
              }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" sx={{ 
                fontSize: '0.75rem',
                color: 'text.secondary'
              }}>
                {stat.change}
              </Typography>
              {stat.clickable && (
                <Typography variant="caption" sx={{ 
                  fontSize: '0.6875rem',
                  color: 'primary.main',
                  fontWeight: 500,
                  mt: 1,
                  display: 'block'
                }}>
                  Click to view details →
                </Typography>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </Box>
  );
}

