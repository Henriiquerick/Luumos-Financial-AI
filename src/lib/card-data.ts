
import type { CardType, CardEntity } from './types';

export const CARD_TYPES: Omit<CardEntity, 'supportedTypes' | 'icon'>[] = [
    { value: 'credit', label: 'Cartão de Crédito' },
    { value: 'debit', label: 'Cartão de Débito' },
    { value: 'voucher', label: 'Vale / Benefício' },
]

export const CARD_ISSUERS: CardEntity[] = [
  { value: 'alelo', label: 'Alelo', icon: 'https://www.vectorlogo.zone/logos/alelo/alelo-icon.svg', supportedTypes: ['voucher'], color: '#00785c' },
  { value: 'banco-do-brasil', label: 'Banco do Brasil', icon: 'https://www.vectorlogo.zone/logos/bancodobrasil/bancodobrasil-icon.svg', supportedTypes: ['credit', 'debit'], color: '#0038a9' },
  { value: 'banco-pan', label: 'Banco Pan', icon: 'https://www.vectorlogo.zone/logos/bancopan/bancopan-icon.svg', supportedTypes: ['credit', 'debit'] },
  { value: 'ben-visa-vale', label: 'Ben Visa Vale', icon: 'https://raw.githubusercontent.com/diegomier/payment-icons/master/assets/benvisavale.svg', supportedTypes: ['voucher'] },
  { value: 'bradesco', label: 'Bradesco', icon: 'https://www.vectorlogo.zone/logos/bradesco/bradesco-icon.svg', supportedTypes: ['credit', 'debit'], color: '#cc092f' },
  { value: 'btg-pactual', label: 'BTG Pactual', icon: 'https://www.vectorlogo.zone/logos/btgpactual/btgpactual-icon.svg', supportedTypes: ['credit', 'debit'], color: '#002d62' },
  { value: 'c6', label: 'C6 Bank', icon: 'https://www.vectorlogo.zone/logos/c6bank/c6bank-icon.svg', supportedTypes: ['credit', 'debit'], color: '#242424' },
  { value: 'caixa', label: 'Caixa', icon: 'https://www.vectorlogo.zone/logos/caixa/caixa-icon.svg', supportedTypes: ['credit', 'debit'], color: '#005c9f' },
  { value: 'caju', label: 'Caju', icon: 'https://www.vectorlogo.zone/logos/cajucombr/cajucombr-icon.svg', supportedTypes: ['voucher'], color: '#f34e56' },
  { value: 'flash', label: 'Flash', icon: 'https://www.vectorlogo.zone/logos/flashappcombr/flashappcombr-icon.svg', supportedTypes: ['voucher'], color: '#f32684' },
  { value: 'ifood-beneficios', label: 'iFood Benefícios', icon: 'https://www.vectorlogo.zone/logos/ifood/ifood-icon.svg', supportedTypes: ['voucher'] },
  { value: 'inter', label: 'Inter', icon: 'https://www.vectorlogo.zone/logos/bancointer/bancointer-icon.svg', supportedTypes: ['credit', 'debit'], color: '#ff7a00' },
  { value: 'itau', label: 'Itaú', icon: 'https://www.vectorlogo.zone/logos/itau/itau-icon.svg', supportedTypes: ['credit', 'debit'], color: '#ec7000' },
  { value: 'magalu', label: 'Magalu Pay', icon: 'https://www.vectorlogo.zone/logos/magazineluiza/magazineluiza-icon.svg', supportedTypes: ['credit'] },
  { value: 'meliuz', label: 'Méliuz', icon: 'https://www.vectorlogo.zone/logos/meliuz/meliuz-icon.svg', supportedTypes: ['credit'] },
  { value: 'mercado-pago', label: 'Mercado Pago', icon: 'https://www.vectorlogo.zone/logos/mercadopago/mercadopago-icon.svg', supportedTypes: ['credit', 'debit'], color: '#009ee3'},
  { value: 'neon', label: 'Neon', icon: 'https://www.vectorlogo.zone/logos/banconeon/banconeon-icon.svg', supportedTypes: ['credit', 'debit'], color: '#00ffff' },
  { value: 'nubank', label: 'Nubank', icon: 'https://www.vectorlogo.zone/logos/nubank/nubank-icon.svg', supportedTypes: ['credit', 'debit'], color: '#820ad1' },
  { value: 'pagbank', label: 'PagBank', icon: 'https://www.vectorlogo.zone/logos/pagseguro/pagseguro-icon.svg', supportedTypes: ['credit', 'debit'] },
  { value: 'paypal', label: 'PayPal', icon: 'https://www.vectorlogo.zone/logos/paypal/paypal-icon.svg', supportedTypes: ['credit'] },
  { value: 'picpay', label: 'PicPay', icon: 'https://www.vectorlogo.zone/logos/picpay/picpay-icon.svg', supportedTypes: ['credit', 'debit'], color: '#11C76F'},
  { value: 'rico', label: 'Rico', icon: 'https://www.vectorlogo.zone/logos/ricocomvc/ricocomvc-icon.svg', supportedTypes: ['credit', 'debit'] },
  { value: 'safra', label: 'Banco Safra', icon: 'https://www.vectorlogo.zone/logos/bancosafra/bancosafra-icon.svg', supportedTypes: ['credit', 'debit'] },
  { value: 'santander', label: 'Santander', icon: 'https://www.vectorlogo.zone/logos/santander/santander-icon.svg', supportedTypes: ['credit', 'debit'], color: '#ec0000' },
  { value: 'sodexo', label: 'Sodexo (Pluxee)', icon: 'https://www.vectorlogo.zone/logos/sodexo/sodexo-icon.svg', supportedTypes: ['voucher'], color: '#181b4f' },
  { value: 'ticket', label: 'Ticket', icon: 'https://www.vectorlogo.zone/logos/ticketcombr/ticketcombr-icon.svg', supportedTypes: ['voucher'], color: '#ce001d' },
  { value: 'vr', label: 'VR Benefícios', icon: 'https://www.vectorlogo.zone/logos/vrcombr/vrcombr-icon.svg', supportedTypes: ['voucher'], color: '#00a535' },
  { value: 'will-bank', label: 'Will Bank', icon: 'https://www.vectorlogo.zone/logos/willbank/willbank-icon.svg', supportedTypes: ['credit', 'debit'] },
  { value: 'xp', label: 'XP', icon: 'https://www.vectorlogo.zone/logos/xpinvestimentos/xpinvestimentos-icon.svg', supportedTypes: ['credit', 'debit'] },
];


