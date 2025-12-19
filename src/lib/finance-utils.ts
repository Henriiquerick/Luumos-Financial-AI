
import { addMonths, startOfMonth, isSameMonth, startOfToday, getDaysInMonth, getDate, subMonths, endOfMonth, format } from 'date-fns';
import type { Transaction, CreditCard } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

export function getDateFromTimestamp(date: Date | Timestamp): Date {
  return (date instanceof Timestamp) ? date.toDate() : date;
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

  const cardExpenseTransactions = allTransactions.filter(t => t.cardId === cardId && t.type === 'expense');

  const totalSpent = cardExpenseTransactions.reduce((acc, t) => {
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

export function generateInsightAnalysis(transactions: Transaction[], balance: number): string {
    const today = new Date();
    const currentMonthStart = startOfMonth(today);
    const previousMonthStart = startOfMonth(subMonths(today, 1));
    const previousMonthEnd = endOfMonth(previousMonthStart);

    const expensesThisMonth = transactions
        .filter(t => t.type === 'expense' && getDateFromTimestamp(t.date) >= currentMonthStart && getDateFromTimestamp(t.date) <= today)
        .reduce((sum, t) => sum + t.amount, 0);

    const expensesLastMonth = transactions
        .filter(t => t.type === 'expense' && getDateFromTimestamp(t.date) >= previousMonthStart && getDateFromTimestamp(t.date) <= previousMonthEnd)
        .reduce((sum, t) => sum + t.amount, 0);

    const daysInMonth = getDaysInMonth(today);
    const dayOfMonth = getDate(today);
    const daysRemaining = daysInMonth - dayOfMonth;
    const balancePerDay = daysRemaining > 0 ? balance / daysRemaining : balance;

    let analysis = `Current cash balance is ${balance.toFixed(2)}. `;
    analysis += `There are ${daysRemaining} days left in the month. This leaves a budget of ${balancePerDay.toFixed(2)} per day. `;
    
    if (expensesLastMonth > 0) {
        const percentageChange = ((expensesThisMonth - expensesLastMonth) / expensesLastMonth) * 100;
        if (percentageChange > 10) {
            analysis += `Spending is up by ${percentageChange.toFixed(0)}% compared to last month. This is a significant increase.`;
        } else if (percentageChange < -10) {
            analysis += `User is saving money, spending is down by ${Math.abs(percentageChange.toFixed(0))}% compared to last month. This is great.`;
        } else {
            analysis += `Spending is stable compared to last month.`;
        }
    } else if (expensesThisMonth > 0) {
        analysis += `Total spending this month is ${expensesThisMonth.toFixed(2)}.`;
    } else {
        analysis += `No expenses recorded this month yet.`;
    }

    return analysis;
}

export function calculateCardBillProjection(
  transactions: Transaction[],
  cards: CreditCard[],
  projectionMonths = 6
): ( { name: string } & { [key: string]: number | string } )[] {
  const today = startOfToday();
  const monthlyBills: { [monthKey: string]: { [cardName: string]: number } } = {};

  // 1. Initialize months and card totals for each month
  for (let i = 0; i < projectionMonths; i++) {
    const month = startOfMonth(addMonths(today, i));
    const monthKey = format(month, 'yyyy-MM'); // Use a sortable format
    monthlyBills[monthKey] = {};
    cards.forEach(card => {
      monthlyBills[monthKey][card.name] = 0;
    });
  }

  // 2. Process each transaction
  transactions.forEach(t => {
    if (!t.cardId || t.type !== 'expense') return; // Only card expenses
    
    const card = cards.find(c => c.id === t.cardId);
    if (!card || !card.closingDay) return;

    const transactionDate = getDateFromTimestamp(t.date);
    const transactionDay = getDate(transactionDate);

    // 3. Determine the correct bill month for the transaction based on closing day
    let firstBillDate;
    if (transactionDay > card.closingDay) {
      // If purchase is after closing day, it falls into the next month's bill
      firstBillDate = addMonths(transactionDate, 1);
    } else {
      // Otherwise, it's in the current month's bill
      firstBillDate = transactionDate;
    }
    
    // For single purchases, just add the amount to the correct bill month.
    const isInstallment = t.installments && t.installments > 1;
    
    if (!isInstallment) {
      const monthKey = format(startOfMonth(firstBillDate), 'yyyy-MM');
      if (monthKey in monthlyBills) {
        monthlyBills[monthKey][card.name] += t.amount;
      }
    } else {
      // For installment purchases, the amount is already the value of ONE installment.
      const installmentAmount = t.amount; // The amount is already the monthly value
      const totalInstallments = t.installments || 1;

      // This logic assumes that when a user creates 'N' installments,
      // 'N' separate transaction documents are created in Firestore, each representing one month.
      // So, we just need to place this single transaction's amount in the correct bill.
      const monthKey = format(startOfMonth(firstBillDate), 'yyyy-MM');
      if (monthKey in monthlyBills) {
          monthlyBills[monthKey][card.name] += installmentAmount;
      }
    }
  });

  // 4. Convert the aggregated data into the format required by the chart
  return Object.entries(monthlyBills).map(([name, bills]) => {
    const monthData: { [key: string]: string | number } = { name };
    let totalOfMonth = 0;
    Object.entries(bills).forEach(([cardName, amount]) => {
      monthData[cardName] = amount;
      totalOfMonth += amount;
    });
    monthData.total = totalOfMonth;
    return monthData;
  }).sort((a, b) => (a.name as string).localeCompare(b.name as string)); // Sort by month key
}
