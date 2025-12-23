'use client';

import { useEffect } from 'react';

interface AdSenseBannerProps {
  slotId: string;
  className?: string;
}

export function AdSenseBanner({ slotId, className }: AdSenseBannerProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense Banner Error:', err);
    }
  }, [slotId]); // Re-run if slotId changes

  return (
    <div className={`flex justify-center items-center w-full my-4 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
