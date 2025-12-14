"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PERSONAS } from '@/lib/personas';
import { cn } from '@/lib/utils';
import type { AIPersonality } from '@/lib/types';
import { Bot } from 'lucide-react';

interface PersonaOnboardingProps {
  onComplete: () => void;
}

export function PersonaOnboarding({ onComplete }: PersonaOnboardingProps) {
  const [selectedPersona, setSelectedPersona] = useState<AIPersonality | null>(null);

  const handleSelect = (persona: AIPersonality) => {
    setSelectedPersona(persona);
  };

  const handleConfirm = () => {
    if (selectedPersona) {
      localStorage.setItem('user_persona_preference', selectedPersona.id);
      onComplete();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center h-full animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <Bot className="w-10 h-10 text-primary" />
        <h1 className="text-4xl font-bold tracking-tighter text-center">Choose Your Financial Partner</h1>
      </div>
      <p className="text-muted-foreground mb-8 text-center">Select the AI personality that will guide you on your financial journey.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
        {PERSONAS.map(persona => (
          <Card
            key={persona.id}
            onClick={() => handleSelect(persona)}
            className={cn(
              "cursor-pointer bg-card/50 border-2 border-transparent transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10",
              selectedPersona?.id === persona.id && "border-primary shadow-2xl shadow-primary/20 scale-105"
            )}
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="text-6xl mb-4">{persona.icon}</div>
              <h2 className="text-xl font-bold mb-2">{persona.name}</h2>
              <p className="text-muted-foreground text-sm italic">"{persona.catchphrase}"</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={handleConfirm} disabled={!selectedPersona} size="lg" className="bg-primary hover:bg-primary/90">
        Confirm &amp; Enter Dashboard
      </Button>
    </div>
  );
}
