
import 'server-only';
import admin from 'firebase-admin';
function formatPrivateKey(key: string) { return key.replace(/\\n/g, '\n'); }

export function getAdminDb() { // 1. Verificação Otimista: Se já tem app, retorna o banco direto if (admin.apps.length > 0) { return admin.firestore(); }

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

// 2. Validação de Variável de Ambiente if (!serviceAccountKey) { throw new Error('❌ FIREBASE_SERVICE_ACCOUNT_KEY ausente no .env'); }

try { // 3. Sanitização do JSON (Remove quebras de linha invisíveis que quebram o parse) // Muitos erros de 'Bad control character' vêm de copy-paste errado const sanitizedKey = serviceAccountKey .replace(/[\u0000-\u0019]+/g, "") // Remove caracteres de controle estranhos .trim(); // Remove espaços extras

let serviceAccount;
try { // Tenta parse normal serviceAccount = JSON.parse(sanitizedKey); } catch (parseError) { // Se falhar, tenta corrigir escapando as quebras de linha console.warn("⚠️ JSON Parse falhou, tentando recuperar formato..."); const fixedJson = sanitizedKey.replace(/\n/g, "\\n"); serviceAccount = JSON.parse(fixedJson); }

// Ajusta a chave privada (restaura \n reais)
if (serviceAccount.private_key) {
  serviceAccount.private_key = formatPrivateKey(serviceAccount.private_key);
}
// 4. Inicialização
// Verifica novamente se outra thread não iniciou enquanto parseávamos
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin inicializado.');
}
return admin.firestore();
} catch (error) { console.error('❌ FALHA CRÍTICA NO FIREBASE ADMIN:', error); // IMPORTANTE: Lança o erro para PARAR a execução. // Se não lançarmos, ele tentaria retornar admin.firestore() sem app, causando o erro "does not exist". throw new Error('Falha ao inicializar conexão com Firebase: ' + (error as Error).message); } }