import { addMonths, startOfMonth, isSameMonth } from 'date-fns';
import type { Transaction, CreditCard } from '@/lib/types';

export function calculateMonthlyProjection(
  transactions: Transaction[],
  currentBalance: number,
  projectionMonths = 6
): { month: Date; balance: number }[] {
  const projections: { month: Date; balance: number }[] = [];
  let lastBalance = currentBalance;
  const today = new Date();

  // Find monthly income to project forward
  const monthlyIncomes = transactions.filter(t => t.type === 'income');
  // Simple average of last few months salary.
  // A more complex implementation could be used here.
  const estimatedMonthlySalary =
    monthlyIncomes.length > 0
      ? monthlyIncomes.reduce((acc, t) => acc + t.amount, 0) / monthlyIncomes.length
      : 0;

  for (let i = 1; i <= projectionMonths; i++) {
    const targetMonthDate = addMonths(today, i);
    const monthStart = startOfMonth(targetMonthDate);

    // Sum of future installments for the given month
    const futureInstallmentsOnMonth = transactions.filter(t => 
        t.type === 'expense' &&
        t.installmentId &&
        t.installments > 1 &&
        isSameMonth(t.date, monthStart) &&
        t.date > today
    );
    
    const monthlyInstallmentExpense = futureInstallmentsOnMonth.reduce((acc, t) => acc + t.amount, 0);

    // For simplicity, we assume salary is added at the start of the month
    // and installments are deducted.
    const monthEndBalance = lastBalance + estimatedMonthlySalary - monthlyInstallmentExpense;

    projections.push({ month: monthStart, balance: monthEndBalance });
    lastBalance = monthEndBalance;
  }

  return projections;
}

export function getCardUsage(
  cardId: string,
  allTransactions: Transaction[],
  allCards: CreditCard[]
) {
  const card = allCards.find(c => c.id === cardId);
  if (!card) {
    throw new Error('Card not found');
  }

  // Get all unique installment IDs for this card to avoid double counting.
  const installmentTransactionIds = new Set<string>();
  const cardTransactions = allTransactions.filter(t => {
    if (t.cardId !== cardId) return false;
    
    if (t.installmentId) {
      if (installmentTransactionIds.has(t.installmentId)) {
        return false;
      }
      installmentTransactionIds.add(t.installmentId);
    }
    return true;
  });

  const totalSpent = cardTransactions.reduce((acc, t) => {
    // For installment purchases, the total amount is the amount of the first transaction multiplied by the number of installments.
    if (t.installmentId && t.installments > 1) {
      // Find the original transaction group to get the total amount
      const originalGroup = allTransactions.filter(tx => tx.installmentId === t.installmentId);
      const totalAmount = originalGroup[0].amount * originalGroup[0].installments;
      return acc + totalAmount;
    }
    return acc + t.amount;
  }, 0);

  const availableLimit = card.totalLimit - totalSpent;

  return {
    totalLimit: card.totalLimit,
    spent: totalSpent,
    availableLimit: availableLimit,
    usagePercentage: (totalSpent / card.totalLimit) * 100,
  };
}
