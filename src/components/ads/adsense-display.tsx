'use client';

import { useEffect } from 'react';

interface AdSenseDisplayProps {
  slotId: string;
  clientId: string;
  className?: string;
}

export function AdSenseDisplay({ slotId, clientId, className }: AdSenseDisplayProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense push error:', err);
    }
  }, []);

  return (
    <div className="flex justify-center items-center w-full min-h-[250px] bg-muted/30 rounded-lg">
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '300px', height: '250px' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
      ></ins>
    </div>
  );
}
