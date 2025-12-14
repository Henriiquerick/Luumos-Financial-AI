"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TransactionForm } from '@/components/transaction-form';
import type { CreditCard, Transaction } from '@/lib/types';

interface TransactionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (transactions: Transaction[]) => void;
  transactions: Transaction[];
  creditCards: CreditCard[];
}

export function TransactionDialog({ isOpen, setIsOpen, onSave, transactions, creditCards }: TransactionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] bg-background border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary">Add Transaction</DialogTitle>
          <DialogDescription>
            Add a new income or expense to your account. AI can help you categorize it.
          </DialogDescription>
        </DialogHeader>
        <TransactionForm 
          onSave={(newTransactions) => {
            onSave(newTransactions);
            setIsOpen(false);
          }}
          transactions={transactions}
          creditCards={creditCards}
        />
      </DialogContent>
    </Dialog>
  );
}
