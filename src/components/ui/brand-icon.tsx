import React from 'react';
import { cn } from "@/lib/utils"; 

interface BrandIconProps {
  position: string;
  className?: string;
}

export const BrandIcon = ({ position, className }: BrandIconProps) => {
  return (
    <div
      className={cn(
        "w-10 h-7", 
        "bg-no-repeat rounded-[2px]",
        "drop-shadow-md",
        className
      )}
      style={{
        backgroundImage: 'url("/sprite-bandeiras.png")',
        backgroundPosition: position,
        backgroundSize: '300%', 
      }}
    />
  );
};
