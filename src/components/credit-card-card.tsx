"use client";

import type { CreditCard, Transaction } from "@/lib/types";
import { getCardUsage } from "@/lib/finance-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bot } from "lucide-react";

interface CreditCardCardProps {
  card: CreditCard;
  allTransactions: Transaction[];
  allCards: CreditCard[];
}

export function CreditCardCard({ card, allTransactions, allCards }: CreditCardCardProps) {
  const usage = getCardUsage(card.id, allTransactions, allCards);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return (
    <Card
      className="border-none text-white relative overflow-hidden"
      style={{ backgroundColor: card.color }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-black/20 mix-blend-multiply"></div>
      <CardHeader className="relative z-10">
        <CardTitle className="flex items-center justify-between">
          <span>{card.name}</span>
          <Bot className="w-6 h-6 opacity-50"/>
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
  );
}
