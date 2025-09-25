'use client';

import {
  Snackbar,
  Alert,
  Slide,
  Box,
} from '@mui/material';
import type { SlideProps } from '@mui/material/Slide';
import React from 'react';

// Types
export type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  severity: ToastSeverity;
  duration?: number;
  open: boolean;
  onClose: () => void;
}

export interface ToastContainerProps {
  toasts: ToastProps[];
}

// Slide transition component
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

// Individual Toast component
export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  severity,
  duration = 5000,
  open,
  onClose,
}) => {
  return (
    <Snackbar
      key={id}
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        position: 'relative',
        '& .MuiSnackbar-root': {
          position: 'static',
          transform: 'none',
        },
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          width: '100%',
          '& .MuiAlert-message': {
            fontSize: '0.875rem',
            fontWeight: 500,
          },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

// Toast Container component that manages multiple toasts
export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  if (!toasts.length) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 1,
        maxWidth: 400,
        width: '100%',
        '@media (max-width: 600px)': {
          left: 16,
          right: 16,
          maxWidth: 'none',
        },
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </Box>
  );
}; 