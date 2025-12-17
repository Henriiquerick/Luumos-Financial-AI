
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { CategoryIcon } from './category-icon';
import { useTranslation } from '@/contexts/language-context';
import { Button } from './ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
}

export function RecentTransactions({ transactions, onEdit, onDelete }: RecentTransactionsProps) {
  const { t } = useTranslation();
  const recent = transactions
    .sort((a, b) => (b.date as Date).getTime() - (a.date as Date).getTime())
    .slice(0, 5);

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
              <TableHead className="text-right">Ações</TableHead>
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
              recent.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted/50 rounded-md">
                        <CategoryIcon category={t.category} className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{t.description}</div>
                        <div className="text-sm text-muted-foreground hidden md:block">{t.category}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{format(t.date as Date, 'MMM dd, yyyy')}</TableCell>
                  <TableCell className={`text-right font-semibold ${t.type === 'income' ? 'text-primary' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(t.amount)}
                  </TableCell>
                   <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(t)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
