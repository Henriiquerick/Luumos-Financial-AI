
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { TransactionForm } from '@/components/transaction-form';
import type { CreditCard, Transaction, CustomCategory } from '@/lib/types';
import { useTranslation } from '@/contexts/language-context';

interface TransactionDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  transactions: Transaction[];
  creditCards: CreditCard[];
  customCategories: CustomCategory[];
  transactionToEdit?: Transaction | null;
  onFinished: () => void;
}

export function TransactionDialog({ 
  isOpen, 
  setIsOpen, 
  transactions, 
  creditCards,
  customCategories,
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
      <DialogContent className="sm:max-w-[480px] bg-background border-primary/20 flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-primary">{transactionToEdit ? t.modals.transaction.edit_title : t.modals.transaction.title}</DialogTitle>
          <DialogDescription>
            {transactionToEdit ? t.modals.transaction.edit_subtitle : t.modals.transaction.subtitle}
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto px-6">
            <TransactionForm 
            onSave={() => {
                setIsOpen(false);
                onFinished();
            }}
            transactions={transactions}
            creditCards={creditCards}
            customCategories={customCategories}
            transactionToEdit={transactionToEdit}
            />
        </div>
      </DialogContent>
    </Dialog>
  );
}
