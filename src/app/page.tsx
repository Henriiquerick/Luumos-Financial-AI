"use client";

import { useState, useEffect } from 'react';
import Dashboard from '@/components/dashboard';
import { PersonaOnboarding } from '@/components/persona-onboarding';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const storedPreference = localStorage.getItem('user_persona_preference');
    setShowOnboarding(storedPreference === null);
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (showOnboarding === null) {
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
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8">
      {showOnboarding ? (
        <PersonaOnboarding onComplete={handleOnboardingComplete} />
      ) : (
        <Dashboard />
      )}
    </main>
  );
}
