
'use server';

import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { initAdmin } from '@/firebase/admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { Transaction, UserProfile } from '@/lib/types';
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

    const userProfile = userDoc.data() as UserProfile;
    const transactions = transactionsSnapshot.docs.map(doc => {
        const data = doc.data() as Transaction;
        return {
            ...data,
            date: getDateFromTimestamp(data.date) // Converte Timestamp para Date
        }
    });

    // 2. Gerar a análise financeira
    // A função generateInsightAnalysis precisa ser adaptada para calcular o balanço internamente ou receber os dados
    // Por simplicidade, vamos recalcular o balanço aqui.
    const cashBalance = transactions.reduce((acc, t) => {
        if (t.cardId) return acc;
        const multiplier = t.type === 'income' ? 1 : -1;
        return acc + t.amount * multiplier;
    }, 0);

    const analysis = generateInsightAnalysis(transactions, cashBalance);
    
    // 3. Obter a personalidade e instrução do sistema
    const personality = PERSONALITIES.find(p => p.id === userProfile.aiPersonality) || PERSONALITIES.find(p => p.id === 'biris')!;
    const systemInstruction = personality.instruction;

    // 4. Montar o prompt para a Groq
    const finalPrompt = `
      ${systemInstruction}
      
      You are giving a user a quick, proactive daily financial insight. 
      Based on the following analysis, give a short, engaging comment (max 2 sentences) in your persona's voice.
      DO NOT repeat the numbers, just the conclusion.

      Analysis: ${analysis}

      Your Insight (in Brazilian Portuguese):
    `;

    // 5. Chamar a API da Groq
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: finalPrompt }],
      model: 'llama-3.1-70b-versatile',
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
