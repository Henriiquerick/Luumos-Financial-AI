
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

export function useUserProfile() {
  const { auth, firestore: db } = initializeFirebase();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Detecta o Usuário Auth
  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    };
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // 2. Busca o Documento do Firestore
  useEffect(() => {
    if (!user || !db) {
        // Se não há usuário, a "carga" terminou.
        if (!user) setIsLoading(false);
        return;
    };

    const userRef = doc(db, 'users', user.uid);
    // Escuta em tempo real
    const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setProfile({ uid: user.uid, ...docSnapshot.data() } as UserProfile);
      } else {
        console.warn("⚠️ Documento de usuário não encontrado no Firestore.");
        setProfile(null);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Erro ao buscar perfil:", error);
      setProfile(null);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, db]);

  return { user, profile, isLoading };
}
