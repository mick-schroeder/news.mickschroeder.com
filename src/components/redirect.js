import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useNextSiteContext } from "./next-site-context";
import { useI18next, Trans, useTranslation } from "gatsby-plugin-react-i18next";

const Redirecter = () => {
  const { nextSite, nextSiteName, refreshNextSite, availableCount } = useNextSiteContext();
  const { language } = useI18next();
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    // Seed using the current locale path (en-US/ga/en-IE)
    refreshNextSite(language);
    const retry = setTimeout(() => {
      if (!nextSite) refreshNextSite(language);
    }, 600);
    return () => clearTimeout(retry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    if (!nextSite) return;
    if (typeof window === "undefined") return;
    if (nextSite === window.location.href) return;

    setIsLoading(true);
    const t = setTimeout(() => {
      window.location.replace(nextSite);
    }, 150);
    return () => clearTimeout(t);
  }, [nextSite]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="bg-card rounded-lg p-8 shadow-md my-16 flex flex-col items-center justify-center ">
          <p className="text-xl font-bold mb-4 text-card-foreground">
            <Trans i18nKey="redirect.heading" />
          </p>
          <div role="status">
            <Loader2 aria-hidden="true" className="w-16 h-16 text-muted-foreground animate-spin" />
            <span className="sr-only"><Trans i18nKey="redirect.loading" /></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="bg-card rounded-lg p-8 shadow-md">
        <p className="text-xl font-bold mb-4 text-card-foreground">
          <Trans i18nKey="redirect.heading" />
        </p>
        <p className="text-muted-foreground">
          <Trans i18nKey="redirect.description" />
        </p>
        <p className="text-primary font-medium">
          {nextSite}
        </p>
      </div>
    </div>
  );
};

export default Redirecter;
