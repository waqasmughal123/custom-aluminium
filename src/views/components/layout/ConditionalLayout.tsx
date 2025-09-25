'use client';

import { Box } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import { Loader } from '../common';
import { MainLayout } from './MainLayout';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export const ConditionalLayout: React.FC<ConditionalLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // Routes that should not have header/footer (login-only routes)
  const authRoutes = ['/login'];
  const isAuthRoute = pathname ? authRoutes.includes(pathname) : false;
  const isRootRoute = pathname === '/';
  
  useEffect(() => {
    if (status === 'loading') return; // Still loading session
    
    const isLoggedIn = !!session?.user;
    
    // Handle redirects based on authentication state
    if (isRootRoute) {
      if (isLoggedIn) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
      return;
    }
    
    // If user is logged in and tries to access login page, redirect to home
    if (isAuthRoute && isLoggedIn) {
      router.push('/dashboard');
      return;
    }
    
    // If user is not logged in and tries to access protected routes, redirect to login
    if (!isAuthRoute && !isLoggedIn) {
      router.push('/login');
      return;
    }
  }, [session, status, pathname, router, isAuthRoute, isRootRoute]);

  // Handle case where pathname is null (shouldn't happen in normal Next.js usage)
  if (!pathname) {
    return <Loader />;
  }

  if (isAuthRoute || isRootRoute) {
    // Minimal layout for login pages and root route (no header/footer)
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        {children}
      </Box>
    );
  }

  // Show loading while checking authentication for protected routes
  if (status === 'loading') {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: 'background.default',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        suppressHydrationWarning={true}
      >
        <Loader />
      </Box>
    );
  }

  // Full layout with header/footer for authenticated pages
  return <MainLayout>{children}</MainLayout>;
}; 