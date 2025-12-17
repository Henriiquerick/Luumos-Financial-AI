

export const BANK_COLORS: Record<string, string> = {
  // Gigantes
  'banco do brasil': '#0038A9',
  'caixa': '#005C9F',
  'caixa economica federal': '#005C9F',
  'santander': '#EC0000',
  'bradesco': '#CC092F',
  'itau': '#EC7000',
  'itaú': '#EC7000',

  // Digitais & Fintechs
  'nubank': '#820AD1',
  'inter': '#FF7A00',
  'c6 bank': '#242424',
  'c6': '#242424',
  'btg pactual': '#002D62',
  'btg': '#002D62',
  'xp investimentos': '#000000',
  'xp': '#000000',
  'neon': '#00A3A3', // Tom mais escuro para contraste
  'next': '#00FF5F',
  'original': '#3AB54A',
  'picpay': '#11C76F',
  'mercado pago': '#009EE3',
  'pagbank': '#96C12E',
  'pagseguro': '#96C12E',

  // Cooperativas
  'sicredi': '#366528',
  'sicoob': '#003641',
};

const FALLBACK_COLOR = '#333333';

/**
 * Normaliza o nome de um banco para uma chave consistente.
 * @param name O nome do banco.
 * @returns O nome normalizado em minúsculas e sem acentos.
 */
function normalizeBankName(name: string): string {
  if (!name) return '';
  return name
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Obtém a cor hexadecimal correspondente a um nome de banco.
 * @param bankName O nome do banco (ex: 'Nubank', 'Itaú').
 * @returns A cor hexadecimal da marca ou uma cor de fallback.
 */
export function getBankColor(bankName: string): string {
  const normalizedName = normalizeBankName(bankName);

  // Procura por uma correspondência exata primeiro
  if (BANK_COLORS[normalizedName]) {
    return BANK_COLORS[normalizedName];
  }

  // Se não encontrar, procura por uma chave que contenha o nome normalizado
  // (útil para "Cartão Nubank")
  const key = Object.keys(BANK_COLORS).find(key => normalizedName.includes(key));
  if (key) {
    return BANK_COLORS[key];
  }
  
  return FALLBACK_COLOR;
}
