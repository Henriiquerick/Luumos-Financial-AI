'use client';
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { User } from 'firebase/auth';

export interface UserProfile {
  uid: string;
  email?: string;
  onboardingCompleted?: boolean;
  aiPersonality?: string;
  aiKnowledgeLevel?: string;
  updatedAt?: any;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  city?: string;
  jobTitle?: string;
  company?: string;
  dailyCredits?: number;
  lastCreditReset?: any;
  adsWatchedToday?: number;
  isAdmin?: boolean;
}

/**
 * Hook centralizado para gerenciar o estado do Usuário (Auth) e seu Perfil (Firestore).
 * Essencial para fluxos de redirecionamento e proteção de rotas.
 */
export function useUserProfile() {
  const { auth, firestore: db } = initializeFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Monitora o estado de autenticação (Firebase Auth)
  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    };

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      
      // Se não houver usuário logado, paramos o loading aqui
      if (!currentUser) {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // 2. Busca o perfil detalhado no Firestore se o usuário estiver logado
  useEffect(() => {
    // Se não há usuário logado ou o DB não iniciou, não há perfil para buscar
    if (!user || !db) {
        return;
    };

    const userRef = doc(db, 'users', user.uid);
    
    // Escuta o documento em tempo real para reagir a mudanças no onboarding
    const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setProfile({ uid: user.uid, ...docSnapshot.data() } as UserProfile);
      } else {
        console.warn("ℹ️ useUserProfile: Documento não encontrado. Usuário pode ser novo.");
        setProfile(null);
      }
      // Marcar como carregado apenas após a tentativa de busca no Firestore
      setIsLoading(false);
    }, (error) => {
      console.error("❌ useUserProfile: Erro ao buscar perfil:", error);
      setProfile(null);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, db]);

  return { user, profile, isLoading };
}
