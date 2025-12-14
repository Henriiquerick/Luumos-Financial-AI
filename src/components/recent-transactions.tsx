"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Transaction } from '@/lib/types';
import { format } from 'date-fns';
import { CategoryIcon } from './category-icon';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5);

  return (
    <Card className="bg-card/50 border-primary/20">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your last 5 transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recent.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No transactions yet.
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
                        <div className="font-medium">{t.title}</div>
                        <div className="text-sm text-muted-foreground hidden md:block">{t.category}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{format(t.date, 'MMM dd, yyyy')}</TableCell>
                  <TableCell className={`text-right font-semibold ${t.type === 'income' ? 'text-primary' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(t.amount)}
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
