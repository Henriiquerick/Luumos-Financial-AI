'use client';

import React from 'react';
import CurrencyInput, { type CurrencyInputProps } from 'react-currency-input-field';
// Removemos a dependência do contexto para forçar o padrão BRL visualmente
import { cn } from '@/lib/utils';

// Tipagem atualizada
type MoneyInputProps = Omit<CurrencyInputProps, 'onValueChange'> & {
  onValueChange: (value: number | undefined) => void;
  value?: number | string; // Aceita number ou string para flexibilidade
};

export function MoneyInput({ className, onValueChange, value, ...props }: MoneyInputProps) {
  return (
    <CurrencyInput
      className={cn(
        'flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
      )}
      // 1. Configuração Brasileira Explícita
      intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
      
      // 2. Força os separadores visuais (Vírgula para decimal)
      decimalSeparator=","
      groupSeparator="."
      
      // 3. Limita a 2 casas decimais e permite digitá-las
      decimalsLimit={2}
      allowDecimals={true}
      
      // 4. Prefixo fixo (opcional, já que o intlConfig coloca, mas garante o espaço)
      prefix="R$ "
      
      // 5. Lógica de atualização (Extrai o Float puro para o banco de dados)
      onValueChange={(value, name, values) => {
        // values.float retorna o número "limpo" (ex: 1250.50)
        onValueChange(values?.float);
      }}
      
      // 6. Garante que o valor venha controlado
      value={value}
      
      {...props}
    />
  );
}