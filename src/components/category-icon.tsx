
import type { TransactionCategory } from '@/lib/types';
import { Shapes } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { DEFAULT_CATEGORY_ICONS } from '@/lib/constants';

interface CategoryIconProps extends LucideProps {
  category: TransactionCategory;
  className?: string;
}

export function CategoryIcon({ category, className, ...props }: CategoryIconProps) {
  const icon = DEFAULT_CATEGORY_ICONS[category];

  if (!icon) {
    return <Shapes className={className} {...props} />;
  }

  return (
    <span className={className} role="img" aria-label={category}>
      {icon}
    </span>
  );
}
