'use client';

import { Menu } from '@mui/icons-material';
import { AppBar, Toolbar, IconButton, Box, Avatar, Tooltip, Popover, Typography, Paper, Divider } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

interface NavbarProps {
  toggleSidebarWidth?: () => void;
  isSidebarCollapsed?: boolean;
}

export function Navbar({ toggleSidebarWidth, isSidebarCollapsed = false }: NavbarProps) {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleUserClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'user-popover' : undefined;

  const userInitial = (session?.user as { name?: string })?.name?.[0] || 
                     session?.user?.email?.[0] || 
                     'U';

  return (
    <AppBar 
      position="fixed" 
      color="secondary"
      sx={{ 
        left: { xs: 0, md: isSidebarCollapsed ? '50px' : '200px' },
        width: { xs: '100%', md: `calc(100% - ${isSidebarCollapsed ? '50px' : '200px'})` },
        boxShadow: 1,
        transition: 'all 0.2s ease-in-out',
        backdropFilter: 'blur(10px)',
        backgroundColor: 'secondary.main',
        zIndex: (theme) => theme.zIndex.drawer - 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <IconButton 
          color="inherit" 
          onClick={toggleSidebarWidth}
          edge="start"
          sx={{ display: { xs: 'none', md: 'flex' } }}
        >
          <Menu />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Account settings">
            <IconButton 
              onClick={handleUserClick}
              size="small"
              aria-describedby={id}
            >
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.main',
                  width: 38,
                  height: 38,
                  color: 'primary.contrastText',
                  fontWeight: 'medium',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}
              >
                {userInitial}
              </Avatar>
            </IconButton>
          </Tooltip>
          
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1.5,
                overflow: 'visible',
                width: 220,
                borderRadius: 1,
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: -10,
                  right: 15,
                  width: 20,
                  height: 20,
                  bgcolor: 'background.paper',
                  transform: 'rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            <Paper sx={{ p: 2, borderRadius: 1 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {(session?.user as { name?: string })?.name || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                {session?.user?.email || ''}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary">
                {(session?.user as { role?: string })?.role === 'admin' ? 'Administrator' : 'User'}
              </Typography>
            </Paper>
          </Popover>
        </Box>
      </Toolbar>
    </AppBar>
  );
} 