import * as React from 'react';
import { Trans } from 'gatsby-plugin-react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';
import LocalizedLink from './LocalizedLink';
import { Button } from './ui/button';
import { sourcePath } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';

type DirectorySource = {
  id?: string;
  name: string;
  url: string;
};

type SourceDirectoryProps = {
  items: DirectorySource[];
};

const SourceDirectory = ({ items }: SourceDirectoryProps): JSX.Element | null => {
  const [expanded, setExpanded] = React.useState(false);

  const sorted = React.useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  if (!sorted.length) return null;

  return (
    <div>
      <div className={cn('relative', !expanded && 'max-h-[26rem] overflow-hidden')}>
        <ul className="columns-2 gap-x-6 sm:columns-3 lg:columns-4">
          {sorted.map((source) => (
            <li key={source.id || source.url}>
              {source.id ? (
                <LocalizedLink
                  to={sourcePath(source.id)}
                  className="block truncate py-0.5 text-sm leading-6 hover:underline"
                >
                  {source.name}
                </LocalizedLink>
              ) : (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate py-0.5 text-sm leading-6 hover:underline"
                >
                  {source.name}
                </a>
              )}
            </li>
          ))}
        </ul>
        {!expanded ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"
            aria-hidden="true"
          />
        ) : null}
      </div>

      <div className="mt-3 text-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? (
            <>
              <Trans i18nKey="home_page.show_fewer" defaults="Show fewer" />
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            </>
          ) : (
            <>
              <Trans
                i18nKey="home_page.show_all"
                defaults="Show all {{count}} sources"
                values={{ count: sorted.length }}
              />
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SourceDirectory;
