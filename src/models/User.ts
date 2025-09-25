import { BaseModel } from './index';

export interface User extends BaseModel {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  avatar?: string;
  isActive: boolean;
  role: UserRole;
  lastLogin?: string;
}

export interface CreateUserRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive?: boolean;
  role?: UserRole;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  search?: string;
}

export type UserRole = 'admin' | 'manager' | 'employee' | 'customer';

export interface UserProfile extends User {
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
  };
  permissions: string[];
} 