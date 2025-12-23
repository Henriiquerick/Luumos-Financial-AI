'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  where,
  Timestamp,
  type DocumentData,
  type Query,
  type QueryDocumentSnapshot,
  deleteDoc,
  doc,
  writeBatch,
  getDocs as getDocsFirestore,
} from 'firebase/firestore';
import type { Transaction, CustomCategory, CreditCard, TransactionCategory } from '@/lib/types';
import { useTranslation } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Importar Tabs
import { formatDate } from '@/lib/i18n-utils';
import { useCurrency } from '@/contexts/currency-context';
import { Loader2, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { startOfMonth, startOfYear, subMonths } from 'date-fns';
import { getDateFromTimestamp } from '@/lib/finance-utils';
import Header from './header';
import { useDoc, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import Link from 'next/link';
import { TRANSLATED_CATEGORIES, DEFAULT_CATEGORY_ICONS } from '@/lib/constants';
import { TransactionDialog } from './transaction-dialog';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from './ui/toast';
import type { Language } from '@/lib/translations';
import { RecurringExpensesList } from './recurring-expenses-list'; // Importar novo componente

const TRANSACTIONS_PER_PAGE = 20;

export function HistoryPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { t, language } = useTranslation();
  const { formatMoney } = useCurrency();
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [period, setPeriod] = useState('all');
  
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);


  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);
  const categoriesRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'custom_categories') : null, [firestore, user]);
  const { data: customCategories } = useCollection<CustomCategory>(categoriesRef);
  const cardsRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'cards') : null, [firestore, user]);
  const { data: creditCards } = useCollection<CreditCard>(cardsRef);


  const getCategoryDisplay = (categoryName: string) => {
    const custom = customCategories?.find(c => c.name === categoryName);
    if (custom) return { name: custom.name, icon: custom.icon };
    
    const isDefaultCategory = Object.keys(TRANSLATED_CATEGORIES[language]).includes(categoryName);
    if(isDefaultCategory){
      const defaultName = TRANSLATED_CATEGORIES[language][categoryName as keyof typeof TRANSLATED_CATEGORIES[Language]] || categoryName;
      const defaultIcon = DEFAULT_CATEGORY_ICONS[categoryName as TransactionCategory] || '📦';
      return { name: defaultName, icon: defaultIcon };
    }
    
    return { name: categoryName, icon: '📦' };
  }
  
  const typedTransactions = useMemo(() => {
    if (!transactions) return [];
    return transactions.map(t => ({
      ...t,
      date: getDateFromTimestamp(t.date)
    }));
  }, [transactions]);

  const buildQuery = (): Query<DocumentData> | null => {
    if (!user) return null;

    let q = query(
      collection(firestore, 'users', user.uid, 'transactions'),
      orderBy('date', 'desc')
    );

    const now = new Date();
    if (period === 'this_month') {
      q = query(q, where('date', '>=', startOfMonth(now)));
    } else if (period === 'last_3_months') {
      q = query(q, where('date', '>=', startOfMonth(subMonths(now, 2))));
    } else if (period === 'this_year') {
      q = query(q, where('date', '>=', startOfYear(now)));
    }

    return q;
  };

  const fetchTransactions = async (newQuery: boolean = false) => {
    const q = buildQuery();
    if (!q) return;

    setIsLoading(true);

    try {
      let finalQuery = q;
      if (!newQuery && lastVisible) {
        finalQuery = query(q, startAfter(lastVisible));
      }
      finalQuery = query(finalQuery, limit(TRANSACTIONS_PER_PAGE));

      const documentSnapshots = await getDocs(finalQuery);

      const newTransactions: Transaction[] = documentSnapshots.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Transaction));

      setLastVisible(documentSnapshots.docs[documentSnapshots.docs.length - 1] || null);
      
      if (newQuery) {
        setTransactions(newTransactions);
      } else {
        setTransactions(prev => [...prev, ...newTransactions]);
      }
      
      setHasMore(newTransactions.length === TRANSACTIONS_PER_PAGE);

    } catch (error) {
      console.error("Error fetching transactions: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(user) {
      fetchTransactions(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, user]);
  
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionDialogOpen(true);
  };
  
  const handleUndoDelete = (deletedTransactions: Transaction[]) => {
    if (!user || !firestore) return;
    const batch = writeBatch(firestore);
    deletedTransactions.forEach(t => {
        const docRef = doc(firestore, 'users', user.uid, 'transactions', t.id);
        const firestoreTransaction = { ...t, date: new Date(t.date) }; 
        batch.set(docRef, firestoreTransaction);
    });
    batch.commit().then(() => {
        toast({ title: "Restaurado!", description: "A transação foi restaurada." });
        fetchTransactions(true); // Re-fetch to show restored data
    }).catch(err => {
        console.error("Error undoing delete:", err);
        toast({ title: "Erro", description: "Não foi possível restaurar a transação.", variant: "destructive" });
    });
  };

  const handleDeleteTransaction = async (transactionToDelete: Transaction) => {
    if (!user || !firestore) return;
  
    const isInstallment = transactionToDelete.installments && transactionToDelete.installments > 1;
    const confirmationMessage = isInstallment
      ? "Esta é uma compra parcelada. Deseja excluir esta e todas as parcelas futuras?"
      : t.modals.delete_transaction.confirmation;
  
    if (window.confirm(confirmationMessage)) {
      try {
        const transactionsToDeleteRaw: Transaction[] = [];

        if (isInstallment && transactionToDelete.installmentId) {
          const batch = writeBatch(firestore);
          const installmentsQuery = query(
            collection(firestore, 'users', user.uid, 'transactions'),
            where('installmentId', '==', transactionToDelete.installmentId),
            where('date', '>=', transactionToDelete.date)
          );
  
          const querySnapshot = await getDocsFirestore(installmentsQuery);
          querySnapshot.forEach(docSnap => {
            transactionsToDeleteRaw.push({ id: docSnap.id, ...docSnap.data() } as Transaction);
            batch.delete(docSnap.ref);
          });
  
          await batch.commit();
          toast({ 
              title: "Parcelas Excluídas", 
              description: "A transação e suas parcelas futuras foram removidas.",
              action: <ToastAction altText="Desfazer" onClick={() => handleUndoDelete(transactionsToDeleteRaw)}>Desfazer</ToastAction>
          });
        } else {
          transactionsToDeleteRaw.push(transactionToDelete);
          await deleteDoc(doc(firestore, 'users', user.uid, 'transactions', transactionToDelete.id));
          toast({ 
              title: t.toasts.transaction_deleted.title, 
              description: t.toasts.transaction_deleted.description,
              action: <ToastAction altText="Desfazer" onClick={() => handleUndoDelete(transactionsToDeleteRaw)}>Desfazer</ToastAction>
          });
        }
        // Optimistically update UI
        setTransactions(prev => prev.filter(t => !transactionsToDeleteRaw.some(del => del.id === t.id)));
      } catch (error) {
        console.error("Error deleting transaction(s): ", error);
        toast({ title: t.toasts.error.title, description: t.toasts.error.description, variant: 'destructive' });
      }
    }
  };


  return (
    <>
      <div className="w-full max-w-4xl mx-auto">
        <Header userProfile={userProfile} />
        <Button asChild variant="outline" className="mb-4">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Dashboard
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{t.history.title}</CardTitle>
            <CardDescription>{t.history.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="transactions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transactions">Transações</TabsTrigger>
                <TabsTrigger value="recurring">Recorrências</TabsTrigger>
              </TabsList>
              
              <TabsContent value="transactions">
                <div className="my-4">
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t.history.filters.period} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.history.filters.all_time}</SelectItem>
                      <SelectItem value="this_month">{t.history.filters.this_month}</SelectItem>
                      <SelectItem value="last_3_months">{t.history.filters.last_3_months}</SelectItem>
                      <SelectItem value="this_year">{t.history.filters.this_year}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                    {typedTransactions.map((t) => {
                      const categoryDisplay = getCategoryDisplay(t.category);
                      return (
                        <TableRow key={t.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-muted/50 rounded-md text-xl">
                                <span role="img">{categoryDisplay.icon}</span>
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
                            <Button variant="ghost" size="icon" onClick={() => handleEditTransaction(t)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTransaction(t)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                {isLoading && (
                  <div className="flex justify-center my-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
                {!isLoading && transactions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">{t.transaction.no_transactions}</p>
                )}
                {hasMore && !isLoading && (
                  <div className="text-center mt-6">
                    <Button onClick={() => fetchTransactions(false)} variant="outline">
                      {t.history.load_more}
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="recurring">
                  <RecurringExpensesList />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <TransactionDialog 
        isOpen={isTransactionDialogOpen} 
        setIsOpen={setIsTransactionDialogOpen} 
        transactions={typedTransactions}
        creditCards={creditCards || []}
        customCategories={customCategories || []}
        transactionToEdit={editingTransaction}
        onFinished={() => {
          setEditingTransaction(null);
          fetchTransactions(true); // Re-fetch data after edit
        }}
      />
    </>
  );
}