export const CARD_BRANDS: CardEntity[] = [
  { value: 'visa', label: 'Visa', icon: 'https://raw.githubusercontent.com/diegomier/payment-icons/master/assets/visa.svg', supportedTypes: ['credit', 'debit'] },
  { value: 'mastercard', label: 'Mastercard', icon: 'https://raw.githubusercontent.com/diegomier/payment-icons/master/assets/mastercard.svg', supportedTypes: ['credit', 'debit'] },
  { value: 'amex', label: 'American Express', icon: 'https://raw.githubusercontent.com/diegomier/payment-icons/master/assets/amex.svg', supportedTypes: ['credit', 'debit'] },
  { value: 'elo', label: 'Elo', icon: 'https://raw.githubusercontent.com/diegomier/payment-icons/master/assets/elo.svg', supportedTypes: ['credit', 'debit'] },
  { value: 'hipercard', label: 'Hipercard', icon: 'https://raw.githubusercontent.com/diegomier/payment-icons/master/assets/hipercard.svg', supportedTypes: ['credit'] },
  { value: 'diners', label: 'Diners Club', icon: 'https://raw.githubusercontent.com/diegomier/payment-icons/master/assets/diners.svg', supportedTypes: ['credit'] },
  { value: 'discover', label: 'Discover', icon: 'https://raw.githubusercontent.com/diegomier/payment-icons/master/assets/discover.svg', supportedTypes: ['credit'] },
  { value: 'jcb', label: 'JCB', icon: 'https://raw.githubusercontent.com/diegomier/payment-icons/master/assets/jcb.svg', supportedTypes: ['credit'] },
  { value: 'aura', label: 'Aura', icon: 'https://raw.githubusercontent.com/diegomier/payment-icons/master/assets/aura.svg', supportedTypes: ['credit'] },
  
  // Voucher brands can mirror issuers
  ...CARD_ISSUERS.filter(issuer => issuer.supportedTypes.includes('voucher'))
];

// Funções auxiliares essenciais
export const getBrand = (value: string | undefined | null): CardEntity | undefined => {
  if (!value) return undefined;
  return CARD_BRANDS.find(b => b.value === value);
}

export const getIssuer = (value: string | undefined | null): CardEntity | undefined => {
  if (!value) return undefined;
  return CARD_ISSUERS.find(i => i.value === value);
}
