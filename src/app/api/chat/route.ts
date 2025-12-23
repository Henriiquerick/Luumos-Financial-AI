
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { PLAN_LIMITS } from '@/lib/constants';
import { isBefore, startOfToday } from 'date-fns';
import { KNOWLEDGE_LEVELS, PERSONALITIES } from '@/lib/agent-config';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const ADMIN_IDS = [ "S5f4IWY1eFTKIIjE2tJH5o5EUwv1", "rickson.henrique2018@gmail.com" ];

const getDateFromTimestamp = (date: any): Date | null => {
  if (!date) return null;
  if (date instanceof Timestamp) return date.toDate();
  if (date._seconds) return new Date(date._seconds * 1000);
  if (date instanceof Date) return date;
  return null;
};

export async function POST(req: Request) {
  try {
    const db = getAdminDb();

    if (!db) {
        throw new Error("O objeto 'db' retornou undefined.");
    }
    const { userId, messages, data } = await req.json();
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const userData = userDoc.data();
    const isAdmin = ADMIN_IDS.includes(userId) || userData?.isAdmin === true;

    if (!isAdmin) {
      const today = startOfToday();
      const lastReset = getDateFromTimestamp(userData?.lastCreditReset);
      if (!lastReset || isBefore(lastReset, today)) {
        const planLimit = PLAN_LIMITS.free; 
        await userRef.update({
          dailyCredits: planLimit,
          lastCreditReset: FieldValue.serverTimestamp()
        });
        if (userData) userData.dailyCredits = planLimit;
      }
      const total = (userData?.dailyCredits || 0) + (userData?.credits || 0);
      if (total <= 0) {
        return NextResponse.json(
          { error: 'Sem créditos.', code: '403_INSUFFICIENT_CREDITS' },
          { status: 403 }
        );
      }
    }
    
    // --- LÓGICA DE INJEÇÃO DE PERSONALIDADE ---
    const personality = PERSONALITIES.find(p => p.id === data.personalityId) || PERSONALITIES[0];
    const systemPrompt = personality.instruction;

    const messagesForGroq = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages // Histórico de mensagens do usuário/modelo
    ];

    const financialContext = data ? `
      ---
      INFORMAÇÕES FINANCEIRAS DO USUÁRIO (Use isso para basear suas respostas):
      - Saldo Atual: R$ ${data.balance || 0}
      - Idioma de Resposta: ${data.language || 'pt-BR'}
      - Transações Recentes: ${JSON.stringify(data.transactions?.slice(0, 5) || [])}
    ` : "Nenhum dado financeiro disponível.";

    // Adiciona o contexto financeiro à última mensagem do usuário
    const lastUserMessage = messagesForGroq[messagesForGroq.length - 1];
    lastUserMessage.content = `${lastUserMessage.content}\n\n${financialContext}`;
    
    const chatCompletion = await groq.chat.completions.create({
      messages: messagesForGroq,
      model: "llama-3.1-8b-instant",
      temperature: 0.8,
      max_tokens: 1024,
    });

    const textResponse = chatCompletion.choices[0]?.message?.content || "";
    
    if (!isAdmin) {
        if ((userData?.dailyCredits || 0) > 0) {
            await userRef.update({ dailyCredits: FieldValue.increment(-1) });
        } else {
            await userRef.update({ credits: FieldValue.increment(-1) });
        }
    }
    return NextResponse.json({ text: textResponse });
  } catch (error: any) { 
    console.error('CHAT API ERROR (Groq):', error); 
    return NextResponse.json({ error: error.message }, { status: 500 }); 
  } 
}
