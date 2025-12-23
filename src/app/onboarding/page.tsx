'use client';
import { PersonaOnboarding } from '@/components/persona-onboarding';
import { useUserProfile } from '@/hooks/use-user-profile';
import { updateDocumentNonBlocking } from '@/firebase';
import { doc, getFirestore } from 'firebase/firestore';

export default function OnboardingPage() {
  const { user } = useUserProfile(); // Reutilizamos o hook para pegar o usuário
  const db = getFirestore();

  const handleOnboardingComplete = (persona: any, knowledge: any) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      updateDocumentNonBlocking(userRef, {
        aiPersonality: persona.id,
        aiKnowledgeLevel: knowledge.id,
        onboardingCompleted: true,
      });
    }
  };

  return <PersonaOnboarding onComplete={() => {}} />;
}
