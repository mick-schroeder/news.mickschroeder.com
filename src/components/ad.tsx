import React, { useEffect } from 'react';

type AdProps = {
  adClient: string;
  adSlot: string | number;
  adFormat?: string;
};

const Ad: React.FC<AdProps> = ({ adClient, adSlot, adFormat }) => {
  const isProd = process.env.NODE_ENV === 'production';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (_) {
      // Silently ignore if blocked by extensions or script not loaded
    }
  }, []);

  return (
    <ins
      className="adsbygoogle mb-2"
      style={{ display: 'block' }}
      data-ad-client={adClient}
      data-ad-slot={adSlot as any}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
      data-adtest={isProd ? undefined : ('on' as any)}
    ></ins>
  );
};

export default Ad;
