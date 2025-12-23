import 'server-only';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
function formatPrivateKey(key: string) { return key.replace(/\\n/g, '\n'); }

export function getAdminDb() { // 1. Verifica se ja existe app const apps = getApps(); if (apps.length > 0) { return getFirestore(); }

// 2. Carrega a chave const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) { throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_MISSING'); }

try { // 3. Limpeza da chave let cleanKey = serviceAccountKey.trim();

// Remove aspas extras se houver
if (cleanKey.startsWith("'") && cleanKey.endsWith("'")) {
  cleanKey = cleanKey.slice(1, -1);
}
if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
  cleanKey = cleanKey.slice(1, -1);
}
// Remove caracteres invisiveis
cleanKey = cleanKey.replace(/[\u0000-\u0019]+/g, "");
let serviceAccount;
try { serviceAccount = JSON.parse(cleanKey); } catch (e) { // Tenta corrigir quebras de linha const fixedJson = cleanKey.replace(/\n/g, "\n"); serviceAccount = JSON.parse(fixedJson); }

// Ajusta a chave privada
if (serviceAccount.private_key) {
  serviceAccount.private_key = formatPrivateKey(serviceAccount.private_key);
}
// 4. Inicializa
initializeApp({
  credential: cert(serviceAccount),
});
return getFirestore();
} catch (error) { console.error('Firebase Admin Init Error:', error); throw error; } }
