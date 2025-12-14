
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CardForm } from './card-form';

interface AddCardDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function AddCardDialog({ isOpen, setIsOpen }: AddCardDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] bg-background border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary">Add New Credit Card</DialogTitle>
          <DialogDescription>
            Enter the details for your new card.
          </DialogDescription>
        </DialogHeader>
        <CardForm onSave={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
