import React from 'react';
import { cn } from "@/lib/utils"; // Ajuste o import conforme sua estrutura

interface BrandIconProps {
  position: string;
  className?: string;
}

export const BrandIcon = ({ position, className }: BrandIconProps) => {
  return (
    <div
      className={cn(
        // Tamanho padrão do ícone (ajuste se achar pequeno)
        "w-10 h-7", 
        "bg-no-repeat rounded-[2px]",
        // Sombra para destacar do fundo colorido do cartão
        "drop-shadow-md",
        className
      )}
      style={{
        // Aponta para o arquivo que você salvou em public/
        backgroundImage: 'url("/sprite-bandeiras.png")',
        backgroundPosition: position,
        // Como são 3 colunas, o tamanho é 300% para dar o zoom certo
        backgroundSize: '300%', 
      }}
    />
  );
};