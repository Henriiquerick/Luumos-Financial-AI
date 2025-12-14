import { addMonths, startOfMonth, isSameMonth } from 'date-fns';
import type { Transaction } from '@/lib/types';

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
