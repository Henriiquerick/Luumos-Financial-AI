"use client";

import { CreditCardCard } from "@/components/credit-card-card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { CreditCard, Transaction } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CardsCarouselProps {
  cards: CreditCard[];
  transactions: Transaction[];
}

export function CardsCarousel({ cards, transactions }: CardsCarouselProps) {
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
              <Button variant="ghost" className="flex flex-col h-auto">
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
