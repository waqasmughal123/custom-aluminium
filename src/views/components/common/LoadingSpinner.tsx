"use client";

import { 
  Backdrop, 
  CircularProgress, 
  Typography 
} from '@mui/material';
import React from 'react';

export interface LoadingSpinnerProps {
  open: boolean;
  message?: string;
  size?: number;
  zIndex?: number;
}

export default function LoadingSpinner({ 
  open, 
  message = "Loading...", 
  size = 40,
  zIndex = 10000 
}: LoadingSpinnerProps) {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: zIndex,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
      open={open}
    >
      <CircularProgress color="primary" size={size} />
      {message && (
        <Typography variant="body1" color="inherit" textAlign="center">
          {message}
        </Typography>
      )}
    </Backdrop>
  );
}
