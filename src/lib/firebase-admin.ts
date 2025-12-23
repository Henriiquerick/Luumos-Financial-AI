import 'server-only';
import admin from 'firebase-admin';
interface FirebaseAdminConfig { projectId: string; clientEmail: string; privateKey: string; }

function formatPrivateKey(key: string) { return key.replace(/\\n/g, '\n'); }

export function getAdminDb() { // 1. Verificação Otimista if (admin.apps.length > 0) { return admin.firestore(); }

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

// 2. Validação if (!serviceAccountKey) { throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY ausente no .env'); }

try { // 3. Sanitização const sanitizedKey = serviceAccountKey .replace(/[\u0000-\u0019]+/g, "") .trim();

let serviceAccount;
try { serviceAccount = JSON.parse(sanitizedKey); } catch (parseError) { console.warn("⚠️ JSON Parse falhou, tentando recuperar..."); const fixedJson = sanitizedKey.replace(/\n/g, "\n"); serviceAccount = JSON.parse(fixedJson); }

if (serviceAccount.private_key) {
  serviceAccount.private_key = formatPrivateKey(serviceAccount.private_key);
}
// 4. Inicialização
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin inicializado.');
}
return admin.firestore();
} catch (error) { console.error('❌ FALHA NO FIREBASE ADMIN:', error);

// --- CORREÇÃO AQUI ---
// Usamos String(error) para evitar erros de sintaxe do TypeScript
const errorMessage = error instanceof Error ? error.message : String(error);
throw new Error(`Falha ao inicializar Firebase: ${errorMessage}`);
} }
