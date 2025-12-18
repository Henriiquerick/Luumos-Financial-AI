
'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CreditCard, CardType } from '@/lib/types';
import { useEffect, useMemo } from 'react';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useTranslation } from '@/contexts/language-context';
import { getBankTheme } from '@/lib/bank-colors';
import { Combobox } from './ui/combobox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CARD_BRANDS, CARD_ISSUERS, CARD_TYPES } from '@/lib/card-data';

const formSchema = z.object({
  name: z.string().min(2, 'Card name is required.'),
  issuer: z.string({ required_error: "Selecione o emissor" }).min(1, 'Issuer is required.'),
  brand: z.string({ required_error: "Selecione a bandeira" }).min(1, 'Card brand is required.'),
  type: z.enum(["credit", "debit", "voucher"], { required_error: "Selecione o tipo do cartão" }),
  totalLimit: z.coerce.number().positive('Limit must be a positive number.'),
  closingDay: z.string().min(1, "Please select a closing day."),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color.'),
});

type FormValues = z.infer<typeof formSchema>;

interface CardFormProps {
  onSave: (updatedCard?: CreditCard) => void;
  cardToEdit?: CreditCard | null;
}

export function CardForm({ onSave, cardToEdit }: CardFormProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      issuer: '',
      brand: '',
      type: 'credit',
      totalLimit: 1000,
      closingDay: '', 
      color: '#333333',
    },
  });

  const cardName = form.watch('name');
  const cardType = form.watch('type');

  const availableIssuers = useMemo(() => {
      return CARD_ISSUERS.filter(issuer => issuer.types.includes(cardType));
  }, [cardType]);

  const availableBrands = useMemo(() => {
      if (cardType === 'voucher') {
          return CARD_ISSUERS.filter(issuer => issuer.types.includes('voucher'));
      }
      return CARD_BRANDS.filter(brand => brand.types.includes(cardType));
  }, [cardType]);


  useEffect(() => {
    const theme = getBankTheme(cardName);
    if(theme.bg !== '#242424') {
        form.setValue('color', theme.bg);
    }
  }, [cardName, form]);

  useEffect(() => {
    if (cardToEdit) {
      form.reset({
        name: cardToEdit.name,
        issuer: cardToEdit.issuer,
        brand: cardToEdit.brand,
        type: cardToEdit.type,
        totalLimit: Number(cardToEdit.totalLimit),
        color: cardToEdit.color,
        closingDay: cardToEdit.closingDay ? String(cardToEdit.closingDay) : '', 
      });
    } else {
      form.reset({
        name: '',
        issuer: '',
        brand: '',
        type: 'credit',
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
      const updatedCard = { ...cardToEdit, ...cardData };
      updateDocumentNonBlocking(cardRef, cardData);
      onSave(updatedCard);
    } else {
      const cardsRef = collection(firestore, 'users', user.uid, 'cards');
      addDocumentNonBlocking(cardsRef, cardData);
      onSave();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apelido do Cartão</FormLabel>
              <FormControl>
                <Input placeholder="ex: Cartão da Viagem" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Tipo do Cartão</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                    <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {CARD_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}
        />

        <FormField
          control={form.control}
          name="issuer"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Banco / Emissor</FormLabel>
              <Combobox
                options={availableIssuers}
                value={field.value}
                onChange={field.onChange}
                placeholder="Selecione o emissor"
                searchPlaceholder="Procurar emissor..."
                notfoundText="Nenhum emissor encontrado."
              />
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Bandeira do Cartão</FormLabel>
              <Combobox
                options={availableBrands}
                value={field.value}
                onChange={field.onChange}
                placeholder="Selecione a bandeira"
                searchPlaceholder="Procurar bandeira..."
                notfoundText="Nenhuma bandeira encontrada."
                disabled={cardType === 'voucher'}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        
        {cardType !== 'voucher' && (
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
        )}

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
