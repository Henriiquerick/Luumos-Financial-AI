'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Funções utilitárias mantidas
import {
  setDocumentNonBlocking,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from './non-blocking-updates';

// Variáveis globais para cache do SDK (Singleton Pattern)
let firebaseApp: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

export function initializeFirebase() {
  // Se já inicializamos antes, retorna as instâncias cacheadas
  if (firebaseApp) {
    return { firebaseApp, auth, firestore };
  }

  // Se o Firebase já foi inicializado por outra via (ex: SSR), recupera a instância
  if (getApps().length > 0) {
    firebaseApp = getApp();
    auth = getAuth(firebaseApp);
    firestore = getFirestore(firebaseApp);
    return { firebaseApp, auth, firestore };
  }

  // Validação de Segurança
  if (!firebaseConfig.apiKey) {
    console.error("⚠️ Firebase Config inválida ou ausente. Verifique o .env.local");
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // INICIALIZAÇÃO LIMPA (PRODUÇÃO)
  // Sem emuladores, sem configurações complexas de debug.
  firebaseApp = initializeApp(firebaseConfig);
  
  // Configura Autenticação com Persistência Local (Vital para não deslogar no reload)
  auth = getAuth(firebaseApp);
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Erro ao definir persistência de auth:", error);
  });

  firestore = getFirestore(firebaseApp);

  console.log("🔥 Firebase inicializado (Modo Produção)");

  return {
    firebaseApp,
    auth,
    firestore,
  };
}

// Função auxiliar para obter SDKs já prontos
export function getSdks(app: FirebaseApp | null) {
  if (!app) return initializeFirebase();
  return {
    firebaseApp: app,
    auth: getAuth(app),
    firestore: getFirestore(app)
  };
}

// Exports mantidos conforme seu projeto original
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

export {
  setDocumentNonBlocking,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
};