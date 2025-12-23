
'use server';

import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import type { UserProfile, Transaction } from '@/lib/types';
import { PERSONALITIES } from '@/lib/agent-config';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

const getDateFromTimestamp = (date: any): Date => {
  if (date instanceof Timestamp) return date.toDate();
  if (date instanceof Date) return date;
  return new Date();
};

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // --- LÓGICA DE CACHE ---
    const todayStr = new Date().toISOString().split('T')[0];
    const cacheRef = adminDb.collection('users').doc(userId).collection('cache').doc('daily_insight');
    const cacheDoc = await cacheRef.get();

    if (cacheDoc.exists && cacheDoc.data()?.date === todayStr) {
      console.log(`CACHE HIT for user: ${userId}`);
      return NextResponse.json({ insight: cacheDoc.data()?.content });
    }
    
    console.log(`CACHE MISS for user: ${userId}`);
    // --- FIM DA LÓGICA DE CACHE ---


    // 1. Buscar dados diretamente do Firebase Admin (se o cache falhar)
    const userRef = adminDb.collection('users').doc(userId);
    const transactionsRef = userRef.collection('transactions').orderBy('date', 'desc').limit(50);
    
    const [userDoc, transactionsSnapshot] = await Promise.all([
        userRef.get(),
        transactionsRef.get()
    ]);

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    if (transactionsSnapshot.empty) {
        const noTransactionInsight = "Você ainda não tem transações suficientes para uma análise. Comece a registrar seus gastos e receitas!";
        return NextResponse.json({ insight: noTransactionInsight });
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
    
    // 4. Montar o prompt para o Gemini
    const finalPrompt = `
      ${personality.instruction}
      
      Você está dando ao usuário um insight financeiro diário, rápido e proativo.
      Baseado na análise JSON a seguir, forneça um comentário curto e envolvente (máx. 2 frases) com a voz da sua persona.
      NÃO repita os números, apenas a conclusão. Seja direto e acionável. Use emojis.
      Responda em Português do Brasil.

      Análise de Transações Recentes: ${JSON.stringify(simplifiedTransactions)}
    `;

    // 5. Chamar a API do Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const insightText = response.text();


    // --- SALVAR NO CACHE ---
    await cacheRef.set({
        content: insightText,
        date: todayStr,
        lastUpdated: FieldValue.serverTimestamp()
    });
    // --- FIM DO SALVAMENTO ---

    return NextResponse.json({ insight: insightText });

  } catch (error: any) {
    console.error("Gemini API or Firebase Error in Daily Insight:", error);
    return NextResponse.json(
      { error: error.message, stack: error.stack }, 
      { status: 500 }
    );
  }
}
