'use client';

import { useState, useMemo } from 'react';
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
  
  // State for AI Advisor
  const [personality, setPersonality] = useState<AIPersonality>(PERSONALITIES.find(p => p.id === userProfile?.aiPersonality) || PERSONALITIES.find(p => p.id === 'neytan')!);
  const [knowledge, setKnowledge] = useState<AIKnowledgeLevel>(KNOWLEDGE_LEVELS.find(k => k.id === userProfile?.aiKnowledgeLevel) || KNOWLEDGE_LEVELS.find(k => k.id === 'lumos-five')!);


  const handleInvalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['financial-data', user?.uid] });
  };

  const { netBalance, cashBalance } = useMemo(() => {
    const today = startOfToday();
    const currentCashBalance = transactions.reduce((acc, t) => {
      if (t.cardId) return acc; // ignora transações de cartão para o saldo em conta
      const multiplier = t.type === 'income' ? 1 : -1;
      return acc + t.amount * multiplier;
    }, 0);
    
    // O disponível real é o saldo em conta menos as faturas ABERTAS
    const currentMonthCardBill = transactions.reduce((acc, t) => {
      const card = creditCards.find(c => c.id === t.cardId);
      if(!card) return acc;
      
      const transactionDate = getDateFromTimestamp(t.date);
      const closingDay = card.closingDay;
      const transactionDay = transactionDate.getDate();

      // Fatura do mês atual: compra feita ANTES do dia do fechamento, no mês ATUAL
      const isCurrentBill = isSameMonth(transactionDate, today) && transactionDay <= closingDay;
      // Fatura do mês atual: compra feita DEPOIS do dia do fechamento, no mês ANTERIOR
      const isPreviousMonthBill = isSameMonth(addMonths(transactionDate, 1), today) && transactionDay > closingDay;

      if (t.type === 'expense' && (isCurrentBill || isPreviousMonthBill)) {
        return acc + t.amount;
      }
      return acc;
    }, 0);

    return {
      netBalance: currentCashBalance - currentMonthCardBill,
      cashBalance: currentCashBalance
    };
  }, [transactions, creditCards]);

  const isLoading = isFinancialDataLoading || isSubscriptionLoading || isProfileLoading;
  
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
  
  // A proteção de rota agora está no layout, então aqui só precisamos dos dados
  if (!userProfile) {
    // Isso não deve acontecer se a proteção de rota funcionar, mas é uma salvaguarda
    return null; 
  }

  const handleAddCard = () => {
    setEditingCard(null);
    setIsCardDialogOpen(true);
  };

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setIsCardDialogOpen(true);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!user) return;

    const cardToDelete = creditCards.find(c => c.id === cardId);
    if (!cardToDelete) return;

    // Passo A (Imediato): Adiciona o ID ao estado otimista para esconder o cartão da UI
    setOptimisticDeletedCardIds(prev => [...prev, cardId]);

    try {
      // Passo B (Async): Executa a exclusão no banco de dados
      const cardDocRef = doc(firestore, 'users', user.uid, 'cards', cardId);
      const transactionsRef = collection(firestore, 'users', user.uid, 'transactions');
      const q = query(transactionsRef, where('cardId', '==', cardId));
      const querySnapshot = await getDocs(q);

      const batch = writeBatch(firestore);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      batch.delete(cardDocRef);
      await batch.commit();

      toast({
        title: t.toasts.card.deleted.title,
        description: t.toasts.card.deleted.description.replace('{cardName}', cardToDelete.name),
      });

      // Consolida o estado invalidando a query, que irá buscar os dados frescos
      handleInvalidateQueries();

    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        variant: 'destructive',
        title: t.toasts.error.title,
        description: t.toasts.error.description,
      });
      // Passo C (Erro): Reverte a UI otimista se a exclusão falhar
      setOptimisticDeletedCardIds(prev => prev.filter(id => id !== cardId));
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
          const firestoreTransaction = { ...t, date: new Date(t.date) }; 
          batch.set(docRef, firestoreTransaction);
      });
      batch.commit().then(() => {
          toast({ title: "Restaurado!", description: "A transação foi restaurada." });
          handleInvalidateQueries();
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
        handleInvalidateQueries();
      } catch (error) {
        console.error("Error deleting transaction(s): ", error);
        toast({ title: t.toasts.error.title, description: t.toasts.error.description, variant: 'destructive' });
      }
    }
  };
  
  const visibleCards = creditCards.filter(card => !optimisticDeletedCardIds.includes(card.id));

  return (
        <div className="w-full max-w-7xl mx-auto">
          <Header userProfile={userProfile as UserProfile} />
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
                    transactions={transactions}
                    personality={personality}
                    balance={netBalance}
                />
              </div>
          </div>
          
          <AdSenseBanner slotId={process.env.NEXT_PUBLIC_ADSENSE_BANNER_SLOT_ID!} />

          <div className="mt-6 space-y-6">
              <CardsCarousel 
                cards={visibleCards} 
                transactions={transactions} 
                onAddCard={handleAddCard}
                onEditCard={handleEditCard}
                onDeleteCard={handleDeleteCard}
              />

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <FinancialGoalsCard 
                    goals={goals}
                    onAddGoal={handleAddGoal}
                    onEditGoal={handleEditGoal}
                    onAddProgress={handleAddProgress}
                />
                <InstallmentTunnelChart transactions={transactions} cards={creditCards} />
              </div>
              
                <AiAdvisorCard
                    knowledge={knowledge}
                    personality={personality}
                    onKnowledgeChange={setKnowledge}
                    onPersonalityChange={setPersonality}
                    transactions={transactions}
                    cards={creditCards}
                    balance={netBalance}
                />

              <RecentTransactions 
                transactions={visibleTransactions}
                categories={customCategories}
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
          
            <TransactionDialog 
                isOpen={isTransactionDialogOpen} 
                setIsOpen={setIsTransactionDialogOpen} 
                transactions={transactions}
                creditCards={creditCards}
                customCategories={customCategories}
                transactionToEdit={editingTransaction}
                onFinished={() => {
                    setEditingTransaction(null);
                    handleInvalidateQueries();
                }}
            />
            <AddCardDialog
                isOpen={isCardDialogOpen}
                setIsOpen={setIsCardDialogOpen}
                cardToEdit={editingCard}
                onFinished={() => {
                    setEditingCard(null);
                    handleInvalidateQueries();
                }}
                onColorChange={() => {}}
            />
            <GoalDialog
                isOpen={isGoalDialogOpen}
                setIsOpen={setIsGoalDialogOpen}
                goalToEdit={editingGoal}
                onFinished={() => {
                    setEditingGoal(null);
                    handleInvalidateQueries();
                }}
            />
            <AddProgressDialog
                isOpen={isAddProgressDialogOpen}
                setIsOpen={setIsAddProgressDialogOpen}
                goal={goalToAddProgress}
                onFinished={() => {
                    setGoalToAddProgress(null);
                    handleInvalidateQueries();
                }}
            />
        </div>
  )
}
