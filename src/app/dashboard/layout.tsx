'use client';
import { useUserProfile } from '@/hooks/use-user-profile'; 
import { useRouter } from 'next/navigation'; 
import { useEffect } from 'react'; 
import { Loader2 } from 'lucide-react';

/**
 * Layout do Dashboard que atua como uma guarda de rota (Route Guard).
 * Verifica se o usuário está autenticado e se possui um perfil completo no Firestore.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) { 
    const { user, profile, isLoading } = useUserProfile(); 
    const router = useRouter();

    useEffect(() => {
        // Só tomamos decisão após o carregamento inicial do Firebase Auth e Firestore
        if (!isLoading) {
            // Caso 1: Usuário não está nem logado no Firebase Auth
            if (!user) {
                console.log("🚫 Usuário não autenticado. Redirecionando para login...");
                router.push('/');
                return;
            }

            // Caso 2: Usuário logado mas sem documento no Firestore ou onboarding incompleto
            // Isso identifica um novo usuário ou alguém que fechou o app no meio do processo
            if (!profile || !profile.onboardingCompleted) {
                console.log("✨ Novo usuário detectado ou perfil incompleto. Redirecionando para Onboarding...");
                router.push('/onboarding');
            }
        }
    }, [user, profile, isLoading, router]);

    // Enquanto carrega os dados ou enquanto o redirecionamento não acontece,
    // exibimos um loader centralizado para evitar a "tela preta/em branco"
    if (isLoading || (user && (!profile || !profile.onboardingCompleted))) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background text-center p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground animate-pulse">Preparando seu ambiente financeiro...</p>
            </div>
        );
    }

    // Se passou pelas guardas, renderiza o dashboard
    return <>{children}</>; 
}
