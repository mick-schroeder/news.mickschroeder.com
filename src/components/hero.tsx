import React from 'react';
import { Button } from './ui/button';
import { Newspaper } from 'lucide-react';
import RedirectButton from '../components/redirect-button';
import { Trans } from 'gatsby-plugin-react-i18next';
import BookmarkCTA from '../components/bookmark-cta';
import { getSiteConfig } from '../config/getSiteConfig';

const site = getSiteConfig();

const SideBar: React.FC = () => {
  const heroHeadline = site.copyOverrides?.heroHeadline;
  const heroTagline = site.copyOverrides?.heroTagline;

  return (
    <div className="relative p-4 md:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />
      <div className="flex-col content-center mx-auto text-center">
        <h2 className="mx-auto my-2 max-w-3xl text-3xl sm:text-4xl md:text-5xl tracking-tight font-extrabold leading-[1.15] md:leading-[1.05] text-foreground">
          {heroHeadline || <Trans i18nKey="hero.headline" />}
        </h2>
        <p className="mx-auto my-4 max-w-2xl text-pretty text-muted-foreground md:text-lg">
          {heroTagline || <Trans i18nKey="hero.tagline" />}
        </p>
        <div className="flex items-center justify-center gap-3 py-4 lg:py-6">
          <RedirectButton />
          <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-6">
            <a href="#sources-gallery">
              <Newspaper className="h-5 w-5" /> <Trans i18nKey="sources" />
            </a>
          </Button>
        </div>
        <div className="flex items-center justify-center gap-4">
          <BookmarkCTA />
        </div>
      </div>
    </div>
  );
};

export default SideBar;
