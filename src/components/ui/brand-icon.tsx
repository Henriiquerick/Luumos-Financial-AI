// src/components/ui/brand-icon.tsx
import React from 'react';
import { cn } from "@/lib/utils";

interface BrandIconProps {
  icon: string; // Agora recebemos a URL direto
  className?: string;
}

export const BrandIcon = ({ icon, className }: BrandIconProps) => {
  return (
    // Usamos 'img' normal para evitar bloqueios de domínio do Next/Image
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={icon} 
      alt="Brand Logo"
      className={cn(
        // Tamanho padrão
        "h-8 w-auto", 
        // Garante que a imagem caiba sem distorcer
        "object-contain",
        // Sombra suave para destacar do fundo colorido do cartão
        "drop-shadow-md",
        className
      )}
    />
  );
};
