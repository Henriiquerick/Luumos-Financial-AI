"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TransactionForm } from '@/components/transaction-form';
import type { CreditCard, Transaction } from '@/lib/types';
import { useTranslation } from '@/contexts/language-context';

interface TransactionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  transactions: Transaction[];
  creditCards: CreditCard[];
  transactionToEdit?: Transaction | null;
  onFinished: () => void;
}

export function TransactionDialog({ 
  isOpen, 
  setIsOpen, 
  transactions, 
  creditCards, 
  transactionToEdit,
  onFinished,
}: TransactionDialogProps) {
  const { t } = useTranslation();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onFinished();
    }
    setIsOpen(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-background border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary">{transactionToEdit ? 'Edit Transaction' : t.modals.transaction.title}</DialogTitle>
          <DialogDescription>
            {transactionToEdit ? 'Update the details of your transaction.' : t.modals.transaction.subtitle}
          </DialogDescription>
        </DialogHeader>
        <TransactionForm 
          onSave={() => {
            setIsOpen(false);
            onFinished();
          }}
          transactions={transactions}
          creditCards={creditCards}
          transactionToEdit={transactionToEdit}
        />
      </DialogContent>
    </Dialog>
  );
}
