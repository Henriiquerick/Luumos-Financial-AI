'use server';

import { contextualChatFlow } from '@/ai/flows/contextual-chat';
import { NextResponse } from 'next/server';
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase-admin/firestore';
import { initAdmin } from '@/firebase/admin';
import { PLAN_LIMITS } from '@/lib/constants';
import type { UserProfile, Subscription } from '@/lib/types';
import { isBefore, startOfToday } from 'date-fns';

const app = initAdmin();
const db = getFirestore(app);

// Helper para garantir que a data de reset seja um objeto Date do JS
const getDateFromTimestamp = (date: any): Date | null => {
  if (date instanceof Timestamp) {
    return date.toDate();
  }
  if (date instanceof Date) {
    return date;
  }
  return null;
};


/**
 * Checks and resets daily credits for a user if a new day has started.
 * @param userId The user's ID.
 * @param userProfile The user's profile data.
 * @param subscription The user's subscription data.
 * @returns The updated user profile with current credits.
 */
async function checkAndResetCredits(userId: string, userProfile: UserProfile, subscription: Subscription): Promise<UserProfile> {
    const today = startOfToday();
    const lastResetDate = getDateFromTimestamp(userProfile.lastCreditReset);
    
    // Se não houver data de reset ou se a última recarga foi antes de hoje, reseta os créditos.
    if (!lastResetDate || isBefore(lastResetDate, today)) {
        const userPlan = subscription?.plan || 'free';
        const newCredits = PLAN_LIMITS[userPlan];
        
        const userRef = db.collection('users').doc(userId);
        await updateDoc(userRef, {
            dailyCredits: newCredits,
            lastCreditReset: serverTimestamp() 
        });

        console.log(`Credits reset for user ${userId}. Plan: ${userPlan}, Credits: ${newCredits}`);
        
        return {
            ...userProfile,
            dailyCredits: newCredits,
            lastCreditReset: new Date(), // Retorna a data atual para a lógica subsequente
        };
    }

    return userProfile; // Retorna o perfil sem alterações se os créditos já estiverem atualizados para o dia.
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const { userId, messages, data: contextData } = body;

    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    let messageText = "";
    if (messages && Array.isArray(messages)) {
      const lastMessage = messages[messages.length - 1];
      messageText = lastMessage.content || "";
    } else if (body.message) {
      messageText = body.message;
    }

    if (!messageText) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

    // --- LÓGICA DE CRÉDITOS ---
    const userRef = db.collection('users').doc(userId);
    const subscriptionRef = userRef.collection('subscription').doc('status');

    const [userDoc, subscriptionDoc] = await Promise.all([
        getDoc(userRef),
        getDoc(subscriptionRef)
    ]);
    
    if (!userDoc.exists()) {
        return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    let userProfile = userDoc.data() as UserProfile;
    const subscription = (subscriptionDoc.exists() ? subscriptionDoc.data() : { plan: 'free' }) as Subscription;

    // 1. Checar e resetar créditos se for um novo dia
    userProfile = await checkAndResetCredits(userId, userProfile, subscription);
    
    // 2. Verificar se há créditos suficientes
    if (userProfile.dailyCredits <= 0) {
        return NextResponse.json(
            { error: 'Insufficient credits', code: '403_INSUFFICIENT_CREDITS' }, 
            { status: 403 }
        );
    }
    
    // 3. Decrementar o crédito (operação otimista, mas confirmada antes de prosseguir)
    await updateDoc(userRef, {
        dailyCredits: (userProfile.dailyCredits || 0) - 1
    });

    // --- FIM DA LÓGICA DE CRÉDITOS ---

    const knowledgeId = contextData?.knowledgeId;
    const personalityId = contextData?.personalityId;

    const responseText = await contextualChatFlow({ 
      message: messageText,
      data: contextData,
      knowledgeId,
      personalityId,
    });
    
    return NextResponse.json({ text: responseText });

  } catch (error: any) {
    console.error("🔥 ERRO:", error);
    return NextResponse.json(
      { error: error.message || 'Erro interno na IA' }, 
      { status: 500 }
    );
  }
}
