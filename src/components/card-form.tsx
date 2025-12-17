
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
import { useTranslation } from '@/contexts/language-context';
import { getBankColor, BANK_COLORS } from '@/lib/bank-colors';

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

// Criar um conjunto de valores de cores únicos para evitar duplicatas
const uniqueColors = Array.from(new Set(Object.values(BANK_COLORS)));
const PREDEFINED_COLORS = uniqueColors.map(color => ({ name: '', value: color }));


export function CardForm({ onSave, cardToEdit }: CardFormProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      totalLimit: 1000,
      closingDay: '', 
      color: '#333333',
    },
  });

  const cardName = form.watch('name');

  useEffect(() => {
    const color = getBankColor(cardName);
    if(color !== '#333333') {
        form.setValue('color', color);
    }
  }, [cardName, form]);

  useEffect(() => {
    if (cardToEdit) {
      form.reset({
        name: cardToEdit.name,
        totalLimit: Number(cardToEdit.totalLimit),
        color: cardToEdit.color,
        closingDay: cardToEdit.closingDay ? String(cardToEdit.closingDay) : '', 
      });
    } else {
      form.reset({
        name: '',
        totalLimit: 1000,
        color: '#333333',
        closingDay: '',
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
              <FormLabel>{t.modals.card.fields.name}</FormLabel>
              <FormControl>
                <Input placeholder={t.modals.card.fields.namePlaceholder} {...field} />
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
                <FormLabel>{t.modals.card.fields.limit}</FormLabel>
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
                <FormLabel>{t.modals.card.fields.closingDay}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value} 
                  key={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t.modals.card.fields.dayPlaceholder} />
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

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.modals.card.fields.color}</FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
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
          {cardToEdit ? t.modals.card.save_changes : t.modals.card.save}
        </Button>
      </form>
    </Form>
  );
}
