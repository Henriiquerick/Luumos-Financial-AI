
import { Bot, LogOut, Tags, Menu } from 'lucide-react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

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

        {/* --- Itens de Desktop --- */}
        <div className="hidden md:flex items-center gap-2">
          {activePersonality && (
            <Badge variant="secondary" className="border-accent/20 flex items-center gap-2">
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

        {/* --- Menu de Mobile --- */}
        <div className="md:hidden flex items-center gap-2">
          {userProfile && subscription && (
            <EnergyCreditsDisplay userProfile={userProfile} subscription={subscription} />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Abrir menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userProfile?.firstName || 'Usuário'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {auth?.currentUser?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setIsCategoryDialogOpen(true)}>
                <Tags className="mr-2" />
                <span>Gerenciar Categorias</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                 <div className="flex items-center justify-between w-full">
                    <span>Tema</span>
                    <ModeToggle />
                 </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                 <div className="flex items-center justify-between w-full">
                    <span>Idioma</span>
                    <LanguageSwitcher />
                 </div>
              </DropdownMenuItem>
               <DropdownMenuItem>
                 <div className="flex items-center justify-between w-full">
                    <span>Moeda</span>
                    <CurrencySwitcher />
                 </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleSignOut} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                <LogOut className="mr-2" />
                <span>{t.header.sign_out}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <ManageCategoriesDialog isOpen={isCategoryDialogOpen} setIsOpen={setIsCategoryDialogOpen} />
    </>
  );
}
