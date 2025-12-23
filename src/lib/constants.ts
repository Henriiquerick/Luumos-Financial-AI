
import type { TransactionCategory } from '@/lib/types';
import type { Language } from './translations';

export const PLAN_LIMITS: Record<string, number> = {
    free: 5,
    pro: 45,
    gold: 45, // Adicionando o plano gold conforme solicitado
};

export const ADS_WATCH_LIMITS: Record<string, number> = {
    free: 5,
    bronze: 8,
    silver: 12,
    gold: 20,
    pro: 20, // Pro plan gets same as gold
};

// Estrutura de dados enriquecida para as categorias padrão
export const DEFAULT_CATEGORIES = [
  { value: 'Groceries', labelKey: 'Groceries', icon: '🛒', type: 'expense' },
  { value: 'Dining', labelKey: 'Dining', icon: '🍽️', type: 'expense' },
  { value: 'Shopping', labelKey: 'Shopping', icon: '🛍️', type: 'expense' },
  { value: 'Entertainment', labelKey: 'Entertainment', icon: '🎮', type: 'expense' },
  { value: 'Utilities', labelKey: 'Utilities', icon: '📄', type: 'expense' },
  { value: 'Rent', labelKey: 'Rent', icon: '🏠', type: 'expense' },
  { value: 'Transport', labelKey: 'Transport', icon: '🚌', type: 'expense' },
  { value: 'Salary', labelKey: 'Salary', icon: '💰', type: 'income' },
  { value: 'Investments', labelKey: 'Investments', icon: '📈', type: 'income' },
  { value: 'Other', labelKey: 'Other', icon: '📦', type: 'expense' },
] as const;


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
        Transport: 'Transporte',
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
        Transport: 'Transport',
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
        Transport: 'Transporte',
    }
}

// Mantém o array simples de strings para validação e compatibilidade onde necessário.
export const ALL_CATEGORIES: TransactionCategory[] = [
  'Groceries',
  'Dining',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Rent',
  'Transport',
  'Salary',
  'Investments',
  'Other',
];

// Mapeia o valor da categoria padrão para seu ícone correspondente.
export const DEFAULT_CATEGORY_ICONS: Record<TransactionCategory, string> = 
  DEFAULT_CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = cat.icon;
    return acc;
  }, {} as Record<TransactionCategory, string>);
