import * as React from 'react';
import { useNextSiteContext } from './context/next-site-context';
import { Button } from './ui/button';
import { Trans, useTranslation } from 'gatsby-plugin-react-i18next';
import { ExternalLink, RefreshCw } from 'lucide-react';
import LocalizedLink from './LocalizedLink';
import { cn } from '@/lib/utils';

type ShufflePlayerProps = {
  className?: string;
};

const ShufflePlayer: React.FC<ShufflePlayerProps> = ({ className }) => {
  const { nextSite, nextSiteId, nextSiteName, refreshNextSite, availableCount } =
    useNextSiteContext();

  const { t } = useTranslation();

  const handleExternalClick = () => {
    if (!nextSite) return;
    refreshNextSite();
  };

  return (
    <div className={cn('flex w-full min-w-0 items-center justify-center', className)}>
      <div className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2">
        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
          <div className="min-w-0 text-center">
            <div className="text-sm font-bold leading-5 text-card-foreground">
              {nextSiteName && nextSite ? (
                <span className="block overflow-hidden">
                  <LocalizedLink
                    to={`/sources/${nextSiteId}/`}
                    className="block truncate hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {nextSiteName}
                  </LocalizedLink>
                  <a
                    href={nextSite}
                    target="_blank"
                    rel="noopener"
                    onClick={handleExternalClick}
                    aria-label={String(t('open_site', { name: nextSiteName }))}
                    className="mt-0.5 inline-flex max-w-full items-center justify-center gap-2 text-sm font-normal text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="truncate">{nextSite}</span>
                    <ExternalLink className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  </a>
                </span>
              ) : (
                <span className="text-muted-foreground">
                  {availableCount ? (
                    <Trans i18nKey="loading" />
                  ) : (
                    <Trans i18nKey="filter_selector.no_sources" defaults="No matching sources" />
                  )}
                </span>
              )}
            </div>
            {!nextSite && availableCount > 0 && (
              <div className="mx-auto mt-1 h-4 w-48 rounded bg-muted animate-pulse" />
            )}
          </div>

          <Button
            onClick={refreshNextSite}
            variant="ghost"
            size="icon"
            disabled={!availableCount}
            aria-label={String(t('shuffle_next'))}
            className="h-10 w-10 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <RefreshCw className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShufflePlayer;
