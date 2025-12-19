
import { format as fnsFormat, parse } from 'date-fns';
import { enUS, ptBR, es } from 'date-fns/locale';
import type { Language } from './translations';

const locales: { [key in Language]: Locale } = {
  en: enUS,
  pt: ptBR,
  es: es,
};

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
        // Use MMM/yy for consistency, avoids full month name
        const formatString = language === 'pt' ? 'MMM/yy' : 'MMM/yy';
        return fnsFormat(date, formatString, { locale });
    } catch (e) {
        console.error("Error formatting month:", e);
        return monthKey;
    }
}
