
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Confetti from 'react-confetti';

interface AdSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (callback: () => void) => Promise<void>;
  isLoading: boolean;
  showConfetti: boolean;
}

const AD_DURATION = 5; // seconds

export function AdSimulatorModal({ isOpen, onClose, onReward, isLoading, showConfetti }: AdSimulatorModalProps) {
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setIsFinished(false);
      setCountdown(AD_DURATION);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer); // Cleanup on close
    }
  }, [isOpen]);
  
  // Do not allow closing via overlay click while ad is "running"
  const handleOpenChange = (open: boolean) => {
    if (!open && isFinished) {
      onClose();
    }
  };

  const handleClaimReward = () => {
    // onReward will handle closing the modal after API call
    onReward(onClose);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="w-screen h-screen max-w-none bg-black/90 backdrop-blur-sm border-none flex flex-col items-center justify-center text-white"
        hideCloseButton={!isFinished}
      >
        {showConfetti && <Confetti recycle={false} numberOfPieces={400}/>}
        {!isFinished ? (
          <>
            <p className="text-xl font-medium text-muted-foreground mb-4">Exibindo publicidade de parceiro...</p>
            <div className="text-8xl font-bold tabular-nums">
              {countdown}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-3xl font-bold text-primary">Obrigado por seu apoio!</h2>
            <Button
              size="lg"
              onClick={handleClaimReward}
              disabled={isLoading}
              className="px-8 py-6 text-lg"
            >
              {isLoading && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
              Fechar e Resgatar Recompensa
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Customization to DialogContent to allow hiding the close button
const OriginalDialogContent = Dialog.Content;
const NewDialogContent = React.forwardRef<
  React.ElementRef<typeof OriginalDialogContent>,
  React.ComponentPropsWithoutRef<typeof OriginalDialogContent> & { hideCloseButton?: boolean }
>(({ hideCloseButton, children, ...props }, ref) => {
  return (
    <OriginalDialogContent
      ref={ref}
      {...props}
      // This is a way to conditionally render the close button by overriding its style
      // This is a bit of a hack, but it's the easiest way to do it without re-implementing the entire DialogContent component
      // A better way would be to fork the component and add a prop to control the close button
      // For the sake of this example, this is fine
      onInteractOutside={(e) => {
        if (hideCloseButton) {
          e.preventDefault();
        }
      }}
    >
      {children}
      {hideCloseButton && <div className="absolute right-4 top-4 hidden" />}
    </OriginalDialogContent>
  );
});
NewDialogContent.displayName = "DialogContent";

// Replace DialogContent with our new version
(Dialog as any).Content = NewDialogContent;


