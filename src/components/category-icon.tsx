import type { TransactionCategory } from '@/lib/types';
import {
  Landmark,
  ShoppingCart,
  UtensilsCrossed,
  Film,
  Receipt,
  Home,
  Wallet,
  TrendingUp,
  Shapes,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';

const categoryIcons: Record<TransactionCategory, ComponentType<LucideProps>> = {
  Salary: Wallet,
  Rent: Home,
  Groceries: ShoppingCart,
  Dining: UtensilsCrossed,
  Shopping: ShoppingCart,
  Entertainment: Film,
  Utilities: Receipt,
  Investments: TrendingUp,
  Other: Shapes,
};

interface CategoryIconProps extends LucideProps {
  category: TransactionCategory;
}

export function CategoryIcon({ category, ...props }: CategoryIconProps) {
  const Icon = categoryIcons[category] || Shapes;
  return <Icon {...props} />;
}
