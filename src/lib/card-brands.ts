// src/lib/card-brands.ts

export interface CardBrand {
  value: string;
  label: string;
  icon: string; // URL direta da imagem
}

export const CARD_BRANDS: CardBrand[] = [
  { 
    value: 'visa', 
    label: 'Visa', 
    icon: 'https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/visa.svg' 
  },
  { 
    value: 'mastercard', 
    label: 'Mastercard', 
    icon: 'https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/mastercard.svg' 
  },
  { 
    value: 'amex', 
    label: 'American Express', 
    icon: 'https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/amex.svg' 
  },
  { 
    value: 'elo', 
    label: 'Elo', 
    icon: 'https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/elo.svg' 
  },
  { 
    value: 'hipercard', 
    label: 'Hipercard', 
    icon: 'https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/hipercard.svg' 
  },
  { 
    value: 'diners', 
    label: 'Diners Club', 
    icon: 'https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/diners.svg' 
  },
  { 
    value: 'discover', 
    label: 'Discover', 
    icon: 'https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/discover.svg' 
  },
  { 
    value: 'jcb', 
    label: 'JCB', 
    icon: 'https://raw.githubusercontent.com/datatrans/payment-logos/master/assets/cards/jcb.svg' 
  },
  { 
    value: 'aura', 
    label: 'Aura', 
    icon: 'https://img.icons8.com/color/48/aura.png' 
  },
  {
    value: 'nubank',
    label: 'Nubank',
    icon: 'https://www.vectorlogo.zone/logos/nubank/nubank-icon.svg'
  }
];
