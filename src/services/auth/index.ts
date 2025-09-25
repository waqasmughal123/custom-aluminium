// Type extensions
import './types';

// NextAuth configuration and handlers
export { auth, signIn, signOut, handlers } from './nextauth.config';

// Auth types
export type { Session } from 'next-auth';

// Auth utility types (moved from removed service)
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role?: string;
  roleDisplay?: string;
  dateJoined?: string;
  isActive?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
} 