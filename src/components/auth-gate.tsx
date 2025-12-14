// src/components/auth-gate.tsx
'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase/provider';
import { useRouter, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If auth is done loading and there's no user, redirect to login.
    if (!isUserLoading && !user && pathname !== '/') {
      router.push('/');
    }
  }, [user, isUserLoading, router, pathname]);

  // While checking auth state, show a loading skeleton.
  if (isUserLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
        <div className="w-full max-w-7xl space-y-8">
          <Skeleton className="h-16 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-12 w-1/4 mx-auto" />
        </div>
      </main>
    );
  }

  // If there's a user, render the children (the main app).
  if (user) {
    return <>{children}</>;
  }

  // If no user and on the login page, let the login page render.
  if (!user && pathname === '/') {
    return null; // Or you could render the login page children if it was structured that way.
  }
  
  // This is a fallback state, might show briefly during redirection.
  return null;
}
