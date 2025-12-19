
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { GoalForm } from './goal-form';
import type { FinancialGoal } from '@/lib/types';

interface GoalDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  goalToEdit?: FinancialGoal | null;
  onFinished: () => void;
}

export function GoalDialog({ isOpen, setIsOpen, goalToEdit, onFinished }: GoalDialogProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onFinished();
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{goalToEdit ? 'Editar Meta' : 'Criar Nova Meta'}</DialogTitle>
          <DialogDescription>
            {goalToEdit ? 'Ajuste os detalhes da sua meta.' : 'Defina um objetivo financeiro para acompanhar.'}
          </DialogDescription>
        </DialogHeader>
        <GoalForm onSave={() => {
            setIsOpen(false);
            onFinished();
        }} goalToEdit={goalToEdit} />
      </DialogContent>
    </Dialog>
  );
}
