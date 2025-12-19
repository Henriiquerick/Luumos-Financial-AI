
'use client';

import { useState } from 'react';
import { Gift, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { UserProfile, Subscription } from '@/lib/types';
import { useUser } from '@/firebase';
import { PLAN_LIMITS, ADS_WATCH_LIMITS } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AdSimulatorModal } from './ad-simulator-modal';

interface EnergyCreditsDisplayProps {
  userProfile: UserProfile;
  subscription: Subscription;
}

export function EnergyCreditsDisplay({ userProfile, subscription }: EnergyCreditsDisplayProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);


  const userPlan = subscription?.plan || 'free';
  const dailyCreditsCap = PLAN_LIMITS[userPlan] ?? 0;
  const adWatchLimit = ADS_WATCH_LIMITS[userPlan] ?? 0;
  const maxCap = dailyCreditsCap + adWatchLimit;
  const adsWatched = userProfile.adsWatchedToday ?? 0;

  const canWatchAd = adsWatched < adWatchLimit;

  const handleReward = async (callback: () => void) => {
    if (!user) return;

    setIsAdLoading(true);
    try {
      const response = await fetch('/api/reward-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.code === '403_AD_LIMIT_REACHED'
          ? 'Você já atingiu seu limite de anúncios hoje.'
          : 'Falha ao creditar recompensa.';
        throw new Error(errorMessage);
      }
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5 seconds

      toast({
        title: 'Recompensa Recebida!',
        description: `+1 crédito foi adicionado ao seu saldo. Novo saldo: ${result.newCreditBalance}`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Ops!',
        description: error.message || 'Ocorreu um erro.',
      });
    } finally {
      setIsAdLoading(false);
      callback(); // Close the modal
    }
  };

  return (
    <>
      <TooltipProvider>
        <div className="flex items-center gap-2 border bg-background/50 rounded-full p-1 pl-3 text-sm">
          <span
            className={cn(
              'font-semibold tracking-wider',
              (userProfile.dailyCredits || 0) <= 3 && 'text-red-500 animate-pulse'
            )}
          >
            ⚡ {userProfile.dailyCredits || 0} / {maxCap}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 rounded-full bg-amber-400/20 hover:bg-amber-400/40 border-amber-500/50"
                onClick={() => setIsAdModalOpen(true)}
                disabled={!canWatchAd || isAdLoading}
              >
                {isAdLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Gift className="h-4 w-4 text-amber-500" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {canWatchAd ? (
                <p>Assista um anúncio para ganhar +1 crédito ({adsWatched}/{adWatchLimit})</p>
              ) : (
                <p>Limite diário de anúncios atingido ({adsWatched}/{adWatchLimit})</p>
              )}
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
      <AdSimulatorModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onReward={handleReward}
        isLoading={isAdLoading}
        showConfetti={showConfetti}
      />
    </>
  );
}
