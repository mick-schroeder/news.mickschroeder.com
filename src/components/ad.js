import React, { useEffect } from "react";

const Ad = ({ adClient, adSlot, adFormat }) => {
  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <ins
      className="adsbygoogle mb-2"
      style={{ display: "block" }}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
    ></ins>
  );
};

export default Ad;
