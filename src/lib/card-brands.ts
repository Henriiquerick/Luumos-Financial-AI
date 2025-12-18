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
    icon: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg' 
  },
  { 
    value: 'mastercard', 
    label: 'Mastercard', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg' 
  },
  { 
    value: 'amex', 
    label: 'American Express', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg' 
  },
  { 
    value: 'elo', 
    label: 'Elo', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Elo_Logo.svg' 
  },
  { 
    value: 'hipercard', 
    label: 'Hipercard', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Hipercard_logo.svg' 
  },
  { 
    value: 'diners', 
    label: 'Diners Club', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Diners_Club_Logo3.svg' 
  },
  { 
    value: 'discover', 
    label: 'Discover', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Discover_Card_logo.svg' 
  },
  { 
    value: 'jcb', 
    label: 'JCB', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/4/40/JCB_logo.svg' 
  },
  { 
    value: 'aura', 
    label: 'Aura', 
    // Aura é difícil achar SVG, vamos de PNG transparente
    icon: 'https://upload.wikimedia.org/wikipedia/pt/e/e4/Aura_logo.png' 
  },
  {
    value: 'nubank',
    label: 'Nubank',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Nubank_logo_2021.svg'
  }
];