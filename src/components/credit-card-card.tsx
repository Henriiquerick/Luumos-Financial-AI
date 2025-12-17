
'use client';

import { useState } from 'react';
import type { CreditCard, Transaction } from '@/lib/types';
import { getCardUsage } from '@/lib/finance-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Landmark, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { useFirestore, useUser } from '@/firebase';
import {
  collection,
  doc,
  writeBatch,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CreditCardCardProps {
  card: CreditCard;
  allTransactions: Transaction[];
  allCards: CreditCard[];
  onEdit: () => void;
}

export function CreditCardCard({
  card,
  allTransactions,
  allCards,
  onEdit
}: CreditCardCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const usage = getCardUsage(card.id, allTransactions, allCards);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

  const handleDeleteCard = async () => {
    if (!user) return;
    try {
      const cardDocRef = doc(firestore, 'users', user.uid, 'cards', card.id);

      const transactionsRef = collection(
        firestore,
        'users',
        user.uid,
        'transactions'
      );
      const q = query(transactionsRef, where('cardId', '==', card.id));
      const querySnapshot = await getDocs(q);

      const batch = writeBatch(firestore);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      batch.delete(cardDocRef);

      await batch.commit();

      toast({
        title: 'Card Deleted',
        description: `The card "${card.name}" and its transactions have been removed.`,
      });
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete the card.',
      });
    }
    setIsDeleteDialogOpen(false);
    setIsMenuOpen(false);
  };
  
  const handleSelectDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
    setIsMenuOpen(false);
  };

  const handleSelectEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
    setIsMenuOpen(false);
  };

  return (
    <>
      <Card
        className="bg-card/50 backdrop-blur-sm text-white relative overflow-hidden group border-white/10"
        onClick={() => isMenuOpen && setIsMenuOpen(false)}
      >
        <div 
            className="absolute inset-0 opacity-20"
            style={{ backgroundColor: card.color }}
        ></div>
        <div className="absolute inset-0 bg-black/30"></div>
        
        <div
          className="absolute top-2 right-2 z-20"
          style={{ pointerEvents: 'auto' }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <MoreVertical className="w-5 h-5 text-white opacity-60 hover:opacity-100 transition-opacity" />
          </button>

          {isMenuOpen && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-sm border border-gray-800 rounded-lg shadow-xl z-30 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="p-1">
                <li>
                  <button onClick={handleSelectEdit} className="flex items-center w-full text-left px-3 py-2 text-sm text-white rounded-md hover:bg-gray-700/50 focus:outline-none focus:bg-gray-700/50">
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>Edit Card</span>
                  </button>
                </li>
                <li>
                   <button onClick={handleSelectDelete} className="flex items-center w-full text-left px-3 py-2 text-sm text-red-400 rounded-md hover:bg-red-900/50 focus:outline-none focus:bg-red-900/50">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Card</span>
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center justify-between">
            <span>{card.name}</span>
            <Landmark className="w-6 h-6 opacity-50" />
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 space-y-2">
          <div>
            <Progress
              value={usage.usagePercentage}
              className="h-2 bg-white/20"
              indicatorClassName="bg-white"
            />
          </div>
          <div className="text-sm font-medium">
            <p>
              {formatCurrency(usage.availableLimit)} available of{' '}
              {formatCurrency(usage.totalLimit)}
            </p>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the card "{card.name}" and all of its
              associated transactions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCard}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
