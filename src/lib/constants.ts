
import type { TransactionCategory } from '@/lib/types';
import type { Language } from './translations';

export const PLAN_LIMITS: Record<string, number> = {
    free: 15,
    pro: 45,
    gold: 45, // Adicionando o plano gold conforme solicitado
};

export const CATEGORIES_OLD: TransactionCategory[] = [
  'Groceries',
  'Dining',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Rent',
  'Salary',
  'Investments',
  'Other',
];


export const TRANSLATED_CATEGORIES: Record<Language, Record<TransactionCategory, string>> = {
    pt: {
        Groceries: 'Supermercado',
        Dining: 'Restaurante',
        Shopping: 'Compras',
        Entertainment: 'Lazer',
        Utilities: 'Contas Fixas',
        Rent: 'Aluguel',
        Salary: 'Salário',
        Investments: 'Investimentos',
        Other: 'Outro',
    },
    en: {
        Groceries: 'Groceries',
        Dining: 'Dining',
        Shopping: 'Shopping',
        Entertainment: 'Entertainment',
        Utilities: 'Utilities',
        Rent: 'Rent',
        Salary: 'Salary',
        Investments: 'Investments',
        Other: 'Other',
    },
    es: {
        Groceries: 'Supermercado',
        Dining: 'Restaurante',
        Shopping: 'Compras',
        Entertainment: 'Ocio',
        Utilities: 'Cuentas Fijas',
        Rent: 'Alquiler',
        Salary: 'Salario',
        Investments: 'Inversiones',
        Other: 'Otro',
    }
}

export const ALL_CATEGORIES: TransactionCategory[] = [
  'Groceries',
  'Dining',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Rent',
  'Salary',
  'Investments',
  'Other',
];
