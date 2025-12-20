'use client';
import { useUserProfile } from '@/hooks/use-user-profile'; 
import { useRouter } from 'next/navigation'; 
import { useEffect } from 'react'; 
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) { 
    const { profile, isLoading } = useUserProfile(); 
    const router = useRouter();

    useEffect(() => { 
        // O Porteiro: Só deixa passar se tiver carregado E tiver a flag true 
        if (!isLoading) { 
            if (!profile?.onboardingCompleted) { 
                console.log("🚫 Acesso negado: Perfil incompleto. Redirecionando..."); 
                router.push('/onboarding'); 
            } else { 
                console.log("✅ Acesso permitido: Onboarding completo."); 
            } 
        } 
    }, [profile, isLoading, router]);

    // Tela de Carregamento enquanto verifica 
    if (isLoading) { 
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

    // Se não tiver perfil (e não estiver carregando), retorna null para evitar flash de conteúdo 
    // O useEffect acima já vai ter disparado o redirect 
    if (!profile?.onboardingCompleted) { 
        return null; 
    }

    // Se passou por tudo, mostra o Dashboard! 
    return <>{children}</>; 
}
