import * as React from 'react';
import { useNextSiteContext } from './next-site-context';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Trans, useTranslation } from 'gatsby-plugin-react-i18next';
import { ExternalLink, RefreshCw } from 'lucide-react';
const WebShufflePlayer: React.FC = () => {
  const { nextSite, nextSiteName, refreshNextSite } = useNextSiteContext();

  const { t } = useTranslation();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.open(nextSite, '_blank');
    refreshNextSite();
  };

  return (
    <div className="flex items-center justify-center px-2 shrink-0">
      <Card
        className="w-[320px] sm:w-[420px] md:w-[520px] lg:w-[640px] bg-background/40 border-border/60 shadow-sm"
      >
        <CardHeader className="p-2 pb-2">
          <div className="grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2">
            <div className="w-9 h-9" aria-hidden="true" />
            <div className="min-w-0 text-center">
              <CardTitle className="text-sm font-bold text-card-foreground text-center">
                {nextSiteName && nextSite ? (
                  <a
                    href={nextSite}
                    target="_blank"
                    rel="noopener"
                    onClick={handleClick}
                    aria-label={String(t('open_site', { name: nextSiteName }))}
                    className="block overflow-hidden hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="block truncate">{nextSiteName}</span>
                    <span className="mt-0.5 inline-flex items-center justify-center gap-2 text-sm font-normal text-primary truncate min-w-0">
                      <span className="truncate">{nextSite}</span>
                      <ExternalLink className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    </span>
                  </a>
                ) : (
                  <span className="text-muted-foreground">
                    <Trans i18nKey="loading" />
                  </span>
                )}
              </CardTitle>
              <CardDescription className="mt-0.5">
                {!nextSite && <div className="h-4 w-48 mx-auto rounded bg-muted animate-pulse" />}
              </CardDescription>
            </div>

            <Button
              onClick={refreshNextSite}
              variant="ghost"
              size="icon"
              aria-label="Shuffle next site"
              className="h-11 w-11"
            >
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default WebShufflePlayer;
