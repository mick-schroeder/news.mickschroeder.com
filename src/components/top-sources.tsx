import * as React from 'react';
import LocalizedLink from './LocalizedLink';
import { sourcePath } from '@/lib/taxonomy';

type TopSource = {
  id?: string;
  name: string;
  description?: string | null;
  url: string;
  score?: number | string;
  lists?: string[] | null;
};

type TopSourcesProps = {
  items: TopSource[];
  limit?: number;
};

const scoreOf = (score: TopSource['score']): number => {
  const n = parseFloat(String(score ?? '0'));
  return Number.isFinite(n) ? n : 0;
};

const TopSources = ({ items, limit = 24 }: TopSourcesProps): JSX.Element | null => {
  const ranked = React.useMemo(() => {
    return [...items]
      .sort(
        (a, b) =>
          scoreOf(b.score) - scoreOf(a.score) ||
          (b.lists?.length ?? 0) - (a.lists?.length ?? 0) ||
          a.name.localeCompare(b.name)
      )
      .slice(0, limit);
  }, [items, limit]);

  if (!ranked.length) return null;

  return (
    <ol className="columns-1 gap-x-8 sm:columns-2 lg:columns-3">
      {ranked.map((source, index) => (
        <li key={source.id || source.url} className="break-inside-avoid py-1.5">
          <div className="flex items-start gap-2">
            <span className="w-7 shrink-0 text-right font-mono text-base font-bold tabular-nums text-foreground mt-0.5">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                {source.id ? (
                  <LocalizedLink
                    to={sourcePath(source.id)}
                    className="min-w-0 truncate text-sm font-medium hover:underline"
                  >
                    {source.name}
                  </LocalizedLink>
                ) : (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 truncate text-sm font-medium hover:underline"
                  >
                    {source.name}
                  </a>
                )}
              </div>
              {source.description ? (
                <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {source.description}
                </p>
              ) : null}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
};

export default TopSources;
