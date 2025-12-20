
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, AlertCircle } from 'lucide-react';
import type { AIPersonality, Transaction } from '@/lib/types';
import { useTranslation } from '@/contexts/language-context';
import { useUser } from '@/firebase';

interface DailyInsightCardProps {
  transactions: Transaction[];
  personality: AIPersonality;
  balance: number;
}

interface CachedInsight {
  date: string;
  insight: string;
}

export function DailyInsightCard({ transactions, personality, balance }: DailyInsightCardProps) {
  const [insight, setInsight] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();
  const { user } = useUser();

  useEffect(() => {
    const fetchInsight = async () => {
      // 1. Guarda de segurança para garantir que o usuário está logado
      if (!user?.uid) {
        setError('User not authenticated.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      const todayStr = new Date().toISOString().split('T')[0];
      const cacheKey = `daily_insight_cache_${user.uid}`;

      try {
        const cachedItem = localStorage.getItem(cacheKey);
        if (cachedItem) {
          const cached: CachedInsight = JSON.parse(cachedItem);
          // O insight agora independe da personalidade, então removemos a verificação
          if (cached.date === todayStr) {
            setInsight(cached.insight);
            setIsLoading(false);
            return;
          }
        }

        // 2. CORREÇÃO: Enviando o userId no corpo da requisição
        const response = await fetch('/api/daily-insight', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.uid }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch daily insight');
        }
        
        if (result.insight) {
          setInsight(result.insight);
          const newCache: CachedInsight = {
            date: todayStr,
            insight: result.insight,
          };
          localStorage.setItem(cacheKey, JSON.stringify(newCache));
        } else {
          throw new Error("Failed to generate insight.");
        }

      } catch (e: any) {
        console.error('Failed to generate daily insight:', e);
        setError(e.message || t.dashboard.insight_error.replace('{personalityName}', personality.name));
      } finally {
        setIsLoading(false);
      }
    };

    // A chamada agora só depende do usuário estar logado
    if (user) {
      fetchInsight();
    } else if (!user) {
        setIsLoading(false);
    }
  }, [user, t, personality.name]); // Removido transactions e balance para evitar re-chamadas desnecessárias

  return (
    <Card className="bg-card/50 border-accent/20 shadow-lg shadow-accent/5 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="text-2xl mt-1">💡</div>
          <div className="flex-grow">
            <h3 className="font-semibold text-accent flex items-center gap-2">
              <Bot className="w-5 h-5" />
              {t.dashboard.daily_insight}
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
