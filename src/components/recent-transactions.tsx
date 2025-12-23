"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Transaction, CustomCategory, TransactionCategory } from '@/lib/types';
import { useTranslation } from '@/contexts/language-context';
import { Button } from './ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/i18n-utils';
import { useCurrency } from '@/contexts/currency-context';
import { TRANSLATED_CATEGORIES, DEFAULT_CATEGORY_ICONS } from '@/lib/constants';
import type { Language } from '@/lib/translations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from './ui/badge';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: CustomCategory[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function RecentTransactions({ transactions, categories, onEdit, onDelete }: RecentTransactionsProps) {
  const { t, language } = useTranslation();
  const { formatMoney } = useCurrency();

  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedTransactions = useMemo(() => 
    transactions.sort((a, b) => (b.date as Date).getTime() - (a.date as Date).getTime()),
    [transactions]
  );

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  const displayedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedTransactions.slice(startIndex, endIndex);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page
  };

  const getCategoryDisplay = (categoryName: string) => {
    const custom = categories.find(c => c.name === categoryName);
    if (custom) return { name: custom.name, icon: custom.icon };
    
    const isDefaultCategory = Object.keys(TRANSLATED_CATEGORIES[language]).includes(categoryName);
    if(isDefaultCategory){
      const defaultName = TRANSLATED_CATEGORIES[language][categoryName as keyof typeof TRANSLATED_CATEGORIES[Language]] || categoryName;
      const defaultIcon = DEFAULT_CATEGORY_ICONS[categoryName as TransactionCategory] || '📦';
      return { name: defaultName, icon: defaultIcon };
    }
    
    return { name: categoryName, icon: '📦' };
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
            {displayedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {t.transaction.no_transactions}
                </TableCell>
              </TableRow>
            ) : (
              displayedTransactions.map((t) => {
                const categoryDisplay = getCategoryDisplay(t.category);
                // A primeira parcela é aquela que tem installments > 1 mas não tem o sufixo (x/y)
                const isFirstInstallment = t.installments > 1 && !/\(\d+\/\d+\)$/.test(t.description);
                
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted/50 rounded-md text-xl">
                          <span role="img">{categoryDisplay.icon}</span>
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {t.description}
                            {isFirstInstallment && <Badge variant="secondary">1/{t.installments}</Badge>}
                          </div>
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
       <CardFooter className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Linhas por página:</span>
          <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map(size => (
                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            Página {currentPage} de {totalPages > 0 ? totalPages : 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Próximo
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
