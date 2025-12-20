'use client';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/currency-context';

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onValueChange'> {
  onValueChange: (value: number | undefined) => void;
  value?: number | string;
}

export function MoneyInput({ className, onValueChange, value: initialValue, ...props }: MoneyInputProps) {
  const { currency } = useCurrency();
  const [displayValue, setDisplayValue] = useState('');

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || isNaN(num)) return '';
    return new Intl.NumberFormat(currency.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  useEffect(() => {
    let numValue: number | undefined;

    if (typeof initialValue === 'string') {
        const clean = initialValue.replace(/[^\d,-]/g, '').replace(currency.thousandSeparator, '').replace(currency.decimalSeparator, '.');
        numValue = parseFloat(clean);
    } else {
        numValue = initialValue;
    }

    if (numValue !== undefined && !isNaN(numValue)) {
      // Check if the input is not focused before formatting
      if (document.activeElement !== document.getElementById(props.id || '')) {
         setDisplayValue(formatNumber(numValue));
      }
    } else {
       setDisplayValue('');
    }
  }, [initialValue, currency.locale]);

  const parseValue = (str: string): number | undefined => {
    if (!str) return undefined;
    const clean = str.replace(new RegExp(`\\${currency.thousandSeparator}`, 'g'), '').replace(currency.decimalSeparator, '.');
    const number = parseFloat(clean);
    return isNaN(number) ? undefined : number;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value;

    const regex = new RegExp(`[^0-9\\${currency.decimalSeparator}]`, 'g');
    let filteredValue = rawValue.replace(regex, '');

    const parts = filteredValue.split(currency.decimalSeparator);
    if (parts.length > 2) {
      filteredValue = parts[0] + currency.decimalSeparator + parts.slice(1).join('');
    }

    setDisplayValue(filteredValue);

    const numericValue = parseValue(filteredValue);
    onValueChange(numericValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const numericValue = parseValue(displayValue);
    if (numericValue !== undefined) {
      setDisplayValue(formatNumber(numericValue));
    } else {
      setDisplayValue('');
    }
    props.onBlur?.(e);
  };

   const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const numericValue = parseValue(displayValue);
    if (numericValue !== undefined) {
      setDisplayValue(String(numericValue).replace('.', currency.decimalSeparator));
    }
     props.onFocus?.(e);
  };

  return (
    <div className="relative flex items-center">
      <span className="absolute left-3 text-muted-foreground pointer-events-none">{currency.symbol}</span>
      <input
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder="0,00"
        className={cn(
          'flex h-12 w-full rounded-md border border-input bg-background py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'pl-10 pr-3', // Espaço para o símbolo e padding direito
          className
        )}
        {...props}
      />
    </div>
  );
}
