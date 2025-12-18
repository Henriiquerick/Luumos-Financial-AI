// src/lib/card-brands.ts

export interface CardBrand {
  value: string;
  label: string;
  position: string; // A coordenada mágica no sprite
}

export const CARD_BRANDS: CardBrand[] = [
  // --- LINHA 1 (Topo) ---
  { 
    value: 'visa', 
    label: 'Visa', 
    position: '0% 0%' // Canto Superior Esquerdo
  },
  { 
    value: 'mastercard', 
    label: 'Mastercard', 
    position: '50% 0%' // Meio Topo
  },
  { 
    value: 'amex', 
    label: 'American Express', 
    position: '100% 0%' // Canto Superior Direito
  },

  // --- LINHA 2 (Meio) ---
  { 
    value: 'discover', 
    label: 'Discover', 
    position: '0% 50%' // Meio Esquerda
  },
  { 
    value: 'diners', 
    label: 'Diners Club', 
    position: '50% 50%' // Centro Absoluto
  },
  { 
    value: 'jcb', 
    label: 'JCB', 
    position: '100% 50%' // Meio Direita
  },

  // --- LINHA 3 (Baixo) ---
  { 
    value: 'hipercard', 
    label: 'Hipercard', 
    position: '0% 100%' // Baixo Esquerda
  },
  { 
    value: 'aura', 
    label: 'Aura', 
    position: '50% 100%' // Baixo Meio
  },
  { 
    value: 'elo', 
    label: 'Elo', 
    position: '100% 100%' // Baixo Direita
  },
];