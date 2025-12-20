'use client';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onValueChange' | 'value'> {
  onValueChange: (value: number | undefined) => void;
  value?: number | string;
}

export function MoneyInput({ className, onValueChange, value: initialValue, ...props }: MoneyInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  const formatToBRL = (num: number | undefined) => {
    if (num === undefined || isNaN(num)) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num);
  };

  useEffect(() => {
    let numValue: number | undefined;
    if (typeof initialValue === 'string') {
        // First, try to parse it as a float directly
        numValue = parseFloat(initialValue);
        if (isNaN(numValue)) {
            // If it fails, assume it's a BRL formatted string
            const clean = initialValue.replace(/[R$\s.]/g, '').replace(',', '.');
            numValue = parseFloat(clean);
        }
    } else {
        numValue = initialValue;
    }

    if (numValue !== undefined && !isNaN(numValue)) {
      // Check if the input is not focused before formatting
      if (document.activeElement !== document.getElementById(props.id || '')) {
         setDisplayValue(formatToBRL(numValue));
      } else {
        // If focused, show the raw number to allow editing
        setDisplayValue(String(numValue).replace('.', ','));
      }
    } else {
       setDisplayValue('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);
  
  const parseFromBRL = (str: string): number | undefined => {
    if (!str) return undefined;
    // Remove R$, spaces, and thousand separators (.), then replace comma with dot
    const clean = str.toString().replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.');
    const number = parseFloat(clean);
    return isNaN(number) ? undefined : number;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value;
    
    // Allow only digits, comma, and period for input flexibility
    let filteredValue = rawValue.replace(/[^0-9,.]/g, '');
    
    // Replace period with comma for consistency
    filteredValue = filteredValue.replace('.', ',');

    // Ensure only one comma
    const parts = filteredValue.split(',');
    if (parts.length > 2) {
      filteredValue = parts[0] + ',' + parts.slice(1).join('');
    }

    setDisplayValue(filteredValue);

    const numericValue = parseFromBRL(filteredValue);
    onValueChange(numericValue);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const numericValue = parseFromBRL(displayValue);
    if (numericValue !== undefined) {
      setDisplayValue(formatToBRL(numericValue));
    } else {
      setDisplayValue(''); // Clear if invalid
    }
    // Propagate blur event if provided
    props.onBlur?.(e);
  };
  
   const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const numericValue = parseFromBRL(displayValue);
    if (numericValue !== undefined) {
      // Show a simpler, editable value on focus
      setDisplayValue(String(numericValue).replace('.', ','));
    }
     props.onFocus?.(e);
  };


  return (
    <input
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      placeholder="R$ 0,00"
      className={cn(
        'flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
      )}
      {...props}
    />
  );
}
