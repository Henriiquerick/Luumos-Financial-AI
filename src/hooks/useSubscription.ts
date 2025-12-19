
'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Subscription } from '@/lib/types';
import { useMemo } from 'react';

export function useSubscription() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const subscriptionRef = useMemoFirebase(
    () => (user ? doc(firestore, `users/${user.uid}/subscription/status`) : null),
    [user, firestore]
  );
  
  const { data: subscriptionData, isLoading: isSubscriptionLoading, error } = useDoc<Subscription>(subscriptionRef);

  const subscription = useMemo(() => {
    // If there is no subscription document, we default to a 'free' plan.
    if (!isUserLoading && !isSubscriptionLoading && !subscriptionData && !error) {
      return {
        id: 'default',
        plan: 'free',
        isActive: true,
        validUntil: null,
      } as Subscription;
    }
    return subscriptionData;
  }, [subscriptionData, isUserLoading, isSubscriptionLoading, error]);

  return {
    subscription,
    isLoading: isUserLoading || isSubscriptionLoading,
    error,
  };
}
