// src/lib/card-brands.ts

export interface CardBrand {
  value: string;
  label: string;
  icon: string; // Pode ser coordenada ("0% 0%") OU URL ("https://...")
}

export const CARD_BRANDS: CardBrand[] = [
    // --- GRUPO 1: ESTÃO NO SEU ARQUIVO SPRITE (Coordenadas) ---
    { 
      value: 'visa', 
      label: 'Visa', 
      icon: '0% 0%' // Linha 1, Coluna 1
    },
    { 
      value: 'mastercard', 
      label: 'Mastercard', 
      icon: '25% 0%' // Linha 1, Coluna 2 (Matemática: 100 / 4 intervalos = 25%)
    },
    { 
      value: 'maestro', 
      label: 'Maestro', 
      icon: '50% 0%' // Linha 1, Coluna 3
    },
    { 
      value: 'elo', 
      label: 'Elo', 
      icon: '75% 0%' // Linha 1, Coluna 4
    },
    { 
      value: 'alelo', 
      label: 'Alelo', 
      icon: '100% 0%' // Linha 1, Coluna 5
    },
    { 
      value: 'amex', 
      label: 'American Express', 
      icon: '0% 100%' // Linha 2, Coluna 1
    },
    { 
      value: 'hipercard', 
      label: 'Hipercard', 
      icon: '50% 100%' // Linha 2, Coluna 3
    },
    { 
      value: 'diners', 
      label: 'Diners Club', 
      icon: '75% 100%' // Linha 2, Coluna 4
    },
  
    // --- GRUPO 2: NÃO ESTÃO NO ARQUIVO (Usamos URLs Externas) ---
    { 
      value: 'nubank', 
      label: 'Nubank', 
      icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Nubank_logo_2021.svg' 
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
      icon: 'https://upload.wikimedia.org/wikipedia/pt/e/e4/Aura_logo.png' 
    }
  ];
  