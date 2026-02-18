import React from 'react';
import { useNextSiteContext } from './context/next-site-context';
import { Trans } from 'gatsby-plugin-react-i18next';
import { Button } from './ui/button';
import { Shuffle } from 'lucide-react';
import { getSiteConfig } from '../config/getSiteConfig';

const site = getSiteConfig();

const RedirectButton: React.FC = () => {
  const { nextSite, refreshNextSite } = useNextSiteContext();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    window.open(nextSite, '_blank');
    refreshNextSite();
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      size="lg"
      className="group relative w-full overflow-hidden rounded-full px-6 py-4 text-base font-black text-primary-foreground shadow-md transition-transform duration-300 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/70 sm:w-auto sm:px-10 sm:text-lg h-auto"
    >
      <span className="relative z-10 flex items-center gap-3 tracking-wide">
        <Shuffle
          className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12 group-active:scale-95"
          aria-hidden="true"
          strokeWidth={2.5}
        />
        {site.copyOverrides?.shuffleLabel || <Trans i18nKey="shuffle" />}
      </span>
    </Button>
  );
};

export default RedirectButton;
