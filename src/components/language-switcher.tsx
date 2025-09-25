import React from 'react'
import { useI18next } from 'gatsby-plugin-react-i18next';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ChevronDown, Languages } from 'lucide-react';
import LocalizedLink from './LocalizedLink';

const LanguageSwitcher: React.FC = () => {
  const { languages, language, originalPath } = useI18next();

  const displayNames = React.useMemo(() => {
    if (typeof Intl !== 'undefined' && (Intl as any).DisplayNames) {
      return new Intl.DisplayNames([language], { type: 'language' });
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
          <Languages aria-hidden="true" className="w-4 h-4 me-2" />
          {displayNames ? displayNames.of(language) : language}
          <ChevronDown aria-hidden="true" className="w-4 h-4 ms-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="my-2">
        {languages.map((lng) => (
          <DropdownMenuItem key={lng} asChild>
            <LocalizedLink
              to={originalPath}
              language={lng}
              hrefLang={lng}
              aria-selected={lng === language}
              className="flex items-center gap-2"
            >
              <Languages aria-hidden="true" className="w-4 h-4 me-2 text-primary" />
              <span className="font-medium">{displayNames ? displayNames.of(lng) : lng}</span>
              {lng === language && <span className="sr-only">(current)</span>}
            </LocalizedLink>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
