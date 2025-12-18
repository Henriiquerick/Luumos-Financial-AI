
export type CardType = 'credit' | 'debit' | 'voucher';

export interface CardEntity {
  value: string;
  label: string;
  icon: string;
  types: CardType[];
}

export const CARD_TYPES: Omit<CardEntity, 'types' | 'icon'>[] = [
    { value: 'credit', label: 'Cartão de Crédito' },
    { value: 'debit', label: 'Cartão de Débito' },
    { value: 'voucher', label: 'Vale / Benefício' },
]

export const CARD_ISSUERS: CardEntity[] = [
  // Bancos Digitais
  { value: 'nubank', label: 'Nubank', icon: 'https://www.vectorlogo.zone/logos/nubank/nubank-icon.svg', types: ['credit', 'debit'] },
  { value: 'inter', label: 'Inter', icon: 'https://www.vectorlogo.zone/logos/bancointer/bancointer-icon.svg', types: ['credit', 'debit'] },
  { value: 'c6', label: 'C6 Bank', icon: 'https://www.vectorlogo.zone/logos/c6bank/c6bank-icon.svg', types: ['credit', 'debit'] },
  { value: 'picpay', label: 'PicPay', icon: 'https://www.vectorlogo.zone/logos/picpay/picpay-icon.svg', types: ['credit', 'debit'] },
  { value: 'mercado-pago', label: 'Mercado Pago', icon: 'https://www.vectorlogo.zone/logos/mercadopago/mercadopago-icon.svg', types: ['credit', 'debit'] },
  { value: 'banco-pan', label: 'Banco Pan', icon: 'https://www.vectorlogo.zone/logos/bancopan/bancopan-icon.svg', types: ['credit', 'debit'] },
  { value: 'btg-pactual', label: 'BTG Pactual', icon: 'https://www.vectorlogo.zone/logos/btgpactual/btgpactual-icon.svg', types: ['credit', 'debit'] },
  { value: 'will-bank', label: 'Will Bank', icon: 'https://www.vectorlogo.zone/logos/willbank/willbank-icon.svg', types: ['credit', 'debit'] },
  { value: 'neon', label: 'Neon', icon: 'https://www.vectorlogo.zone/logos/banconeon/banconeon-icon.svg', types: ['credit', 'debit'] },
  { value: 'pagbank', label: 'PagBank', icon: 'https://www.vectorlogo.zone/logos/pagseguro/pagseguro-icon.svg', types: ['credit', 'debit'] },
  
  // Bancos Tradicionais
  { value: 'itau', label: 'Itaú', icon: 'https://www.vectorlogo.zone/logos/itau/itau-icon.svg', types: ['credit', 'debit'] },
  { value: 'bradesco', label: 'Bradesco', icon: 'https://www.vectorlogo.zone/logos/bradesco/bradesco-icon.svg', types: ['credit', 'debit'] },
  { value: 'santander', label: 'Santander', icon: 'https://www.vectorlogo.zone/logos/santander/santander-icon.svg', types: ['credit', 'debit'] },
  { value: 'banco-do-brasil', label: 'Banco do Brasil', icon: 'https://www.vectorlogo.zone/logos/bancodobrasil/bancodobrasil-icon.svg', types: ['credit', 'debit'] },
  { value: 'caixa', label: 'Caixa', icon: 'https://www.vectorlogo.zone/logos/caixa/caixa-icon.svg', types: ['credit', 'debit'] },
  { value: 'safra', label: 'Banco Safra', icon: 'https://www.vectorlogo.zone/logos/bancosafra/bancosafra-icon.svg', types: ['credit', 'debit'] },

  // Outros
  { value: 'paypal', label: 'PayPal', icon: 'https://www.vectorlogo.zone/logos/paypal/paypal-icon.svg', types: ['credit'] },
  { value: 'magalu', label: 'Magalu Pay', icon: 'https://www.vectorlogo.zone/logos/magazineluiza/magazineluiza-icon.svg', types: ['credit'] },
  { value: 'meliuz', label: 'Méliuz', icon: 'https://www.vectorlogo.zone/logos/meliuz/meliuz-icon.svg', types: ['credit'] },
  { value: 'xp', label: 'XP', icon: 'https://www.vectorlogo.zone/logos/xpinvestimentos/xpinvestimentos-icon.svg', types: ['credit', 'debit'] },
  { value: 'rico', label: 'Rico', icon: 'https://www.vectorlogo.zone/logos/ricocomvc/ricocomvc-icon.svg', types: ['credit', 'debit'] },

  // Vouchers
  { value: 'alelo', label: 'Alelo', icon: 'https://www.vectorlogo.zone/logos/alelo/alelo-icon.svg', types: ['voucher'] },
  { value: 'sodexo', label: 'Sodexo (Pluxee)', icon: 'https://www.vectorlogo.zone/logos/sodexo/sodexo-icon.svg', types: ['voucher'] },
  { value: 'vr', label: 'VR Benefícios', icon: 'https://www.vectorlogo.zone/logos/vrcombr/vrcombr-icon.svg', types: ['voucher'] },
  { value: 'ticket', label: 'Ticket', icon: 'https://www.vectorlogo.zone/logos/ticketcombr/ticketcombr-icon.svg', types: ['voucher'] },
  { value: 'caju', label: 'Caju', icon: 'https://www.vectorlogo.zone/logos/cajucombr/cajucombr-icon.svg', types: ['voucher'] },
  { value: 'flash', label: 'Flash', icon: 'https://www.vectorlogo.zone/logos/flashappcombr/flashappcombr-icon.svg', types: ['voucher'] },
  { value: 'ifood-beneficios', label: 'iFood Benefícios', icon: 'https://www.vectorlogo.zone/logos/ifood/ifood-icon.svg', types: ['voucher'] },
  { value: 'ben-visa-vale', label: 'Ben Visa Vale', icon: 'https://raw.githubusercontent.com/diegomier/payment-icons/master/assets/benvisavale.svg', types: ['voucher'] },
];


export const CARD_BRANDS: CardEntity[] = [
  { value: 'visa', label: 'Visa', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg', types: ['credit', 'debit'] },
  { value: 'mastercard', label: 'Mastercard', icon: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg', types: ['credit', 'debit'] },
  { value: 'amex', label: 'American Express', icon: 'https://www.vectorlogo.zone/logos/americanexpress/americanexpress-icon.svg', types: ['credit', 'debit'] },
  { value: 'elo', label: 'Elo', icon: 'https://www.vectorlogo.zone/logos/cartaoelocombr/cartaoelocombr-ar21.svg', types: ['credit', 'debit'] },
  { value: 'hipercard', label: 'Hipercard', icon: 'https://www.vectorlogo.zone/logos/hipercard/hipercard-icon.svg', types: ['credit'] },
  { value: 'diners', label: 'Diners Club', icon: 'https://www.vectorlogo.zone/logos/dinersclub/dinersclub-icon.svg', types: ['credit'] },
  { value: 'discover', label: 'Discover', icon: 'https://www.vectorlogo.zone/logos/discover/discover-icon.svg', types: ['credit'] },
  { value: 'jcb', label: 'JCB', icon: 'https://www.vectorlogo.zone/logos/jcb/jcb-icon.svg', types: ['credit'] },
  { value: 'aura', label: 'Aura', icon: 'https://raw.githubusercontent.com/tuna-pay/tuna-docs/master/assets/payment-methods/aura.png', types: ['credit'] },
  
  // Voucher brands can mirror issuers
  ...CARD_ISSUERS.filter(issuer => issuer.types.includes('voucher'))
];
