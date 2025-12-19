
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
  instruction: string;
  tagline: string;
  style: string;
};

export type AIKnowledgeLevel = {
  id: string;
  name: string;
  description: string;
  instruction: string;
  icon: string;
}

export type CardType = 'credit' | 'debit' | 'voucher';

export interface CardEntity {
  value: string;
  label: string;
  icon: string;
  supportedTypes: CardType[];
  color?: string; // Cor oficial da marca
}


export type CreditCard = {
  id: string;
  name: string;
  issuer: string; // ex: 'nubank', 'itau'
  brand: string;  // ex: 'visa', 'mastercard'
  type: CardType; // ex: 'credit', 'voucher'
  totalLimit: number;
  color: string;
  closingDay: number;
  dueDay: number; // Dia do vencimento
  expiryDate: string;
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
