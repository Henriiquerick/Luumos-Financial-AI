
"use client";

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { calculateCardBillProjection } from '@/lib/finance-utils';
import type { Transaction, CreditCard } from '@/lib/types';
import { useTranslation } from '@/contexts/language-context';

interface InstallmentTunnelChartProps {
  transactions: Transaction[];
  cards: CreditCard[];
}

export function InstallmentTunnelChart({ transactions, cards }: InstallmentTunnelChartProps) {
  const { t } = useTranslation();
  const chartData = useMemo(() => {
    return calculateCardBillProjection(transactions, cards);
  }, [transactions, cards]);

  const cardColors: { [key: string]: string } = {
    'Nubank': '#820AD1',
    'Mercado Pago': '#009EE3',
  };
  const defaultColor = '#22c55e';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="p-2 bg-background border rounded-lg shadow-lg">
          <p className="label font-bold">{`${label}`}</p>
          {payload.map((entry: any) => (
             <p key={entry.name} style={{ color: entry.color }}>
                {`${entry.name}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(entry.value)}`}
            </p>
          ))}
           <p className="mt-2 font-bold border-t border-border pt-1">
            Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card/50 border-primary/20">
      <CardHeader>
        <CardTitle>{t.dashboard.installment_tunnel}</CardTitle>
        <CardDescription>{t.dashboard.installment_subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              cursor={{ fill: 'hsla(var(--muted), 0.5)' }}
              content={<CustomTooltip />}
            />
            <Legend formatter={(value) => <span className="text-muted-foreground">{value}</span>} />
            {cards.map((card) => (
              <Bar 
                key={card.id} 
                dataKey={card.name} 
                stackId="a" 
                fill={cardColors[card.name] || card.color || defaultColor} 
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
