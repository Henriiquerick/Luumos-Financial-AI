import type { CardType } from './types';

// O tipo foi simplificado porque a lógica de ícone agora é baseada em caminhos locais
export interface CardBrand {
    name: string;
    icon: string; // Caminho para o ícone local ou URL
}

export const CARD_BRANDS: Record<string, CardBrand> = {
    'visa': { name: 'Visa', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg' },
    'mastercard': { name: 'Mastercard', icon: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg' },
    'elo': { name: 'Elo', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Elo_logo.svg' },
    'amex': { name: 'American Express', icon: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg'},
    'hipercard': { name: 'Hipercard', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Hipercard_logo.svg'},
};


export const CARD_ISSUERS = [
    'Nubank',
    'Inter',
    'C6 Bank',
    'Bradesco',
    'Itaú',
    'Santander',
    'Caixa',
    'Banco do Brasil',
    'BTG Pactual',
    'XP',
    'Neon',
    'Next',
    'PagBank',
    'PicPay',
    'Will Bank',
    'Méliuz'
];

export const VOUCHER_ISSUERS = [
    'Alelo',
    'Ticket',
    'Sodexo',
    'VR Benefícios',
    'Caju',
    'Flash',
    'Ben Visa Vale',
    'iFood Benefícios'
];


export const CARD_TYPES: { value: CardType, label: string }[] = [
    { value: 'credit', label: 'Cartão de Crédito' },
    { value: 'debit', label: 'Cartão de Débito' },
    { value: 'voucher', label: 'Vale / Benefício' },
];
