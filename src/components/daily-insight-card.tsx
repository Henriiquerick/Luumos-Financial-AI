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

interface CachedInsight {
  date: string;
  insight: string;
  personalityId: string;
}

export function DailyInsightCard({ transactions, personality, balance }: DailyInsightCardProps) {
  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoading(true);
      setError('');

      const todayStr = new Date().toISOString().split('T')[0];
      const cacheKey = 'daily_insight_cache';

      try {
        const cachedItem = localStorage.getItem(cacheKey);
        if (cachedItem) {
          const cached: CachedInsight = JSON.parse(cachedItem);
          // Use cache if it's from today and for the same personality
          if (cached.date === todayStr && cached.personalityId === personality.id) {
            setInsight(cached.insight);
            setIsLoading(false);
            return;
          }
        }

        // If no valid cache, fetch from API
        const analysis = generateInsightAnalysis(transactions, balance);
        const result = await getDailyInsight({
          analysis,
          systemInstruction: personality.systemInstruction,
        });

        if(result.insight) {
            setInsight(result.insight);
            // Save to cache
            const newCache: CachedInsight = {
                date: todayStr,
                insight: result.insight,
                personalityId: personality.id,
            };
            localStorage.setItem(cacheKey, JSON.stringify(newCache));
        } else {
             throw new Error("Failed to generate insight.");
        }

      } catch (e) {
        console.error('Failed to generate daily insight:', e);
        setError(`(${personality.name}): O mercado está volátil, mas estou de olho. Tente novamente mais tarde.`);
      } finally {
        setIsLoading(false);
      }
    };

    if (personality && transactions) {
        fetchInsight();
    }
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
