
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
  totalLimit: z.coerce.number().positive('Limit must be a positive number.').optional(),
  closingDay: z.string().min(1, "Please select a closing day.").optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color.'),
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
      color: '#333333',
    },
  });

  const cardType = form.watch('type');
  const issuerValue = form.watch('issuer');
  const colorValue = form.watch('color');

  // Propagate color changes to parent - CORRIGIDO
  useEffect(() => {
    if (cardToEdit && colorValue) {
      // Só notifica após a primeira renderização (evita notificar a cor inicial)
      if (hasNotifiedInitialColor.current) {
        onColorChange(colorValue);
      } else {
        hasNotifiedInitialColor.current = true;
      }
    }
  }, [colorValue]);

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
    setTimeout(() => { isInitialLoad.current = false; }, 100);
  }, [cardToEdit?.id]);

  // Lógica de auto-preenchimento de cor e bandeira com TRAVA DE SEGURANÇA
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
  }, [cardType, issuerValue]);

  // Limpa os erros de validação quando o tipo de cartão é alterado, ocultando os campos
  useEffect(() => {
    if (cardType === 'voucher') {
      form.clearErrors(['closingDay', 'totalLimit', 'brand']);
    }
  }, [cardType, form]);


  const onSubmit = (values: FormValues) => {
    console.log("Dados submetidos no formulário:", values);
    if (!user || !firestore) return;

    const cardData = {
      ...values,
      brand: values.type === 'voucher' ? values.issuer : values.brand,
      totalLimit: values.type === 'voucher' ? 0 : Number(values.totalLimit),
      closingDay: values.type === 'voucher' ? 0 : Number(values.closingDay),
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
        
        {cardType !== 'voucher' && (
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
         <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
                <FormLabel>Cor do Cartão</FormLabel>
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

    