
'use client';

import React from 'react';
import CurrencyInput, { type CurrencyInputProps } from 'react-currency-input-field';
import { useCurrency } from '@/contexts/currency-context';
import { cn } from '@/lib/utils';

// Ajustamos o onValueChange para receber uma string (que a lib nos dá) e repassar o número.
type MoneyInputProps = Omit<CurrencyInputProps, 'prefix' | 'groupSeparator' | 'decimalSeparator' | 'onValueChange'> & {
  onValueChange: (value: number | undefined) => void;
};

export function MoneyInput({ className, onValueChange, value, ...props }: MoneyInputProps) {
  const { currency } = useCurrency();

  return (
    <CurrencyInput
      className={cn(
        'flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
      )}
      prefix={`${currency.symbol} `}
      groupSeparator={currency.thousandSeparator}
      decimalSeparator={currency.decimalSeparator}
      decimalScale={2} // Garante 2 casas decimais
      // A lib nos dá o valor como string ('1.000,50') e o valor numérico.
      // Repassamos o valor numérico para o react-hook-form.
      onValueChange={(value, name, values) => onValueChange(values?.float)}
      value={value} // Passamos o valor do formulário diretamente.
      {...props}
    />
  );
}
