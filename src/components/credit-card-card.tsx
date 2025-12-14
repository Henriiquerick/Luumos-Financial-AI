"use client";

import { useState } from "react";
import type { CreditCard, Transaction } from "@/lib/types";
import { getCardUsage } from "@/lib/finance-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bot, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { useFirestore, useUser } from "@/firebase";
import { collection, doc, writeBatch, getDocs, query, where } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface CreditCardCardProps {
  card: CreditCard;
  allTransactions: Transaction[];
  allCards: CreditCard[];
}

export function CreditCardCard({ card, allTransactions, allCards }: CreditCardCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const usage = getCardUsage(card.id, allTransactions, allCards);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  const handleDeleteCard = async () => {
    if (!user) return;
    try {
      const cardDocRef = doc(firestore, 'users', user.uid, 'cards', card.id);
      
      // Find and delete all transactions associated with this card
      const transactionsRef = collection(firestore, 'users', user.uid, 'transactions');
      const q = query(transactionsRef, where('cardId', '==', card.id));
      const querySnapshot = await getDocs(q);

      const batch = writeBatch(firestore);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      // Delete the card itself
      batch.delete(cardDocRef);

      await batch.commit();

      toast({ title: "Card Deleted", description: `The card "${card.name}" and its transactions have been removed.` });
    } catch (error) {
      console.error("Error deleting card:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not delete the card." });
    }
    setIsDeleteDialogOpen(false);
  };


  return (
    <>
      <Card
        className="border-none text-white relative overflow-hidden group"
        style={{ backgroundColor: card.color }}
      >
        <div className="absolute top-0 left-0 w-full h-full bg-black/20 mix-blend-multiply"></div>

        <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-20 h-8 w-8 text-white/50 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsDeleteDialogOpen(true)}
        >
            <Trash2 className="h-4 w-4" />
        </Button>

        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center justify-between">
            <span>{card.name}</span>
            <Bot className="w-6 h-6 opacity-50" />
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10 space-y-2">
          <div>
            <Progress value={usage.usagePercentage} className="h-2 bg-white/20 [&>div]:bg-white" />
          </div>
          <div className="text-sm font-medium">
            <p>
              {formatCurrency(usage.availableLimit)} available of {formatCurrency(usage.totalLimit)}
            </p>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the card "{card.name}" and all of its associated transactions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCard} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
