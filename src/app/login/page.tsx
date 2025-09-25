'use client';

import React from 'react';
import  {Login}  from '../../components/login/page';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  // LoginForm now handles authentication internally via NextAuth
  return <Login />;
} 