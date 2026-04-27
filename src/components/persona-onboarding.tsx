
"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AIPersonality, AIKnowledgeLevel } from '@/lib/types';
import { Bot, Loader2, UserCircle2 } from 'lucide-react';
import { KNOWLEDGE_LEVELS, PERSONALITIES } from '@/lib/agent-config';
import { initializeFirebase } from '@/firebase'; 
import { doc, setDoc } from 'firebase/firestore';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Briefcase, Calendar, MapPin, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PersonaOnboardingProps {
  onComplete: (persona: AIPersonality, knowledge: AIKnowledgeLevel) => void;
}

export function PersonaOnboarding({ onComplete }: PersonaOnboardingProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedKnowledge, setSelectedKnowledge] = useState<AIKnowledgeLevel | null>(null);
  const [selectedPersonality, setSelectedPersonality] = useState<AIPersonality | null>(null);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | 'non-binary' | 'hidden' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [firstName, setFirstName] = useState(''); 
  const [lastName, setLastName] = useState(''); 
  const [birthDate, setBirthDate] = useState(''); 
  const [city, setCity] = useState(''); 
  const [jobTitle, setJobTitle] = useState(''); 
  const [company, setCompany] = useState('');

  const { auth, firestore: db } = initializeFirebase();

  const handleNextStep = () => {
    if (step === 1 && isProfileValid) setStep(2);
    else if (step === 2 && selectedKnowledge) setStep(3);
    else if (step === 3 && selectedPersonality) setStep(4);
  };

  const handleConfirm = async () => {
    if (!selectedKnowledge || !selectedPersonality || !selectedGender) return;
    setIsLoading(true);

    try {
      const user = auth?.currentUser;
      if (user && db) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          firstName,
          lastName,
          birthDate,
          city,
          jobTitle,
          company,
          displayName: `${firstName} ${lastName}`,
          aiPersonality: selectedPersonality.id,
          aiKnowledgeLevel: selectedKnowledge.id,
          gender: selectedGender,
          onboardingCompleted: true,
          hasSeenHelpCenter: false, // Feature Tutorial
          frequentModules: ['balance', 'insight', 'cards', 'goals', 'advisor', 'transactions'], // Hiperpersonalização
          email: user.email,
          updatedAt: new Date(),
          uid: user.uid
        }, { merge: true });
        router.push('/dashboard');
        setTimeout(() => setIsLoading(false), 500); 
      }
    } catch (error: any) {
      console.error("❌ ERRO NO SALVAMENTO:", error);
      alert(`Erro ao salvar perfil: ${error.message}`);
      setIsLoading(false);
    }
  };

  const isProfileValid = firstName.trim() !== '' && lastName.trim() !== '';

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-screen animate-fade-in py-10 px-4">
      
      {step === 1 && (
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <User className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-bold tracking-tighter text-center">Vamos nos conhecer melhor</h1>
          </div>
          <p className="text-muted-foreground mb-8 text-center">Essas informações ajudam a IA a personalizar seus conselhos financeiros.</p>
          <Card className="border-2 border-muted/50">
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nome *</Label><Input placeholder="Seu nome" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Sobrenome *</Label><Input placeholder="Seu sobrenome" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Data de Nascimento</Label><div className="relative"><Calendar className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" /><Input className="pl-9 h-12" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} /></div></div>
                <div className="space-y-2"><Label>Cidade</Label><div className="relative"><MapPin className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" /><Input className="pl-9 h-12" placeholder="Ex: São Paulo" value={city} onChange={e => setCity(e.target.value)} /></div></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Cargo / Profissão</Label><div className="relative"><Briefcase className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" /><Input className="pl-9 h-12" placeholder="Ex: Designer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} /></div></div>
                <div className="space-y-2"><Label>Empresa</Label><Input className="h-12" placeholder="Onde você trabalha?" value={company} onChange={e => setCompany(e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>
          <div className="mt-8">
            <Button onClick={handleNextStep} disabled={!isProfileValid} size="lg" className="w-full md:w-auto min-w-[200px] h-14 text-lg">Continuar</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="w-full">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="w-10 h-10 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-center">Qual o seu objetivo?</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
            {KNOWLEDGE_LEVELS.map(level => (
              <Card key={level.id} onClick={() => setSelectedKnowledge(level)} className={cn("cursor-pointer bg-card/50 border-2 transition-all p-2", selectedKnowledge?.id === level.id ? "border-primary shadow-xl scale-105" : "border-transparent")}>
                <CardContent className="p-4 text-center">
                  <div className="text-5xl mb-3">{level.icon}</div>
                  <h2 className="text-xl font-bold mb-1">{level.name}</h2>
                  <p className="text-muted-foreground text-sm">{level.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <Button onClick={() => setStep(1)} variant="outline" size="lg" className="h-14 flex-1">Voltar</Button>
            <Button onClick={handleNextStep} disabled={!selectedKnowledge} size="lg" className="h-14 flex-1">Próximo</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="w-full">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="w-10 h-10 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-center">Escolha seu guia:</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
            {PERSONALITIES.map(persona => (
              <Card key={persona.id} onClick={() => setSelectedPersonality(persona)} className={cn("cursor-pointer bg-card/50 border-2 transition-all p-2", selectedPersonality?.id === persona.id ? "border-accent shadow-xl scale-105" : "border-transparent")}>
                <CardContent className="p-4 text-center">
                  <h2 className="text-xl font-bold mb-1">{persona.name}</h2>
                  <p className="text-muted-foreground text-xs mb-3">{persona.style}</p>
                  <div className="bg-muted/50 p-2 rounded-lg text-sm italic">"{persona.tagline}"</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <Button onClick={() => setStep(2)} variant="outline" size="lg" className="h-14 flex-1">Voltar</Button>
            <Button onClick={handleNextStep} disabled={!selectedPersonality} size="lg" className="h-14 flex-1">Próximo</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-center gap-3 mb-6">
            <UserCircle2 className="w-10 h-10 text-green-500" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-center">Como devo te tratar?</h1>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 w-full mb-8">
            {[
              { id: 'male', label: 'Ele / Dele', icon: '🧔🏻‍♂️' },
              { id: 'female', label: 'Ela / Dela', icon: '👩🏻' },
              { id: 'non-binary', label: 'Não-binário', icon: '🌈' },
              { id: 'hidden', label: 'Ocultar', icon: '🔒' }
            ].map(g => (
              <Card key={g.id} onClick={() => setSelectedGender(g.id as any)} className={cn("cursor-pointer bg-card/50 border-2 transition-all p-4 text-center", selectedGender === g.id ? "border-green-500 shadow-xl" : "border-transparent")}>
                <span className="text-4xl block mb-2">{g.icon}</span>
                <h2 className="font-bold">{g.label}</h2>
              </Card>
            ))}
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <Button onClick={() => setStep(3)} variant="outline" size="lg" className="h-14 flex-1">Voltar</Button>
            <Button onClick={handleConfirm} disabled={!selectedGender || isLoading} size="lg" className="bg-green-600 hover:bg-green-700 h-14 flex-1">
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Começar Jornada"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
