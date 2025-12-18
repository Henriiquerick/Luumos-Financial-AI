// src/components/ui/brand-icon.tsx
import React from 'react';
import { cn } from "@/lib/utils";

interface BrandIconProps {
  icon: string; // Pode ser coordenada ("0% 0%") OU URL ("https://...")
  className?: string;
}

export const BrandIcon = ({ icon, className }: BrandIconProps) => {
  // Truque do Nerd: Se tem "%", é coordenada do Sprite. Se não, é URL.
  const isSprite = icon.includes('%');

  if (isSprite) {
    return (
      <div
        className={cn(
          "w-10 h-7 shadow-sm rounded-sm bg-no-repeat", // Tamanho padrão
          "bg-white/90", // Um fundinho branco ajuda se o logo for transparente no sprite
          className
        )}
        style={{
          backgroundImage: 'url("/sprite-bandeiras.png")',
          backgroundPosition: icon,
          backgroundSize: '500% 200%', // 5 colunas, 2 linhas = Zoom Exato
        }}
      />
    );
  }

  // Se não é sprite, renderiza a imagem da URL
  return (
    <img
      src={icon}
      alt="Bandeira"
      className={cn(
        "w-10 h-7 object-contain drop-shadow-md",
        className
      )}
    />
  );
};
