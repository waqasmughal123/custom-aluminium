'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner } from '@/views/components/common';

export default function LoadingState() {
  const { t } = useTranslation();

  return (
    <LoadingSpinner 
      open={true}
      message={t('dashboard.loading.message')}
      size={64}
      zIndex={1000}
    />
  );
}
