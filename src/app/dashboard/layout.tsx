'use client';
import { useUserProfile } from '@/hooks/use-user-profile'; 
import { useRouter } from 'next/navigation'; 
import { useEffect } from 'react'; 
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) { 
    const { profile, isLoading } = useUserProfile(); 
    const router = useRouter();

    useEffect(() => {
    if (!isLoading) {
      /* if (!profile || !profile.onboardingCompleted) {
        console.log("🚫 Perfil incompleto. Redirecionando...");
        router.push('/onboarding');
      }
      */
      
      // Apenas log para sabermos o que está acontecendo
      console.log("Status do Perfil:", profile); 
    }
  }, [profile, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    // Permite renderizar SEMPRE
    return <>{children}</>; 
}
