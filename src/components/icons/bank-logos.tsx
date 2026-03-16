'use client';

import React from 'react';
import { getBankTheme } from '@/lib/bank-colors';

interface BankLogoProps {
  brand: string;
  className?: string;
}

/**
 * Componente que renderiza o logo do banco ou um placeholder elegante.
 * Resolve o problema de requisições 404 para logos inexistentes.
 */
export const BankLogo = ({ brand, className }: BankLogoProps) => {
  const theme = getBankTheme(brand);
  const normalized = brand.toLowerCase().replace(/\s/g, '');

  // Caso especial: PayPal (conforme solicitado anteriormente)
  if (normalized === 'paypal') {
    return (
      <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
        <path fill="#003087" d="M21.5 8.1h14.1c10.4 0 15.1 5.2 14.1 12.8-.9 7.6-6.4 12.8-16.8 12.8h-4.3l-2.1 13.2h-9.1l8.2-51.8z" />
        <path fill="#009cde" d="M25.6 21.3h14.1c10.4 0 15.1 5.2 14.1 12.8-.9 7.6-6.4 12.8-16.8 12.8h-4.3l-2.1 13.2h-9.1l8.2-51.8z" opacity=".5" />
      </svg>
    );
  }

  // Placeholder Elegante: Retorna um SVG com a cor do banco e a inicial/nome curto
  return (
    <svg viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="12" fill={theme.bg} />
      <text 
        x="50%" 
        y="50%" 
        dy=".3em" 
        fill={theme.text} 
        fontSize="24" 
        fontFamily="sans-serif" 
        textAnchor="middle" 
        fontWeight="bold"
      >
        {brand.charAt(0).toUpperCase()}
      </text>
    </svg>
  );
};
