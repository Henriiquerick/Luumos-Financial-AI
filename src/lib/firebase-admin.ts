import admin from 'firebase-admin';
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Função Singleton para inicializar o Firebase Admin
function createFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error('A variável de ambiente FIREBASE_SERVICE_ACCOUNT_KEY não foi definida.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey);
    // Transforma os literais "\\n" em quebras de linha reais
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch (error: any) {
    throw new Error(`Falha ao inicializar o Firebase Admin: ${error.message}`);
  }
}

// Inicializa o app e exporta a instância do Firestore
const adminApp = createFirebaseAdminApp();
export const adminDb = getFirestore(adminApp);
export const adminAuth = adminApp.auth();

