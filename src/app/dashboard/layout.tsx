'use client';
import { useUserProfile } from '@/hooks/use-user-profile'; 
import { useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react'; 
import { Loader2 } from 'lucide-react';

/**
 * Layout do Dashboard que atua como uma guarda de rota (Route Guard).
 * Verifica se o usuário está autenticado e se possui um perfil completo no Firestore.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) { 
    const { user, profile, isLoading } = useUserProfile(); 
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        // Só tomamos decisão após o carregamento inicial do Firebase Auth e Firestore
        if (!isLoading && !isNavigating) {
            // Caso 1: Usuário não está nem logado no Firebase Auth
            if (!user) {
                console.log("🚫 Usuário não autenticado. Redirecionando para login...");
                setIsNavigating(true);
                router.push('/');
                return;
            }

            // Caso 2: Usuário logado mas sem documento no Firestore ou onboarding incompleto
            if (!profile || !profile.onboardingCompleted) {
                console.log("✨ Perfil incompleto. Redirecionando para Onboarding...");
                setIsNavigating(true);
                router.push('/onboarding');
            }
        }
    }, [user, profile, isLoading, router, isNavigating]);

    // Bug 2 Fix: Evita que o loader fique "preso" se já iniciamos a navegação
    // Enquanto carrega os dados ou enquanto o redirecionamento acontece,
    // exibimos um loader centralizado para evitar a "tela preta/em branco"
    if (isLoading || (user && !profile && !isNavigating)) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-center p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground animate-pulse">Preparando seu ambiente financeiro...</p>
            </div>
        );
    }
    
    // Se estivermos em processo de navegação para fora do dashboard, mantemos um estado limpo
    if (isNavigating) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-center p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Redirecionando...</p>
            </div>
        );
    }

    // Se passou pelas guardas, renderiza o dashboard
    return <>{children}</>; 
}
