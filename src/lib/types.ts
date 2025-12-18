
import type { Timestamp } from 'firebase/firestore';

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
  date: Date | Timestamp;
  installments: number;
  installmentId?: string;
  category: TransactionCategory;
  type: 'income' | 'expense';
  cardId?: string;
};

export type AIPersonality = {
  id: string;
  name: string;
  icon: string;
  catchphrase: string;
  systemInstruction: string;
};

export type AIKnowledgeLevel = {
  id: string;
  name: string;
  description: string;
  instruction: string;
}

export type CreditCard = {
  id: string;
  name: string;
  brand: string;
  totalLimit: number;
  color: string;
  closingDay: number;
};

export type UserProfile = {
  id: string;
  aiPersonality: string;
  aiKnowledgeLevel?: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  city?: string;
  jobTitle?: string;
  company?: string;
};
