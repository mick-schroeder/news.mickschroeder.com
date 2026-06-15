import * as React from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ExternalLink,
  LayoutGrid,
  LayoutList,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import LocalizedLink from './LocalizedLink';
import { Badge } from './ui/badge';
import ScoreBadge from './score-badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { sourcePath } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';
import { TAG_CONFIG } from '@/config/tag-config';

type SourceList = {
  id: string;
  name: string;
};

type SourceTableItem = {
  id?: string;
  name: string;
  description?: string | null;
  url: string;
  canonicalKey?: string | null;
  tags?: string[] | null;
  lists?: string[] | null;
  score?: number | string | null;
};

type SourcesDataTableProps = {
  sources: SourceTableItem[];
  lists: SourceList[];
  initialList?: string;
  initialTag?: string;
};

type SortKey = 'name' | 'score';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'table' | 'grid';

const hostOf = (url: string): string => {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const scoreOf = (score: SourceTableItem['score']): number => {
  const value = parseFloat(String(score ?? '0'));
  return Number.isFinite(value) ? value : 0;
};

const normalizeText = (value: unknown): string => String(value ?? '').toLowerCase();

const SortIcon = ({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}): JSX.Element => {
  if (!active) return <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5" />;
  return direction === 'asc' ? (
    <ArrowUp aria-hidden="true" className="h-3.5 w-3.5" />
  ) : (
    <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
  );
};

const SourcesDataTable = ({
  sources,
  lists,
  initialList,
  initialTag,
}: SourcesDataTableProps): JSX.Element => {
  const [query, setQuery] = React.useState('');
  const [selectedList, setSelectedList] = React.useState(initialList ?? 'all');
  const [selectedTag, setSelectedTag] = React.useState(initialTag ?? 'all');
  const [sortKey, setSortKey] = React.useState<SortKey>('score');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');
  const [view, setView] = React.useState<ViewMode>('table');

  const listNameById = React.useMemo(
    () => new Map(lists.map((list) => [list.id, list.name])),
    [lists]
  );

  const tags = React.useMemo(() => {
    const values = new Set<string>();
    for (const source of sources) {
      for (const tag of source.tags ?? []) values.add(tag);
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [sources]);

  const filteredSources = React.useMemo(() => {
    const needle = normalizeText(query).trim();

    return sources.filter((source) => {
      const sourceTags = source.tags ?? [];
      const sourceLists = source.lists ?? [];

      if (selectedList !== 'all' && !sourceLists.includes(selectedList)) return false;
      if (selectedTag !== 'all' && !sourceTags.includes(selectedTag)) return false;

      if (!needle) return true;

      const haystack = [
        source.name,
        source.description,
        source.url,
        hostOf(source.url),
        source.canonicalKey,
        ...sourceTags,
        ...sourceLists.map((id) => listNameById.get(id) || id),
      ]
        .map(normalizeText)
        .join(' ');

      return haystack.includes(needle);
    });
  }, [listNameById, query, selectedList, selectedTag, sources]);

  const sortedSources = React.useMemo(() => {
    const compareStrings = (a: string, b: string) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' });

    const sorted = [...filteredSources].sort((a, b) => {
      switch (sortKey) {
        case 'score':
          return scoreOf(a.score) - scoreOf(b.score);
        case 'name':
        default:
          return compareStrings(a.name, b.name);
      }
    });

    return sortDirection === 'asc' ? sorted : sorted.reverse();
  }, [filteredSources, sortDirection, sortKey]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection(key === 'name' ? 'asc' : 'desc');
  };

  const resetFilters = () => {
    setQuery('');
    setSelectedList(initialList ?? 'all');
    setSelectedTag(initialTag ?? 'all');
  };

  const sortButton = (key: SortKey, label: string, className?: string) => (
    <button
      type="button"
      className={cn(
        'inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        className
      )}
      onClick={() => toggleSort(key)}
    >
      {label}
      <SortIcon active={sortKey === key} direction={sortDirection} />
    </button>
  );

  return (
    <Card className="overflow-hidden rounded-none border-x-0 border-t-0 shadow-none lg:rounded-lg lg:border lg:shadow-sm lg:m-4">
      <CardHeader className="border-b p-4">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_auto] lg:items-center">
          <label className="relative block">
            <span className="sr-only">Search sources</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, domain, list, or tag"
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            {/* List + Tag dropdowns — hidden on mobile when sidebar provides navigation */}
            <div className="flex flex-1 gap-2 lg:flex-none">
              <label className="min-w-0 flex-1 lg:w-44 lg:flex-none">
                <span className="sr-only">Filter by list</span>
                <select
                  value={selectedList}
                  onChange={(event) => setSelectedList(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="all">All lists</option>
                  {lists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="min-w-0 flex-1 lg:w-36 lg:flex-none">
                <span className="sr-only">Filter by tag</span>
                <select
                  value={selectedTag}
                  onChange={(event) => setSelectedTag(event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="all">All tags</option>
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <Button type="button" variant="outline" onClick={resetFilters} className="h-10 shrink-0">
              <SlidersHorizontal aria-hidden="true" className="h-4 w-4" />
              Reset
            </Button>

            {/* View toggle */}
            <div className="flex items-center rounded-md border border-input shadow-sm">
              <button
                type="button"
                onClick={() => setView('table')}
                aria-label="Table view"
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-l-md transition-colors',
                  view === 'table'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-background text-muted-foreground hover:bg-accent/50'
                )}
              >
                <LayoutList aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setView('grid')}
                aria-label="Grid view"
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-r-md border-l border-input transition-colors',
                  view === 'grid'
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-background text-muted-foreground hover:bg-accent/50'
                )}
              >
                <LayoutGrid aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b px-4 py-3 text-sm text-muted-foreground">
          <span className="tabular-nums">
            {sortedSources.length} of {sources.length} sources
          </span>
          <span className="hidden sm:inline">Sorted by {sortKey}</span>
        </div>

        {view === 'table' ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="min-w-[240px]">{sortButton('name', 'Source')}</TableHead>
                <TableHead className="hidden min-w-[220px] max-w-[320px] xl:table-cell">
                  Description
                </TableHead>
                <TableHead className="hidden min-w-[160px] md:table-cell">Tags</TableHead>
                <TableHead className="w-[88px] text-right">
                  {sortButton('score', 'Score')}
                </TableHead>
                <TableHead className="min-w-[180px]">URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSources.length ? (
                sortedSources.map((source) => {
                  const sourceTags = source.tags ?? [];
                  const detailPath = source.id ? sourcePath(source.id) : null;

                  return (
                    <TableRow key={source.id || source.url}>
                      <TableCell>
                        <div className="min-w-0">
                          {detailPath ? (
                            <LocalizedLink
                              to={detailPath}
                              className="block truncate font-semibold text-foreground hover:underline"
                            >
                              {source.name}
                            </LocalizedLink>
                          ) : (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block truncate font-semibold text-foreground hover:underline"
                            >
                              {source.name}
                            </a>
                          )}
                          {source.description ? (
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground xl:hidden">
                              {source.description}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="hidden max-w-[320px] xl:table-cell">
                        <p
                          className="truncate text-sm text-muted-foreground"
                          title={source.description || source.canonicalKey || hostOf(source.url)}
                        >
                          {source.description || source.canonicalKey || hostOf(source.url)}
                        </p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex max-w-[220px] flex-wrap gap-1.5">
                          {sourceTags.slice(0, 2).map((tag) => {
                            const cfg = TAG_CONFIG[tag];
                            const Icon = cfg?.icon;
                            return (
                              <span
                                key={tag}
                                className={cn(
                                  'inline-flex max-w-full items-center gap-1 truncate rounded-md border px-2 py-0.5 text-xs font-semibold',
                                  cfg?.colorClass ??
                                    'border-border bg-secondary text-secondary-foreground'
                                )}
                              >
                                {Icon && <Icon aria-hidden="true" className="h-3 w-3 shrink-0" />}
                                {tag}
                              </span>
                            );
                          })}
                          {sourceTags.length > 2 ? (
                            <Badge variant="outline">+{sourceTags.length - 2}</Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <ScoreBadge score={source.score} />
                      </TableCell>
                      <TableCell>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex max-w-[220px] items-center gap-2 truncate text-sm font-medium text-primary hover:underline"
                        >
                          <span className="truncate">{hostOf(source.url)}</span>
                          <ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0" />
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-muted-foreground">
                    No sources match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          /* Grid view */
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {sortedSources.length ? (
              sortedSources.map((source) => {
                const sourceTags = source.tags ?? [];
                const detailPath = source.id ? sourcePath(source.id) : null;
                const host = hostOf(source.url);

                return (
                  <Card
                    key={source.id || source.url}
                    className="flex flex-col overflow-hidden rounded-lg shadow-sm"
                  >
                    <CardContent className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          {detailPath ? (
                            <LocalizedLink
                              to={detailPath}
                              className="block truncate font-semibold text-card-foreground hover:underline"
                            >
                              {source.name}
                            </LocalizedLink>
                          ) : (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block truncate font-semibold text-card-foreground hover:underline"
                            >
                              {source.name}
                            </a>
                          )}
                        </div>
                        <ScoreBadge score={source.score} />
                      </div>

                      {sourceTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {sourceTags.slice(0, 3).map((tag) => {
                            const cfg = TAG_CONFIG[tag];
                            const Icon = cfg?.icon;
                            return (
                              <span
                                key={tag}
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-semibold',
                                  cfg?.colorClass ??
                                    'border-border bg-secondary text-secondary-foreground'
                                )}
                              >
                                {Icon && (
                                  <Icon aria-hidden="true" className="h-2.5 w-2.5 shrink-0" />
                                )}
                                {tag}
                              </span>
                            );
                          })}
                          {sourceTags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{sourceTags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {source.description && (
                        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {source.description}
                        </p>
                      )}

                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        <span className="truncate">{host}</span>
                        <ExternalLink aria-hidden="true" className="h-3 w-3 shrink-0" />
                      </a>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
                No sources match the current filters.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SourcesDataTable;
