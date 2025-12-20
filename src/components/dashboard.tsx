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
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, deleteDoc, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { PersonaOnboarding } from './persona-onboarding';
import { Skeleton } from './ui/skeleton';
import { AuthGate } from './auth-gate';
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
import { useFinancialData } from '@/hooks/use-financial-data';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';


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
  const router = useRouter();
  
  const { data: financialData, isLoading: isFinancialDataLoading } = useFinancialData();
  const { 
    transactions = [], 
    creditCards = [], 
    customCategories = [], 
    goals = [] 
  } = financialData || {};

  const { data: userProfile, isLoading: isProfileLoading } = useFinancialData();
  const { subscription, isLoading: isSubscriptionLoading } = useSubscription();

  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isAddProgressDialogOpen, setIsAddProgressDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [goalToAddProgress, setGoalToAddProgress] = useState<FinancialGoal | null>(null);
  
  const handleInvalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['financial-data', user?.uid] });
  };

  const handleOnboardingComplete = (personality: AIPersonality, knowledge: AIKnowledgeLevel) => {
    if (user) {
        const userProfileRef = doc(firestore, 'users', user.uid);
        const profileData = { 
            id: user.uid, 
            aiPersonality: personality.id, 
            aiKnowledgeLevel: knowledge.id 
        };
        setDocumentNonBlocking(userProfileRef, profileData, { merge: true });
        handleInvalidateQueries();
    }
  }

  const { netBalance, cashBalance } = useMemo(() => {
    const today = startOfToday();
    const currentCashBalance = transactions.reduce((acc, t) => {
      if (t.cardId) return acc;
      const multiplier = t.type === 'income' ? 1 : -1;
      return acc + t.amount * multiplier;
    }, 0);
    
    const currentMonthCardBill = transactions.reduce((acc, t) => {
      if (t.cardId && t.type === 'expense' && isSameMonth(getDateFromTimestamp(t.date), today)) {
        return acc + t.amount;
      }
      return acc;
    }, 0);

    return {
      netBalance: currentCashBalance - currentMonthCardBill,
      cashBalance: currentCashBalance
    };
  }, [transactions]);

  const isLoading = isFinancialDataLoading || isSubscriptionLoading || isProfileLoading;
  
  // DEBUG SCREEN
  if (true) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono p-8">
        <h1 className="text-3xl font-bold border-b border-green-700 pb-2 mb-4">RAIO-X DO DASHBOARD</h1>
        
        <div className="bg-gray-900/50 border border-green-800 p-4 rounded-lg">
            <p>Status: <span className={isLoading ? 'text-yellow-400' : 'text-green-400'}>{isLoading ? 'Carregando dados...' : 'Dados Carregados'}</span></p>
            <p>User ID: <span className="text-cyan-400">{user?.uid || 'Nenhum usuário logado'}</span></p>
        </div>

        <div className="mt-6">
            <h2 className="text-xl border-b border-green-800 pb-1 mb-2">Verificação de Onboarding</h2>
            <div className="bg-gray-900/50 border border-green-800 p-4 rounded-lg">
                <p>O perfil do usuário (`userProfile`) foi encontrado? {userProfile ? <span className='text-green-400'>SIM</span> : <span className='text-red-500'>NÃO</span>}</p>
                <p>Campo `aiPersonality` existe no perfil? {userProfile?.aiPersonality ? <span className='text-green-400'>SIM (Valor: {userProfile.aiPersonality})</span> : <span className='text-red-500'>NÃO</span>}</p>
            </div>
        </div>

        <div className="mt-6">
            <h2 className="text-xl border-b border-green-800 pb-1 mb-2">Objeto UserProfile Completo (do hook `useFinancialData`):</h2>
            <pre className="bg-gray-900 p-4 rounded text-xs border border-green-800 max-h-96 overflow-auto">
                {JSON.stringify(userProfile, null, 2)}
            </pre>
        </div>
        
        <div className="mt-10 border-t border-gray-700 pt-5 opacity-30">
           <h2 className="text-xl mb-4 text-center text-gray-500">--- PREVIEW DO APP ABAIXO ---</h2>
           {userProfile && <Header userProfile={userProfile} />}
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tighter">
                  {userProfile?.firstName ? `${t.dashboard.greeting} ${userProfile.firstName}!` : t.dashboard.welcome_back}
                </h1>
                <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
            </div>
        </div>
      </div>
    );
  }


  if (!isLoading && (!userProfile || !userProfile.aiPersonality)) {
     return <PersonaOnboarding onComplete={handleOnboardingComplete} />
  }

  const personality = PERSONALITIES.find(p => p.id === userProfile?.aiPersonality) || PERSONALITIES.find(p => p.id === 'neytan')!;
  const knowledge = KNOWLEDGE_LEVELS.find(k => k.id === userProfile?.aiKnowledgeLevel) || KNOWLEDGE_LEVELS.find(k => k.id === 'lumos-five')!;

  const handleAddCard = () => {
    setEditingCard(null);
    setIsCardDialogOpen(true);
  };

  const handleEditCard = (card: CreditCard) => {
    setEditingCard(card);
    setIsCardDialogOpen(true);
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
                        transactions={transactions}
                        personality={personality}
                        balance={netBalance}
                    />
                 </div>
              </div>

              <div className="mt-6 space-y-6">
                  <CardsCarousel 
                    cards={creditCards} 
                    transactions={transactions} 
                    onAddCard={handleAddCard}
                    onEditCard={handleEditCard}
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
                        onKnowledgeChange={handleKnowledgeChange}
                        onPersonalityChange={handlePersonalityChange}
                        transactions={transactions}
                        cards={creditCards}
                        balance={netBalance}
                    />

                  <RecentTransactions 
                    transactions={transactions}
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
              </div>
        )}
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
    </AuthGate>
  )
}
