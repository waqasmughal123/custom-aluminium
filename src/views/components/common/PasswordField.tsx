'use client';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { IconButton } from '@mui/material';
import React, { useState } from 'react';
import InputText, { type InputTextProps } from './InputText';

export interface PasswordFieldProps extends Omit<InputTextProps, 'type' | 'error' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label = 'Password',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <InputText
      type={showPassword ? 'text' : 'password'}
      value={value}
      onChange={handleChange}
      helperText={error}
      disabled={disabled}
      label={label}
      endIcon={
        <IconButton
          onClick={togglePasswordVisibility}
          edge="end"
          disabled={disabled}
          size="small"
        >
          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </IconButton>
      }
      {...props}
    />
  );
}; 