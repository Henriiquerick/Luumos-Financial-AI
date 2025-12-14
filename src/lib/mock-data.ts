import type { Transaction } from '@/lib/types';

const today = new Date();
const getPastDate = (days: number) => new Date(new Date().setDate(today.getDate() - days));

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 2500,
    title: 'Monthly Salary',
    category: 'Salary',
    date: getPastDate(15),
    type: 'income',
  },
  {
    id: '2',
    amount: 1200,
    title: 'Apartment Rent',
    category: 'Rent',
    date: getPastDate(14),
    type: 'expense',
  },
  {
    id: '3',
    amount: 75.5,
    title: 'Grocery Shopping',
    category: 'Groceries',
    date: getPastDate(10),
    type: 'expense',
  },
  {
    id: '4',
    amount: 45,
    title: 'Dinner with friends',
    category: 'Dining',
    date: getPastDate(8),
    type: 'expense',
  },
  {
    id: '5',
    amount: 200,
    title: 'New headphones',
    category: 'Shopping',
    date: getPastDate(5),
    type: 'expense',
    installment_group_id: 'install_1',
    installments_paid: 1,
    installments_total: 3,
  },
  {
    id: '6',
    amount: 90,
    title: 'Electricity Bill',
    category: 'Utilities',
    date: getPastDate(3),
    type: 'expense',
  },
];
