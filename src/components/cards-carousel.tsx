
"use client";

import { CreditCardCard } from "@/components/credit-card-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { CreditCard, Transaction } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslation } from "@/contexts/language-context";

interface CardsCarouselProps {
  cards: CreditCard[];
  transactions: Transaction[];
  onAddCard: () => void;
  onEditCard: (card: CreditCard) => void;
}

export function CardsCarousel({ cards, transactions, onAddCard, onEditCard }: CardsCarouselProps) {
    const { t } = useTranslation();
  return (
    <>
      <Carousel
        opts={{
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent>
          {cards.map((card) => (
            <CarouselItem key={card.id} className="md:basis-1/2 lg:basis-1/2">
              <CreditCardCard card={card} allTransactions={transactions} allCards={cards} onEdit={() => onEditCard(card)} />
            </CarouselItem>
          ))}
          <CarouselItem className="md:basis-1/2 lg:basis-1/2">
            <Card className="h-full flex items-center justify-center bg-card/50 border-dashed border-primary/20 hover:border-primary transition-colors">
              <CardContent className="p-6">
                <Button variant="ghost" className="flex flex-col h-auto" onClick={onAddCard}>
                  <Plus className="w-8 h-8 text-primary mb-2" />
                  <span className="text-primary">{t.card.add_new}</span>
                </Button>
              </CardContent>
            </Card>
          </CarouselItem>
        </CarouselContent>
        {cards.length > 1 && (
            <>
                <CarouselPrevious className="hidden lg:flex" />
                <CarouselNext className="hidden lg:flex" />
            </>
        )}
      </Carousel>
    </>
  );
}
