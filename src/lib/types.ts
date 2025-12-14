export type TransactionCategory =
  | 'Groceries'
  | 'Dining'
  | 'Shopping'
  | 'Entertainment'
  | 'Utilities'
  | 'Rent'
  | 'Salary'
  | 'Investments'
  | 'Other';

export type Transaction = {
  id: string;
  amount: number;
  title: string;
  category: TransactionCategory;
  date: Date;
  type: 'income' | 'expense';
  installment_group_id?: string;
  installments_total?: number;
  installments_paid?: number;
};

export type AIPersonality = 'Warren Buffett' | 'Suze Orman' | 'Dave Ramsey';
