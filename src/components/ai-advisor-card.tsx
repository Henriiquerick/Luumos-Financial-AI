"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Bot } from 'lucide-react';
import type { AIPersonality, Transaction } from '@/lib/types';
import { AI_PERSONALITIES } from '@/lib/constants';
import { getFinanceAdvice } from '@/ai/flows/get-finance-advice';

interface AiAdvisorCardProps {
  personality: AIPersonality;
  onPersonalityChange: (p: AIPersonality) => void;
  transactions: Transaction[];
}

export function AiAdvisorCard({ personality, onPersonalityChange, transactions }: AiAdvisorCardProps) {
  const [userInput, setUserInput] = useState('');
  const [advice, setAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGetAdvice = async () => {
    if (!userInput) return;
    setIsLoading(true);
    setAdvice('');
    try {
      const fullInput = `Based on my recent transactions (last 10): ${JSON.stringify(transactions.slice(0,10).map(t => ({...t, date: t.date.toISOString().split('T')[0]})))}\n\nMy question is: ${userInput}`;
      const result = await getFinanceAdvice({ userInput: fullInput, aiPersonality: personality });
      setAdvice(result.advice);
    } catch (error) {
      console.error('Failed to get advice:', error);
      setAdvice('Sorry, I was unable to get advice at this time. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card/50 border-accent/20 shadow-lg shadow-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="text-accent" />
          AI Financial Advisor
        </CardTitle>
        <CardDescription>Get personalized advice from your chosen AI finance personality.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Finance Personality</label>
          <Select value={personality} onValueChange={(v) => onPersonalityChange(v as AIPersonality)}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Select a personality" />
            </SelectTrigger>
            <SelectContent>
              {AI_PERSONALITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="user-question" className="text-sm font-medium">Your Question</label>
          <Textarea
            id="user-question"
            placeholder={`Ask ${personality} anything about your finances...`}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button onClick={handleGetAdvice} disabled={isLoading || !userInput} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Get Advice'}
        </Button>
        {advice && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm whitespace-pre-wrap font-code">{advice}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
