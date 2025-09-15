import React, { useEffect, useState } from 'react';
import { Trans } from 'gatsby-plugin-react-i18next';
import { Loader2 } from 'lucide-react';
import { useNextSiteContext } from './next-site-context';

const Redirecter: React.FC = () => {
  const { nextSite, refreshNextSite } = useNextSiteContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    refreshNextSite();
    const retry = setTimeout(() => {
      if (!nextSite) refreshNextSite();
    }, 600);
    setIsLoading(false);
    return () => clearTimeout(retry);
  }, [refreshNextSite]);

  useEffect(() => {
    if (!nextSite) return;
    if (typeof window === 'undefined') return;
    if (nextSite === window.location.href) return;

    setIsLoading(false);
    const t = setTimeout(() => {
      window.location.replace(nextSite);
    }, 150);
    return () => clearTimeout(t);
  }, [nextSite]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="bg-card rounded-lg p-10 shadow-lg border border-border text-center my-16 flex flex-col items-center justify-center ">
          <p className="text-xl font-bold mb-4 text-card-foreground">
            <Trans i18nKey="redirect.heading" />
          </p>
          <div role="status">
            <Loader2 aria-hidden="true" className="w-16 h-16 text-muted-foreground animate-spin" />
            <span className="sr-only">
              <Trans i18nKey="redirect.loading" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="bg-card rounded-lg p-10 shadow-lg border border-border text-center">
        <p className="text-xl font-bold mb-4 text-card-foreground">
          <Trans i18nKey="redirect.heading" />
        </p>
        <p className="text-muted-foreground">
          <Trans i18nKey="redirect.description" />
        </p>
        <p className="text-primary font-medium">{nextSite}</p>
      </div>
    </div>
  );
};

export default Redirecter;
