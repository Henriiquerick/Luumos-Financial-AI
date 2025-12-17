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
}

export function TransactionDialog({ isOpen, setIsOpen, transactions, creditCards }: TransactionDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] bg-background border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary">{t.modals.transaction.title}</DialogTitle>
          <DialogDescription>
            {t.modals.transaction.subtitle}
          </DialogDescription>
        </DialogHeader>
        <TransactionForm 
          onSave={() => {
            setIsOpen(false);
          }}
          transactions={transactions}
          creditCards={creditCards}
        />
      </DialogContent>
    </Dialog>
  );
}
