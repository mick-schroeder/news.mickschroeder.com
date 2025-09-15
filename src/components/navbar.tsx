import React from 'react';
import { Link, Trans } from 'gatsby-plugin-react-i18next';
import RedirectButton from './redirect-button';
import Logo from '../components/logo';

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

export default function DefaultNavbar() {
  return (
    <nav className="inset-x-0 top-0 z-50 w-full md:fixed md:h-[var(--nav-h)] backdrop-blur bg-background/80 border-b border-border">
      <div className="lg:max-w-screen-lg md:max-w-screen-md mx-auto px-4">
        <div className="flex items-center justify-between py-2 flex-wrap gap-2 md:flex-nowrap">
          <div className="flex items-center gap-2 md:gap-4">
            <Logo />
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/" className={navigationMenuTriggerStyle()}>
                      <Trans i18nKey="home" />
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/#sources-gallery" className={navigationMenuTriggerStyle()}>
                      <Trans i18nKey="sources" />
                    </Link>
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
}
