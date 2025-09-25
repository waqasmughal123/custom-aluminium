'use client';

import { Box, Typography } from '@mui/material';
import { useSession } from 'next-auth/react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export default function DashboardHeader() {
  const { data: session } = useSession();
  const { t } = useTranslation();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', md: 'row' }, 
      gap: 4, 
      alignItems: { md: 'center' }, 
      justifyContent: { md: 'space-between' } 
    }}>
      <Typography variant="h4" sx={{ 
        fontWeight: 600, 
        color: 'text.primary',
        fontSize: '1.875rem',
        lineHeight: '2.25rem'
      }}>
        {t('dashboard.welcome', { name: session?.user?.name || t('common.user') })}
      </Typography>
    </Box>
  );
}

