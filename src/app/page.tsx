'use client';

import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const dynamic = 'force-dynamic';

export default function RootPage() {
  const { t } = useTranslation();

  // ConditionalLayout handles all the authentication logic and redirects
  // This component only shows while the redirect is happening
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {t('login.companyName', 'Custom Aluminium')}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mt: 3 }}>
          <CircularProgress size={24} />
          <Typography variant="body1" color="text.secondary">
            {t('common.loading', 'Loading...')}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
