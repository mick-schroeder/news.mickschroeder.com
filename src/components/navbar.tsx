import React from 'react';
import { Trans, useTranslation } from 'gatsby-plugin-react-i18next';
import RedirectButton from './redirect-button';
import Logo from '../components/logo';
import { House, Newspaper } from 'lucide-react';

import ShufflePlayer from '../components/player';
import LanguageSwitcher from './language-switcher';
import { Button } from './ui/button';
import { SourceCategorySelector } from './source-category-selector';
import LocalizedLink from './LocalizedLink';
import { cn } from '@/lib/utils';

const DefaultNavbar: React.FC = () => {
  const { t } = useTranslation();
  const navInteractiveClasses =
    'text-navbar-foreground hover:bg-navbar-accent hover:text-navbar-accent-foreground focus-visible:ring-navbar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-navbar';
  return (
    <nav className="inset-x-0 top-0 z-50 w-full md:fixed xl:h-[var(--nav-h)] backdrop-blur bg-navbar/50 border-b border-navbar-border text-navbar-foreground">
      <div className="container mx-auto px-4 max-w-screen-xl">
        <div className="flex items-center justify-between py-2 flex-wrap gap-2 xl:flex-nowrap">
          <div className="w-full flex justify-center md:w-auto md:justify-start pt-4 md:pt-0">
            <Logo />
          </div>
          <div className="flex w-full flex-wrap items-center justify-center gap-2 md:w-auto md:flex-nowrap md:justify-start md:gap-4">
            <div className="flex flex-wrap items-center justify-center gap-1 md:flex-nowrap md:justify-start md:gap-2">
              <Button
                asChild
                variant="ghost"
                size=""
                className={cn('flex items-center gap-2', navInteractiveClasses)}
              >
                <LocalizedLink to="/">
                  <House aria-hidden="true" className="w-4 h-4" />
                  <Trans i18nKey="home" />
                </LocalizedLink>
              </Button>

              <Button
                asChild
                variant="ghost"
                size=""
                className={cn('flex items-center gap-2', navInteractiveClasses)}
              >
                <LocalizedLink to="/#sources-gallery">
                  <Newspaper aria-hidden="true" className="w-4 h-4" />
                  <Trans i18nKey="sources" />
                </LocalizedLink>
              </Button>

              <Button
                asChild
                variant="ghost"
                size=""
                className={cn('flex items-center gap-2', navInteractiveClasses)}
              >
                <a
                  href="https://www.mickschroeder.com"
                  target="_blank"
                  rel="noopener"
                  aria-label={String(t('navbar.personal_site'))}
                >
                  <span className="px-2">mickschroeder.com</span>
                </a>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="icon"
                className={cn('flex items-center gap-2', navInteractiveClasses)}
              >
                <a
                  href="https://www.linkedin.com/in/schroedermick/"
                  target="_blank"
                  rel="noopener"
                  aria-label={String(t('navbar.linkedin'))}
                >
                  <img
                    src="/images/linkedin.svg"
                    alt={String(t('navbar.linkedin'))}
                    className="h-4 w-4 dark:invert"
                  />
                </a>
              </Button>

              <Button
                asChild
                variant="ghost"
                size="icon"
                className={cn('flex items-center gap-2', navInteractiveClasses)}
              >
                <a
                  href="https://github.com/mick-schroeder/news.mickschroeder.com"
                  target="_blank"
                  rel="noopener"
                  aria-label={String(t('navbar.github'))}
                >
                  <img
                    src="/images/github.svg"
                    alt={String(t('navbar.github'))}
                    className="h-4 w-4 dark:invert"
                  />
                </a>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full justify-center xl:justify-end xl:w-auto">
            <LanguageSwitcher />
            <SourceCategorySelector />
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 pb-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
          <ShufflePlayer />
          <RedirectButton />
        </div>
      </div>
    </nav>
  );
};

export default DefaultNavbar;
