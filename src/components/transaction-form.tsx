"use client";

import { useState, useCallback, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { addMonths, format } from 'date-fns';
import { CalendarIcon, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';
import type { Transaction, TransactionCategory, CreditCard } from '@/lib/types';
import { categorizeTransaction } from '@/ai/flows/categorize-transaction';
import { useToast } from '@/hooks/use-toast';
import { getCardUsage } from '@/lib/finance-utils';

const formSchema = z.object({
  description: z.string().min(2, { message: 'Description must be at least 2 characters.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  date: z.date(),
  type: z.enum(['income', 'expense']),
  category: z.custom<TransactionCategory>(),
  isInstallment: z.boolean(),
  installments: z.coerce.number().int().min(2).max(60).optional(),
  paymentMethod: z.enum(['cash', 'card']),
  cardId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  onSave: (transactions: Transaction[]) => void;
  transactions: Transaction[];
  creditCards: CreditCard[];
}

export function TransactionForm({ onSave, transactions, creditCards }: TransactionFormProps) {
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const { toast } = useToast();
  
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

  const { control, getValues, setValue, watch } = form;
  const watchedValues = useWatch({ control });
  
  const isInstallment = watch('isInstallment');
  const transactionType = watch('type');
  const paymentMethod = watch('paymentMethod');

  const handleAutoCategorize = useCallback(async () => {
    const description = getValues('description');
    if (description.length < 5) return;

    setIsCategorizing(true);
    try {
      const userHistory = JSON.stringify(transactions.slice(0, 10).map(t => ({ description: t.description, category: t.category })));
      const result = await categorizeTransaction({ description, userHistory });
      if (result.category && CATEGORIES.includes(result.category as TransactionCategory)) {
        setValue('category', result.category as TransactionCategory);
        toast({ title: 'AI Suggestion', description: `We've categorized this as "${result.category}".` });
      }
    } catch (error) {
      console.error('AI categorization failed:', error);
    } finally {
      setIsCategorizing(false);
    }
  }, [getValues, setValue, transactions, toast]);

  useEffect(() => {
    const { amount, cardId, paymentMethod } = watchedValues;
    if (paymentMethod === 'card' && cardId && amount > 0) {
      try {
        const usage = getCardUsage(cardId, transactions, creditCards);
        const willExceed = amount > usage.availableLimit;
        
        if (willExceed && !isLimitExceeded) {
           toast({
            variant: "destructive",
            title: "⚠️ Limite insuficiente neste cartão!",
            description: `Disponível: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usage.availableLimit)}`,
          });
        }
        setIsLimitExceeded(willExceed);
      } catch (error) {
        console.error(error);
        setIsLimitExceeded(false);
      }
    } else {
      setIsLimitExceeded(false);
    }
  }, [watchedValues, transactions, creditCards, toast, isLimitExceeded]);
  
  useEffect(() => {
    if (transactionType === 'income') {
      setValue('paymentMethod', 'cash');
    }
  }, [transactionType, setValue]);


  function onSubmit(values: FormValues) {
    if (values.isInstallment && values.type === 'expense' && values.installments) {
      const newTransactions: Transaction[] = [];
      const installmentId = crypto.randomUUID();
      const installmentAmount = values.amount / values.installments;

      for (let i = 0; i < values.installments; i++) {
        newTransactions.push({
          id: crypto.randomUUID(),
          description: `${values.description} (${i + 1}/${values.installments})`,
          amount: installmentAmount,
          category: values.category,
          date: addMonths(values.date, i),
          type: 'expense',
          installments: values.installments,
          installmentId: installmentId,
          cardId: values.paymentMethod === 'card' ? values.cardId : undefined,
        });
      }
      onSave(newTransactions);
    } else {
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        ...values,
        amount: values.amount,
        installments: 1,
        cardId: values.paymentMethod === 'card' ? values.cardId : undefined,
      };
      onSave([newTransaction]);
    }
    form.reset();
  }

  const isSubmitDisabled = form.formState.isSubmitting || (paymentMethod === 'card' && isLimitExceeded);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-transparent">
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Coffee shop" {...field} onBlur={handleAutoCategorize} />
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
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
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
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
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
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash / Debit</SelectItem>
                      <SelectItem value="card">Credit Card</SelectItem>
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
                    <FormLabel>Card</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a card" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {creditCards.map(card => <SelectItem key={card.id} value={card.id}>{card.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={control}
              name="isInstallment"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Installment Purchase</FormLabel>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </>
        )}

        {isInstallment && transactionType === 'expense' && (
          <FormField
            control={control}
            name="installments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Installments</FormLabel>
                <FormControl>
                  <Input type="number" min="2" max="60" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
          {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Add Transaction
        </Button>
      </form>
    </Form>
  );
}
