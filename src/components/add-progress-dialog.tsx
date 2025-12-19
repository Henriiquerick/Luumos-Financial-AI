
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { FinancialGoal } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { parseCurrency } from '@/lib/i18n-utils';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive.'),
});

type FormValues = z.infer<typeof formSchema>;

interface AddProgressDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  goal: FinancialGoal | null;
  onFinished: () => void;
}

export function AddProgressDialog({ isOpen, setIsOpen, goal, onFinished }: AddProgressDialogProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      onFinished();
    }
    setIsOpen(open);
  };

  const onSubmit = (values: FormValues) => {
    if (!user || !goal) return;

    const goalRef = doc(firestore, 'users', user.uid, 'goals', goal.id);
    const newCurrentAmount = goal.currentAmount + values.amount;

    updateDocumentNonBlocking(goalRef, { currentAmount: newCurrentAmount });

    toast({
      title: 'Progresso Adicionado!',
      description: `Você adicionou valor à sua meta "${goal.title}".`,
    });
    handleOpenChange(false);
  };

  if (!goal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Progresso a "{goal.title}"</DialogTitle>
          <DialogDescription>
            Quanto você gostaria de adicionar a esta meta?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field: { onChange, ...rest } }) => (
                <FormItem>
                  <FormLabel>Valor a Adicionar</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="R$ 0,00"
                      onChange={e => onChange(parseCurrency(e.target.value))}
                      {...rest}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
