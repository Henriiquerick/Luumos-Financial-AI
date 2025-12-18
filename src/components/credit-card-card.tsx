
'use client';

import { useState } from 'react';
import type { CreditCard, Transaction } from '@/lib/types';
import { getCardUsage } from '@/lib/finance-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
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
import { useTranslation } from '@/contexts/language-context';
import { formatCurrency } from '@/lib/i18n-utils';
import { getBrand, getIssuer } from '@/lib/card-data';
import { BrandIcon } from './ui/brand-icon';

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
  const { t, language } = useTranslation();

  const usage = getCardUsage(card.id, allTransactions, allCards);
  
  const brandData = getBrand(card.brand);
  const issuerData = getIssuer(card.issuer);

  const theme = {
    bg: card.color || '#242424',
    text: '#FFFFFF', // Assuming dark backgrounds always use white text
  };


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
        title: t.toasts.card.deleted.title,
        description: t.toasts.card.deleted.description.replace('{cardName}', card.name),
      });
    } catch (error) {
      console.error('Error deleting card:', error);
      toast({
        variant: 'destructive',
        title: t.toasts.error.title,
        description: t.toasts.error.description,
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

  const formattedAvailable = formatCurrency(language, usage.availableLimit);
  const formattedTotal = formatCurrency(language, usage.totalLimit);
  const formattedSpent = formatCurrency(language, usage.spent);

  return (
    <>
      <Card
        className="bg-card/50 backdrop-blur-sm relative overflow-hidden group border-white/10 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20 min-h-[190px] flex flex-col justify-between"
        style={{
          backgroundColor: theme.bg,
          color: theme.text,
        }}
        onClick={() => isMenuOpen && setIsMenuOpen(false)}
      >
        {issuerData?.icon && (
            <img 
                src={issuerData.icon} 
                alt="" 
                className="absolute -bottom-10 -right-10 w-56 h-56 object-contain opacity-[0.07] rotate-12 brightness-0 invert pointer-events-none z-0" 
            />
        )}
        <div 
          className="absolute inset-0 bg-black/30 opacity-20 group-hover:opacity-10 transition-opacity duration-300"
        ></div>

        <div className="relative z-10">
            {issuerData?.icon && (
              <div className="absolute top-4 left-4 h-8 w-12">
                <BrandIcon 
                  icon={issuerData.icon} 
                  className="h-full w-full object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] brightness-0 invert opacity-70"
                />
              </div>
            )}

            {brandData?.icon && (
                <div className="absolute top-4 right-4 h-8 w-12">
                    <BrandIcon icon={brandData.icon} className="h-full w-full" />
                </div>
            )}
            
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
                className={cn(
                  "p-2 rounded-full transition-colors cursor-pointer",
                  theme.text === '#FFFFFF' ? 'hover:bg-white/10 text-white' : 'hover:bg-black/10 text-black'
                )}
              >
                <MoreVertical className="w-5 h-5 opacity-60 hover:opacity-100 transition-opacity" />
              </button>

              {isMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-background/80 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl z-30 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ul className="p-1">
                    <li>
                      <button onClick={handleSelectEdit} className="flex items-center w-full text-left px-3 py-2 text-sm text-foreground rounded-md hover:bg-muted/50 focus:outline-none focus:bg-muted/50">
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>{t.card.menu.edit}</span>
                      </button>
                    </li>
                    <li>
                       <button onClick={handleSelectDelete} className="flex items-center w-full text-left px-3 py-2 text-sm text-red-400 rounded-md hover:bg-red-900/50 focus:outline-none focus:bg-red-900/50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>{t.card.menu.delete}</span>
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <CardHeader>
              <CardTitle className="flex items-start justify-between">
                <span>{card.name}</span>
                 {card.expiryDate && (
                    <div className="text-right">
                        <span className="text-xs font-mono opacity-70 tracking-wider">VALID THRU</span>
                        <p className="text-sm font-semibold">{card.expiryDate}</p>
                    </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {card.type === 'credit' ? (
                <>
                  <div>
                    <Progress
                      value={usage.usagePercentage}
                      className={cn('h-4', theme.text === '#FFFFFF' ? 'bg-white/20' : 'bg-black/20')}
                      indicatorClassName={cn(theme.text === '#FFFFFF' ? 'bg-white' : 'bg-black')}
                    />
                  </div>
                  <div className="text-sm font-medium">
                    <p>
                      {t.card.limit_info.replace('{available}', formattedAvailable).replace('{total}', formattedTotal)}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Spacer to align content when there is no progress bar */}
                  <div className='h-4'></div>
                  {card.type === 'voucher' && (
                      <div className="text-sm font-medium">
                         <p>Saldo: {formattedAvailable}</p>
                      </div>
                  )}
                   {card.type === 'debit' && (
                      <div className="text-sm font-medium">
                         <p>Gasto no mês: {formattedSpent}</p>
                         <p className='text-xs opacity-70'>{getIssuer(card.issuer)?.label}</p>
                      </div>
                   )}
                </>
              )}
            </CardContent>
        </div>
      </Card>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.modals.delete_card.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.modals.delete_card.description.replace('{cardName}', card.name)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.modals.delete_card.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCard}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t.modals.delete_card.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
