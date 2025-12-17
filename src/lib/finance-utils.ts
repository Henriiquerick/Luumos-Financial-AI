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

  const processedInstallmentIds = new Set<string>();
  
  const totalSpent = cardExpenseTransactions.reduce((acc, t) => {
    if (t.installmentId) {
      if (processedInstallmentIds.has(t.installmentId)) {
        return acc;
      }
      processedInstallmentIds.add(t.installmentId);
      return acc + (t.amount * t.installments);
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
  const monthlyBills: { [monthKey: string]: { [cardName: string]: number, total: number } } = {};

  for (let i = 0; i < projectionMonths; i++) {
    const month = startOfMonth(addMonths(today, i));
    const monthKey = format(month, 'MMM/yy');
    monthlyBills[monthKey] = { total: 0 };
    cards.forEach(card => {
      monthlyBills[monthKey][card.name] = 0;
    });
  }

  transactions.forEach(t => {
    const transactionDate = getDateFromTimestamp(t.date);
    if (t.cardId && transactionDate >= startOfMonth(today)) {
      const card = cards.find(c => c.id === t.cardId);
      if (!card) return;

      const monthKey = format(startOfMonth(transactionDate), 'MMM/yy');
      if (monthKey in monthlyBills) {
        monthlyBills[monthKey][card.name] = (monthlyBills[monthKey][card.name] || 0) + t.amount;
        monthlyBills[monthKey].total += t.amount;
      }
    }
  });
  
  return Object.entries(monthlyBills).map(([name, bills]) => {
    const monthData: { [key: string]: string | number } = { name };
    cards.forEach(card => {
        monthData[card.name] = Math.round(bills[card.name] || 0);
    });
    monthData.total = Math.round(bills.total);
    return monthData;
  });
}
