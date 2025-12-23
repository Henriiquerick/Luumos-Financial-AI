'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { RecurringExpense } from '@/lib/types';
import { useTranslation } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/i18n-utils';
import { useCurrency } from '@/contexts/currency-context';
import { Loader2, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getDateFromTimestamp } from '@/lib/finance-utils';

export function RecurringExpensesList() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { t, language } = useTranslation();
  const { formatMoney } = useCurrency();
  const { toast } = useToast();

  const recurringExpensesQuery = useMemoFirebase(
    () => user ? query(collection(firestore, 'users', user.uid, 'recurring_expenses'), where('isActive', '==', true)) : null,
    [user, firestore]
  );
  const { data: recurringExpenses, isLoading } = useCollection<RecurringExpense>(recurringExpensesQuery);
  
  const sortedExpenses = useMemo(() => {
    if (!recurringExpenses) return [];
    return recurringExpenses.sort((a, b) => 
        getDateFromTimestamp(a.nextTriggerDate).getTime() - getDateFromTimestamp(b.nextTriggerDate).getTime()
    );
  }, [recurringExpenses]);

  const handleStopRecurring = (expense: RecurringExpense) => {
    if (!user || !window.confirm(`Tem certeza que deseja parar a despesa recorrente "${expense.description}"?`)) return;

    const expenseRef = doc(firestore, 'users', user.uid, 'recurring_expenses', expense.id);
    updateDocumentNonBlocking(expenseRef, { isActive: false });

    toast({
      title: "Recorrência Parada",
      description: `A despesa "${expense.description}" não será mais cobrada automaticamente.`,
    });
  };

  const getFrequencyLabel = (freq: 'weekly' | 'monthly' | 'yearly') => {
    switch (freq) {
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensal';
      case 'yearly': return 'Anual';
      default: return freq;
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center my-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (recurringExpenses?.length === 0) {
    return <p className="text-center text-muted-foreground py-8">Você não possui despesas recorrentes ativas.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descrição</TableHead>
          <TableHead>Frequência</TableHead>
          <TableHead>Próxima Cobrança</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedExpenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell className="font-medium">{expense.description}</TableCell>
            <TableCell>
              <Badge variant="secondary">{getFrequencyLabel(expense.frequency)}</Badge>
            </TableCell>
            <TableCell>{formatDate(language, getDateFromTimestamp(expense.nextTriggerDate))}</TableCell>
            <TableCell className="text-right font-semibold">{formatMoney(expense.amount)}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" onClick={() => handleStopRecurring(expense)}>
                <Trash2 className="h-4 w-4 text-red-500" />
                <span className="sr-only">Parar Recorrência</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
