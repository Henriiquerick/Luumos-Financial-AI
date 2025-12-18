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
    icon: 'https://raw.githubusercontent.com/alvarotrigo/social-share-urls/master/public/img/elo.svg' 
  },
  { 
    value: 'hipercard', 
    label: 'Hipercard', 
    icon: 'https://raw.githubusercontent.com/aaronfischer/payment-icons/main/assets/hipercard.svg' 
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
    icon: 'https://seeklogo.com/images/C/Cartao_Aura-logo-1563B3D9DE-seeklogo.com.png' 
  },
  {
    value: 'nubank',
    label: 'Nubank',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Nubank_logo_2021.svg'
  }
];
