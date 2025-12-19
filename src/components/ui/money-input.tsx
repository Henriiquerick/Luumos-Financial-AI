'use client';

import React from 'react';
import CurrencyInput, { type CurrencyInputProps } from 'react-currency-input-field';
import { useCurrency } from '@/contexts/currency-context';
import { cn } from '@/lib/utils';

type MoneyInputProps = Omit<CurrencyInputProps, 'prefix' | 'groupSeparator' | 'decimalSeparator'> & {
  onValueChange: (value: number | undefined) => void;
};

export function MoneyInput({ className, onValueChange, ...props }: MoneyInputProps) {
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
      decimalsLimit={2}
      onValueChange={(value, _name, values) => onValueChange(values?.float)}
      {...props}
    />
  );
}
