
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Target, Edit, PlusCircle } from 'lucide-react';
import type { FinancialGoal } from '@/lib/types';
import { Progress } from './ui/progress';
import { formatCurrency } from '@/lib/i18n-utils';
import { useTranslation } from '@/contexts/language-context';

interface FinancialGoalsCardProps {
  goals: FinancialGoal[];
  onAddGoal: () => void;
  onEditGoal: (goal: FinancialGoal) => void;
  onAddProgress: (goal: FinancialGoal) => void;
}

export function FinancialGoalsCard({ goals, onAddGoal, onEditGoal, onAddProgress }: FinancialGoalsCardProps) {
  const { language } = useTranslation();

  return (
    <Card className="bg-card/50 border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Target /> Metas Financeiras
          </CardTitle>
          <CardDescription>Acompanhe seu progresso para alcançar seus sonhos.</CardDescription>
        </div>
        <Button size="sm" onClick={onAddGoal}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Meta
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length === 0 && (
          <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
            <p>Você ainda não tem nenhuma meta.</p>
            <Button variant="link" onClick={onAddGoal}>Crie sua primeira meta!</Button>
          </div>
        )}
        {goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <div key={goal.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{goal.icon}</span>
                  <div>
                    <h4 className="font-semibold">{goal.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(language, goal.currentAmount)} de {formatCurrency(language, goal.targetAmount)}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-1'>
                    <Button variant="ghost" size="icon" onClick={() => onAddProgress(goal)}>
                        <PlusCircle className="h-5 w-5 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEditGoal(goal)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                </div>
              </div>
              <Progress value={progress} className="mt-2 h-3" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
