'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreditCard } from '@/lib/types';
import { useEffect } from 'react';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const formSchema = z.object({
  name: z.string().min(2, 'Card name is required.'),
  totalLimit: z.coerce.number().positive('Limit must be a positive number.'),
  closingDay: z.string().min(1, "Please select a closing day."),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color.'),
});

type FormValues = z.infer<typeof formSchema>;

interface CardFormProps {
  onSave: () => void;
  cardToEdit?: CreditCard | null;
}

const PREDEFINED_COLORS = [
  { name: 'Nubank', value: '#820AD1' },
  { name: 'Mercado Pago', value: '#009EE3' },
  { name: 'Inter', value: '#FF7A00' },
  { name: 'Black', value: '#111111' },
  { name: 'Neon Green', value: '#00FF88' },
];

export function CardForm({ onSave, cardToEdit }: CardFormProps) {
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      totalLimit: 1000,
      closingDay: '', // Mudança 1: Começa vazio para forçar seleção ou reset
      color: PREDEFINED_COLORS[0].value,
    },
  });

  // Watcher para debug (opcional, pode remover depois)
  const watchedDay = form.watch("closingDay"); 
  
  useEffect(() => {
    if (cardToEdit) {
      // MODO EDIÇÃO
      form.reset({
        name: cardToEdit.name,
        totalLimit: Number(cardToEdit.totalLimit),
        color: cardToEdit.color,
        // Mudança 2: Tratamento de Nulo mais robusto
        // Se closingDay for 0 ou nulo, vira string vazia, senão vira string do número
        closingDay: cardToEdit.closingDay ? String(cardToEdit.closingDay) : '', 
      });
    } else {
      // MODO CRIAÇÃO
      form.reset({
        name: '',
        totalLimit: 1000,
        color: PREDEFINED_COLORS[0].value,
        closingDay: '', // Reset para vazio
      });
    }
  }, [cardToEdit, form]);

  const onSubmit = (values: FormValues) => {
    if (!user || !firestore) return;

    const cardData = {
      ...values,
      totalLimit: Number(values.totalLimit),
      closingDay: Number(values.closingDay),
    };
    
    if (cardToEdit) {
      const cardRef = doc(firestore, 'users', user.uid, 'cards', cardToEdit.id);
      updateDocumentNonBlocking(cardRef, cardData);
    } else {
      const cardsRef = collection(firestore, 'users', user.uid, 'cards');
      addDocumentNonBlocking(cardsRef, cardData);
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
              <FormLabel>Card Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Nubank" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="totalLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Limit</FormLabel>
                <FormControl>
                  <Input type="number" step="100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="closingDay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Closing Day</FormLabel>
                {/* Mudança 3: Removido defaultValue e adicionado key para forçar re-render */}
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value} 
                  key={field.value} // O TRUQUE: Força o componente a atualizar se o valor mudar
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Day" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={String(day)}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Campo de Cor (Mantido igual) */}
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Color</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  {PREDEFINED_COLORS.map((color) => (
                    <button
                      type="button"
                      key={color.value}
                      onClick={() => field.onChange(color.value)}
                      className={cn(
                        'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                        field.value === color.value
                          ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'border-transparent'
                      )}
                      style={{ backgroundColor: color.value }}
                      aria-label={`Select ${color.name}`}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {cardToEdit ? 'Save Changes' : 'Save Card'}
        </Button>
      </form>
    </Form>
  );
}