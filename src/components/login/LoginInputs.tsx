'use client';

import { Stack } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmailField, PasswordField } from '@/views/components/common';

interface LoginInputsProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  emailError?: string;
  passwordError?: string;
  disabled?: boolean;
}

export const LoginInputs: React.FC<LoginInputsProps> = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  emailError,
  passwordError,
  disabled = false,
}) => {
  const { t } = useTranslation();
  
  return (
    <Stack spacing={3}>
      <EmailField
        value={email}
        onChange={onEmailChange}
        error={emailError}
        disabled={disabled}
        label={t('login.email')}
      />
      
      <PasswordField
        value={password}
        onChange={onPasswordChange}
        error={passwordError}
        disabled={disabled}
        label={t('login.password')}
      />
    </Stack>
  );
}; 