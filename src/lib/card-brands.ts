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
    // CORRIGIDO: Usando a versão PNG gerada pela Wikimedia (mais estável e visível)
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Elo_Logo.svg/200px-Elo_Logo.svg.png' 
  },
  { 
    value: 'hipercard', 
    label: 'Hipercard', 
    // CORRIGIDO: Versão oficial da Wikimedia (PNG Thumb para garantir carregamento)
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Hipercard_logo.svg/200px-Hipercard_logo.svg.png' 
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
    // CORRIGIDO: Repositório Brasileiro estável (Diego Mier) - PNG transparente
    icon: 'https://raw.githubusercontent.com/diegomier/payment-icons/master/assets/aura.png' 
  },
  {
    value: 'nubank',
    label: 'Nubank',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Nubank_logo_2021.svg'
  }
];
