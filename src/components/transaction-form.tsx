
"use client";

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addMonths } from 'date-fns';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';
import type { Transaction, TransactionCategory, CreditCard } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getCardUsage, getDateFromTimestamp } from '@/lib/finance-utils';
import { useFirestore, useUser } from '@/firebase';
import { collection, Timestamp, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useTranslation } from '@/contexts/language-context';
import { DatePicker } from './ui/date-picker';


const formSchema = z.object({
  description: z.string().min(2, { message: 'Description must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  date: z.date({required_error: "A date is required."}),
  type: z.enum(['income', 'expense']),
  category: z.custom<TransactionCategory>(),
  isInstallment: z.boolean(),
  installments: z.coerce.number().int().min(2).max(60).optional(),
  paymentMethod: z.enum(['cash', 'card']),
  cardId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  onSave: () => void;
  transactions: Transaction[];
  creditCards: CreditCard[];
  transactionToEdit?: Transaction | null;
}

export function TransactionForm({ onSave, transactions, creditCards, transactionToEdit }: TransactionFormProps) {
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
      date: new Date(),
      type: 'expense',
      category: 'Other',
      isInstallment: false,
      installments: 2,
      paymentMethod: 'cash',
    },
  });

  const { control, getValues, setValue, watch, reset } = form;
  
  useEffect(() => {
    if (transactionToEdit) {
      const isCard = !!transactionToEdit.cardId;
      reset({
        description: transactionToEdit.description,
        amount: transactionToEdit.amount,
        date: getDateFromTimestamp(transactionToEdit.date),
        type: transactionToEdit.type,
        category: transactionToEdit.category,
        isInstallment: (transactionToEdit.installments || 1) > 1,
        installments: transactionToEdit.installments,
        paymentMethod: isCard ? 'card' : 'cash',
        cardId: transactionToEdit.cardId,
      });
    } else {
      reset({
        description: '',
        amount: 0,
        date: new Date(),
        type: 'expense',
        category: 'Other',
        isInstallment: false,
        installments: 2,
        paymentMethod: 'cash',
        cardId: undefined
      });
    }
  }, [transactionToEdit, reset]);


  const isInstallment = watch('isInstallment');
  const transactionType = watch('type');
  const paymentMethod = watch('paymentMethod');
  const selectedCardId = watch('cardId');
  const amount = watch('amount');

  const cardUsage = useMemo(() => {
    if (paymentMethod === 'card' && selectedCardId) {
      try {
        return getCardUsage(selectedCardId, transactions, creditCards);
      } catch (error) {
        console.error(error);
        return null;
      }
    }
    return null;
  }, [selectedCardId, paymentMethod, transactions, creditCards]);

  const isLimitExceeded = useMemo(() => {
    if (cardUsage && amount > 0) {
      return amount > cardUsage.availableLimit;
    }
    return false;
  }, [cardUsage, amount]);

  const handleAutoCategorize = useCallback(async () => {
    const description = getValues('description');
    if (description.length < 5) return;

    setIsCategorizing(true);
    try {
      const userHistory = transactions.slice(0, 10).map(t => ({ description: t.description, category: t.category }));
      
      const response = await fetch('/api/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, userHistory }),
      });

      if (!response.ok) {
        throw new Error('AI categorization request failed');
      }

      const result = await response.json();

      if (result.category && CATEGORIES.includes(result.category as TransactionCategory)) {
        setValue('category', result.category as TransactionCategory);
        toast({ title: t.toasts.ai.title, description: t.toasts.ai.description.replace('{category}', result.category) });
      }
    } catch (error) {
      console.error('AI categorization failed:', error);
    } finally {
      setIsCategorizing(false);
    }
  }, [getValues, setValue, transactions, toast, t]);
  
  useEffect(() => {
    if (transactionType === 'income') {
      setValue('paymentMethod', 'cash'); 
      setValue('isInstallment', false); 
      setValue('category', 'Salary'); 
    } else {
      // Don't reset category if we are not in income mode
      // setValue('category', 'Other'); 
    }
  }, [transactionType, setValue]);


  function onSubmit(values: FormValues) {
    if (!user || !firestore) return;
    
    const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(values.amount);
    
    if (transactionToEdit) {
      // UPDATE LOGIC
      const transactionRef = doc(firestore, 'users', user.uid, 'transactions', transactionToEdit.id);
      const dataToUpdate: Partial<Transaction> & { date: Timestamp } = {
        description: values.description,
        amount: values.amount,
        category: values.category,
        date: Timestamp.fromDate(values.date),
        type: values.type,
      };

      if (values.type === 'expense' && values.paymentMethod === 'card') {
        dataToUpdate.cardId = values.cardId;
      } else {
        dataToUpdate.cardId = undefined; // Explicitly remove for non-card expenses/incomes
      }
      
      updateDocumentNonBlocking(transactionRef, dataToUpdate);
      toast({ title: "Transaction Updated", description: `Transaction of ${formattedAmount} was updated.` });

    } else {
      // CREATE LOGIC
      const transactionsRef = collection(firestore, 'users', user.uid, 'transactions');
      const isCardPayment = values.type === 'expense' && values.paymentMethod === 'card';

      if (values.isInstallment && isCardPayment && values.installments) {
        const installmentId = crypto.randomUUID();
        const installmentAmount = values.amount / values.installments;

        for (let i = 0; i < values.installments; i++) {
          const transactionData: Omit<Transaction, 'id' | 'date'> & { date: Timestamp } = {
            description: `${values.description} (${i + 1}/${values.installments})`,
            amount: installmentAmount,
            category: values.category,
            date: Timestamp.fromDate(addMonths(values.date, i)),
            type: 'expense',
            installments: values.installments,
            installmentId: installmentId,
            cardId: values.cardId,
          };
          addDocumentNonBlocking(transactionsRef, transactionData);
        }
        toast({ title: t.toasts.installments.title, description: t.toasts.installments.description.replace('{count}', String(values.installments)) });
      } else { 
        const transactionData: Omit<Transaction, 'id' | 'date'> & { date: Timestamp, cardId?: string } = {
          description: values.description,
          amount: values.amount,
          category: values.category,
          date: Timestamp.fromDate(values.date),
          type: values.type,
          installments: 1,
        };
        
        if (isCardPayment) {
          transactionData.cardId = values.cardId;
        }

        addDocumentNonBlocking(transactionsRef, transactionData as any);
        toast({
          title: t.toasts.transaction.title,
          description: t.toasts.transaction.description.replace('{amount}', formattedAmount),
        });
      }
    }
    
    onSave();
    form.reset();
  }

  const isSubmitDisabled = form.formState.isSubmitting || (paymentMethod === 'card' && (!selectedCardId || isLimitExceeded));
  const incomeCategories = ['Salary', 'Investments', 'Other'];
  const expenseCategories = CATEGORIES.filter(c => !incomeCategories.includes(c) || c === 'Other');


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!!transactionToEdit}>
                <FormControl>
                  <SelectTrigger className="bg-transparent text-lg font-semibold py-6">
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="expense">{t.modals.transaction.tabs.expense}</SelectItem>
                  <SelectItem value="income">{t.modals.transaction.tabs.income}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="relative">
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.modals.transaction.fields.description}</FormLabel>
                <FormControl>
                  <Input placeholder={t.modals.transaction.fields.placeholderDesc} {...field} onBlur={handleAutoCategorize} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-6 text-primary hover:text-accent" onClick={handleAutoCategorize} disabled={isCategorizing}>
            {isCategorizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.modals.transaction.fields.amount}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} readOnly={isInstallment} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t.modals.transaction.fields.date}</FormLabel>
                 <FormControl>
                    <DatePicker 
                        value={field.value}
                        onChange={field.onChange}
                    />
                 </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.modals.transaction.fields.category}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t.modals.transaction.fields.placeholderCategory} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(transactionType === 'income' ? incomeCategories : expenseCategories).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {transactionType === 'expense' && (
          <>
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t.modals.transaction.fields.paymentMethod}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isInstallment}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t.modals.transaction.fields.placeholderPayment} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">{t.modals.transaction.fields.cash}</SelectItem>
                      <SelectItem value="card">{t.modals.transaction.fields.creditCard}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {paymentMethod === 'card' && (
              <FormField
                control={form.control}
                name="cardId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.modals.transaction.fields.card}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isInstallment}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t.modals.transaction.fields.placeholderCard} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {creditCards.map(card => <SelectItem key={card.id} value={card.id}>{card.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {cardUsage && (
                       <FormMessage className={cn(isLimitExceeded && "text-destructive")}>
                        {t.modals.transaction.fields.available}: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cardUsage.availableLimit)}
                       </FormMessage>
                    )}
                  </FormItem>
                )}
              />
            )}
            {paymentMethod === 'card' && (
              <FormField
                control={control}
                name="isInstallment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>{t.modals.transaction.fields.installments}</FormLabel>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!!transactionToEdit}/>
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
             {isInstallment && paymentMethod === 'card' && (
              <FormField
                control={control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.modals.transaction.fields.installments_number}</FormLabel>
                    <FormControl>
                      <Input type="number" min="2" max="60" {...field} readOnly={!!transactionToEdit}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}
       
        <Button 
          type="submit" 
          className={cn(
            "w-full",
            transactionType === 'income' && !transactionToEdit ? 'bg-green-600 hover:bg-green-700' : ''
          )} 
          disabled={isSubmitDisabled}
        >
          {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {transactionToEdit ? t.modals.transaction.submit.save : (transactionType === 'income' ? t.modals.transaction.submit.addIncome : t.modals.transaction.submit.addExpense)}
        </Button>
      </form>
    </Form>
  );
}
