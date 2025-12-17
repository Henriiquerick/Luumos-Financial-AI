
import { Bot, LogOut } from 'lucide-react';
import { useAuth } from '@/firebase';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { UserProfileDialog } from './user-profile-dialog';
import type { UserProfile } from '@/lib/types';
import { Badge } from './ui/badge';
import { PERSONAS } from '@/lib/personas';
import { ModeToggle } from './mode-toggle';
import { LanguageSwitcher } from './language-switcher';
import { useTranslation } from '@/contexts/language-context';

interface HeaderProps {
  userProfile: UserProfile | null;
}

export default function Header({ userProfile }: HeaderProps) {
  const auth = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const handleSignOut = () => {
    if (auth) {
      auth.signOut();
      router.push('/');
    }
  };

  const activePersonality = PERSONAS.find(p => p.id === userProfile?.aiPersonality);

  return (
    <header className="w-full max-w-7xl mx-auto mb-8 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Bot className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tighter">Lucent AI</h1>
      </div>
      <div className="flex items-center gap-2">
        {activePersonality && (
          <Badge variant="secondary" className="border-accent/20 hidden sm:flex items-center gap-2">
            <span>🧠</span>
            <span>{activePersonality.name}</span>
          </Badge>
        )}
        <UserProfileDialog />
        <ModeToggle />
        <LanguageSwitcher />
        <Button variant="ghost" onClick={handleSignOut}>
          <LogOut className="mr-2" />
          {t.header.sign_out}
        </Button>
      </div>
    </header>
  );
}
