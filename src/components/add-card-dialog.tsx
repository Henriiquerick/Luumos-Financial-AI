
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

interface AddCardDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  cardToEdit?: CreditCard | null;
  onFinished: () => void;
}

export function AddCardDialog({ isOpen, setIsOpen, cardToEdit, onFinished }: AddCardDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] bg-background border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary">{cardToEdit ? 'Edit Credit Card' : 'Add New Credit Card'}</DialogTitle>
          <DialogDescription>
            {cardToEdit ? 'Update the details for your card.' : 'Enter the details for your new card.'}
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
