
'use server';

import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { initAdmin } from '@/firebase/admin';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { KNOWLEDGE_LEVELS, PERSONALITIES } from '@/lib/agent-config';
import { PLAN_LIMITS } from '@/lib/constants';
import type { UserProfile, Subscription, ChatMessage } from '@/lib/types';
import { isBefore, startOfToday } from 'date-fns';

// Initialize Groq SDK
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Initialize Firebase Admin
const app = initAdmin();
const db = getFirestore(app);

const getDateFromTimestamp = (date: any): Date | null => {
  if (date instanceof Timestamp) return date.toDate();
  if (date instanceof Date) return date;
  return null;
};

async function checkAndResetCredits(userId: string, userProfile: UserProfile, subscription: Subscription): Promise<UserProfile> {
    const today = startOfToday();
    const lastResetDate = getDateFromTimestamp(userProfile.lastCreditReset);
    
    if (!lastResetDate || isBefore(lastResetDate, today)) {
        const userPlan = subscription?.plan || 'free';
        const newCredits = PLAN_LIMITS[userPlan];
        
        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            dailyCredits: newCredits,
            lastCreditReset: FieldValue.serverTimestamp() 
        });

        console.log(`Credits reset for user ${userId}. Plan: ${userPlan}, Credits: ${newCredits}`);
        
        return {
            ...userProfile,
            dailyCredits: newCredits,
            lastCreditReset: new Date(),
        };
    }

    return userProfile;
}

export async function POST(req: Request) {
  if (!app) {
      return NextResponse.json({ error: "Server configuration missing" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { userId, messages, data: contextData } = body;

    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const userMessageContent = messages?.[messages.length - 1]?.content || '';
    if (!userMessageContent) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    const userRef = db.collection('users').doc(userId);
    const subscriptionRef = userRef.collection('subscription').doc('status');
    const [userDoc, subscriptionDoc] = await Promise.all([userRef.get(), subscriptionRef.get()]);

    if (!userDoc.exists) {
        return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    let userProfile = userDoc.data() as UserProfile;
    const subscription = (subscriptionDoc.exists ? subscriptionDoc.data() : { plan: 'free' }) as Subscription;

    userProfile = await checkAndResetCredits(userId, userProfile, subscription);

    if (userProfile.dailyCredits <= 0) {
        return NextResponse.json(
            { error: 'Insufficient credits', code: '403_INSUFFICIENT_CREDITS' }, 
            { status: 403 }
        );
    }

    await userRef.update({ dailyCredits: FieldValue.increment(-1) });

    const knowledge = KNOWLEDGE_LEVELS.find(k => k.id === userProfile.aiKnowledgeLevel) || KNOWLEDGE_LEVELS.find(k => k.id === 'lumos-five')!;
    const personality = PERSONALITIES.find(p => p.id === userProfile.aiPersonality) || PERSONALITIES.find(p => p.id === 'neytan')!;

    const langInstruction = 
        contextData?.language === 'pt' ? 'Responda estritamente em Português do Brasil.' :
        contextData?.language === 'es' ? 'Responda estritamente em Espanhol.' :
        'Answer strictly in English.';

    const genderInstruction = (userProfile as any).gender === 'female' 
        ? "O usuário se identifica como mulher. Use pronomes femininos e adjetivos como 'preparada', 'focada', 'gata', 'diva'." 
        : "O usuário se identifica como homem. Use pronomes masculinos e adjetivos como 'preparado', 'focado', 'campeão', 'monstro'.";

    const systemPrompt = `
      --- DIRETRIZ DE GÊNERO ---
      ${genderInstruction}

      --- DIRETRIZ DE IDIOMA ---
      ${langInstruction}

      --- DIRETRIZES DE CONHECIMENTO (O CÉREBRO) ---
      ${knowledge.instruction}

      --- DIRETRIZES DE PERSONALIDADE (A VOZ) ---
      ${personality.instruction}

      --- DADOS DO USUÁRIO ---
      ${contextData ? JSON.stringify(contextData, null, 2) : "Nenhum dado financeiro disponível."}

      --- INSTRUÇÃO FINAL ---
      Responda à mensagem do usuário usando APENAS o conhecimento do seu Nível e estritamente o tom da sua Personalidade, no idioma e gênero solicitados.
    `;

    const groqMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessageContent }
    ];

    const completion = await groq.chat.completions.create({
      messages: groqMessages as any,
      model: 'llama-3.1-8b-instant', 
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // We don't save the chat history in the backend anymore with this simplified approach
    // The frontend handles the state.

    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    console.error("Groq API or Firebase Error:", error);
    return NextResponse.json(
      { error: error.message, stack: error.stack }, 
      { status: 500 }
    );
  }
}
