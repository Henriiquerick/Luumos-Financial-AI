"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AIPersonality, AIKnowledgeLevel } from '@/lib/types';
import { Bot, Loader2 } from 'lucide-react';
import { KNOWLEDGE_LEVELS, PERSONALITIES } from '@/lib/agent-config';
import { initializeFirebase } from '@/firebase'; 
import { doc, setDoc } from 'firebase/firestore';

interface PersonaOnboardingProps {
  onComplete: (persona: AIPersonality, knowledge: AIKnowledgeLevel) => void;
}

export function PersonaOnboarding({ onComplete }: PersonaOnboardingProps) {
  const [step, setStep] = useState(1);
  const [selectedKnowledge, setSelectedKnowledge] = useState<AIKnowledgeLevel | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<AIPersonality | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Inicializa a conexão com o Firebase
  const { auth, firestore: db } = initializeFirebase();

  const handleNextStep = () => {
    if (selectedKnowledge) {
      setStep(2);
    }
  };

  const handleConfirm = async () => {
    if (!selectedKnowledge || !selectedPersonality) return;
    setIsLoading(true);

    try {
      const user = auth?.currentUser;
      
      if (user && db) {
        const userRef = doc(db, 'users', user.uid);
        
        console.log("💾 Salvando dados no Firestore (Produção)...");
        
        // PADRONIZAÇÃO DOS CAMPOS
        await setDoc(userRef, {
          // Salva com o nome que o Dashboard procura
          aiPersonality: selectedPersonality.id, 
          aiKnowledgeLevel: selectedKnowledge.id,
          onboardingCompleted: true, // A flag principal
          email: user.email,
          updatedAt: new Date(),
          uid: user.uid
        }, { merge: true });

        console.log("✅ Sucesso! Redirecionando...");
      } else {
        throw new Error("Usuário ou banco de dados não está disponível.");
      }
    } catch (error: any) {
      console.error("❌ ERRO AO SALVAR NO ONBOARDING:", error);
      alert(`Erro de conexão ao salvar seu perfil: ${error.message}.`);
      setIsLoading(false); // Para o loading para você tentar de novo
      return; // NÃO REDIRECIONA se der erro
    }

    // Se chegou aqui, deu certo.
    window.location.href = '/dashboard';
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center h-full animate-fade-in py-8 pb-24">
      {step === 1 && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <Bot className="w-10 h-10 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-center">Primeiro, defina o seu objetivo atual:</h1>
          </div>
          <p className="text-muted-foreground mb-8 text-center max-w-2xl">Selecione o nível de suporte que mais se encaixa com seu momento financeiro. Isso define o que a IA vai te ensinar.</p>
          
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
                  <div className="text-6xl mb-4">
                    {level.icon}
                  </div>
                  <h2 className="text-xl font-bold mb-2">{level.name}</h2>
                  <p className="text-muted-foreground text-sm flex-grow">{level.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={handleNextStep} disabled={!selectedKnowledge} size="lg">
            Próximo
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <Bot className="w-10 h-10 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-center">Agora, escolha quem vai te guiar:</h1>
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
            <Button onClick={() => setStep(1)} variant="outline" size="lg">
              Voltar
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedPersonality || isLoading} 
              size="lg" 
              className="bg-accent hover:bg-accent/90 min-w-[200px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Começar Minha Jornada"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
