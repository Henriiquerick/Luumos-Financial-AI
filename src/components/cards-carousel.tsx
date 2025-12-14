"use client";

import { CreditCardCard } from "@/components/credit-card-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { CreditCard, Transaction } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useFirestore, useUser, addDocumentNonBlocking } from "@/firebase";
import { collection } from "firebase/firestore";

interface CardsCarouselProps {
  cards: CreditCard[];
  transactions: Transaction[];
}

export function CardsCarousel({ cards, transactions }: CardsCarouselProps) {
  const firestore = useFirestore();
  const { user } = useUser();

  const handleAddCard = () => {
    if (!user) return;
    // This is a placeholder for a proper "Add Card" dialog.
    const newCard: Omit<CreditCard, 'id'> = {
      name: `Card #${cards.length + 1}`,
      totalLimit: 2000,
      color: '#00AEEF',
      closingDay: 5
    };
    const cardsRef = collection(firestore, 'users', user.uid, 'cards');
    addDocumentNonBlocking(cardsRef, newCard);
  };

  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent>
        {cards.map((card) => (
          <CarouselItem key={card.id} className="md:basis-1/2">
            <CreditCardCard card={card} allTransactions={transactions} allCards={cards} />
          </CarouselItem>
        ))}
        <CarouselItem className="md:basis-1/2">
           <Card className="h-full flex items-center justify-center bg-card/50 border-dashed border-primary/20 hover:border-primary transition-colors">
            <CardContent className="p-6">
              <Button variant="ghost" className="flex flex-col h-auto" onClick={handleAddCard}>
                <Plus className="w-8 h-8 text-primary mb-2"/>
                <span className="text-primary">Add New Card</span>
              </Button>
            </CardContent>
          </Card>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious className="hidden lg:flex" />
      <CarouselNext className="hidden lg:flex" />
    </Carousel>
  );
}