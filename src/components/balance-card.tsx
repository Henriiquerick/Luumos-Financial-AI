
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useTranslation } from '@/contexts/language-context';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/currency-context';

interface BalanceCardProps {
  netBalance: number;
  cashBalance: number;
  onAddTransaction: () => void;
}

export function BalanceCard({ netBalance, cashBalance, onAddTransaction }: BalanceCardProps) {
  const { t } = useTranslation();
  const { formatMoney } = useCurrency();
  
  const formattedNetBalance = formatMoney(netBalance);
  const formattedCashBalance = formatMoney(cashBalance);
  const isNegative = netBalance < 0;

  return (
    <Card className="bg-card/50 border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">{t.dashboard.real_available}</CardTitle>
        <Button variant="ghost" size="sm" className="hidden lg:flex" onClick={onAddTransaction}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t.dashboard.add_transaction}
        </Button>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-4xl font-bold",
          isNegative ? "text-red-400" : "text-primary"
        )}>
          {formattedNetBalance}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t.dashboard.in_account} {formattedCashBalance}
        </p>
      </CardContent>
    </Card>
  );
}
