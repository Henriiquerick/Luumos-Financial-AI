
'use client';

import { useState, useMemo, useEffect } from 'react';
import Header from '@/components/header';
import { BalanceCard } from '@/components/balance-card';
import { RecentTransactions } from '@/components/recent-transactions';
import { AiAdvisorCard } from '@/components/ai-advisor-card';
import { TransactionDialog } from '@/components/transaction-dialog';
import type { Transaction, AIPersonality, CreditCard, UserProfile, AIKnowledgeLevel, CustomCategory, FinancialGoal } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, History } from 'lucide-react';
import { KNOWLEDGE_LEVELS, PERSONALITIES } from '@/lib/agent-config';
import { CardsCarousel } from '@/components/cards-carousel';
import { DailyInsightCard } from '@/components/daily-insight-card';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { PersonaOnboarding } from './persona-onboarding';
import { Skeleton } from './ui/skeleton';
import { AuthGate } from './auth-gate';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { AddCardDialog } from './add-card-dialog';
import { useTranslation } from '@/contexts/language-context';
import { isSameMonth, startOfToday } from 'date-fns';
import { getDateFromTimestamp } from '@/lib/finance-utils';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ToastAction } from '@/components/ui/toast';
import { FinancialGoalsCard } from './financial-goals-card';
import { GoalDialog } from './goal-dialog';
import { AddProgressDialog } from './add-progress-dialog';
import { useSubscription } from '@/hooks/useSubscription';


const InstallmentTunnelChart = dynamic(
  () => import('@/components/installment-tunnel-chart').then(mod => mod.InstallmentTunnelChart),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[322px] w-full" /> 
  }
);


