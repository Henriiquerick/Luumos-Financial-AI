'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CURRENCIES, type Currency, type CurrencyCode } from '@/lib/currencies';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currencyCode: CurrencyCode) => void;
  formatMoney: (value: number, options?: Intl.NumberFormatOptions) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider = ({ children }: CurrencyProviderProps) => {
  const { user } = useUser();
  const firestore = useFirestore();
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('BRL');

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [user, firestore]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    // Priority: 1. Firestore, 2. localStorage, 3. Default ('BRL')
    if (userProfile?.currency && CURRENCIES[userProfile.currency]) {
      setCurrencyCode(userProfile.currency);
    } else {
      const storedCurrency = localStorage.getItem('lucent-currency') as CurrencyCode;
      if (storedCurrency && CURRENCIES[storedCurrency]) {
        setCurrencyCode(storedCurrency);
      }
    }
  }, [userProfile]);

  const handleSetCurrency = (newCurrencyCode: CurrencyCode) => {
    if (CURRENCIES[newCurrencyCode]) {
      setCurrencyCode(newCurrencyCode);
      localStorage.setItem('lucent-currency', newCurrencyCode);
      if (userProfileRef) {
        updateDocumentNonBlocking(userProfileRef, { currency: newCurrencyCode });
      }
    }
  };

  const formatMoney = useCallback((value: number, options?: Intl.NumberFormatOptions): string => {
    const currency = CURRENCIES[currencyCode];
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      ...options,
    }).format(value);
  }, [currencyCode]);


  const value = {
    currency: CURRENCIES[currencyCode],
    setCurrency: handleSetCurrency,
    formatMoney,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
