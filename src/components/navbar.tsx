import React from 'react';
import { Trans } from 'gatsby-plugin-react-i18next';
import RedirectButton from './redirect-button';
import Logo from '../components/logo';
import { House, Newspaper } from 'lucide-react';

import WebShufflePlayer from '../components/player';
import LanguageSwitcher from './language-switcher';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from './ui/navigation-menu';
import { SourceCategorySelector } from './SourceCategorySelector';
import LocalizedLink from './LocalizedLink';

const DefaultNavbar: React.FC = () => {
  return (
    <nav className="inset-x-0 top-0 z-50 w-full md:fixed md:h-[var(--nav-h)] backdrop-blur bg-background/80 border-b border-border">
      <div className="container mx-auto px-4 max-w-screen-xl">
        <div className="flex items-center justify-between py-2 flex-wrap gap-2 md:flex-nowrap">
          <div className="w-full flex justify-center md:w-auto md:justify-start">
            <Logo />
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <LocalizedLink to="/" className={navigationMenuTriggerStyle()}>
                      <House aria-hidden="true" className="w-4 h-4 me-2" />

                      <Trans i18nKey="home" />
                    </LocalizedLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <LocalizedLink to="/#sources-gallery" className={navigationMenuTriggerStyle()}>
                      <Newspaper aria-hidden="true" className="w-4 h-4 me-2" />

                      <Trans i18nKey="sources" />
                    </LocalizedLink>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <a
                      href="https://www.mickschroeder.com"
                      target="_blank"
                      rel="noopener"
                      aria-label="Personal website"
                      className={navigationMenuTriggerStyle() + ' h-8 px-2 text-sm'}
                    >
                      <span className="px-2">mickschroeder.com</span>
                    </a>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <a
                      href="https://www.linkedin.com/in/schroedermick/"
                      target="_blank"
                      rel="noopener"
                      aria-label="LinkedIn"
                      className={navigationMenuTriggerStyle() + ' h-8 px-2'}
                    >
                      <img
                        src="/images/linkedin.svg"
                        alt="LinkedIn"
                        className="h-4 w-4 dark:invert"
                      />
                    </a>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <a
                      href="https://github.com/mick-schroeder/news.mickschroeder.com"
                      target="_blank"
                      rel="noopener"
                      aria-label="GitHub"
                      className={navigationMenuTriggerStyle() + ' h-8 px-2'}
                    >
                      <img src="/images/github.svg" alt="GitHub" className="h-4 w-4 dark:invert" />
                    </a>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-3 w-full justify-center md:w-auto md:justify-end">
            <LanguageSwitcher />
            <SourceCategorySelector />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 pb-2 md:flex-row">
          <WebShufflePlayer />
          <RedirectButton />
        </div>
      </div>
    </nav>
  );
};

export default DefaultNavbar;
