import 'server-only';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
// Função auxiliar para formatar a chave privada function formatPrivateKey(key: string) { return key.replace(/\\n/g, '\n'); }

export function getAdminDb() { // 1. Se já existe app iniciado, retorna o banco dele const apps = getApps(); if (apps.length > 0) { return getFirestore(); }

// 2. Busca a chave const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) { throw new Error('❌ FIREBASE_SERVICE_ACCOUNT_KEY não encontrada no .env'); }

try { // 3. Limpeza Extrema da Chave // Remove aspas simples ou duplas extras que podem vir do .env let cleanKey = serviceAccountKey.trim(); if (cleanKey.startsWith("'") && cleanKey.endsWith("'")) cleanKey = cleanKey.slice(1, -1); if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) cleanKey = cleanKey.slice(1, -1);

// Remove caracteres de controle invisíveis
cleanKey = cleanKey.replace(/[\u0000-\u0019]+/g, "");
let serviceAccount;
try { serviceAccount = JSON.parse(cleanKey); } catch (e) { // Fallback: Tenta escapar quebras de linha reais console.warn("⚠️ JSON Parse falhou, tentando sanitizar..."); const fixedJson = cleanKey.replace(/\n/g, "\\n"); serviceAccount = JSON.parse(fixedJson); }

// Formata a private_key
if (serviceAccount.private_key) {
    serviceAccount.private_key = formatPrivateKey(serviceAccount.private_key);
}
// 4. Inicializa
initializeApp({
  credential: cert(serviceAccount),
});
console.log('✅ Firebase Admin (Modular) inicializado.');

// Retorna a instância garantida return getFirestore();

} catch (error) { console.error('❌ ERRO CRÍTICO AO INICIAR FIREBASE:', error); const msg = error instanceof Error ? error.message : String(error); throw new Error(`Falha no Firebase Admin: ${msg}`); } }
