
import { Bot, LogOut, Tags } from 'lucide-react';
import { useAuth } from '@/firebase';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { UserProfileDialog } from './user-profile-dialog';
import type { UserProfile, Subscription } from '@/lib/types';
import { Badge } from './ui/badge';
import { PERSONALITIES } from '@/lib/agent-config';
import { ModeToggle } from './mode-toggle';
import { LanguageSwitcher } from './language-switcher';
import { useTranslation } from '@/contexts/language-context';
import { useState } from 'react';
import { ManageCategoriesDialog } from './manage-categories-dialog';
import { EnergyCreditsDisplay } from './energy-credits-display';
import { useSubscription } from '@/hooks/useSubscription';
import { CurrencySwitcher } from './currency-switcher';

interface HeaderProps {
  userProfile: UserProfile | null;
}

export default function Header({ userProfile }: HeaderProps) {
  const auth = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const { subscription } = useSubscription();

  const handleSignOut = () => {
    if (auth) {
      auth.signOut();
      router.push('/');
    }
  };

  const activePersonality = PERSONALITIES.find(p => p.id === userProfile?.aiPersonality);

  return (
    <>
      <header className="w-full max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tighter">Lucent AI</h1>
        </div>
        <div className="flex items-center gap-2">
          {activePersonality && (
            <Badge variant="secondary" className="border-accent/20 hidden sm:flex items-center gap-2">
              <span>{activePersonality.icon}</span>
              <span>{activePersonality.name}</span>
            </Badge>
          )}
          {userProfile && subscription && (
            <EnergyCreditsDisplay userProfile={userProfile} subscription={subscription} />
          )}
          <Button variant="ghost" size="icon" onClick={() => setIsCategoryDialogOpen(true)}>
            <Tags className="h-5 w-5" />
            <span className="sr-only">Gerenciar Categorias</span>
          </Button>
          <UserProfileDialog />
          <ModeToggle />
          <LanguageSwitcher />
          <CurrencySwitcher />
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2" />
            {t.header.sign_out}
          </Button>
        </div>
      </header>
      <ManageCategoriesDialog isOpen={isCategoryDialogOpen} setIsOpen={setIsCategoryDialogOpen} />
    </>
  );
}
