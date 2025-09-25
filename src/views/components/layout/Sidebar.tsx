'use client';
import { Dashboard, People, ChevronRight, Logout, Work, Assignment, Build } from '@mui/icons-material';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Button, useTheme, Drawer, Tooltip, IconButton } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import React from 'react';



interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const adminRoutes = [
  {
    label: "Dashboard",
    icon: Dashboard,
    href: "/dashboard",
  },
  {
    label: "Jobs",
    icon: Work,
    href: "/job/list",
  },
  // {
  //   label: "Calendar",
  //   icon: DateRange,
  //   href: "/dashboard/calendar",
  // },
  {
    label: "Workers",
    icon: People,
    href: "/worker/list",
  },
  // {
  //   label: "Analytics",
  //   icon: BarChart,
  //   href: "/dashboard/analytics",
  // },
  // {
  //   label: "Settings",
  //   icon: Settings,
  //   href: "/dashboard/settings",
  // },
];

const workerRoutes = [
  {
    label: "My Jobs",
    icon: Work,
    href: "/dashboard/worker-jobs",
  },
  {
    label: "My Tasks",
    icon: Assignment,
    href: "/dashboard/tasks",
  },
  {
    label: "My Processes",
    icon: Build,
    href: "/job-processes",
  },
  // {
  //   label: "Settings",
  //   icon: Settings,
  //   href: "/dashboard/settings",
  // },
];

export function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role;
  const isAdmin = userRole === 'admin';
  const routes = isAdmin ? adminRoutes : workerRoutes;
  const theme = useTheme();

  const drawerWidth = isCollapsed ? 50 : 200;

  return (
    <Drawer
      variant="permanent"
      sx={{
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'secondary.main',
          color: 'secondary.contrastText',
          borderRight: 1,
          borderColor: 'divider',
          transition: 'width 0.2s ease-in-out',
          overflowX: 'hidden',
        },
      }}
      open
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header with Logo */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          px: isCollapsed ? 0.5 : 1.5, 
          py: 2, 
        //   mt: 8, // Space for the AppBar
        }}>
          <Box 
            sx={{ 
              width: isCollapsed ? 35 : 180, 
              height: isCollapsed ? 35 : 45, 
              position: 'relative', 
              transition: 'all 0.2s ease-in-out',
              borderRadius: isCollapsed ? '50%' : 0,
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: isCollapsed ? 'transparent' : 'transparent',
            }}
          >
            <Image
              src={isCollapsed ? "/assets/images/logoicon.png" : "/assets/images/logo.png"}
              alt="Custom Aluminium - Metal Work Specialists"
              fill
              style={{ 
                objectFit: 'contain',
                objectPosition: 'center',
                padding: isCollapsed ? '5px' : '0px',
                transition: 'all 0.2s ease-in-out'
              }}
              priority
            />
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'secondary.contrastText', opacity: 0.1 }} />

        {/* Navigation Links */}
        <Box sx={{ flex: 1, mt: 2, overflowY: 'auto' }}>
          <List component="nav" sx={{ px: 0.5 }}>
            {routes.map((route) => {
              const isActive = pathname === route.href;
              const IconComponent = route.icon;
              return (
                <ListItem 
                  key={route.href}
                  disablePadding
                  sx={{ mb: 0.5 }}
                >
                  <Tooltip 
                    title={isCollapsed ? route.label : ""} 
                    placement="right"
                    arrow
                  >
                    <ListItemButton
                      component={Link}
                      href={route.href}
                      selected={isActive}
                      sx={{
                        minHeight: 44,
                        justifyContent: isCollapsed ? 'center' : 'initial',
                        px: isCollapsed ? 1 : 2,
                        py: 0.75,
                        borderRadius: '8px',
                        backgroundColor: isActive ? 'action.selected' : 'transparent',
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                        },
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ 
                        minWidth: isCollapsed ? 0 : 36,
                        color: isActive ? 'primary.contrastText' : 'secondary.contrastText',
                        opacity: isActive ? 1 : 0.7,
                        mr: isCollapsed ? 0 : 2,
                        justifyContent: 'center'
                      }}>
                        <IconComponent sx={{ fontSize: 20 }} />
                      </ListItemIcon>
                      {!isCollapsed && (
                        <ListItemText 
                          primary={route.label} 
                          primaryTypographyProps={{ 
                            fontSize: '0.875rem',
                            fontWeight: isActive ? 'medium' : 'normal'
                          }} 
                        />
                      )}
                      {!isCollapsed && isActive && (
                        <ChevronRight 
                          sx={{ 
                            fontSize: 18,
                            color: isActive ? theme.palette.primary.contrastText : undefined,
                            opacity: isActive ? 1 : 0
                          }} 
                        />
                      )}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Divider sx={{ borderColor: 'secondary.contrastText', opacity: 0.1 }} />

        {/* Logout Button */}
        <Box sx={{ p: isCollapsed ? 1 : 2, display: 'flex', justifyContent: 'center' }}>
          <Tooltip 
            title="Logout" 
            placement="right"
            disableHoverListener={!isCollapsed}
          >
            {isCollapsed ? (
              <IconButton
                onClick={() => signOut()}
                color="error"
                size="medium"
                sx={{
                  border: '1px solid',
                  borderColor: 'error.main',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'error.main',
                    color: 'error.contrastText',
                  }
                }}
              >
                <Logout sx={{ fontSize: 18 }} />
              </IconButton>
            ) : (
            <Button
              onClick={() => signOut()}
                variant="outlined"
                fullWidth
                startIcon={<Logout sx={{ fontSize: 18 }} />}
                sx={{ 
                  justifyContent: 'flex-start',
                  minWidth: 0,
                  color: 'error.main',
                  borderColor: 'error.main',
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'error.main',
                    color: 'error.contrastText',
                    borderColor: 'error.main',
                  }
                }}
              >
                Logout
            </Button>
            )}
          </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
} 