
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useUser, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { CustomCategory } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  icon: z.string().min(1, 'O ícone é obrigatório.'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida.'),
  type: z.enum(['income', 'expense']),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  onSave: () => void;
  categoryToEdit?: CustomCategory | null;
}

export function CategoryForm({ onSave, categoryToEdit }: CategoryFormProps) {
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      icon: '💰',
      color: '#3b82f6',
      type: 'expense',
    },
  });

  useEffect(() => {
    if (categoryToEdit) {
      form.reset(categoryToEdit);
    } else {
      form.reset({
        name: '',
        icon: '💰',
        color: '#3b82f6',
        type: 'expense',
      });
    }
  }, [categoryToEdit, form]);

  const onSubmit = (values: FormValues) => {
    if (!user) return;

    if (categoryToEdit) {
      const categoryRef = doc(firestore, 'users', user.uid, 'custom_categories', categoryToEdit.id);
      updateDocumentNonBlocking(categoryRef, values);
    } else {
      const categoriesRef = collection(firestore, 'users', user.uid, 'custom_categories');
      addDocumentNonBlocking(categoriesRef, values);
    }
    onSave();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Categoria</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Viagem" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ícone</FormLabel>
                <FormControl>
                  <Input maxLength={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Cor</FormLabel>
                <FormControl>
                  <Input type="color" {...field} className="h-10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Categoria
        </Button>
      </form>
    </Form>
  );
}
