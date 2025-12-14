"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  onAddTransaction: () => void;
}

export function BalanceCard({ balance, onAddTransaction }: BalanceCardProps) {
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(balance);

  return (
    <Card className="bg-card/50 border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">Available Balance</CardTitle>
        <Button variant="ghost" size="sm" className="hidden lg:flex" onClick={onAddTransaction}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-primary">{formattedBalance}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {balance >= 0 ? 'Looking good!' : 'You might want to check your spending.'}
        </p>
      </CardContent>
    </Card>
  );
}
