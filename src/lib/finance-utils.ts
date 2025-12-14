import { addMonths, startOfMonth, isSameMonth, startOfToday } from 'date-fns';
import type { Transaction, CreditCard } from '@/lib/types';

export function calculateMonthlyProjection(
  transactions: Transaction[],
  currentBalance: number,
  projectionMonths = 6
): { month: Date; balance: number }[] {
  const projections: { month: Date; balance: number }[] = [];
  let lastBalance = currentBalance;
  const today = startOfToday();

  // Find monthly income to project forward
  const monthlyIncomes = transactions.filter(t => t.type === 'income' && !t.cardId);
  // Simple average of last few months salary.
  // A more complex implementation could be used here.
  const estimatedMonthlySalary =
    monthlyIncomes.length > 0
      ? monthlyIncomes.reduce((acc, t) => acc + t.amount, 0) / monthlyIncomes.length
      : 0;

  for (let i = 1; i <= projectionMonths; i++) {
    const targetMonthDate = addMonths(today, i);
    const monthStart = startOfMonth(targetMonthDate);

    // Sum of future installments and single expenses for the given month
    const futureExpensesOnMonth = transactions.filter(t => 
        t.type === 'expense' &&
        !t.cardId && // Only consider cash/debit expenses for cash flow projection
        isSameMonth(t.date, monthStart) &&
        t.date >= today
    );
    
    const monthlyExpense = futureExpensesOnMonth.reduce((acc, t) => acc + t.amount, 0);

    // For simplicity, we assume salary is added at the start of the month
    // and expenses are deducted.
    const monthEndBalance = lastBalance + estimatedMonthlySalary - monthlyExpense;

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

  // Get all transactions for this card that are expenses
  const cardExpenseTransactions = allTransactions.filter(t => t.cardId === cardId && t.type === 'expense');

  const totalSpent = cardExpenseTransactions.reduce((acc, t) => {
    // For installment purchases, the total value consumes the limit at once.
    // We need to find the first installment to get the full amount.
    if (t.installmentId && t.installments > 1) {
        // Check if we've already processed this installment group
        const isFirstInstallment = !allTransactions.some(
            prev => prev.installmentId === t.installmentId && prev.date < t.date
        );

        if (isFirstInstallment) {
            // This is the first time we see this installment group, count the whole purchase value
            return acc + (t.amount * t.installments);
        }
        // If not the first, we've already counted it, so add 0.
        return acc;
    }
    // For single payments, just add the amount.
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
