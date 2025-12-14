"use client";

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { calculateCardBillProjection } from '@/lib/finance-utils';
import type { Transaction } from '@/lib/types';

interface InstallmentTunnelChartProps {
  transactions: Transaction[];
}

export function InstallmentTunnelChart({ transactions }: InstallmentTunnelChartProps) {
  const chartData = useMemo(() => {
    return calculateCardBillProjection(transactions);
  }, [transactions]);
  
  const maxBill = Math.max(...chartData.map(d => d.totalBill), 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background border rounded-lg shadow-lg">
          <p className="label font-bold">{`${label}`}</p>
          <p className="intro text-primary">{`Total Bill: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(payload[0].value)}`}</p>
        </div>
      );
    }
    return null;
  };
  
  const getBarColor = (value: number) => {
    const percentage = maxBill > 0 ? (value / maxBill) * 100 : 0;
    if (percentage > 75) return 'hsl(var(--destructive))';
    if (percentage > 50) return 'hsl(var(--chart-5))';
    if (percentage > 25) return 'hsl(var(--chart-4))';
    return 'hsl(var(--primary))';
  };

  return (
    <Card className="bg-card/50 border-primary/20">
      <CardHeader>
        <CardTitle>Installment Tunnel</CardTitle>
        <CardDescription>Your projected credit card bills for the next 6 months.</CardDescription>
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
            <Bar dataKey="totalBill" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <cell key={`cell-${index}`} fill={getBarColor(entry.totalBill)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
