// src/components/auth-gate.tsx
'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@/firebase/provider';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    // If auth is initialized, not loading, and there's no user, sign in anonymously.
    if (auth && !isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [auth, user, isUserLoading]);

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

  // Fallback, though should be brief as sign-in is initiated.
  return null;
}
