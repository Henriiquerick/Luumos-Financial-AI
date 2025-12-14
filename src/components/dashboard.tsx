'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/header';
import { BalanceCard } from '@/components/balance-card';
import { RecentTransactions } from '@/components/recent-transactions';
import { InstallmentTunnelChart } from '@/components/installment-tunnel-chart';
import { AiAdvisorCard } from '@/components/ai-advisor-card';
import { TransactionDialog } from '@/components/transaction-dialog';
import type { Transaction, AIPersonality, CreditCard, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import { PERSONAS } from '@/lib/personas';
import { CardsCarousel } from '@/components/cards-carousel';
import { DailyInsightCard } from '@/components/daily-insight-card';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { PersonaOnboarding } from './persona-onboarding';
import { Skeleton } from './ui/skeleton';

export default function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Memoize Firestore references
  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const transactionsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'transactions') : null, [firestore, user]);
  const cardsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'cards') : null, [firestore, user]);

  // Fetch data using hooks
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  const { data: transactions = [], isLoading: isTransactionsLoading } = useCollection<Transaction>(transactionsRef);
  const { data: creditCards = [], isLoading: isCardsLoading } = useCollection<CreditCard>(cardsRef);
  
  const typedTransactions = useMemo(() => (transactions || []).map(t => ({...t, date: (t.date as any).toDate()})), [transactions]);

  const handlePersonalityChange = (personality: AIPersonality) => {
    if (userProfileRef) {
      setDoc(userProfileRef, { aiPersonality: personality.id }, { merge: true });
    }
  };

  const handleOnboardingComplete = (persona: AIPersonality) => {
    if (userProfileRef) {
      setDoc(userProfileRef, { id: user!.uid, aiPersonality: persona.id }, { merge: true });
    }
  }

  const currentBalance = useMemo(() => {
    return typedTransactions.reduce((acc, t) => {
      if (t.cardId) return acc;
      const multiplier = t.type === 'income' ? 1 : -1;
      return acc + t.amount * multiplier;
    }, 0);
  }, [typedTransactions]);

  const isLoading = isProfileLoading || isTransactionsLoading || isCardsLoading;

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
        <div className="w-full max-w-7xl space-y-8">
          <Skeleton className="h-16 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-12 w-1/4 mx-auto" />
        </div>
      </main>
    );
  }

  const personality = PERSONAS.find(p => p.id === userProfile?.aiPersonality) || PERSONAS[0];

  if (!userProfile?.aiPersonality) {
    return <PersonaOnboarding onComplete={handleOnboardingComplete} />;
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto">
      <Header />
      <DailyInsightCard 
        transactions={typedTransactions}
        personality={personality}
        balance={currentBalance}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <BalanceCard balance={currentBalance} onAddTransaction={() => setIsDialogOpen(true)} />
          <CardsCarousel cards={creditCards} transactions={typedTransactions} />
          <InstallmentTunnelChart transactions={typedTransactions} cards={creditCards} />
          <RecentTransactions transactions={typedTransactions} />
        </div>
        <div className="space-y-6">
          <div className="block lg:hidden">
            <Button className="w-full" onClick={() => setIsDialogOpen(true)} >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
            </Button>
          </div>
          <AiAdvisorCard
            personality={personality}
            onPersonalityChange={handlePersonalityChange}
            transactions={typedTransactions}
          />
        </div>
      </div>
      <TransactionDialog 
        isOpen={isDialogOpen} 
        setIsOpen={setIsDialogOpen} 
        transactions={typedTransactions}
        creditCards={creditCards}
      />
    </div>
  );
}
