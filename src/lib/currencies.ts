
export type CurrencyCode = 'BRL' | 'USD' | 'EUR';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  decimalSeparator: ',' | '.';
  thousandSeparator: '.' | ',';
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  BRL: { code: 'BRL', symbol: 'R$', locale: 'pt-BR', decimalSeparator: ',', thousandSeparator: '.' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', decimalSeparator: '.', thousandSeparator: ',' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', decimalSeparator: ',', thousandSeparator: '.' }
};

export const CURRENCY_LIST = Object.values(CURRENCIES);
