import * as React from "react";
import { useI18next } from "gatsby-plugin-react-i18next";
import { Link } from "gatsby-plugin-react-i18next";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

const LanguageSwitcher: React.FC = () => {
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
              <span className="font-medium">
                {displayNames ? displayNames.of(lng) : lng}
              </span>
              {lng === language && <span className="sr-only">(current)</span>}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
