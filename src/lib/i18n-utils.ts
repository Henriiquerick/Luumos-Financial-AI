
import { format as fnsFormat, parse } from 'date-fns';
import { enUS, ptBR, es } from 'date-fns/locale';
import type { Language } from './translations';

const locales: { [key in Language]: Locale } = {
  en: enUS,
  pt: ptBR,
  es: es,
};

const currencyMap: { [key in Language]: string } = {
  en: 'USD',
  pt: 'BRL',
  es: 'EUR', // Example, can be changed
};

const currencyLocaleMap: { [key in Language]: string } = {
    en: 'en-US',
    pt: 'pt-BR',
    es: 'es-ES',
};

/**
 * Formats a number as a currency string based on the provided language.
 * @param language The current language ('en', 'pt', 'es').
 * @param value The number to format.
 * @param options Optional Intl.NumberFormatOptions to override default settings.
 * @returns The formatted currency string.
 */
export function formatCurrency(language: Language, value: number, options?: Intl.NumberFormatOptions): string {
  const locale = currencyLocaleMap[language] || 'en-US';
  const currency = currencyMap[language] || 'USD';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...options
  }).format(value);
}

/**
 * Formats a date object or a date string into a localized string.
 * @param language The current language ('en', 'pt', 'es').
 * @param date The date to format.
 * @param formatStr The desired output format string (defaults to 'P').
 * @returns The formatted date string.
 */
export function formatDate(language: Language, date: Date | string, formatStr: string = 'P'): string {
  const locale = locales[language] || enUS;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return fnsFormat(dateObj, formatStr, { locale });
}


/**
 * Formats a date string like "2024-07" into a localized month/year format.
 * @param language The current language ('en', 'pt', 'es').
 * @param monthKey The date string in 'yyyy-MM' format.
 * @returns The formatted month string (e.g., "Jul/24").
 */
export function formatMonth(language: Language, monthKey: string): string {
    const locale = locales[language] || enUS;
    try {
        const date = parse(monthKey, 'yyyy-MM', new Date());
        return fnsFormat(date, 'MMM/yy', { locale });
    } catch (e) {
        console.error("Error formatting month:", e);
        return monthKey;
    }
}
