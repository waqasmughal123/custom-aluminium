'use client';

import React from 'react';
import InputText, { type InputTextProps } from './InputText';

export interface EmailFieldProps extends Omit<InputTextProps, 'type' | 'error' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
}

export const EmailField: React.FC<EmailFieldProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label = 'Email',
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <InputText
      type="email"
      value={value}
      onChange={handleChange}
      helperText={error}
      disabled={disabled}
      label={label}
      // startIcon={<EmailIcon />}
      {...props}
    />
  );
}; 