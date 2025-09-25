'use client';

import type { User, CreateUserRequest, UpdateUserRequest, UserFilters } from '../../models/User';
import { userApiService } from '../../services/api/userApi';
import { useApiQuery } from './useApi';
import { createEntityCrudHooks } from './useEntityCrud';
import type { EntityApiService } from './useEntityCrud';

// Adapt userApiService to match the generic interface
const userEntityService: EntityApiService<User, CreateUserRequest, UpdateUserRequest, UserFilters> = {
  getAll: userApiService.getUsers.bind(userApiService),
  getById: userApiService.getUserById.bind(userApiService),
  create: userApiService.createUser.bind(userApiService),
  update: userApiService.updateUser.bind(userApiService),
  delete: userApiService.deleteUser.bind(userApiService),
  activate: userApiService.activateUser.bind(userApiService),
  deactivate: userApiService.deactivateUser.bind(userApiService),
  resetPassword: userApiService.resetUserPassword.bind(userApiService),
};

// Create user-specific hooks using the generic factory
const userCrudHooks = createEntityCrudHooks('users', userEntityService);

// Export user-specific hooks with better names
export const userQueryKeys = userCrudHooks.queryKeys;

// Query Hooks
export const useUsers = userCrudHooks.useEntityList;
export const useUser = userCrudHooks.useEntity;

// Add useCurrentUser for backward compatibility
export function useCurrentUser() {
  return useApiQuery(
    userQueryKeys.current(),
    () => userApiService.getCurrentUser(),
    {
      staleTime: 15 * 60 * 1000, // 15 minutes
      retry: 1,
    }
  );
}

// Mutation Hooks
export const useCreateUser = userCrudHooks.useCreateEntity;
export const useUpdateUser = userCrudHooks.useUpdateEntity;
export const useDeleteUser = userCrudHooks.useDeleteEntity;
export const useToggleUserStatus = userCrudHooks.useToggleEntityStatus;
export const useResetUserPassword = userCrudHooks.useResetEntityPassword;
export const useBulkUserOperations = userCrudHooks.useBulkEntityOperations;

// Export the complete hooks object for advanced usage
export const userHooks = userCrudHooks; 