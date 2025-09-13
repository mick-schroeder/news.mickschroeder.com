import React, { useEffect } from "react";

type AdProps = {
  adClient: string;
  adSlot: string | number;
  adFormat?: string;
};

const Ad: React.FC<AdProps> = ({ adClient, adSlot, adFormat }) => {
  useEffect(() => {
    (window as any).adsbygoogle = (window as any).adsbygoogle || [];
    (window as any).adsbygoogle.push({});
  }, []);

  return (
    <ins
      className="adsbygoogle mb-2"
      style={{ display: "block" }}
      data-ad-client={adClient}
      data-ad-slot={adSlot as any}
      data-ad-format={adFormat}
    ></ins>
  );
};

export default Ad;

