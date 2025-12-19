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
} from 'firebase/firestore';
import type { Transaction, CustomCategory } from '@/lib/types';
import { useTranslation } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CategoryIcon } from './category-icon';
import { formatDate, formatCurrency } from '@/lib/i18n-utils';
import { Loader2 } from 'lucide-react';
import { startOfMonth, startOfYear, subMonths } from 'date-fns';
import { getDateFromTimestamp } from '@/lib/finance-utils';
import Header from './header';
import { useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { TRANSLATED_CATEGORIES } from '@/lib/constants';

const TRANSACTIONS_PER_PAGE = 20;

export function HistoryPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { t, language } = useTranslation();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [period, setPeriod] = useState('all');

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);
  const categoriesRef = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'custom_categories') : null, [firestore, user]);
  const { data: customCategories } = useCollection<CustomCategory>(categoriesRef);

  const getCategoryDisplay = (categoryName: string) => {
    const custom = customCategories?.find(c => c.name === categoryName);
    if (custom) return { name: custom.name, icon: custom.icon };
    
    const defaultName = TRANSLATED_CATEGORIES[language][categoryName as keyof typeof TRANSLATED_CATEGORIES[Language]] || categoryName;
    return { name: defaultName, icon: <CategoryIcon category={categoryName as any} className="h-5 w-5 text-primary" /> };
  }

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
      setTransactions(prev => newQuery ? newTransactions : [...prev, ...newTransactions]);
      setHasMore(newTransactions.length === TRANSACTIONS_PER_PAGE);

    } catch (error) {
      console.error("Error fetching transactions: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTransactions([]);
    setLastVisible(null);
    setHasMore(true);
    fetchTransactions(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, user]);

  return (
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
          <div className="mb-4">
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => {
                const categoryDisplay = getCategoryDisplay(t.category);
                return(
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
                  <TableCell className="hidden md:table-cell">{formatDate(language, getDateFromTimestamp(t.date))}</TableCell>
                  <TableCell className={`text-right font-semibold ${t.type === 'income' ? 'text-primary' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}
                    {formatCurrency(language, t.amount)}
                  </TableCell>
                </TableRow>
              )})}
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
        </CardContent>
      </Card>
    </div>
  );
}
