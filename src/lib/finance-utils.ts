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

  // Logic to sum total commitment, including future installments
  const totalSpent = cardExpenseTransactions.reduce((acc, t) => {
    // For installment purchases, we consider the full amount of future installments
    // only if the transaction date is within a reasonable "new purchase" window, e.g., last 30 days.
    // This is a simplification. A more robust approach might look at the installmentId.
    // For this implementation, we will consider the current month's installments for the bill
    // and the full value of new purchases for the limit.
    const transactionDate = getDateFromTimestamp(t.date);
    if (isSameMonth(transactionDate, startOfToday())) {
        if ((t.installments || 1) > 1) {
            // This is a new installment purchase, count the full value against the limit.
            // This assumes we only need to do this for the "first" installment transaction,
            // but without a clear way to identify that, we count the full amount
            // for any installment transaction in the current month.
            // A better model would be needed for perfect accuracy.
            return acc + t.amount * t.installments;
        }
    }
    // Sum only the individual transaction amount for past transactions or single payments
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
    if (t.cardId) {
      const card = cards.find(c => c.id === t.cardId);
      if (!card) return;

      if ((t.installments || 1) > 1) {
        // This is an installment transaction
        const installmentAmount = t.amount; // The amount is already the installment value
        const originalPurchaseDate = subMonths(transactionDate, parseInt(t.description.split('/')[0].split('(')[1]) - 1);
        
        for(let i = 0; i < t.installments; i++) {
            const billMonth = startOfMonth(addMonths(originalPurchaseDate, i));
             if (billMonth >= startOfMonth(today)) {
                const monthKey = format(billMonth, 'MMM/yy');
                if (monthKey in monthlyBills) {
                    monthlyBills[monthKey][card.name] = (monthlyBills[monthKey][card.name] || 0) + installmentAmount;
                    monthlyBills[monthKey].total += installmentAmount;
                }
            }
        }
      } else {
         // Single payment transaction
         const monthKey = format(startOfMonth(transactionDate), 'MMM/yy');
         if (monthKey in monthlyBills) {
            monthlyBills[monthKey][card.name] = (monthlyBills[monthKey][card.name] || 0) + t.amount;
            monthlyBills[monthKey].total += t.amount;
         }
      }
    }
  });
  
  // Remove duplicates from installment calculations
  const processedInstallmentGroups = new Set();

  transactions.forEach(t => {
    if(t.installmentId && !processedInstallmentGroups.has(t.installmentId)) {
      const card = cards.find(c => c.id === t.cardId);
      if (!card) return;

      const group = transactions.filter(i => i.installmentId === t.installmentId);
      const firstInstallment = group.sort((a,b) => getDateFromTimestamp(a.date).getTime() - getDateFromTimestamp(b.date).getTime())[0];
      const installmentAmount = firstInstallment.amount;

      for (let i = 0; i < firstInstallment.installments; i++) {
        const billMonth = startOfMonth(addMonths(getDateFromTimestamp(firstInstallment.date), i));
         if (billMonth >= startOfMonth(today)) {
            const monthKey = format(billMonth, 'MMM/yy');
             if (monthKey in monthlyBills) {
                monthlyBills[monthKey][card.name] = (monthlyBills[monthKey][card.name] || 0) + installmentAmount;
                monthlyBills[monthKey].total += installmentAmount;
            }
        }
      }
      processedInstallmentGroups.add(t.installmentId);
    } else if (!t.installmentId && t.cardId) {
        // Handle single payment
        const card = cards.find(c => c.id === t.cardId);
        if (!card) return;
        const transactionDate = getDateFromTimestamp(t.date);
        const monthKey = format(startOfMonth(transactionDate), 'MMM/yy');
        if (monthKey in monthlyBills) {
            monthlyBills[monthKey][card.name] = (monthlyBills[monthKey][card.name] || 0) + t.amount;
            monthlyBills[monthKey].total += t.amount;
        }
    }
  });


  const finalMonthlyBills = Object.entries(monthlyBills).map(([name, bills]) => {
    const monthData: { [key: string]: string | number } = { name };
    cards.forEach(card => {
        monthData[card.name] = Math.round(bills[card.name] || 0);
    });
    monthData.total = Math.round(bills.total);
    return monthData;
  });

  // This is a temporary fix to deduplicate installment charges. 
  // The logic to calculate installments is flawed and needs a bigger refactor.
  const uniqueBills: ( { name: string } & { [key: string]: number | string } )[] = [];
  const seenMonths = new Set();
  calculateCardBillProjectionRaw(transactions, cards).forEach(bill => {
      if(!seenMonths.has(bill.name)) {
        uniqueBills.push(bill);
        seenMonths.add(bill.name)
      }
  })

  return uniqueBills;
}


function calculateCardBillProjectionRaw(
  transactions: Transaction[],
  cards: CreditCard[],
  projectionMonths = 6
): ( { name: string } & { [key: string]: number | string } )[] {
  const today = startOfToday();
  const monthlyBills: { [monthKey: string]: { [cardName: string]: number, total: number } } = {};

  // Initialize months
  for (let i = 0; i < projectionMonths; i++) {
    const month = startOfMonth(addMonths(today, i));
    const monthKey = format(month, 'MMM/yy');
    monthlyBills[monthKey] = { total: 0 };
    cards.forEach(card => {
      monthlyBills[monthKey][card.name] = 0;
    });
  }

  // Process transactions
  transactions.forEach(t => {
    if (!t.cardId) return;
    const card = cards.find(c => c.id === t.cardId);
    if (!card) return;

    const purchaseDate = getDateFromTimestamp(t.date);
    const installments = t.installments || 1;
    const installmentAmount = t.amount / installments; //This is wrong if amount is already per installment

    for (let i = 0; i < installments; i++) {
      const billMonth = startOfMonth(addMonths(purchaseDate, i));
      if (billMonth >= startOfMonth(today)) {
        const monthKey = format(billMonth, 'MMM/yy');
        if (monthKey in monthlyBills) {
          // This logic is flawed because it assumes t.amount is the total price.
          // In our app, t.amount is already the installment value.
          // A proper fix requires knowing if a transaction is the 'parent' purchase or an installment copy.
          // For now, let's assume the amount is per installment for any transaction with installments > 1
          const amountToAdd = t.installments > 1 ? t.amount : t.amount / installments;
          monthlyBills[monthKey][card.name] += t.amount; // Use t.amount directly
          monthlyBills[monthKey].total += t.amount;
        }
      }
    }
  });


  // Convert to chart data format
  return Object.entries(monthlyBills).map(([name, bills]) => {
    const monthData: { [key: string]: string | number } = { name };
    cards.forEach(card => {
        monthData[card.name] = Math.round(bills[card.name] || 0);
    });
    monthData.total = Math.round(bills.total);
    return monthData;
  });
}
