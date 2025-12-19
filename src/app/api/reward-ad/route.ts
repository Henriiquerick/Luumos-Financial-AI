
'use server';

import { NextResponse } from 'next/server';
import { getFirestore, doc, Timestamp, increment, runTransaction, type Transaction as FirestoreTransaction } from 'firebase-admin/firestore';
import { initAdmin } from '@/firebase/admin';
import { PLAN_LIMITS, ADS_WATCH_LIMITS } from '@/lib/constants';
import type { UserProfile, Subscription } from '@/lib/types';
import { isBefore, startOfToday } from 'date-fns';

const app = initAdmin();
const db = getFirestore(app);

const getDateFromTimestamp = (date: any): Date | null => {
  if (date instanceof Timestamp) {
    return date.toDate();
  }
  if (date instanceof Date) {
    return date;
  }
  return null;
};

// Esta função agora opera dentro de uma transação e retorna os dados atualizados
const checkAndResetCountersInTransaction = (
    transaction: FirestoreTransaction,
    userRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
    userProfile: UserProfile, 
    subscription: Subscription
): UserProfile => {
    const today = startOfToday();
    const lastResetDate = getDateFromTimestamp(userProfile.lastCreditReset);
    
    if (!lastResetDate || isBefore(lastResetDate, today)) {
        const userPlan = subscription?.plan || 'free';
        const newCredits = PLAN_LIMITS[userPlan] ?? PLAN_LIMITS['free'];
        
        const updates = {
            dailyCredits: newCredits,
            adsWatchedToday: 0,
            lastCreditReset: Timestamp.now() 
        };

        transaction.update(userRef, updates);
        console.log(`Counters reset for user ${userProfile.id}. Plan: ${userPlan}, Credits: ${newCredits}`);
        
        return {
            ...userProfile,
            ...updates,
            lastCreditReset: new Date(), // Simula a data atual para a lógica subsequente
        };
    }

    return userProfile; // Retorna o perfil sem alterações se os contadores já estiverem atualizados.
};


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const userRef = doc(db, 'users', userId);
    const subscriptionRef = doc(db, 'users', userId, 'subscription', 'status');

    // Use uma transação para garantir atomicidade
    const { newCreditBalance, adsWatchedNow } = await runTransaction(db, async (transaction) => {
        const [userDoc, subscriptionDoc] = await transaction.getAll(userRef, subscriptionRef);

        if (!userDoc.exists()) {
            throw new Error("User profile not found");
        }

        let userProfile = userDoc.data() as UserProfile;
        userProfile.id = userDoc.id; // Adiciona o ID para logs

        const subscription = (subscriptionDoc.exists() ? subscriptionDoc.data() : { plan: 'free' }) as Subscription;

        // 1. Checa e reseta os contadores diários se necessário, dentro da transação
        let updatedProfile = checkAndResetCountersInTransaction(transaction, userRef, userProfile, subscription);

        // 2. Verifica o limite de anúncios
        const userPlan = subscription?.plan || 'free';
        const adLimit = ADS_WATCH_LIMITS[userPlan] ?? ADS_WATCH_LIMITS['free'];
        const adsWatched = updatedProfile.adsWatchedToday || 0;

        if (adsWatched >= adLimit) {
            // Lança um erro para abortar a transação
            throw new Error('AD_LIMIT_REACHED');
        }
        
        // 3. Incrementa os créditos e o contador de anúncios
        transaction.update(userRef, {
            dailyCredits: increment(1),
            adsWatchedToday: increment(1)
        });
        
        const finalCreditBalance = (updatedProfile.dailyCredits || 0) + 1;
        const finalAdsWatched = adsWatched + 1;

        return { newCreditBalance: finalCreditBalance, adsWatched: finalAdsWatched };
    });

    return NextResponse.json({ 
        success: true,
        message: 'Ad reward credited successfully.',
        newCreditBalance: newCreditBalance,
        adsWatched: adsWatchedNow,
    });

  } catch (error: any) {
    console.error("🔥 ERRO no endpoint reward-ad:", error);

    if (error.message === 'AD_LIMIT_REACHED') {
        return NextResponse.json(
            { 
                error: 'Daily ad watch limit reached.', 
                code: '403_AD_LIMIT_REACHED' 
            }, 
            { status: 403 }
        );
    }

     if (error.message === 'User profile not found') {
        return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' }, 
      { status: 500 }
    );
  }
}
