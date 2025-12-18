
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import type { CreditCard } from '@/lib/types';
import { useEffect, useMemo, useRef } from 'react';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useTranslation } from '@/contexts/language-context';
import { Combobox } from './ui/combobox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CARD_TYPES, getIssuer, CARD_ISSUERS, CARD_BRANDS } from '@/lib/card-data';
import type { CardType } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, 'Card name is required.'),
  issuer: z.string({ required_error: "Selecione o emissor" }).min(1, 'Issuer is required.'),
  brand: z.string().optional(),
  type: z.custom<CardType>(v => ['credit', 'debit', 'voucher'].includes(v as string), {
    message: "Selecione o tipo do cartão",
  }),
  totalLimit: z.coerce.number().optional(),
  closingDay: z.string().optional(),
  expiryDate: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color.'),
}).refine(data => {
    if (data.type === 'credit' && (!data.closingDay || Number(data.closingDay) <= 0)) {
        return false;
    }
    return true;
}, {
    message: 'Closing day is required for Credit Cards.',
    path: ['closingDay'],
}).refine(data => {
    if ((data.type === 'credit' || data.type === 'voucher') && (!data.totalLimit || data.totalLimit <= 0)) {
        return false;
    }
    return true;
}, {
    message: 'Limit is required for Credit or Voucher cards.',
    path: ['totalLimit'],
}).refine(data => {
    if ((data.type === 'credit' || data.type === 'debit') && !data.expiryDate) {
        return false;
    }
    if (data.expiryDate && !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(data.expiryDate)) {
        return false;
    }
    return true;
}, {
    message: 'A valid expiry date (MM/YY) is required.',
    path: ['expiryDate'],
});

type FormValues = z.infer<typeof formSchema>;

interface CardFormProps {
  onSave: (updatedCard?: CreditCard) => void;
  cardToEdit?: CreditCard | null;
  onColorChange: (color: string) => void;
}

export function CardForm({ onSave, cardToEdit, onColorChange }: CardFormProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { t } = useTranslation();
  const isInitialLoad = useRef(true);
  const hasNotifiedInitialColor = useRef(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      issuer: '',
      brand: '',
      type: 'credit',
      totalLimit: 1000,
      closingDay: '', 
      expiryDate: '',
      color: '#333333',
    },
  });

  const cardType = form.watch('type');
  const issuerValue = form.watch('issuer');
  const colorValue = form.watch('color');

  // Propagate color changes to parent
  useEffect(() => {
    if (cardToEdit && colorValue) {
      if (hasNotifiedInitialColor.current) {
        onColorChange(colorValue);
      } else {
        hasNotifiedInitialColor.current = true;
      }
    }
  }, [colorValue, cardToEdit, onColorChange]);

  const availableIssuers = useMemo(() => {
    return CARD_ISSUERS.filter(issuer => issuer.supportedTypes.includes(cardType));
  }, [cardType]);

  const availableBrands = useMemo(() => {
    if (cardType === 'voucher') {
      return CARD_ISSUERS.filter(issuer => issuer.supportedTypes.includes('voucher'));
    }
    return CARD_BRANDS.filter(brand => brand.supportedTypes.includes(cardType));
  }, [cardType]);

  // Efeito para resetar o formulário quando o cartão muda
  useEffect(() => {
    isInitialLoad.current = true;
    hasNotifiedInitialColor.current = false;
    
    if (cardToEdit) {
      form.reset({
        name: cardToEdit.name,
        issuer: cardToEdit.issuer,
        brand: cardToEdit.brand,
        type: cardToEdit.type,
        totalLimit: Number(cardToEdit.totalLimit),
        color: cardToEdit.color,
        closingDay: cardToEdit.closingDay ? String(cardToEdit.closingDay) : '', 
        expiryDate: cardToEdit.expiryDate || '',
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
        expiryDate: '',
      });
    }
    setTimeout(() => { isInitialLoad.current = false; }, 100);
  }, [cardToEdit, form]);

  // Lógica de auto-preenchimento de cor e bandeira
  useEffect(() => {
    if (isInitialLoad.current) return;
  
    if (cardType === 'voucher') {
      const currentBrand = form.getValues('brand');
      if (currentBrand !== issuerValue) {
        form.setValue('brand', issuerValue, { shouldDirty: false });
      }
    }
  
    const issuerData = getIssuer(issuerValue);
    const { isDirty } = form.getFieldState('color');
    const currentColor = form.getValues('color');
  
    if (issuerData?.color && !isDirty && currentColor !== issuerData.color) {
      form.setValue('color', issuerData.color, { shouldDirty: false });
    }
  }, [cardType, issuerValue, form]);

  // Limpa os erros de validação quando o tipo de cartão é alterado
  useEffect(() => {
    if (cardType === 'voucher' || cardType === 'debit') {
      form.clearErrors(['closingDay', 'totalLimit', 'brand', 'expiryDate']);
    }
     if (cardType === 'voucher') {
      form.clearErrors(['expiryDate']);
    }
  }, [cardType, form]);


  const onSubmit = (values: FormValues) => {
    if (!user || !firestore) return;

    const cardData = {
      ...values,
      brand: values.type === 'voucher' ? values.issuer : values.brand,
      totalLimit: (values.type === 'voucher' || values.type === 'credit') ? Number(values.totalLimit) : 0,
      closingDay: values.type === 'credit' ? Number(values.closingDay) : 0,
      expiryDate: (values.type === 'credit' || values.type === 'debit') ? values.expiryDate! : '',
    };
    
    if (cardToEdit) {
      const cardRef = doc(firestore, 'users', user.uid, 'cards', cardToEdit.id);
      const updatedCard = { ...cardToEdit, ...cardData };
      updateDocumentNonBlocking(cardRef, cardData as any);
      onSave(updatedCard);
    } else {
      const cardsRef = collection(firestore, 'users', user.uid, 'cards');
      addDocumentNonBlocking(cardsRef, cardData);
      onSave();
    }
  };
  
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    form.setValue('expiryDate', value, { shouldValidate: true });
  };


  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(
          onSubmit, 
          (errors) => console.error("ERROS DE VALIDAÇÃO DO FORMULÁRIO:", errors)
        )} 
        className="space-y-4"
      >
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
        
        {cardType === 'credit' && (
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Bandeira do Cartão</FormLabel>
                <Combobox
                  options={availableBrands}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Selecione a bandeira"
                  searchPlaceholder="Procurar bandeira..."
                  notfoundText="Nenhuma bandeira encontrada."
                />
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        {(cardType === 'credit' || cardType === 'voucher') && (
            <FormField
                control={form.control}
                name="totalLimit"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>{cardType === 'voucher' ? t.modals.card.fields.balance : t.modals.card.fields.limit}</FormLabel>
                    <FormControl>
                    <Input type="number" step="100" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
        )}
        
        <div className="grid grid-cols-2 gap-4">
            {cardType === 'credit' && (
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
            )}

            {(cardType === 'credit' || cardType === 'debit') && (
                <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t.modals.card.fields.expiryDate}</FormLabel>
                        <FormControl>
                        <Input
                            placeholder="MM/AA"
                            {...field}
                            onChange={handleExpiryDateChange}
                            maxLength={5}
                        />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            )}
        </div>
        
         <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
                <FormLabel>{t.modals.card.fields.color}</FormLabel>
                <FormControl>
                    <Input type="color" {...field} className="h-12"/>
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
