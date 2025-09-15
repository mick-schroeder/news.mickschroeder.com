import type { GatsbySSR } from "gatsby";
import React from "react";

/**
 * 1) Set Google Consent Mode defaults as early as possible.
 *    We deny analytics/ads by default (GDPR-safe) and grant only essential storage.
 */
export const onRenderBody: GatsbySSR["onRenderBody"] = ({ setHeadComponents }) => {
  setHeadComponents([
    React.createElement('script', {
      key: 'consent-defaults',
      // IMPORTANT: runs before any gtag code initializes
      dangerouslySetInnerHTML: {
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}

          // Consent Mode defaults (deny non-essential)
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            functionality_storage: 'granted',
            security_storage: 'granted'
          });
        `,
      },
    }),
  ]);
};

/**
 * 2) Make sure our consent-defaults script is the FIRST <head> item.
 *    This helps ensure it runs before scripts injected by other plugins.
 */
export const onPreRenderHTML: GatsbySSR["onPreRenderHTML"] = ({
  getHeadComponents,
  replaceHeadComponents,
}) => {
  const head = getHeadComponents();
  head.sort((a: any, b: any) => {
    const ak = a?.key ?? "";
    const bk = b?.key ?? "";
    if (ak === "consent-defaults") return -1;
    if (bk === "consent-defaults") return 1;
    return 0;
  });
  replaceHeadComponents(head);
};