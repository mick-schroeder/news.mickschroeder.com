import * as React from 'react';
import { ExternalLink } from 'lucide-react';
import LocalizedLink from './LocalizedLink';
import { sourcePath } from '@/lib/taxonomy';

type DirectorySource = {
  id?: string;
  name: string;
  description?: string | null;
  url: string;
};

type SourceDirectoryProps = {
  items: DirectorySource[];
};

const displayHost = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  }
};

const SourceDirectory = ({ items }: SourceDirectoryProps): JSX.Element | null => {
  const sorted = React.useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  if (!sorted.length) return null;

  return (
    <ul
      className="columns-1 gap-x-6 sm:columns-2 lg:columns-3"
      style={{ columnRule: '1px solid var(--border)' }}
    >
      {sorted.map((source) => {
        const host = displayHost(source.url);
        const title = source.description || `${source.name} - ${host}`;

        return (
          <li key={source.id || source.url} className="break-inside-avoid px-1.5 py-1.5">
            <div className="rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60">
              {source.id ? (
                <LocalizedLink
                  to={sourcePath(source.id)}
                  title={title}
                  className="block break-words text-sm font-semibold leading-snug text-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {source.name}
                </LocalizedLink>
              ) : (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={title}
                  className="block break-words text-sm font-semibold leading-snug text-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {source.name}
                </a>
              )}
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex max-w-full items-center gap-1 text-xs leading-5 text-muted-foreground/60 hover:text-muted-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <span className="truncate">{host}</span>
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default SourceDirectory;
