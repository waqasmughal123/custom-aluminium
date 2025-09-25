'use client';

import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import React from 'react';
import type { BaseComponentProps } from '@/utils/types';

interface AuthSessionProviderProps extends BaseComponentProps {
  session?: Session | null;
}

export const AuthSessionProvider: React.FC<AuthSessionProviderProps> = ({
  children,
  session,
}) => {
  return (
    <SessionProvider session={session as Session & { expires: string } | null}>
      {children}
    </SessionProvider>
  );
}; 