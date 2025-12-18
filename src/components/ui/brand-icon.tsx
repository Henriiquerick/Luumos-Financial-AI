// src/components/ui/brand-icon.tsx
import React from 'react';
import { cn } from "@/lib/utils";

interface BrandIconProps {
  icon: string;
  className?: string;
}

export const BrandIcon = ({ icon, className }: BrandIconProps) => {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={icon}
      alt="Brand Logo"
      className={cn(
        // "object-contain" garante que a imagem nunca fique esticada ou cortada
        "object-contain",
        // Tamanho padrão (pode ser sobrescrito pelo pai)
        "h-8 w-auto", 
        // Sombra leve para garantir leitura em fundos da mesma cor
        "drop-shadow-md",
        className
      )}
      loading="lazy"
    />
  );
};