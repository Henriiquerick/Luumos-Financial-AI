
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
import { useUser, useFirestore } from '@/firebase';
import { doc, deleteDoc, writeBatch, query, where, getDocs, collection } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { AddCardDialog } from './add-card-dialog';
import { useTranslation } from '@/contexts/language-context';
import { isSameMonth, startOfToday, addMonths } from 'date-fns';
import { getDateFromTimestamp } from '@/lib/finance-utils';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ToastAction } from '@/components/ui/toast';
import { FinancialGoalsCard } from './financial-goals-card';
import { GoalDialog } from './goal-dialog';
import { AddProgressDialog } from './add-progress-dialog';
import { useSubscription } from '@/hooks/useSubscription';
import { useFinancialData } from '@/hooks/use-financial-data';
import { useQueryClient } from '@tanstack/react-query';
import { useUserProfile } from '@/hooks/use-user-profile';
import { AdSenseBanner } from './ads/adsense-banner';


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
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const { profile: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const { data: financialData, isLoading: isFinancialDataLoading } = useFinancialData();
  const { 
    transactions = [], 
    visibleTransactions = [],
    creditCards = [], 
    customCategories = [], 
    goals = [] 
  } = financialData || {};

  const { subscription, isLoading: isSubscriptionLoading } = useSubscription();

  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isAddProgressDialogOpen, setIsAddProgressDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [goalToAddProgress, setGoalToAddProgress] = useState<FinancialGoal | null>(null);
  const [optimisticDeletedCardIds, setOptimisticDeletedCardIds] = useState<string[]>([]);
  
  const [personality, setPersonality] = useState<AIPersonality>(PERSONALITIES[0]);
  const [knowledge, setKnowledge] = useState<AIKnowledgeLevel>(KNOWLEDGE_LEVELS[0]);

  useEffect(() => {
    if (userProfile) {
      const initialPersonality = PERSONALITIES.find(p => p.id === userProfile.aiPersonality) || PERSONALITIES[0];
      const initialKnowledge = KNOWLEDGE_LEVELS.find(k => k.id === userProfile.aiKnowledgeLevel) || KNOWLEDGE_LEVELS[0];
      setPersonality(initialPersonality);
      setKnowledge(initialKnowledge);
    }
  }, [userProfile]);


  const handleInvalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['financial-data', user?.uid] });
  };

  const { netBalance, cashBalance } = useMemo(() => {
    const today = startOfToday();
    const currentCashBalance = transactions.reduce((acc, t) => {
      if (t.cardId) return acc;
      const multiplier = t.type === 'income' ? 1 : -1;
      return acc + t.amount * multiplier;
    }, 0);
    
    const currentMonthCardBill = transactions.reduce((acc, t) => {
      const card = creditCards.find(c => c.id === t.cardId);
      if(!card) return acc;
      
      const transactionDate = getDateFromTimestamp(t.date);
      const closingDay = card.closingDay;
      const transactionDay = transactionDate.getDate();

      const isCurrentBill = isSameMonth(transactionDate, today) && transactionDay <= closingDay;
      const isPreviousMonthBill = isSameMonth(addMonths(transactionDate, 1), today) && transactionDay > closingDay;

      if (t.type === 'expense' && (isCurrentBill || isPreviousMonthBill)) return acc + t.amount;
      return acc;
    }, 0);

    return { netBalance: currentCashBalance - currentMonthCardBill, cashBalance: currentCashBalance };
  }, [transactions, creditCards]);

  const isLoading = isFinancialDataLoading || isSubscriptionLoading || isProfileLoading;
  
  if (isLoading) {
      return (
            <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background">
              <div className="w-full max-w-7xl space-y-8">
                <Skeleton className="h-16 w-1/3" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>
                <Skeleton className="h-12 w-1/4 mx-auto" />
              </div>
          </main>
      );
  }
  
  if (!userProfile) return null;

  const handleAddCard = () => { setEditingCard(null); setIsCardDialogOpen(true); };
  const handleEditCard = (card: CreditCard) => { setEditingCard(card); setIsCardDialogOpen(true); };

  const handleDeleteCard = async (cardId: string) => {
    if (!user) return;
    const cardToDelete = creditCards.find(c => c.id === cardId);
    if (!cardToDelete) return;
    setOptimisticDeletedCardIds(prev => [...prev, cardId]);
    try {
      const cardDocRef = doc(firestore, 'users', user.uid, 'cards', cardId);
      const transactionsRef = collection(firestore, 'users', user.uid, 'transactions');
      const q = query(transactionsRef, where('cardId', '==', cardId));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(firestore);
      querySnapshot.forEach((doc) => batch.delete(doc.ref));
      batch.delete(cardDocRef);
      await batch.commit();
      toast({ title: t.toasts.card.deleted.title, description: t.toasts.card.deleted.description.replace('{cardName}', cardToDelete.name) });
      handleInvalidateQueries();
    } catch (error) {
      toast({ variant: 'destructive', title: t.toasts.error.title, description: t.toasts.error.description });
      setOptimisticDeletedCardIds(prev => prev.filter(id => id !== cardId));
    }
  };
  
  const handleAddTransaction = () => { setEditingTransaction(null); setIsTransactionDialogOpen(true); };
  const handleEditTransaction = (transaction: Transaction) => { setEditingTransaction(transaction); setIsTransactionDialogOpen(true); };
  const handleAddGoal = () => { setEditingGoal(null); setIsGoalDialogOpen(true); };
  const handleEditGoal = (goal: FinancialGoal) => { setEditingGoal(goal); setIsGoalDialogOpen(true); };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user || !firestore) return;
    const goalToDelete = goals.find(g => g.id === goalId);
    if (!goalToDelete) return;
    if (window.confirm(t.modals.delete_goal.confirmation.replace('{goalTitle}', goalToDelete.title))) {
      try {
        await deleteDoc(doc(firestore, 'users', user.uid, 'goals', goalId));
        toast({ title: t.toasts.goal_deleted.title, description: t.toasts.goal_deleted.description });
        handleInvalidateQueries();
      } catch (error) {
        toast({ variant: 'destructive', title: t.toasts.error.title, description: t.toasts.error.description });
      }
    }
  };

  const handleAddProgress = (goal: FinancialGoal) => { setGoalToAddProgress(goal); setIsAddProgressDialogOpen(true); };
  
  const handleResetData = async () => {
    if (!user || !firestore) return;
    if (!window.confirm(t.modals.reset_data.confirmation)) return;
    try {
      const transactionsRef = collection(firestore, 'users', user.uid, 'transactions');
      const snapshot = await getDocs(transactionsRef);
      const batch = writeBatch(firestore);
      snapshot.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      toast({ title: t.toasts.reset_success.title, description: t.toasts.reset_success.description });
      handleInvalidateQueries();
    } catch (error) {
      toast({ variant: 'destructive', title: t.toasts.error.title, description: t.toasts.error.description });
    }
  };
  
  const visibleCards = creditCards.filter(card => !optimisticDeletedCardIds.includes(card.id));

  // FEATURE: Dashboard Reordering based on preferences
  const moduleOrder = userProfile.frequentModules || ['balance', 'insight', 'cards', 'goals', 'tunnel', 'advisor', 'transactions'];

  const renderModule = (mod: string) => {
    switch(mod) {
        case 'balance': return (
            <div key="balance" className='md:col-span-2 lg:col-span-1'>
                <BalanceCard netBalance={netBalance} cashBalance={cashBalance} onAddTransaction={handleAddTransaction} onResetData={handleResetData} />
            </div>
        );
        case 'insight': return (
            <div key="insight" className='md:col-span-2 lg:col-span-2'>
                <DailyInsightCard transactions={transactions} personality={personality} balance={netBalance} />
            </div>
        );
        case 'cards': return (
            <div key="cards" className="w-full">
                <CardsCarousel cards={visibleCards} transactions={transactions} onAddCard={handleAddCard} onEditCard={handleEditCard} onDeleteCard={handleDeleteCard} />
            </div>
        );
        case 'goals': return (
            <div key="goals" className='w-full'>
                <FinancialGoalsCard goals={goals} onAddGoal={handleAddGoal} onEditGoal={handleEditGoal} onAddProgress={handleAddProgress} onDeleteGoal={handleDeleteGoal} />
            </div>
        );
        case 'tunnel': return (
            <div key="tunnel" className='w-full'>
                <InstallmentTunnelChart transactions={transactions} cards={creditCards} />
            </div>
        );
        case 'advisor': return (
            <div key="advisor" className="w-full">
                <AiAdvisorCard knowledge={knowledge} personality={personality} onKnowledgeChange={setKnowledge} onPersonalityChange={setPersonality} transactions={transactions} cards={creditCards} balance={netBalance} />
            </div>
        );
        case 'transactions': return (
            <div key="transactions" className="w-full space-y-4">
                <RecentTransactions transactions={visibleTransactions} categories={customCategories} onEdit={handleEditTransaction} onDelete={handleDeleteTransaction} />
                <div className="text-center pt-4">
                  <Button asChild variant="outline" className="h-12"><Link href="/dashboard/history"><History className="mr-2 h-4 w-4" />{t.dashboard.view_full_history}</Link></Button>
                  <Button className="ml-4 h-12" onClick={handleAddTransaction}><PlusCircle className="mr-2 h-4 w-4" /> {t.dashboard.add_transaction}</Button>
                </div>
            </div>
        );
        default: return null;
    }
  };

  return (
        <div className="w-full max-w-7xl mx-auto px-4 pb-20">
          <Header userProfile={userProfile} activePersonality={personality} />
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tighter">
              {userProfile?.firstName ? `${t.dashboard.greeting} ${userProfile.firstName}!` : t.dashboard.welcome_back}
            </h1>
            <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {moduleOrder.slice(0, 2).map(m => renderModule(m))}
          </div>
          
          <AdSenseBanner slotId={process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT_ID!} />

          <div className="mt-6 space-y-8">
              {moduleOrder.slice(2, 3).map(m => renderModule(m))}
              
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                 {moduleOrder.slice(3, 5).map(m => renderModule(m))}
              </div>
              
              {moduleOrder.slice(5).map(m => renderModule(m))}
          </div>
          
          <TransactionDialog isOpen={isTransactionDialogOpen} setIsOpen={setIsTransactionDialogOpen} transactions={transactions} creditCards={creditCards} customCategories={customCategories} transactionToEdit={editingTransaction} onFinished={() => { setEditingTransaction(null); handleInvalidateQueries(); }} />
          <AddCardDialog isOpen={isCardDialogOpen} setIsOpen={setIsCardDialogOpen} cardToEdit={editingCard} onFinished={() => { setEditingCard(null); handleInvalidateQueries(); }} onColorChange={() => {}} />
          <GoalDialog isOpen={isGoalDialogOpen} setIsOpen={setIsGoalDialogOpen} goalToEdit={editingGoal} onFinished={() => { setEditingGoal(null); handleInvalidateQueries(); }} />
          <AddProgressDialog isOpen={isAddProgressDialogOpen} setIsOpen={setIsAddProgressDialogOpen} goal={goalToAddProgress} onFinished={() => { setGoalToAddProgress(null); handleInvalidateQueries(); }} />
        </div>
  )
}
