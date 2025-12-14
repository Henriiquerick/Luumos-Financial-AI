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
  description: string;
  amount: number;
  date: Date;
  installments: number;
  installmentId?: string;
  category: TransactionCategory;
  type: 'income' | 'expense';
};

export type AIPersonality = {
  id: string;
  name: string;
  icon: string;
  systemInstruction: string;
};
