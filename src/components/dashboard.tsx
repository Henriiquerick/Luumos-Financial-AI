'use client';

import { useState, useMemo } from 'react';
import Header from '@/components/header';
import { BalanceCard } from '@/components/balance-card';
import { RecentTransactions } from '@/components/recent-transactions';
import { InstallmentTunnelChart } from '@/components/installment-tunnel-chart';
import { AiAdvisorCard } from '@/components/ai-advisor-card';
import { TransactionDialog } from '@/components/transaction-dialog';
import type { Transaction, AIPersonality, CreditCard } from '@/lib/types';
import { mockTransactions, mockCreditCards } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { PERSONAS } from '@/lib/personas';
import { CardsCarousel } from '@/components/cards-carousel';
import { DailyInsightCard } from '@/components/daily-insight-card';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [creditCards, setCreditCards] = useState<CreditCard[]>(mockCreditCards);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userPreferences, setUserPreferences] = useState<{aiPersonality: AIPersonality}>({ aiPersonality: PERSONAS[0] });

  const currentBalance = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.cardId) return acc; // Don't count card transactions in cash balance
      const multiplier = t.type === 'income' ? 1 : -1;
      return acc + t.amount * multiplier;
    }, 0);
  }, [transactions]);

  const handleAddTransaction = (newTransactions: Transaction[]) => {
    setTransactions(prev => [...prev, ...newTransactions].sort((a, b) => b.date.getTime() - a.date.getTime()));
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Header />
      <DailyInsightCard 
        transactions={transactions}
        personality={userPreferences.aiPersonality}
        balance={currentBalance}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <BalanceCard balance={currentBalance} onAddTransaction={() => setIsDialogOpen(true)} />
          <CardsCarousel cards={creditCards} transactions={transactions} />
          <InstallmentTunnelChart transactions={transactions} />
          <RecentTransactions transactions={transactions} />
        </div>
        <div className="space-y-6">
          <div className="block lg:hidden">
            <Button className="w-full" onClick={() => setIsDialogOpen(true)} >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
            </Button>
          </div>
          <AiAdvisorCard
            personality={userPreferences.aiPersonality}
            onPersonalityChange={(p) => setUserPreferences({ aiPersonality: p })}
            transactions={transactions}
          />
        </div>
      </div>
      <TransactionDialog 
        isOpen={isDialogOpen} 
        setIsOpen={setIsDialogOpen} 
        onSave={handleAddTransaction}
        transactions={transactions}
        creditCards={creditCards}
      />
    </div>
  );
}
