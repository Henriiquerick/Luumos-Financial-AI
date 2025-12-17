
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { TRANSLATIONS, Language } from '@/lib/translations';

type TranslationKey = keyof (typeof TRANSLATIONS)['en'];

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (typeof TRANSLATIONS)[Language];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>('pt');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('lucent-lang') as Language;
    if (storedLanguage && TRANSLATIONS[storedLanguage]) {
      setLanguage(storedLanguage);
    }
  }, []);

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('lucent-lang', newLanguage);
  };

  const t = useMemo(() => TRANSLATIONS[language], [language]);

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
