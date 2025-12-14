"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface ProjectedBalanceTimelineProps {
  data: { month: Date; balance: number }[];
}

export function ProjectedBalanceTimeline({ data }: ProjectedBalanceTimelineProps) {
  return (
    <Card className="bg-card/50 border-primary/20">
      <CardHeader>
        <CardTitle>Projected Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto space-x-4 pb-4">
          {data.map(({ month, balance }) => (
            <div key={month.toString()} className="min-w-[150px] flex-shrink-0">
              <div className="p-4 rounded-lg bg-muted/50 border border-border transition-all duration-300 hover:border-accent hover:shadow-md hover:shadow-accent/10">
                <p className="text-sm font-medium text-muted-foreground">{format(month, 'MMMM yyyy')}</p>
                <p className={`mt-1 text-xl font-bold ${balance >= 0 ? 'text-foreground' : 'text-red-400'}`}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(balance)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
