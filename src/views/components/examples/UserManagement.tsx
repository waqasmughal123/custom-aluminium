'use client';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonOff as DeactivateIcon,
  PersonAdd as ActivateIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {
  Box,
  Typography,
  Button as MuiButton,
  TextField,
  Stack,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import React, { useState } from 'react';
import type { User, CreateUserRequest, UserRole } from '@/models/User';
import type { BaseComponentProps } from '@/utils/types';
import { useInvalidateQuery } from '@/viewmodels/hooks/useApi';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useToggleUserStatus,
  userQueryKeys,
} from '@/viewmodels/hooks/useUsers';
import { Loader } from '../common/Loader';

export const UserManagement: React.FC<BaseComponentProps> = ({ className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Query filters
  const filters = {
    search: searchTerm || undefined,
    role: selectedRole || undefined,
    page: 1,
    limit: 10,
  };

  // React Query hooks
  const { data: usersData, isLoading, error, refetch } = useUsers(filters);
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const { activate: activateUser, deactivate: deactivateUser } = useToggleUserStatus();
  const { invalidateQuery } = useInvalidateQuery();

  const users = usersData?.data || [];
  const pagination = usersData?.pagination;

  const handleCreateUser = async (userData: CreateUserRequest) => {
    try {
      await createUserMutation.mutateAsync(userData);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleUpdateUser = async (id: string, userData: Partial<User>) => {
    try {
      await updateUserMutation.mutateAsync({ id, data: userData });
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUserMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      if (user.isActive) {
        await deactivateUser.mutateAsync(user.id);
      } else {
        await activateUser.mutateAsync(user.id);
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleRefresh = () => {
    invalidateQuery(userQueryKeys.lists());
    refetch();
  };

  if (error) {
    return (
      <Box className={className} sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load users: {error.message}
        </Alert>
        <MuiButton variant="outlined" onClick={handleRefresh} startIcon={<RefreshIcon />}>
          Try Again
        </MuiButton>
      </Box>
    );
  }

  return (
    <Box className={className} sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <MuiButton
            variant="outlined"
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
            disabled={isLoading}
          >
            Refresh
          </MuiButton>
          <MuiButton
            variant="contained"
            onClick={() => setIsCreateDialogOpen(true)}
            startIcon={<AddIcon />}
          >
            Add User
          </MuiButton>
        </Stack>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Search users"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            select
            label="Role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            sx={{ minWidth: 150 }}
            SelectProps={{ native: true }}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
            <option value="customer">Customer</option>
          </TextField>
        </Stack>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{user.username}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      color={
                        user.role === 'admin' ? 'error' :
                        user.role === 'manager' ? 'warning' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={user.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? (
                      new Date(user.lastLogin).toLocaleDateString()
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Never
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => setEditingUser(user)}
                          disabled={updateUserMutation.isPending}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleUserStatus(user)}
                          disabled={activateUser.isPending || deactivateUser.isPending}
                        >
                          {user.isActive ? <DeactivateIcon /> : <ActivateIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deleteUserMutation.isPending}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Info */}
      {pagination && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Showing {users.length} of {pagination.total} users
            (Page {pagination.page} of {pagination.totalPages})
          </Typography>
        </Box>
      )}

      {/* Create User Dialog */}
      <CreateUserDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateUser}
        isLoading={createUserMutation.isPending}
      />

      {/* Edit User Dialog */}
      {editingUser && (
        <EditUserDialog
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={(data) => handleUpdateUser(editingUser.id, data)}
          isLoading={updateUserMutation.isPending}
        />
      )}

      {/* Loading overlay for mutations */}
      <Loader
        open={
          createUserMutation.isPending ||
          updateUserMutation.isPending ||
          deleteUserMutation.isPending ||
          activateUser.isPending ||
          deactivateUser.isPending
        }
        variant="minimal"
        message="Processing..."
      />
    </Box>
  );
};

// Create User Dialog Component
interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserRequest) => void;
  isLoading: boolean;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'employee',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof CreateUserRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              required
              fullWidth
            />
            <TextField
              label="Username"
              value={formData.username}
              onChange={handleChange('username')}
              required
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                required
                fullWidth
              />
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                required
                fullWidth
              />
            </Stack>
            <TextField
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange('password')}
              required
              fullWidth
            />
            <TextField
              select
              label="Role"
              value={formData.role}
              onChange={handleChange('role')}
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
              <option value="customer">Customer</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={onClose} disabled={isLoading}>
            Cancel
          </MuiButton>
          <MuiButton type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create User'}
          </MuiButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

// Edit User Dialog Component  
interface EditUserDialogProps {
  user: User;
  onClose: () => void;
  onSubmit: (data: Partial<User>) => void;
  isLoading: boolean;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit User: {user.firstName} {user.lastName}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
                fullWidth
              />
            </Stack>
            <TextField
              select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
              <option value="customer">Customer</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={onClose} disabled={isLoading}>
            Cancel
          </MuiButton>
          <MuiButton type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Update User'}
          </MuiButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 