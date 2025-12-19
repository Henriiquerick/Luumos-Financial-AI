'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from './ui/date-picker';
import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, Timestamp } from 'firebase/firestore';
import type { FinancialGoal } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { getDateFromTimestamp } from '@/lib/finance-utils';
import { MoneyInput } from './ui/money-input';

const formSchema = z.object({
  title: z.string().min(2, 'O título é obrigatório.'),
  icon: z.string().min(1, 'O ícone é obrigatório.'),
  targetAmount: z.coerce.number().positive('O valor alvo deve ser positivo.'),
  currentAmount: z.coerce.number().min(0, 'O valor atual não pode ser negativo.'),
  deadline: z.date({ required_error: 'A data final é obrigatória.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface GoalFormProps {
  onSave: () => void;
  goalToEdit?: FinancialGoal | null;
}

export function GoalForm({ onSave, goalToEdit }: GoalFormProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      icon: '🎯',
      targetAmount: 1000,
      currentAmount: 0,
      deadline: new Date(),
    },
  });

  useEffect(() => {
    if (goalToEdit) {
      form.reset({
        ...goalToEdit,
        deadline: getDateFromTimestamp(goalToEdit.deadline),
      });
    } else {
      form.reset({
        title: '',
        icon: '🎯',
        targetAmount: 1000,
        currentAmount: 0,
        deadline: new Date(),
      });
    }
  }, [goalToEdit, form]);

  const onSubmit = (values: FormValues) => {
    if (!user) return;

    const goalData = {
      ...values,
      deadline: Timestamp.fromDate(values.deadline),
    };

    if (goalToEdit) {
      const goalRef = doc(firestore, 'users', user.uid, 'goals', goalToEdit.id);
      updateDocumentNonBlocking(goalRef, goalData);
      toast({ title: 'Meta atualizada!', description: `Sua meta "${values.title}" foi alterada.` });
    } else {
      const goalsRef = collection(firestore, 'users', user.uid, 'goals');
      addDocumentNonBlocking(goalsRef, goalData);
      toast({ title: 'Meta criada!', description: `Sua meta "${values.title}" foi criada com sucesso.` });
    }
    onSave();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Ícone</FormLabel>
                <FormControl>
                  <Input maxLength={2} {...field} className="text-center text-lg p-0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-3">
                <FormLabel>Título da Meta</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Viagem para o Japão" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="currentAmount"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                <FormLabel>Valor Atual</FormLabel>
                <FormControl>
                  <MoneyInput
                    placeholder="R$ 0,00"
                    value={value}
                    onValueChange={(value) => onChange(value)}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="targetAmount"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                <FormLabel>Valor Alvo</FormLabel>
                <FormControl>
                  <MoneyInput
                    placeholder="R$ 1.000,00"
                    value={value}
                    onValueChange={(value) => onChange(value)}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data Final</FormLabel>
              <DatePicker value={field.value} onChange={field.onChange} />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {goalToEdit ? 'Salvar Alterações' : 'Criar Meta'}
        </Button>
      </form>
    </Form>
  );
}
