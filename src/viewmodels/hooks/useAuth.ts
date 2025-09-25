'use client';

import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import type { AuthUser, LoginCredentials } from '../../services/auth';

export interface UseAuthResult {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export const useAuth = (): UseAuthResult => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loginLoading, setLoginLoading] = useState(false);

  const loading = status === 'loading' || loginLoading;
  const isAuthenticated = !!session?.user;

  const user: AuthUser | null = session?.user ? session.user as AuthUser : null;

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setLoginLoading(true);
    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Redirect to home on success
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      };
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Use signOut without options first to avoid API issues
      await signOut();
    } catch {
      // Fallback: clear session and redirect manually
      router.push('/login');
      // Force page reload to clear any cached session
      window.location.href = '/login';
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  };
}; 