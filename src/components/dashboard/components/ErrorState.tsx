'use client';

import { Warning as WarningIcon } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      p: 4 
    }}>
      <Box sx={{ 
        mb: 2, 
        borderRadius: '50%', 
        bgcolor: 'error.100', 
        p: 1.5 
      }}>
        <WarningIcon sx={{ fontSize: 32, color: 'error.main' }} />
      </Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        {t('dashboard.errors.loadingTitle')}
      </Typography>
      <Typography sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
        {error?.message || t('common.unknownError')}
      </Typography>
      <Button 
        variant="contained" 
        onClick={onRetry}
      >
        {t('common.tryAgain')}
      </Button>
    </Box>
  );
}

