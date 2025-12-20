
'use server';

import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { initAdmin } from '@/firebase/admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { UserProfile, Transaction } from '@/lib/types';
import { PERSONALITIES } from '@/lib/agent-config';
import { generateInsightAnalysis } from '@/lib/finance-utils';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const app = initAdmin();
const db = getFirestore(app);

const getDateFromTimestamp = (date: any): Date => {
  if (date instanceof Timestamp) return date.toDate();
  if (date instanceof Date) return date;
  return new Date();
};

export async function POST(req: Request) {
  if (!app) {
    return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // 1. Buscar dados diretamente do Firebase Admin
    const userRef = db.collection('users').doc(userId);
    const transactionsRef = userRef.collection('transactions').orderBy('date', 'desc').limit(50);
    
    const [userDoc, transactionsSnapshot] = await Promise.all([
        userRef.get(),
        transactionsRef.get()
    ]);

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    if (transactionsSnapshot.empty) {
        return NextResponse.json({ insight: "Você ainda não tem transações suficientes para uma análise. Comece a registrar seus gastos e receitas!" });
    }


    const userProfile = userDoc.data() as UserProfile;
    const transactions = transactionsSnapshot.docs.map(doc => {
        const data = doc.data() as Transaction;
        return {
            ...data,
            date: getDateFromTimestamp(data.date) 
        }
    });

    const simplifiedTransactions = transactions.map(t => ({
      categoria: t.category,
      valor: t.amount,
      tipo: t.type,
      data: t.date.toISOString().split('T')[0] // Formato YYYY-MM-DD
    }));

    // 3. Obter a personalidade e instrução do sistema
    const personality = PERSONALITIES.find(p => p.id === userProfile.aiPersonality) || PERSONALITIES.find(p => p.id === 'biris')!;
    
    // 4. Montar o prompt para a Groq
    const finalPrompt = `
      ${personality.instruction}
      
      Você está dando ao usuário um insight financeiro diário, rápido e proativo.
      Baseado na análise JSON a seguir, forneça um comentário curto e envolvente (máx. 2 frases) com a voz da sua persona.
      NÃO repita os números, apenas a conclusão. Seja direto e acionável. Use emojis.
      Responda em Português do Brasil.

      Análise de Transações Recentes: ${JSON.stringify(simplifiedTransactions)}
    `;

    // 5. Chamar a API da Groq
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: finalPrompt }],
      model: 'llama-3.3-70b-versatile', // Modelo inteligente para análise
      temperature: 0.7,
      max_tokens: 150,
    });

    const insightText = completion.choices[0]?.message?.content || "Não foi possível gerar um insight hoje. Tente mais tarde.";

    return NextResponse.json({ insight: insightText });

  } catch (error: any) {
    console.error("Groq API or Firebase Error in Daily Insight:", error);
    return NextResponse.json(
      { error: error.message, stack: error.stack }, 
      { status: 500 }
    );
  }
}
