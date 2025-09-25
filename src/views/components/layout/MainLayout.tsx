'use client';

import { Box } from '@mui/material';
import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  className = '' 
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        minHeight: '100vh',
      }}
    >
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
      
              <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            ml: { xs: 0, md: isSidebarCollapsed ? '50px' : '200px' },
            // transition: 'margin-left 0.2s ease-in-out',
          }}
        >
        <Navbar 
          toggleSidebarWidth={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: '64px', // AppBar height
            display: 'flex',
            flexDirection: 'column',
            width: { 
              xs: '100%', 
              md: isSidebarCollapsed ? 'calc(100vw - 50px)' : 'calc(100vw - 200px)' 
            },
            maxWidth: { 
              xs: '100%', 
              md: isSidebarCollapsed ? 'calc(100vw - 50px)' : 'calc(100vw - 200px)' 
            },
            overflow: 'hidden'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}; 