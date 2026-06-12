import React from 'react';
import { Trans, useTranslation } from 'gatsby-plugin-react-i18next';
import RedirectButton from './redirect-button';
import Logo from '../components/logo';
import { ExternalLink, House, ListFilter, MoreHorizontal, Newspaper, Tags } from 'lucide-react';

import ShufflePlayer from '../components/player';
import LanguageSwitcher from './language-switcher';
import { Button } from './ui/button';
import { SourceFilterControls } from './source-filter-controls';
import LocalizedLink from './LocalizedLink';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const DefaultNavbar: React.FC = () => {
  const { t } = useTranslation();
  const navInteractiveClasses =
    'text-navbar-foreground hover:bg-navbar-accent hover:text-navbar-accent-foreground focus-visible:ring-navbar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-navbar';
  return (
    <nav className="sticky inset-x-0 top-0 z-50 w-full backdrop-blur bg-navbar/90 border-b border-navbar-border text-navbar-foreground supports-[backdrop-filter]:bg-navbar/70">
      <div className="mx-auto max-w-screen-2xl px-4">
        <div className="flex min-h-16 items-center gap-3 py-2">
          <div className="flex min-w-0 flex-1 items-center">
            <Logo />
          </div>

          <div className="hidden items-center gap-1 lg:flex">
            <Button
              asChild
              size="sm"
              variant="ghost"
              className={cn('h-9 px-3', navInteractiveClasses)}
            >
              <LocalizedLink to="/">
                <House aria-hidden="true" className="w-4 h-4" />
                <Trans i18nKey="home" />
              </LocalizedLink>
            </Button>

            <Button
              asChild
              size="sm"
              variant="ghost"
              className={cn('h-9 px-3', navInteractiveClasses)}
            >
              <LocalizedLink to="/#sources-gallery">
                <Newspaper aria-hidden="true" className="w-4 h-4" />
                <Trans i18nKey="sources" />
              </LocalizedLink>
            </Button>

            <Button
              asChild
              size="sm"
              variant="ghost"
              className={cn('h-9 px-3', navInteractiveClasses)}
            >
              <LocalizedLink to="/lists/">
                <ListFilter aria-hidden="true" className="w-4 h-4" />
                <Trans i18nKey="lists" defaults="Lists" />
              </LocalizedLink>
            </Button>

            <Button
              asChild
              size="sm"
              variant="ghost"
              className={cn('h-9 px-3', navInteractiveClasses)}
            >
              <LocalizedLink to="/tags/">
                <Tags aria-hidden="true" className="w-4 h-4" />
                <Trans i18nKey="tags" defaults="Tags" />
              </LocalizedLink>
            </Button>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <LanguageSwitcher />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-9 w-9', navInteractiveClasses)}
                  aria-label={String(t('navbar.more', 'More links'))}
                >
                  <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild className="lg:hidden">
                  <LocalizedLink to="/" className="flex items-center gap-2">
                    <House aria-hidden="true" className="h-4 w-4" />
                    <Trans i18nKey="home" />
                  </LocalizedLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="lg:hidden">
                  <LocalizedLink to="/#sources-gallery" className="flex items-center gap-2">
                    <Newspaper aria-hidden="true" className="h-4 w-4" />
                    <Trans i18nKey="sources" />
                  </LocalizedLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="lg:hidden">
                  <LocalizedLink to="/lists/" className="flex items-center gap-2">
                    <ListFilter aria-hidden="true" className="h-4 w-4" />
                    <Trans i18nKey="lists" defaults="Lists" />
                  </LocalizedLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="lg:hidden">
                  <LocalizedLink to="/tags/" className="flex items-center gap-2">
                    <Tags aria-hidden="true" className="h-4 w-4" />
                    <Trans i18nKey="tags" defaults="Tags" />
                  </LocalizedLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="https://www.mickschroeder.com"
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink aria-hidden="true" className="h-4 w-4" />
                    mickschroeder.com
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="https://www.linkedin.com/in/schroedermick/"
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-2"
                  >
                    <img
                      src="/images/linkedin.svg"
                      alt=""
                      aria-hidden="true"
                      className="h-4 w-4 dark:invert"
                    />
                    {String(t('navbar.linkedin'))}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a
                    href="https://github.com/mick-schroeder/news.mickschroeder.com"
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-2"
                  >
                    <img
                      src="/images/github.svg"
                      alt=""
                      aria-hidden="true"
                      className="h-4 w-4 dark:invert"
                    />
                    {String(t('navbar.github'))}
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="border-t border-navbar-border/80 py-2">
          <div className="mx-auto max-w-screen-xl rounded-xl border border-navbar-border/80 bg-background/80 p-2 shadow-sm">
            <div className="grid gap-2 xl:grid-cols-[minmax(430px,auto)_minmax(320px,1fr)_auto] xl:items-center">
              <SourceFilterControls className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:flex xl:flex-nowrap xl:justify-start" />
              <ShufflePlayer className="min-w-0" />
              <RedirectButton className="h-11 min-w-[150px] px-5 py-2 text-sm sm:w-full sm:px-5 sm:text-sm xl:w-auto" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DefaultNavbar;
