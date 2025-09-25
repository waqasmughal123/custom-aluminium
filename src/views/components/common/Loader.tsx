'use client';

import { Build } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  useTheme,
  keyframes,
} from '@mui/material';
import React from 'react';
import type { BaseComponentProps } from '@/utils/types';

interface LoaderProps extends BaseComponentProps {
  open?: boolean;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'circular' | 'brand' | 'minimal';
}

// Premium animations
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

export const Loader: React.FC<LoaderProps> = ({
  open = true,
  message = 'Loading...',
  size = 'medium',
  variant = 'brand',
  className = '',
}) => {
  const theme = useTheme();

  // Size configurations
  const sizeConfig = {
    small: { progress: 32, icon: 40, typography: 'body2' as const },
    medium: { progress: 48, icon: 60, typography: 'h6' as const },
    large: { progress: 64, icon: 80, typography: 'h5' as const },
  };

  const config = sizeConfig[size];

  if (!open) return null;

  const renderCircularLoader = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <CircularProgress
        size={config.progress}
        thickness={4}
        sx={{
          color: 'primary.main',
          animation: `${pulse} 2s ease-in-out infinite`,
        }}
      />
      {message && (
        <Typography
          variant={config.typography}
          color="text.secondary"
          sx={{
            fontWeight: 500,
            animation: `${shimmer} 2s ease-in-out infinite`,
            background: `linear-gradient(90deg, 
              ${theme.palette.text.secondary} 0%, 
              ${theme.palette.primary.main} 50%, 
              ${theme.palette.text.secondary} 100%)`,
            backgroundSize: '200px 100%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  const renderBrandLoader = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
      }}
    >
      {/* Brand Icon with Premium Animation */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer spinning ring */}
        <Box
          sx={{
            position: 'absolute',
            width: config.progress + 20,
            height: config.progress + 20,
            border: `3px solid ${theme.palette.primary.main}20`,
            borderTop: `3px solid ${theme.palette.primary.main}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        />
        
        {/* Inner pulsing ring */}
        <Box
          sx={{
            position: 'absolute',
            width: config.progress,
            height: config.progress,
            border: `2px solid ${theme.palette.secondary.main}40`,
            borderRadius: '50%',
            animation: `${pulse} 2s ease-in-out infinite`,
          }}
        />
        
        {/* Brand Icon */}
        <Build
          sx={{
            fontSize: config.icon,
            color: 'primary.main',
            animation: `${float} 3s ease-in-out infinite`,
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
          }}
        />
      </Box>

      {/* Brand Message */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          Custom Aluminium
        </Typography>
        {message && (
          <Typography
            variant={config.typography}
            color="text.secondary"
            sx={{
              fontWeight: 500,
              animation: `${shimmer} 2s ease-in-out infinite`,
              background: `linear-gradient(90deg, 
                ${theme.palette.text.secondary} 0%, 
                ${theme.palette.primary.main} 50%, 
                ${theme.palette.text.secondary} 100%)`,
              backgroundSize: '200px 100%',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Box>
  );

  const renderMinimalLoader = () => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 3,
        py: 2,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: theme.shadows[8],
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <CircularProgress size={24} thickness={4} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'circular':
        return renderCircularLoader();
      case 'brand':
        return renderBrandLoader();
      case 'minimal':
        return renderMinimalLoader();
      default:
        return renderBrandLoader();
    }
  };

  return (
    <Backdrop
      open={open}
      className={className}
      sx={{
        color: '#fff',
        zIndex: 9999, // High z-index to appear on top
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {renderLoader()}
    </Backdrop>
  );
}; 