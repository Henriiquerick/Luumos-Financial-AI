"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AIPersonality, AIKnowledgeLevel } from '@/lib/types';
import { Bot, Loader2, UserCircle2 } from 'lucide-react'; // Adicionei UserCircle2
import { KNOWLEDGE_LEVELS, PERSONALITIES } from '@/lib/agent-config';

// Imports do Firebase (Mantendo a correção do loop)
import { initializeFirebase } from '@/firebase'; 
import { doc, setDoc } from 'firebase/firestore';

interface PersonaOnboardingProps {
  onComplete: (persona: AIPersonality, knowledge: AIKnowledgeLevel) => void;
}

export function PersonaOnboarding({ onComplete }: PersonaOnboardingProps) {
  const [step, setStep] = useState(1);
  const [selectedKnowledge, setSelectedKnowledge] = useState<AIKnowledgeLevel | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<AIPersonality | null>(null);
  
  // NOVO ESTADO: Gênero
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);

  const { auth, firestore: db } = initializeFirebase();

  const handleNextStep = () => {
    if (step === 1 && selectedKnowledge) setStep(2);
    else if (step === 2 && selectedPersonality) setStep(3); // Vai para a escolha de gênero
  };

  const handleConfirm = async () => {
    // Validação completa
    if (!selectedKnowledge || !selectedPersonality || !selectedGender) return;

    setIsLoading(true);

    try {
      const user = auth?.currentUser;
      
      if (user && db) {
        const userRef = doc(db, 'users', user.uid);
        
        console.log("💾 Salvando perfil completo...");
        
        await setDoc(userRef, {
          persona: selectedPersonality,
          aiPersonality: selectedPersonality.id, // Correção: salvar o ID
          knowledgeLevel: selectedKnowledge,
          
          // SALVANDO O GÊNERO NO BANCO
          gender: selectedGender, 
          
          onboardingCompleted: true,
          email: user.email,
          updatedAt: new Date(),
          uid: user.uid
        }, { merge: true });

        console.log("✅ Sucesso!");
      }
    } catch (error: any) {
      console.error("❌ ERRO:", error);
      alert(`Erro ao salvar: ${error.message}`);
      setIsLoading(false);
      return; 
    }

    window.location.href = '/dashboard';
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center h-full animate-fade-in py-8 pb-24">
      
      {/* --- PASSO 1: CONHECIMENTO --- */}
      {step === 1 && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <Bot className="w-10 h-10 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-center">Primeiro, defina o seu objetivo:</h1>
          </div>
          <p className="text-muted-foreground mb-8 text-center max-w-2xl">Selecione o nível de suporte que mais se encaixa com seu momento.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
            {KNOWLEDGE_LEVELS.map(level => (
              <Card
                key={level.id}
                onClick={() => setSelectedKnowledge(level)}
                className={cn(
                  "cursor-pointer bg-card/50 border-2 border-transparent transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 flex flex-col",
                  selectedKnowledge?.id === level.id && "border-primary shadow-2xl shadow-primary/20 scale-105"
                )}
              >
                <CardContent className="p-6 flex flex-col items-center text-center flex-grow">
                  <div className="text-5xl mb-4">{level.icon}</div>
                  <h2 className="text-xl font-bold mb-2">{level.name}</h2>
                  <p className="text-muted-foreground text-sm flex-grow">{level.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button onClick={handleNextStep} disabled={!selectedKnowledge} size="lg">Próximo</Button>
        </>
      )}

      {/* --- PASSO 2: PERSONALIDADE --- */}
      {step === 2 && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <Bot className="w-10 h-10 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-center">Escolha seu guia:</h1>
          </div>
          <p className="text-muted-foreground mb-8 text-center">A personalidade define o "tom de voz" do seu assistente. Escolha a que mais combina com você.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8">
            {PERSONALITIES.map(persona => (
              <Card
                key={persona.id}
                onClick={() => setSelectedPersonality(persona)}
                className={cn(
                  "cursor-pointer bg-card/50 border-2 border-transparent transition-all duration-300 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10 flex flex-col",
                  selectedPersonality?.id === persona.id && "border-accent shadow-2xl shadow-accent/20 scale-105"
                )}
              >
                <CardContent className="p-6 flex flex-col text-center flex-grow">
                  <h2 className="text-xl font-bold mb-2">{persona.name}</h2>
                  <p className="text-muted-foreground text-sm mb-4">{persona.style}</p>
                  <div className="bg-muted/50 p-3 rounded-lg flex-grow">
                    <p className="text-sm italic text-foreground/80">"{persona.tagline}"</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex gap-4">
            <Button onClick={() => setStep(1)} variant="outline" size="lg">Voltar</Button>
            <Button onClick={handleNextStep} disabled={!selectedPersonality} size="lg">Próximo</Button>
          </div>
        </>
      )}

      {/* --- PASSO 3: GÊNERO (NOVO) --- */}
      {step === 3 && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <UserCircle2 className="w-10 h-10 text-green-500" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-center">Como devo te chamar?</h1>
          </div>
          <p className="text-muted-foreground mb-8 text-center">Para eu não te chamar de "Gata" se você for um "Monstro". 😂</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-8">
            <Card
              onClick={() => setSelectedGender('male')}
              className={cn(
                "cursor-pointer bg-card/50 border-2 border-transparent transition-all hover:border-green-500/50 hover:shadow-2xl",
                selectedGender === 'male' && "border-green-500 shadow-2xl shadow-green-500/20 scale-105"
              )}
            >
              <CardContent className="p-8 flex flex-col items-center text-center">
                <span className="text-5xl mb-4">👨</span>
                <h2 className="text-2xl font-bold">Ele / Dele</h2>
                <p className="text-muted-foreground">Me trate no masculino.</p>
              </CardContent>
            </Card>

            <Card
              onClick={() => setSelectedGender('female')}
              className={cn(
                "cursor-pointer bg-card/50 border-2 border-transparent transition-all hover:border-green-500/50 hover:shadow-2xl",
                selectedGender === 'female' && "border-green-500 shadow-2xl shadow-green-500/20 scale-105"
              )}
            >
              <CardContent className="p-8 flex flex-col items-center text-center">
                <span className="text-5xl mb-4">👩</span>
                <h2 className="text-2xl font-bold">Ela / Dela</h2>
                <p className="text-muted-foreground">Me trate no feminino.</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex gap-4">
            <Button onClick={() => setStep(2)} variant="outline" size="lg">Voltar</Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedGender || isLoading} 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white min-w-[200px]"
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Finalizar"}
            </Button>
          </div>
        </>
      )}

    </div>
  );
}