export default function Dashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isAddProgressDialogOpen, setIsAddProgressDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [goalToAddProgress, setGoalToAddProgress] = useState<FinancialGoal | null>(null);
  const { t } = useTranslation();
  const { toast } = useToast();
  const { subscription, isLoading: isSubscriptionLoading } = useSubscription();

  // Memoize Firestore references
  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const transactionsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'transactions') : null, [firestore, user]);
  const cardsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'cards') : null, [firestore, user]);
  const categoriesRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'custom_categories') : null, [firestore, user]);
  const goalsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'goals') : null, [firestore, user]);


  // Fetch data using hooks
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);
  const { data: transactions, isLoading: isTransactionsLoading } = useCollection<Transaction>(transactionsRef);
  const { data: creditCardsFromHook, isLoading: isCardsLoading } = useCollection<CreditCard>(cardsRef);
  const { data: customCategories, isLoading: isCategoriesLoading } = useCollection<CustomCategory>(categoriesRef);
  const { data: goals, isLoading: isGoalsLoading } = useCollection<FinancialGoal>(goalsRef);
  
  // Local state for optimistic UI updates
  const [localCreditCards, setLocalCreditCards] = useState<CreditCard[]>([]);

  useEffect(() => {
    if (creditCardsFromHook) {
      setLocalCreditCards(creditCardsFromHook);
    }
  }, [creditCardsFromHook]);


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

  const handleOnboardingComplete = (personality: AIPersonality, knowledge: AIKnowledgeLevel) => {
    if (userProfileRef && user) {
        const profileData = { 
            id: user.uid, 
            aiPersonality: personality.id, 
            aiKnowledgeLevel: knowledge.id 
        };
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

  const handleCardDialogFinished = (updatedCard?: CreditCard) => {
    setEditingCard(null);
  };

  const handleColorChange = (newColor: string) => {
    if (editingCard) {
      setLocalCreditCards(prevCards =>
        prevCards.map(c =>
          c.id === editingCard.id ? { ...c, color: newColor } : c
        )
      );
    }
  };
  
  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsTransactionDialogOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionDialogOpen(true);
  };

  const handleAddGoal = () => {
    setEditingGoal(null);
    setIsGoalDialogOpen(true);
  };

  const handleEditGoal = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setIsGoalDialogOpen(true);
  };

  const handleAddProgress = (goal: FinancialGoal) => {
    setGoalToAddProgress(goal);
    setIsAddProgressDialogOpen(true);
  };
  
    const handleUndoDelete = (deletedTransactions: Transaction[]) => {
        if (!user || !firestore) return;
        const batch = writeBatch(firestore);
        deletedTransactions.forEach(t => {
            const docRef = doc(firestore, 'users', user.uid, 'transactions', t.id);
            // We need to convert date back to Timestamp for Firestore
            const firestoreTransaction = { ...t, date: new Date(t.date) }; 
            batch.set(docRef, firestoreTransaction);
        });
        batch.commit().then(() => {
            toast({ title: "Restaurado!", description: "A transação foi restaurada." });
        }).catch(err => {
            console.error("Error undoing delete:", err);
            toast({ title: "Erro", description: "Não foi possível restaurar a transação.", variant: "destructive" });
        });
    };

  const handleDeleteTransaction = async (transactionToDelete: Transaction) => {
    if (!user || !firestore) return;
  
    const isInstallment = transactionToDelete.installments && transactionToDelete.installments > 1;
    const confirmationMessage = isInstallment
      ? "Esta é uma compra parcelada. Deseja excluir esta e todas as parcelas futuras?"
      : t.modals.delete_transaction.confirmation;
  
    if (window.confirm(confirmationMessage)) {
      try {
        const transactionsToDelete: Transaction[] = [];

        if (isInstallment && transactionToDelete.installmentId) {
          const batch = writeBatch(firestore);
          const installmentsQuery = query(
            collection(firestore, 'users', user.uid, 'transactions'),
            where('installmentId', '==', transactionToDelete.installmentId),
            where('date', '>=', transactionToDelete.date)
          );
  
          const querySnapshot = await getDocs(installmentsQuery);
          querySnapshot.forEach(doc => {
            transactionsToDelete.push({ id: doc.id, ...doc.data() } as Transaction);
            batch.delete(doc.ref);
          });
  
          await batch.commit();
          toast({ 
              title: "Parcelas Excluídas", 
              description: "A transação e suas parcelas futuras foram removidas.",
              action: <ToastAction altText="Desfazer" onClick={() => handleUndoDelete(transactionsToDelete)}>Desfazer</ToastAction>
          });
        } else {
          transactionsToDelete.push(transactionToDelete);
          await deleteDoc(doc(firestore, 'users', user.uid, 'transactions', transactionToDelete.id));
          toast({ 
              title: t.toasts.transaction_deleted.title, 
              description: t.toasts.transaction_deleted.description,
              action: <ToastAction altText="Desfazer" onClick={() => handleUndoDelete(transactionsToDelete)}>Desfazer</ToastAction>
          });
        }
      } catch (error) {
        console.error("Error deleting transaction(s): ", error);
        toast({ title: t.toasts.error.title, description: t.toasts.error.description, variant: 'destructive' });
      }
    }
  };

  const { netBalance, cashBalance } = useMemo(() => {
    const today = startOfToday();
    const currentCashBalance = (typedTransactions || []).reduce((acc, t) => {
      if (t.cardId) return acc; // Ignore card transactions for cash balance
      const multiplier = t.type === 'income' ? 1 : -1;
      return acc + t.amount * multiplier;
    }, 0);
    
    const currentMonthCardBill = (typedTransactions || []).reduce((acc, t) => {
      if (t.cardId && t.type === 'expense' && isSameMonth(getDateFromTimestamp(t.date), today)) {
        return acc + t.amount;
      }
      return acc;
    }, 0);

    return {
      netBalance: currentCashBalance - currentMonthCardBill,
      cashBalance: currentCashBalance
    };
  }, [typedTransactions]);

  const isLoading = isProfileLoading || isTransactionsLoading || isCardsLoading || isCategoriesLoading || isGoalsLoading || isSubscriptionLoading;

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
        ) : !userProfile?.aiPersonality || !userProfile?.aiKnowledgeLevel ? (
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className='md:col-span-2 lg:col-span-1'>
                    <BalanceCard 
                        netBalance={netBalance} 
                        cashBalance={cashBalance}
                        onAddTransaction={handleAddTransaction} 
                    />
                </div>
                 <div className='md:col-span-2 lg:col-span-2'>
                    <DailyInsightCard 
                        transactions={typedTransactions}
                        personality={personality}
                        balance={netBalance}
                    />
                 </div>
              </div>


              <div className="mt-6 space-y-6">
                  <CardsCarousel 
                    cards={localCreditCards || []} 
                    transactions={typedTransactions} 
                    onAddCard={handleAddCard}
                    onEditCard={handleEditCard}
                  />

                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    <FinancialGoalsCard 
                        goals={goals || []}
                        onAddGoal={handleAddGoal}
                        onEditGoal={handleEditGoal}
                        onAddProgress={handleAddProgress}
                    />
                    <InstallmentTunnelChart transactions={typedTransactions} cards={localCreditCards || []} />
                  </div>
                  
                   <AiAdvisorCard
                        knowledge={knowledge}
                        personality={personality}
                        onKnowledgeChange={handleKnowledgeChange}
                        onPersonalityChange={handlePersonalityChange}
                        transactions={typedTransactions}
                        cards={localCreditCards || []}
                        balance={netBalance}
                    />

                  <RecentTransactions 
                    transactions={typedTransactions}
                    categories={customCategories || []}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                  />
                   <div className="text-center pt-4">
                      <Button asChild variant="outline">
                        <Link href="/dashboard/history">
                          <History className="mr-2 h-4 w-4" />
                          {t.dashboard.view_full_history}
                        </Link>
                      </Button>
                      <Button className="ml-4" onClick={handleAddTransaction} >
                        <PlusCircle className="mr-2 h-4 w-4" /> {t.dashboard.add_transaction}
                     </Button>
                    </div>
                </div>
              </div>
              <TransactionDialog 
                isOpen={isTransactionDialogOpen} 
                setIsOpen={setIsTransactionDialogOpen} 
                transactions={typedTransactions}
                creditCards={localCreditCards || []}
                customCategories={customCategories || []}
                transactionToEdit={editingTransaction}
                onFinished={() => setEditingTransaction(null)}
              />
              <AddCardDialog
                isOpen={isCardDialogOpen}
                setIsOpen={setIsCardDialogOpen}
                cardToEdit={editingCard}
                onFinished={handleCardDialogFinished}
                onColorChange={handleColorChange}
              />
              <GoalDialog
                isOpen={isGoalDialogOpen}
                setIsOpen={setIsGoalDialogOpen}
                goalToEdit={editingGoal}
                onFinished={() => setEditingGoal(null)}
              />
              <AddProgressDialog
                isOpen={isAddProgressDialogOpen}
                setIsOpen={setIsAddProgressDialogOpen}
                goal={goalToAddProgress}
                onFinished={() => setGoalToAddProgress(null)}
              />
            </div>
        )}
    </AuthGate>
  )
}
