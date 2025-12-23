import 'server-only';
import admin from 'firebase-admin';

// Função Singleton para garantir que só inicializamos uma vez
if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountKey) {
      // Remove quebras de linha que as vezes estragam o JSON vindo de ENV
      const cleanKey = serviceAccountKey.replace(/\\n/g, '\n');
      const serviceAccount = JSON.parse(cleanKey);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_KEY não encontrada no Build. O Admin não foi iniciado.');
    }
  } catch (error) {
    console.error('❌ Erro ao iniciar Firebase Admin:', error);
  }
}

// Exporta o Firestore seguro (se falhar o init, ele vai tentar usar o default, o que é melhor que crashar o build)
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();