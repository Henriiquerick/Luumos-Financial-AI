'use client';

import { useState } from 'react';
import type { CreditCard, Transaction } from '@/lib/types';
import { getCardUsage } from '@/lib/finance-utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/language-context';
import { useCurrency } from '@/contexts/currency-context';
import Image from 'next/image';
import { getBankTheme } from '@/lib/bank-colors';
import { CARD_BRANDS } from '@/lib/card-brands';
import { BrandIcon } from './ui/brand-icon';

interface CreditCardCardProps {
  card: CreditCard;
  allTransactions: Transaction[];
  allCards: CreditCard[];
  onEdit: () => void;
  onDelete: (cardId: string) => void;
}

export function CreditCardCard({
  card,
  allTransactions,
  allCards,
  onEdit,
  onDelete
}: CreditCardCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { formatMoney } = useCurrency();

  const usage = getCardUsage(card.id, allTransactions, allCards);
  
  const brand = CARD_BRANDS[card.brand as keyof typeof CARD_BRANDS];
  const theme = getBankTheme(card.issuer);


  const handleDeleteConfirm = () => {
    onDelete(card.id);
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

  const formattedAvailable = formatMoney(usage.availableLimit);
  const formattedTotal = formatMoney(usage.totalLimit);

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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-20 pointer-events-none z-0 flex items-center justify-center">
            <BrandIcon icon={brand?.icon} className="w-full h-full object-contain" />
        </div>
        
        <div 
          className="absolute inset-0 bg-black/30 opacity-20 group-hover:opacity-10 transition-opacity duration-300 z-0"
        ></div>

        <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
                <CardHeader className="p-4">
                    <CardTitle className="font-semibold text-lg tracking-wide">{card.name}</CardTitle>
                    <CardDescription className="text-white/70">
                        <span className="text-xs font-mono opacity-70 tracking-wider">{t.card.valid_thru} </span>
                        <span className="text-sm font-semibold">{card.expiryDate}</span>
                    </CardDescription>
                </CardHeader>

                <div className="p-4 flex items-start gap-2">
                     {brand && (
                        <Image 
                            src={brand.icon}
                            alt={brand.name}
                            width={48}
                            height={32}
                            className="h-8 w-12 object-contain drop-shadow-md"
                        />
                    )}
                    <div
                      className="z-50"
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
                          "p-2 rounded-full transition-colors cursor-pointer text-white/80 bg-black/20 hover:bg-black/40 shadow-sm"
                        )}
                      >
                        <MoreVertical className="w-5 h-5" />
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
                </div>
            </div>

            <CardContent className="p-4 pt-0 space-y-2">
              <div>
                <Progress
                  value={usage.usagePercentage}
                  className={cn('h-3', theme.text === '#FFFFFF' ? 'bg-white/20' : 'bg-black/20')}
                  indicatorClassName={cn(theme.text === '#FFFFFF' ? 'bg-white' : 'bg-black')}
                />
              </div>
              <div className="text-sm font-medium opacity-90">
                <p>
                  {t.card.limit_info.replace('{available}', formattedAvailable).replace('{total}', formattedTotal)}
                </p>
              </div>
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
              onClick={handleDeleteConfirm}
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
