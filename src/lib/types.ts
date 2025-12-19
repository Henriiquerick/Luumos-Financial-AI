
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
  category: string; // Can be default or custom
  type: 'income' | 'expense';
  cardId?: string;
};

export type AIPersonality = {
  id: string;
  name: string;
  instruction: string;
  tagline: string;
  style: string;
  icon: string;
  plan: 'free' | 'pro';
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
  dailyCredits: number;
  lastCreditReset: Date | Timestamp;
};

export type CustomCategory = {
  id: string;
  name: string;
  icon: string; // emoji
  color: string; // hex
  type: 'income' | 'expense';
}

export type FinancialGoal = {
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline: Date | Timestamp;
    icon: string; // emoji
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp?: Timestamp;
}

export interface ChatSession {
  id: string;
  createdAt: Timestamp;
  personaId: string;
  knowledgeId: string;
  messages: ChatMessage[];
  title?: string;
}

export interface Subscription {
    id: string;
    plan: 'free' | 'pro' | 'gold';
    isActive: boolean;
    validUntil: Timestamp | null;
}

export interface AuditLog {
    id: string;
    actionType: 'CREATE' | 'UPDATE' | 'DELETE';
    timestamp: Timestamp;
    transactionId: string;
    previousData?: Partial<Transaction>;
    newData?: Partial<Transaction>;
    metadata: {
        user_agent: string;
        ip_address: string; // Note: IP address might be sensitive and subject to privacy regulations
    };
}
