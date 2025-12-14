import type { Transaction, CreditCard } from '@/lib/types';
import { addMonths, subDays } from 'date-fns';

const today = new Date();
const getPastDate = (days: number) => subDays(today, days);

const generateInstallments = (
    id: string, 
    description: string, 
    totalAmount: number, 
    date: Date, 
    installments: number,
    category: Transaction['category'],
    cardId?: string,
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
            cardId
        });
    }

    return transactions;
}

const headphonesInstallments = generateInstallments('5', 'New headphones', 200, getPastDate(5), 3, 'Shopping', 'card-2');

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
    installments: 1,
    cardId: 'card-1'
  },
  {
    id: '4',
    amount: 45,
    description: 'Dinner with friends',
    category: 'Dining',
    date: getPastDate(8),
    type: 'expense',
    installments: 1,
    cardId: 'card-1'
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
   {
    id: '7',
    amount: 1500,
    description: 'Macbook Pro M4',
    category: 'Shopping',
    date: getPastDate(2),
    type: 'expense',
    installments: 1,
    cardId: 'card-2'
  },
].sort((a, b) => b.date.getTime() - a.date.getTime());


export const mockCreditCards: CreditCard[] = [
  {
    id: 'card-1',
    name: 'Nubank',
    totalLimit: 1500,
    color: '#8A05BE',
    closingDay: 20
  },
  {
    id: 'card-2',
    name: 'Mercado Pago',
    totalLimit: 3000,
    color: '#00AEEF',
    closingDay: 5
  }
];
