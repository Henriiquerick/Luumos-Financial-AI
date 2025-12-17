'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Loader2 } from 'lucide-react';
import { UserProfileForm } from './user-profile-form';
import { useDoc, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { useTranslation } from '@/contexts/language-context';

export function UserProfileDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const { t } = useTranslation();

  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <UserIcon className="h-5 w-5" />
          <span className="sr-only">Edit Profile</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] bg-background border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary">{t.modals.profile.title}</DialogTitle>
          <DialogDescription>
            {t.modals.profile.subtitle}
          </DialogDescription>
        </DialogHeader>
        {isProfileLoading ? (
            <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : userProfile ? (
            <UserProfileForm 
                userProfile={userProfile} 
                onSave={() => setIsOpen(false)} 
            />
        ) : (
            <div className="text-center text-muted-foreground">Could not load user profile.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
