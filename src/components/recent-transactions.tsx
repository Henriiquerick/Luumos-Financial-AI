
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Transaction, CustomCategory } from '@/lib/types';
import { CategoryIcon } from './category-icon';
import { useTranslation } from '@/contexts/language-context';
import { Button } from './ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/i18n-utils';
import { useCurrency } from '@/contexts/currency-context';
import { TRANSLATED_CATEGORIES } from '@/lib/constants';
import type { Language } from '@/lib/translations';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: CustomCategory[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function RecentTransactions({ transactions, categories, onEdit, onDelete }: RecentTransactionsProps) {
  const { t, language } = useTranslation();
  const { formatMoney } = useCurrency();
  const recent = transactions
    .sort((a, b) => (b.date as Date).getTime() - (a.date as Date).getTime())
    .slice(0, 5);
  
  const getCategoryDisplay = (categoryName: string) => {
    const custom = categories.find(c => c.name === categoryName);
    if (custom) return { name: custom.name, icon: custom.icon };
    
    const defaultName = TRANSLATED_CATEGORIES[language][categoryName as keyof typeof TRANSLATED_CATEGORIES[Language]] || categoryName;
    return { name: defaultName, icon: <CategoryIcon category={categoryName as any} className="h-5 w-5 text-primary" /> };
  }

  return (
    <Card className="bg-card/50 border-primary/20">
      <CardHeader>
        <CardTitle>{t.dashboard.recent_activity}</CardTitle>
        <CardDescription>{t.dashboard.last_transactions}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.transaction.header}</TableHead>
              <TableHead className="hidden md:table-cell">{t.transaction.date}</TableHead>
              <TableHead className="text-right">{t.transaction.amount}</TableHead>
              <TableHead className="text-right">{t.transaction.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {t.transaction.no_transactions}
                </TableCell>
              </TableRow>
            ) : (
              recent.map((t) => {
                const categoryDisplay = getCategoryDisplay(t.category);
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted/50 rounded-md text-xl">
                          {categoryDisplay.icon}
                        </div>
                        <div>
                          <div className="font-medium">{t.description}</div>
                          <div className="text-sm text-muted-foreground hidden md:block">{categoryDisplay.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(language, t.date as Date)}</TableCell>
                    <TableCell className={`text-right font-semibold ${t.type === 'income' ? 'text-primary' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'}
                      {formatMoney(t.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(t)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(t)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
