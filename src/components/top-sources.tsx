import * as React from 'react';
import { Trans } from 'gatsby-plugin-react-i18next';
import LocalizedLink from './LocalizedLink';
import { sourcePath } from '@/lib/taxonomy';

type TopSource = {
  id?: string;
  name: string;
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
          (b.lists?.length ?? 0) - (a.lists?.length ?? 0) ||
          scoreOf(b.score) - scoreOf(a.score) ||
          a.name.localeCompare(b.name)
      )
      .slice(0, limit);
  }, [items, limit]);

  if (!ranked.length) return null;

  return (
    <ol className="columns-1 gap-x-8 sm:columns-2 lg:columns-3">
      {ranked.map((source, index) => (
        <li
          key={source.id || source.url}
          className="flex items-baseline gap-2 break-inside-avoid py-1"
        >
          <span className="w-6 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
            {index + 1}
          </span>
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
          <span className="shrink-0 text-xs text-muted-foreground">
            <Trans
              i18nKey="home_page.in_lists"
              defaults="{{count}} lists"
              values={{ count: source.lists?.length ?? 0 }}
            />
          </span>
        </li>
      ))}
    </ol>
  );
};

export default TopSources;
