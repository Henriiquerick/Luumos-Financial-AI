
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
  onFinished: (updatedCard?: CreditCard) => void;
}

export function AddCardDialog({ isOpen, setIsOpen, cardToEdit, onFinished }: AddCardDialogProps) {
  const { t } = useTranslation();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onFinished(); // Call onFinished without args when dialog is closed
    }
    setIsOpen(open);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-background border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary">{cardToEdit ? t.modals.card.edit.title : t.modals.card.add.title}</DialogTitle>
          <DialogDescription>
            {cardToEdit ? t.modals.card.edit.subtitle : t.modals.card.add.subtitle}
          </DialogDescription>
        </DialogHeader>
        <CardForm 
          onSave={(updatedCard) => {
            setIsOpen(false);
            onFinished(updatedCard);
          }} 
          cardToEdit={cardToEdit} 
        />
      </DialogContent>
    </Dialog>
  );
}
