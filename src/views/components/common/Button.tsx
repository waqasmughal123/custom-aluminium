import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import React from 'react';
import { BaseComponentProps } from '@/utils/types';

interface ButtonProps extends BaseComponentProps, Omit<MuiButtonProps, 'className'> {
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  loading = false,
  disabled = false,
  fullWidth = false,
  ...props
}) => {
  return (
    <MuiButton
      className={className}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </MuiButton>
  );
}; 