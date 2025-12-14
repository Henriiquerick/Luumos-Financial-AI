'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, AlertCircle } from 'lucide-react';
import { getDailyInsight } from '@/ai/flows/get-daily-insight';
import { generateInsightAnalysis } from '@/lib/finance-utils';
import type { Transaction, AIPersonality } from '@/lib/types';

interface DailyInsightCardProps {
  transactions: Transaction[];
  personality: AIPersonality;
  balance: number;
}

export function DailyInsightCard({ transactions, personality, balance }: DailyInsightCardProps) {
  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoading(true);
      setError('');
      try {
        const analysis = generateInsightAnalysis(transactions, balance);
        const result = await getDailyInsight({
          analysis,
          systemInstruction: personality.systemInstruction,
        });
        setInsight(result.insight);
      } catch (e) {
        console.error('Failed to generate daily insight:', e);
        setError('Could not generate an insight at this moment.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsight();
  }, [transactions, personality, balance]);

  return (
    <Card className="bg-card/50 border-accent/20 shadow-lg shadow-accent/5 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="text-2xl mt-1">{personality.icon}</div>
          <div className="flex-grow">
            <h3 className="font-semibold text-accent flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Daily Insight
            </h3>
            {isLoading ? (
              <div className="space-y-2 mt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : error ? (
              <p className="text-sm text-red-400 mt-1 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            ) : (
              <p className="text-sm text-foreground mt-1 italic">
                "{insight}"
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
