import type { Transaction } from '@/lib/types';
import { addMonths } from 'date-fns';

const today = new Date();
const getPastDate = (days: number) => new Date(new Date().setDate(today.getDate() - days));

const generateInstallments = (
    id: string, 
    description: string, 
    totalAmount: number, 
    date: Date, 
    installments: number,
    category: Transaction['category']
    ): Transaction[] => {
    
    const installmentAmount = totalAmount / installments;
    const installmentId = id;
    const transactions: Transaction[] = [];

    for (let i = 0; i < installments; i++) {
        transactions.push({
            id: `${id}-${i+1}`,
            amount: installmentAmount,
            description: `${description} (${i + 1}/${installments})`,
            category,
            date: addMonths(date, i),
            type: 'expense',
            installments,
            installmentId,
        });
    }

    return transactions;
}

const headphonesInstallments = generateInstallments('5', 'New headphones', 200, getPastDate(5), 3, 'Shopping');

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 2500,
    description: 'Monthly Salary',
    category: 'Salary',
    date: getPastDate(15),
    type: 'income',
    installments: 1
  },
  {
    id: '2',
    amount: 1200,
    description: 'Apartment Rent',
    category: 'Rent',
    date: getPastDate(14),
    type: 'expense',
    installments: 1
  },
  {
    id: '3',
    amount: 75.5,
    description: 'Grocery Shopping',
    category: 'Groceries',
    date: getPastDate(10),
    type: 'expense',
    installments: 1
  },
  {
    id: '4',
    amount: 45,
    description: 'Dinner with friends',
    category: 'Dining',
    date: getPastDate(8),
    type: 'expense',
    installments: 1
  },
  ...headphonesInstallments,
  {
    id: '6',
    amount: 90,
    description: 'Electricity Bill',
    category: 'Utilities',
    date: getPastDate(3),
    type: 'expense',
    installments: 1
  },
].sort((a, b) => b.date.getTime() - a.date.getTime());
