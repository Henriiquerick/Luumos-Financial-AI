
import { NextResponse } from 'next/server';
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp, Timestamp, increment } from 'firebase-admin/firestore';
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

async function checkAndResetCounters(userId: string, userProfile: UserProfile, subscription: Subscription): Promise<UserProfile> {
    const today = startOfToday();
    const lastResetDate = getDateFromTimestamp(userProfile.lastCreditReset);
    
    if (!lastResetDate || isBefore(lastResetDate, today)) {
        const userPlan = subscription?.plan || 'free';
        const newCredits = PLAN_LIMITS[userPlan] || PLAN_LIMITS['free'];
        
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            dailyCredits: newCredits,
            adsWatchedToday: 0,
            lastCreditReset: serverTimestamp() 
        });

        console.log(`Counters reset for user ${userId}. Plan: ${userPlan}, Credits: ${newCredits}`);
        
        return {
            ...userProfile,
            dailyCredits: newCredits,
            adsWatchedToday: 0,
            lastCreditReset: new Date(),
        };
    }

    return userProfile;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const userRef = doc(db, 'users', userId);
    const subscriptionRef = doc(db, 'users', userId, 'subscription', 'status');

    const [userDoc, subscriptionDoc] = await Promise.all([
        getDoc(userRef),
        getDoc(subscriptionRef)
    ]);
    
    if (!userDoc.exists()) {
        return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    let userProfile = userDoc.data() as UserProfile;
    const subscription = (subscriptionDoc.exists() ? subscriptionDoc.data() : { plan: 'free' }) as Subscription;

    userProfile = await checkAndResetCounters(userId, userProfile, subscription);

    const userPlan = subscription?.plan || 'free';
    const adLimit = ADS_WATCH_LIMITS[userPlan] ?? ADS_WATCH_LIMITS['free'];
    const adsWatched = userProfile.adsWatchedToday || 0;

    if (adsWatched >= adLimit) {
        return NextResponse.json(
            { 
                error: 'Daily ad watch limit reached.', 
                code: '403_AD_LIMIT_REACHED' 
            }, 
            { status: 403 }
        );
    }
    
    await updateDoc(userRef, {
        dailyCredits: increment(1),
        adsWatchedToday: increment(1)
    });

    const newCredits = (userProfile.dailyCredits || 0) + 1;

    return NextResponse.json({ 
        message: 'Ad reward credited successfully.',
        newCreditBalance: newCredits
    });

  } catch (error: any) {
    console.error("🔥 ERRO no endpoint reward-ad:", error);
    return NextResponse.json(
      { error: error.message || 'Erro interno no servidor' }, 
      { status: 500 }
    );
  }
}
