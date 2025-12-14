"use client";

import { useState, useMemo } from 'react';
import { addMonths } from 'date-fns';
import Header from '@/components/header';
import { BalanceCard } from '@/components/balance-card';
import { RecentTransactions } from '@/components/recent-transactions';
import { ProjectedBalanceTimeline } from '@/components/projected-balance-timeline';
import { AiAdvisorCard } from '@/components/ai-advisor-card';
import { TransactionDialog } from '@/components/transaction-dialog';
import type { Transaction, AIPersonality } from '@/lib/types';
import { mockTransactions } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userPreferences, setUserPreferences] = useState<{aiPersonality: AIPersonality}>({ aiPersonality: 'Warren Buffett' });

  const currentBalance = useMemo(() => {
    return transactions.reduce((acc, t) => {
      const multiplier = t.type === 'income' ? 1 : -1;
      return acc + t.amount * multiplier;
    }, 0);
  }, [transactions]);
  
  const projectedData = useMemo(() => {
    const projections: { month: Date; balance: number }[] = [];
    let lastBalance = currentBalance;
    const today = new Date();

    for (let i = 1; i <= 6; i++) {
      const targetMonth = addMonths(today, i);
      const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
      const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

      const futureInstallments = transactions
        .filter(t => t.installment_group_id && t.type === 'expense' && t.installments_paid && t.installments_total)
        .flatMap(t => {
            const newTransactions: Transaction[] = [];
            if(t.installments_paid! < t.installments_total!) {
                for (let j = 1; j < (t.installments_total! - t.installments_paid! + 1); j++) {
                    const futureDate = addMonths(t.date, j);
                     if (futureDate >= monthStart && futureDate <= monthEnd) {
                        newTransactions.push({ ...t, date: futureDate, id: crypto.randomUUID() });
                    }
                }
            }
            return newTransactions;
        });

      const monthBalance = futureInstallments.reduce((acc, t) => acc - t.amount, lastBalance);
      
      projections.push({ month: monthStart, balance: monthBalance });
      lastBalance = monthBalance;
    }
    return projections;
  }, [transactions, currentBalance]);

  const handleAddTransaction = (newTransactions: Transaction[]) => {
    setTransactions(prev => [...prev, ...newTransactions].sort((a, b) => b.date.getTime() - a.date.getTime()));
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <BalanceCard balance={currentBalance} onAddTransaction={() => setIsDialogOpen(true)} />
          <ProjectedBalanceTimeline data={projectedData} />
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
      />
    </div>
  );
}
