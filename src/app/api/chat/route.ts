
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { PLAN_LIMITS } from '@/lib/constants'; // Importe seus limites
import { isBefore, startOfToday } from 'date-fns';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

// IDs dos Admins (Você não gasta créditos)
const ADMIN_IDS = [
  "S5f4IWY1eFTKIIjE2tJH5o5EUwv1", 
  "rickson.henrique2018@gmail.com"
];

// Helper para converter data do Firestore
const getDateFromTimestamp = (date: any): Date | null => {
  if (date instanceof Timestamp) return date.toDate();
  if (date instanceof Date) return date;
  return null;
};

export async function POST(req: Request) {
  try {
    const { userId, messages, data } = await req.json();

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    // 1. Busca Usuário no Banco
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userData = userDoc.data();
    
    // Verifica se é Admin
    const isAdmin = ADMIN_IDS.includes(userId) || userData?.isAdmin === true || userData?.email === ADMIN_IDS[1];

    // 2. Lógica de Reset Diário (Se não for Admin)
    if (!isAdmin) {
      const today = startOfToday();
      const lastReset = getDateFromTimestamp(userData?.lastCreditReset);

      // Se nunca resetou ou resetou antes de hoje, renova os créditos
      if (!lastReset || isBefore(lastReset, today)) {
        // Pega o plano (se não tiver, assume 'free')
        // Nota: Se a subscrição ficar em outra coleção, simplifique assumindo 'free' ou busque lá.
        // Aqui assumimos 'free' para simplificar e evitar erro de busca complexa
        const planLimit = PLAN_LIMITS.free; 

        await userRef.update({
          dailyCredits: planLimit,
          lastCreditReset: FieldValue.serverTimestamp()
        });
        
        // Atualiza a variável local para a verificação abaixo não falhar
        if (userData) userData.dailyCredits = planLimit;
        console.log(`♻️ Créditos renovados para ${userId}: ${planLimit}`);
      }
    }

    // 3. Verificação de Saldo
    if (!isAdmin) {
      // Prioriza 'credits' (adquiridos) e depois 'dailyCredits' (do plano)
      const totalCredits = (userData?.credits || 0) + (userData?.dailyCredits || 0);

      if (totalCredits <= 0) {
        return NextResponse.json(
          { error: 'Sem créditos diários. Assista um anúncio!', code: '403_INSUFFICIENT_CREDITS' },
          { status: 403 }
        );
      }
    }

    // 4. Gera Resposta com Gemini
    const systemInstruction = `
      Atue como um consultor financeiro.
      Contexto: ${JSON.stringify(data || {})}
      Seja direto e útil.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemInstruction }] },
        { role: "model", parts: [{ text: "Ok." }] },
      ],
    });

    const lastMsgContent = messages[messages.length - 1]?.content || "Olá";
    const result = await chat.sendMessage(lastMsgContent);
    const textResponse = result.response.text();

    // 5. Desconta Créditos
    if (!isAdmin) {
        // Tenta descontar do 'dailyCredits' primeiro, se acabar, desconta de 'credits'
        // Simplificação: Desconta de dailyCredits se tiver, senão credits
        if ((userData?.dailyCredits || 0) > 0) {
            await userRef.update({ dailyCredits: FieldValue.increment(-1) });
        } else {
            await userRef.update({ credits: FieldValue.increment(-1) });
        }
    }

    return NextResponse.json({ text: textResponse });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
