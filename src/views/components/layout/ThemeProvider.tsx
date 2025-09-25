'use client';

import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import React from 'react';
import { theme } from '@/utils/constants/theme';
import { BaseComponentProps } from '@/utils/types';

interface CustomThemeProviderProps extends BaseComponentProps {
  children: React.ReactNode;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ 
  children 
}) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}; 