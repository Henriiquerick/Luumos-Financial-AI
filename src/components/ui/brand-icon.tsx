// src/components/ui/brand-icon.tsx
import React from 'react';
import { cn } from "@/lib/utils"; // Ajuste o import se necessário

interface BrandIconProps {
  position: string;
  className?: string;
}

export const BrandIcon = ({ position, className }: BrandIconProps) => {
  return (
    <div
      className={cn(
        // MUDANÇA 1: Tamanho fixo e proporção.
        // w-12 (48px) e h-8 (32px) dá uma proporção 3:2, ótima para bandeiras.
        // 'aspect-[3/2]' ajuda o Tailwind a manter essa proporção se o tamanho mudar.
        "w-12 h-8 aspect-[3/2]", 
        "bg-no-repeat rounded-[3px]",
        // Uma borda sutil ajuda a definir o limite do ícone
        "border border-white/10",
        // Sombra para destacar do fundo do cartão
        "drop-shadow-md",
        className
      )}
      style={{
        // Aponta para o arquivo na pasta public
        backgroundImage: 'url("/sprite-bandeiras.png")',
        backgroundPosition: position,
        // MUDANÇA 2: O PULO DO GATO! 😺
        // Em vez de só '300%', usamos '300% 300%'.
        // Isso força o "mapa gigante" a ter exatamente 3x a largura E 3x a altura
        // do container atual, garantindo que o grid 3x3 se encaixe.
        backgroundSize: '300% 300%', 
      }}
    />
  );
};