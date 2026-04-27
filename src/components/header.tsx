
import { Bot, LogOut, Tags, Menu, HelpCircle } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { UserProfileDialog } from './user-profile-dialog';
import type { UserProfile, AIPersonality } from '@/lib/types';
import { Badge } from './ui/badge';
import { ModeToggle } from './mode-toggle';
import { LanguageSwitcher } from './language-switcher';
import { useTranslation } from '@/contexts/language-context';
import { useState } from 'react';
import { ManageCategoriesDialog } from './manage-categories-dialog';
import { EnergyCreditsDisplay } from './energy-credits-display';
import { useSubscription } from '@/hooks/useSubscription';
import { CurrencySwitcher } from './currency-switcher';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { doc, updateDoc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from 'next/link';

interface HeaderProps {
  userProfile: UserProfile | null;
  activePersonality: AIPersonality;
}

export default function Header({ userProfile, activePersonality }: HeaderProps) {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { t } = useTranslation();
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const { subscription } = useSubscription();

  const handleSignOut = async () => {
    if (auth) {
      if (Capacitor.isNativePlatform()) {
        try {
          await FirebaseAuthentication.signOut();
        } catch (error) {
          console.error("Erro ao encerrar sessão nativa:", error);
        }
      }
      await auth.signOut();
      router.push('/');
    }
  };

  const handleHelpClick = async () => {
    if (userProfile && !userProfile.hasSeenHelpCenter) {
      const userRef = doc(firestore, 'users', userProfile.uid);
      await updateDoc(userRef, { hasSeenHelpCenter: true });
    }
  };

  const showHelpPulse = userProfile && !userProfile.hasSeenHelpCenter;

  return (
    <>
      <header className="w-full max-w-7xl mx-auto mb-8 flex justify-between items-center px-2 md:px-0">
        <div className="flex items-center gap-2">
          <Bot className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tighter">FAInance</h1>
        </div>
        
        <AlertDialog>
          {/* --- Itens de Desktop --- */}
          <div className="hidden md:flex items-center gap-3">
            {activePersonality && (
              <Badge variant="secondary" className="border-accent/20 flex items-center gap-2 h-9 px-3">
                <span>{activePersonality.icon}</span>
                <span>{activePersonality.name}</span>
              </Badge>
            )}
            {userProfile && subscription && (
              <EnergyCreditsDisplay userProfile={userProfile} subscription={subscription} />
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsCategoryDialogOpen(true)} className="w-11 h-11">
              <Tags className="h-5 w-5" />
            </Button>
            <Link href="/help" onClick={handleHelpClick}>
              <Button variant="ghost" size="icon" className={cn("w-11 h-11 relative", showHelpPulse && "animate-pulse bg-yellow-400/10 ring-2 ring-yellow-400")}>
                <HelpCircle className={cn("w-5 h-5", showHelpPulse ? "text-yellow-500" : "text-muted-foreground")} />
              </Button>
            </Link>
            <UserProfileDialog />
            <ModeToggle />
            <LanguageSwitcher />
            <CurrencySwitcher />
            <AlertDialogTrigger asChild>
                <Button variant="ghost" className="h-11">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t.header.sign_out}
                </Button>
            </AlertDialogTrigger>
          </div>

          {/* --- Menu de Mobile --- */}
          <div className="md:hidden flex items-center gap-2">
            {userProfile && subscription && (
              <EnergyCreditsDisplay userProfile={userProfile} subscription={subscription} />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-12 h-12">
                      <Menu className="h-6 w-6" />
                  </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1 py-1">
                    <p className="text-sm font-bold leading-none">{userProfile?.firstName || 'Usuário'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {auth?.currentUser?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setIsCategoryDialogOpen(true)} className="h-12">
                  <Tags className="mr-3 h-5 w-5" />
                  <span>Gerenciar Categorias</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild onSelect={handleHelpClick} className="h-12">
                  <Link href="/help" className="flex items-center w-full">
                    <HelpCircle className={cn("mr-3 h-5 w-5", showHelpPulse && "text-yellow-500")} />
                    <span>{t.dashboard.modules.help}</span>
                    {showHelpPulse && <Badge variant="default" className="ml-auto bg-yellow-500 text-[10px] h-4">NOVO</Badge>}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="grid grid-cols-3 gap-1 p-1">
                   <div className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-muted"><ModeToggle /></div>
                   <div className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-muted"><LanguageSwitcher /></div>
                   <div className="flex flex-col items-center justify-center p-2 rounded-md hover:bg-muted"><CurrencySwitcher /></div>
                </div>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="h-12 text-red-500 focus:text-red-500 focus:bg-red-500/10 font-semibold">
                        <LogOut className="mr-3 h-5 w-5" />
                        <span>{t.header.sign_out}</span>
                    </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

           <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso irá desconectar sua conta do aplicativo. Você precisará fazer login novamente para acessar seus dados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="h-12">Não</AlertDialogCancel>
                <AlertDialogAction onClick={handleSignOut} className="h-12">Sim</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </header>
      <ManageCategoriesDialog isOpen={isCategoryDialogOpen} setIsOpen={setIsCategoryDialogOpen} />
    </>
  );
}
