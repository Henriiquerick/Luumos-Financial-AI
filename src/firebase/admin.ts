
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

// Função Singleton para garantir que só inicializamos uma vez
export function initAdmin(): App {
  // Se já tiver uma instância rodando, devolve ela (evita erro de duplicidade)
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    console.error("FATAL: Variável FIREBASE_SERVICE_ACCOUNT_KEY não encontrada no .env");
    throw new Error('A configuração do servidor Firebase está ausente.');
  }

  try {
    // 1. Parseia o JSON (se vier como string do .env)
    const serviceAccount = JSON.parse(serviceAccountKey);

    // 2. CORREÇÃO CRÍTICA DE QUEBRA DE LINHA
    // Transforma os "\\n" literais em quebras de linha reais que o Node entende
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    // 3. Inicializa
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
    
  } catch (error: any) {
    console.error('Erro CRÍTICO ao inicializar Firebase Admin:', error.message);
    // Relança o erro para a API pegar, mas com uma mensagem mais amigável
    throw new Error(`Falha na inicialização do serviço de backend: ${error.message}`);
  }
}
