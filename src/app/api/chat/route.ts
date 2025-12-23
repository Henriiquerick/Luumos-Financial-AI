import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '@/lib/firebase-admin'; // Certifique-se que este arquivo exporta o getFirestore()
import { FieldValue } from 'firebase-admin/firestore';

// Inicializa o Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { userId, messages, data } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // --- 1. CONFIGURAÇÃO DE ADMIN (Seu ID Mestre) ---
    const ADMIN_IDS = [
      "S5f4IWY1eFTKIIjE2tJH5o5EUwv1", // SEU ID DO FIREBASE
      "rickson.henrique2018@gmail.com" // Fallback de email se necessário
    ];

    // --- 2. BUSCAR DADOS DO USUÁRIO ---
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userData = userDoc.data();

    // Verifica se é Admin (pelo ID ou pela flag no banco)
    const isAdmin = ADMIN_IDS.includes(userId) || userData?.isAdmin === true;

    // --- 3. VERIFICAÇÃO DE CRÉDITOS ---
    // Se NÃO for admin, verifica se tem saldo
    if (!isAdmin) {
      // Verifica se credits existe e é maior que 0
      // Nota: Se quiser manter compatibilidade com 'dailyCredits', verifique ambos
      const currentCredits = userData?.credits ?? userData?.dailyCredits ?? 0;
      if (currentCredits <= 0) {
        return NextResponse.json(
          { 
            error: 'Créditos insuficientes. Assista um anúncio para recarregar!', 
            code: '403_INSUFFICIENT_CREDITS' 
          },
          { status: 403 }
        );
      }
    }

    // --- 4. PREPARAÇÃO DO PROMPT (Contexto) ---
    const lastMessage = messages[messages.length - 1];
    const userQuestion = lastMessage.content;

    // Monta o contexto financeiro se disponível
    const financialContext = data ? `
      Saldo Atual: R$ ${data.balance || 0}
      Transações Recentes: ${JSON.stringify(data.transactions || [])}
      Cartões: ${JSON.stringify(data.cards || [])}
    ` : "Sem dados financeiros.";

    const systemContext = `
      Você é um assistente financeiro inteligente.
      Personalidade ID: ${data?.personalityId || 'padrão'}.
      Nível de Conhecimento: ${data?.knowledgeId || 'básico'}.
      Idioma: ${data?.language || 'pt-BR'}.
      
      CONTEXTO FINANCEIRO:
      ${financialContext}

      Responda de forma direta, útil e curta.
    `;

    // --- 5. CHAMADA AI (GOOGLE GEMINI) ---
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({ 
      history: [ 
        { role: "user", parts: [{ text: systemContext }] }, 
        { role: "model", parts: [{ text: "Entendido. Analisarei os dados financeiros." }] }, 
      ], 
    });

    const result = await chat.sendMessage(userQuestion);
    const response = await result.response;
    const textResponse = response.text();

    // --- 6. COBRANÇA (Só se não for Admin) ---
    if (!isAdmin) {
      // Tenta descontar de 'credits' (novo padrão) ou 'dailyCredits' (legado)
      const fieldToUpdate = userData?.credits !== undefined ? 'credits' : 'dailyCredits';
      
      await userRef.update({
        [fieldToUpdate]: FieldValue.increment(-1)
      });
    }

    return NextResponse.json({ text: textResponse });

  } catch (error: any) { 
    console.error('Chat API Error:', error); 
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message }, 
      { status: 500 } 
    ); 
  } 
}
