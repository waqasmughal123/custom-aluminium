import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import type { Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';

import './types';

interface AuthUser {
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
  accessToken?: string;
  refreshToken?: string;
}

interface AuthSession {
  user: AuthUser;
  accessToken?: string;
  refreshToken?: string;
}

interface AuthToken {
  id?: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  role?: string;
  roleDisplay?: string;
  dateJoined?: string;
  isActive?: boolean;
  accessToken?: string;
  refreshToken?: string;
}

const authConfig = {
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    authorized({ auth, request }: { auth: Session | null, request: NextRequest }) {
      const isLoggedIn = !!(auth as AuthSession)?.user;
      const isOnProtectedRoute = !request.nextUrl.pathname.startsWith('/login');
      
      if (isOnProtectedRoute) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', request.nextUrl));
      }
      return true;
    },
    jwt({ token, user }: { token: JWT, user: User | undefined }) {
      if (user) {
        const authUser = user as AuthUser;
        const authToken = token as AuthToken;
        
        authToken.id = authUser.id;
        authToken.email = authUser.email;
        authToken.name = authUser.name;
        authToken.firstName = authUser.firstName;
        authToken.lastName = authUser.lastName;
        authToken.fullName = authUser.fullName;
        authToken.role = authUser.role;
        authToken.roleDisplay = authUser.roleDisplay;
        authToken.dateJoined = authUser.dateJoined;
        authToken.isActive = authUser.isActive;
        authToken.accessToken = authUser.accessToken;
        authToken.refreshToken = authUser.refreshToken;
      }
      return token;
    },
    session({ session, token }: { session: Session, token: JWT }) {
      if (token) {
        const authToken = token as AuthToken;
        const authSession = session as AuthSession;
        
        authSession.user.id = authToken.id || '';
        authSession.user.email = authToken.email || '';
        authSession.user.name = authToken.name || '';
        authSession.user.firstName = authToken.firstName;
        authSession.user.lastName = authToken.lastName;
        authSession.user.fullName = authToken.fullName;
        authSession.user.role = authToken.role;
        authSession.user.roleDisplay = authToken.roleDisplay;
        authSession.user.dateJoined = authToken.dateJoined;
        authSession.user.isActive = authToken.isActive;
          authSession.accessToken = authToken.accessToken;
        authSession.refreshToken = authToken.refreshToken;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { email, password } = credentials as { email: string; password: string };
          
          const apiUrl = process.env.NEXT_PUBLIC_DJANGO_API_URL;
          
          console.log('Docker Debug - API URL:', apiUrl);
          
          if (!apiUrl) {
            console.log('Docker Debug - No API URL found');
            return null;
          }
          
          const requestBody = {
            email: email,
            password,
          };

          console.log('Docker Debug - Request URL:', `${apiUrl}/api/auth/login/`);
          console.log('Docker Debug - Request Body:', requestBody);
          
          const response = await fetch(`${apiUrl}/api/auth/login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          console.log('Docker Debug - Response Status:', response.status);
          console.log('Docker Debug - Response OK:', response.ok);

          if (!response.ok) {
            const errorText = await response.text();
            console.log('Docker Debug - Error Response:', errorText);
            return null;
          }

          const data = await response.json();
          
          // Handle Django response structure: { user: {...}, access: "...", refresh: "..." }
          if (!data.user) {
            return null;
          }
          
          const user = data.user;
          
          const nextAuthUser: AuthUser = {
            id: user.id.toString(),
            email: user.email,
            name: user.full_name || `${user.first_name} ${user.last_name}`.trim() || user.email.split('@')[0],
            firstName: user.first_name,
            lastName: user.last_name,
            fullName: user.full_name,
            role: user.role,
            roleDisplay: user.role_display,
            dateJoined: user.date_joined,
            isActive: user.is_active,
            accessToken: data.access,
            refreshToken: data.refresh,
          };
          
          return nextAuthUser;
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
};

// @ts-expect-error - NextAuth version compatibility issue
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig); 