'use client';

import { Container, Typography, Box } from '@mui/material';
import React from 'react';
import { UserManagement } from '../../views/components/examples/UserManagement';

export default function UsersPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          React Query Demo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This page demonstrates the complete React Query setup with MVVM architecture.
          It includes API client, custom hooks, and a full CRUD interface.
        </Typography>
      </Box>
      
      <UserManagement />
    </Container>
  );
} 