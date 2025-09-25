declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
  }

  interface User {
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

  interface JWT {
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
} 