'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import {
  setDocumentNonBlocking,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from './non-blocking-updates'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  // Se já houver uma instância do Firebase, retorna os SDKs existentes.
  if (getApps().length) {
    const existingApp = getApp();
    return getSdks(existingApp);
  }

  // Log de Diagnóstico para verificar as variáveis de ambiente
  console.log("🔥 Diagnóstico Firebase:", {
    apiKeyPresent: !!firebaseConfig.apiKey,
    apiKeyPreview: firebaseConfig.apiKey ? firebaseConfig.apiKey.substring(0, 5) + "..." : "MISSING",
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId
  });


  // Validação Crítica: Verifica se as variáveis de ambiente essenciais estão presentes.
  // Isso só executa no lado do cliente, onde process.env.NEXT_PUBLIC_* está disponível.
  if (!firebaseConfig.apiKey) {
    console.error("⚠️ Firebase Config is missing or incomplete! Check your .env.local file and NEXT_PUBLIC_ variables.");
    // Retorna um objeto com serviços nulos para evitar que o aplicativo quebre.
    // Os hooks useFirebase/useUser tratarão esse estado.
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // Inicializa o Firebase com a configuração validada.
  const firebaseApp = initializeApp(firebaseConfig);
  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp | null) {
  if (!firebaseApp) {
    return { firebaseApp: null, auth: null, firestore: null };
  }
  
  const auth = getAuth(firebaseApp);
  // Define a persistência da autenticação para 'local'
  setPersistence(auth, browserLocalPersistence);
  
  return {
    firebaseApp,
    auth,
    firestore: getFirestore(firebaseApp)
  };
}

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
