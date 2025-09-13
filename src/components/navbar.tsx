import * as React from "react";
import { Link, useI18next } from "gatsby-plugin-react-i18next";
import RedirectButton from "./redirect-button";
import Logo from "../components/logo.js";

import WebShufflePlayer from "../components/player";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";

function LanguageSwitcher() {
  const { languages, language, originalPath } = useI18next();

  const displayNames = React.useMemo(() => {
    if (typeof Intl !== "undefined" && (Intl as any).DisplayNames) {
      return new Intl.DisplayNames([language], { type: "language" });
    }
    return null;
  }, [language]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="px-5 py-3 text-sm font-semibold"
          aria-label="Change language"
        >
          {displayNames ? displayNames.of(language) : language}
          <ChevronDown aria-hidden="true" className="w-4 h-4 ms-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="my-2">
        {languages.map((lng) => (
          <DropdownMenuItem key={lng} asChild>
            <Link
              to={originalPath}
              language={lng}
              hrefLang={lng}
              aria-selected={lng === language}
              className="flex items-center gap-2"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              <span className="font-medium">{displayNames ? displayNames.of(lng) : lng}</span>
              {lng === language && <span className="sr-only">(current)</span>}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DefaultNavbar() {
  return (
    <nav className="z-20 backdrop-blur bg-background/80 md:fixed start-0 top-0 left-0 right-0 border-b border-border">
      <div className="lg:max-w-screen-lg md:max-w-screen-md mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <Logo />
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/" className={navigationMenuTriggerStyle()}>Home</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link to="/#sources-gallery" className={navigationMenuTriggerStyle()}>Sources</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
          </div>
        </div>

        <div className="flex items-center pb-2">
          <WebShufflePlayer />
           <RedirectButton />
        </div>
      </div>
    </nav>
  );
}
