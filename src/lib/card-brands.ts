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
    icon: 'https://www.vectorlogo.zone/logos/americanexpress/americanexpress-icon.svg' 
  },
  { 
    value: 'elo', 
    label: 'Elo', 
    // AGORA VAI: Logo colorido oficial (não some no preto) hospedado em CDN estável
    icon: 'https://www.vectorlogo.zone/logos/cartaoelocombr/cartaoelocombr-ar21.svg' 
  },
  { 
    value: 'hipercard', 
    label: 'Hipercard', 
    // AGORA VAI: Link direto da VectorLogoZone
    icon: 'https://www.vectorlogo.zone/logos/hipercard/hipercard-icon.svg' 
  },
  { 
    value: 'diners', 
    label: 'Diners Club', 
    icon: 'https://www.vectorlogo.zone/logos/dinersclub/dinersclub-icon.svg' 
  },
  { 
    value: 'discover', 
    label: 'Discover', 
    icon: 'https://www.vectorlogo.zone/logos/discover/discover-icon.svg' 
  },
  { 
    value: 'jcb', 
    label: 'JCB', 
    icon: 'https://www.vectorlogo.zone/logos/jcb/jcb-icon.svg' 
  },
  { 
    value: 'aura', 
    label: 'Aura', 
    // O DIFICIL: Pegando do repositório da Tuna (Gateway estável)
    icon: 'https://raw.githubusercontent.com/tuna-pay/tuna-docs/master/assets/payment-methods/aura.png' 
  },
  {
    value: 'nubank',
    label: 'Nubank',
    // Esse é chato de achar fora da Wiki, mas esse link costuma ser estável.
    // Se falhar, usaremos o fallback do texto.
    icon: 'https://www.vectorlogo.zone/logos/nubank/nubank-icon.svg'
  }
];
