'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/header';
import { BalanceCard } from '@/components/balance-card';
import { RecentTransactions } from '@/components/recent-transactions';
import { InstallmentTunnelChart } from '@/components/installment-tunnel-chart';
import { AiAdvisorCard } from '@/components/ai-advisor-card';
import { TransactionDialog } from '@/components/transaction-dialog';
import type { Transaction, AIPersonality, CreditCard, UserProfile, AIKnowledgeLevel } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { KNOWLEDGE_LEVELS, PERSONALITIES } from '@/lib/agent-config';
import { CardsCarousel } from '@/components/cards-carousel';
import { DailyInsightCard } from '@/components/daily-insight-card';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { PersonaOnboarding } from './persona-onboarding';
import { Skeleton } from './ui/skeleton';
import { AuthGate } from './auth-gate';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { AddCardDialog } from './add-card-dialog';
import { useTranslation } from '@/contexts/language-context';
import { isSameMonth, startOfToday } from 'date-fns';
import { getDateFromTimestamp } from '@/lib/finance-utils';


export default function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const { t } = useTranslation();

  // Memoize Firestore references
  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const transactionsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'transactions') : null, [firestore, user]);
  const cardsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'cards') : null, [firestore, user]);

  // Fetch data using hooks
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  const { data: transactions, isLoading: isTransactionsLoading } = useCollection<Transaction>(transactionsRef);
  const { data: creditCards, isLoading: isCardsLoading } = useCollection<CreditCard>(cardsRef);
  
  const typedTransactions = useMemo(() => {
    if (!transactions) return [];
    
    return transactions.map(t => ({
      ...t,
      date: getDateFromTimestamp(t.date)
    }));
  }, [transactions]);

  const handlePersonalityChange = (personality: AIPersonality) => {
    if (userProfileRef) {
       setDoc(userProfileRef, { aiPersonality: personality.id }, { merge: true }).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: userProfileRef.path,
            operation: 'update',
            requestResourceData: { aiPersonality: personality.id },
          })
        )
      });
    }
  };

  const handleKnowledgeChange = (knowledge: AIKnowledgeLevel) => {
    if (userProfileRef) {
       setDoc(userProfileRef, { aiKnowledgeLevel: knowledge.id }, { merge: true }).catch(error => {
        errorEmitter.emit(
          'permission-error',
          new FirestorePermissionError({
            path: userProfileRef.path,
            operation: 'update',
            requestResourceData: { aiKnowledgeLevel: knowledge.id },
          })
        )
      });
    }
  };

  const handleOnboardingComplete = (persona: AIPersonality) => {
    if (userProfileRef && user) {
        const profileData = { id: user.uid, aiPersonality: persona.id, aiKnowledgeLevel: 'lumos-one' };
        setDoc(userProfileRef, profileData, { merge: true }).catch(error => {
            errorEmitter.emit(
              'permission-error',
              new FirestorePermissionError({
                path: userProfileRef.path,
                operation: 'create',
                requestResourceData: profileData,
              })
            )
        });
    }
  }

  const handleAddCard = () => {
    setEditingCard(null);
    setIsCardDialogOpen(true);
  };

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setIsCardDialogOpen(true);
  };
  
  const handleCardDialogFinished = () => {
    setEditingCard(null);
  };

  const netBalance = useMemo(() => {
    const today = startOfToday();
    const cashBalance = (typedTransactions || []).reduce((acc, t) => {
      if (t.cardId) return acc; // Ignore card transactions for cash balance
      const multiplier = t.type === 'income' ? 1 : -1;
      return acc + t.amount * multiplier;
    }, 0);
    
    const currentMonthCardBill = (typedTransactions || []).reduce((acc, t) => {
      // Include only card expenses from the current month's bill
      if (t.cardId && t.type === 'expense' && isSameMonth(getDateFromTimestamp(t.date), today)) {
        return acc + t.amount;
      }
      return acc;
    }, 0);

    return cashBalance - currentMonthCardBill;
  }, [typedTransactions]);

  const isLoading = isProfileLoading || isTransactionsLoading || isCardsLoading;

  const personality = PERSONALITIES.find(p => p.id === userProfile?.aiPersonality) || PERSONALITIES.find(p => p.id === 'neytan')!;
  const knowledge = KNOWLEDGE_LEVELS.find(k => k.id === userProfile?.aiKnowledgeLevel) || KNOWLEDGE_LEVELS.find(k => k.id === 'lumos-five')!;

  return (
    <AuthGate>
        {isLoading ? (
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
        ) : !userProfile?.aiPersonality ? (
            <PersonaOnboarding onComplete={handleOnboardingComplete} />
        ) : (
            <div className="w-full max-w-7xl mx-auto">
              <Header userProfile={userProfile} />
              <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tighter">
                  {userProfile?.firstName ? `${t.dashboard.greeting} ${userProfile.firstName}!` : t.dashboard.welcome_back}
                </h1>
                <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
              </div>
              <DailyInsightCard 
                transactions={typedTransactions}
                personality={personality}
                balance={netBalance}
              />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 space-y-6">
                  <BalanceCard balance={netBalance} onAddTransaction={() => setIsTransactionDialogOpen(true)} />
                  <CardsCarousel 
                    cards={creditCards || []} 
                    transactions={typedTransactions} 
                    onAddCard={handleAddCard}
                    onEditCard={handleEditCard}
                  />
                  <InstallmentTunnelChart transactions={typedTransactions} cards={creditCards || []} />
                  <RecentTransactions transactions={typedTransactions} />
                </div>
                <div className="space-y-6">
                  <div className="block lg:hidden">
                    <Button className="w-full" onClick={() => setIsTransactionDialogOpen(true)} >
                      <PlusCircle className="mr-2 h-4 w-4" /> {t.dashboard.add_transaction}
                    </Button>
                  </div>
                  <AiAdvisorCard
                    knowledge={knowledge}
                    personality={personality}
                    onKnowledgeChange={handleKnowledgeChange}
                    onPersonalityChange={handlePersonalityChange}
                    transactions={typedTransactions}
                    cards={creditCards || []}
                    balance={netBalance}
                  />
                </div>
              </div>
              <TransactionDialog 
                isOpen={isTransactionDialogOpen} 
                setIsOpen={setIsTransactionDialogOpen} 
                transactions={typedTransactions}
                creditCards={creditCards || []}
              />
              <AddCardDialog
                isOpen={isCardDialogOpen}
                setIsOpen={setIsCardDialogOpen}
                cardToEdit={editingCard}
                onFinished={handleCardDialogFinished}
              />
            </div>
        )}
    </AuthGate>
  )
}
