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
      alt="Bandeira"
      className={cn(
        "object-contain drop-shadow-sm", // Sombra leve só pra destacar
        className
      )}
      loading="lazy"
      onError={(e) => {
        // Fallback ninja: Se a imagem quebrar, esconde ela pra não mostrar o ícone de erro feio
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};
