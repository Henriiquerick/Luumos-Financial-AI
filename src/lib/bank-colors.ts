

export const BANK_THEMES: Record<string, { bg: string; text: string }> = {
  // Temas Escuros -> Texto Branco
  'bancodobrasil': { bg: '#0038A9', text: '#FFFFFF' },
  'caixa': { bg: '#005C9F', text: '#FFFFFF' },
  'caixaeconomicafederal': { bg: '#005C9F', text: '#FFFFFF' },
  'santander': { bg: '#EC0000', text: '#FFFFFF' },
  'bradesco': { bg: '#CC092F', text: '#FFFFFF' },
  'itau': { bg: '#EC7000', text: '#FFFFFF' },
  'nubank': { bg: '#820AD1', text: '#FFFFFF' },
  'inter': { bg: '#FF7A00', text: '#FFFFFF' },
  'c6bank': { bg: '#242424', text: '#FFFFFF' },
  'c6': { bg: '#242424', text: '#FFFFFF' },
  'btgpactual': { bg: '#002D62', text: '#FFFFFF' },
  'btg': { bg: '#002D62', text: '#FFFFFF' },
  'xpinvestimentos': { bg: '#000000', text: '#FFFFFF' },
  'xp': { bg: '#000000', text: '#FFFFFF' },
  'original': { bg: '#3AB54A', text: '#FFFFFF' },
  'picpay': { bg: '#11C76F', text: '#FFFFFF' },
  'mercadopago': { bg: '#009EE3', text: '#FFFFFF' },
  'sicredi': { bg: '#366528', text: '#FFFFFF' },
  'sicoob': { bg: '#003641', text: '#FFFFFF' },

  // Temas Claros/Neon -> Texto Preto
  'neon': { bg: '#00FFFF', text: '#1A1A1A' },
  'next': { bg: '#00FF5F', text: '#1A1A1A' },
  'pagbank': { bg: '#F4B400', text: '#1A1A1A' },
  'pagseguro': { bg: '#F4B400', text: '#1A1A1A' },
  'willbank': { bg: '#FFD700', text: '#1A1A1A' },
  'will': { bg: '#FFD700', text: '#1A1A1A' },
  'bancopan': { bg: '#00A0FF', text: '#FFFFFF' },
  'pan': { bg: '#00A0FF', text: '#FFFFFF' },
};

const FALLBACK_THEME = { bg: '#242424', text: '#FFFFFF' };

/**
 * Normaliza o nome de um banco para uma chave consistente.
 * @param name O nome do banco.
 * @returns O nome normalizado em minúsculas, sem espaços, e sem acentos.
 */
function normalizeBankName(name: string): string {
  if (!name) return '';
  return name
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, ''); // Remove caracteres não alfanuméricos
}

/**
 * Obtém o tema de cores (fundo e texto) correspondente a um nome de banco.
 * @param bankName O nome do banco (ex: 'Nubank', 'Itaú').
 * @returns Um objeto { bg: string, text: string } com as cores do tema.
 */
export function getBankTheme(bankName: string): { bg: string; text: string } {
  const normalizedName = normalizeBankName(bankName);

  // Procura por uma correspondência exata primeiro
  if (BANK_THEMES[normalizedName]) {
    return BANK_THEMES[normalizedName];
  }

  // Se não encontrar, procura por uma chave que o nome normalizado inclua
  // Isso ajuda a pegar "banco inter" com a chave "inter"
  const key = Object.keys(BANK_THEMES).find(key => normalizedName.includes(key));
  if (key) {
    return BANK_THEMES[key];
  }
  
  return FALLBACK_THEME;
}
