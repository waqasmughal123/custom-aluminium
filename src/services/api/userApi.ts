import type { User, CreateUserRequest, UpdateUserRequest, UserFilters } from '../../models/User';
import type { PaginatedResponse, QueryParams } from '../../utils/types/api';
import { apiClient } from './client';

export class UserApiService {
  private readonly basePath = '/api/users';

  async getUsers(filters?: UserFilters & QueryParams): Promise<PaginatedResponse<User>> {
    return await apiClient.get<PaginatedResponse<User>>(
      this.basePath,
      { params: filters }
    );
  }

  async getUserById(id: string): Promise<User> {
    return await apiClient.get<User>(`${this.basePath}/${id}`);
  }

  async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>(`${this.basePath}/me`);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return await apiClient.post<User, CreateUserRequest>(
      this.basePath,
      userData
    );
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    return await apiClient.patch<User, UpdateUserRequest>(
      `${this.basePath}/${id}`,
      userData
    );
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  async activateUser(id: string): Promise<User> {
    return await apiClient.patch<User>(
      `${this.basePath}/${id}/activate`
    );
  }

  async deactivateUser(id: string): Promise<User> {
    return await apiClient.patch<User>(
      `${this.basePath}/${id}/deactivate`
    );
  }

  async resetUserPassword(id: string): Promise<void> {
    await apiClient.post<void>(`${this.basePath}/${id}/reset-password`);
  }
}

// Create singleton instance
export const userApiService = new UserApiService(); 