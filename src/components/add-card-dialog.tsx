
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CardForm } from './card-form';
import type { CreditCard } from '@/lib/types';
import { useTranslation } from '@/contexts/language-context';

interface AddCardDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  cardToEdit?: CreditCard | null;
  onFinished: () => void;
}

export function AddCardDialog({ isOpen, setIsOpen, cardToEdit, onFinished }: AddCardDialogProps) {
  const { t } = useTranslation();
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] bg-background border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary">{cardToEdit ? t.modals.card.edit.title : t.modals.card.add.title}</DialogTitle>
          <DialogDescription>
            {cardToEdit ? t.modals.card.edit.subtitle : t.modals.card.add.subtitle}
          </DialogDescription>
        </DialogHeader>
        <CardForm 
          onSave={() => {
            setIsOpen(false);
            onFinished();
          }} 
          cardToEdit={cardToEdit} 
        />
      </DialogContent>
    </Dialog>
  );
}
