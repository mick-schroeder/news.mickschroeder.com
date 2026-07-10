import * as React from 'react';
import { Compass, ExternalLink } from 'lucide-react';
import { useTranslation } from 'gatsby-plugin-react-i18next';
import LocalizedLink from './LocalizedLink';
import { sourcePath, tagPath } from '@/lib/taxonomy';
import { TAG_CONFIG } from '@/config/tag-config';
import { cn } from '@/lib/utils';

type DirectorySource = {
  id?: string;
  name: string;
  description?: string | null;
  url: string;
  tags?: string[] | null;
};

type SourceDirectoryProps = {
  items: DirectorySource[];
};

type Category = {
  id: string;
  tag?: string;
  labelKey: string;
};

// Sources often have several tags. Put them in the most specific topical
// category first, then fall back to a regional tag, so each source appears once.
const CATEGORIES: Category[] = [
  { id: 'tech', tag: 'Tech', labelKey: 'home_page.source_categories.tech' },
  { id: 'business', tag: 'Business', labelKey: 'home_page.source_categories.business' },
  { id: 'politics', tag: 'Politics', labelKey: 'home_page.source_categories.politics' },
  { id: 'science', tag: 'Science', labelKey: 'home_page.source_categories.science' },
  { id: 'gaming', tag: 'Gaming', labelKey: 'home_page.source_categories.gaming' },
  { id: 'culture', tag: 'Culture', labelKey: 'home_page.source_categories.culture' },
  { id: 'aggregators', tag: 'Aggregator', labelKey: 'home_page.source_categories.aggregators' },
  { id: 'news', tag: 'News', labelKey: 'home_page.source_categories.news' },
  { id: 'american', tag: 'American', labelKey: 'home_page.source_categories.american' },
  { id: 'british', tag: 'British', labelKey: 'home_page.source_categories.british' },
  { id: 'irish', tag: 'Irish', labelKey: 'home_page.source_categories.irish' },
  { id: 'gaeilge', tag: 'Gaeilge', labelKey: 'home_page.source_categories.gaeilge' },
  { id: 'global', tag: 'Global', labelKey: 'home_page.source_categories.global' },
  { id: 'other', labelKey: 'home_page.source_categories.other' },
];

const categoryFor = (source: DirectorySource): Category =>
  CATEGORIES.find((category) => category.tag && source.tags?.includes(category.tag)) ??
  CATEGORIES[CATEGORIES.length - 1];

const displayHost = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  }
};

const SourceDirectory = ({ items }: SourceDirectoryProps): JSX.Element | null => {
  const { t } = useTranslation();
  const categories = React.useMemo(
    () =>
      CATEGORIES.map((category) => ({
        ...category,
        sources: items
          .filter((source) => categoryFor(source).id === category.id)
          .sort((a, b) => a.name.localeCompare(b.name)),
      })).filter((category) => category.sources.length > 0),
    [items]
  );

  if (!categories.length) return null;

  return (
    <div>
      <nav
        aria-label={String(t('home_page.sources_categories_label'))}
        className="mb-6 flex flex-wrap gap-2"
      >
        {categories.map((category) => {
          const config = category.tag ? TAG_CONFIG[category.tag] : undefined;
          const Icon = config?.icon ?? Compass;

          return (
            <a
              key={category.id}
              href={`#source-category-${category.id}`}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                config?.colorClass ?? 'bg-muted text-muted-foreground border-border'
              )}
            >
              <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              {t(category.labelKey)}
              <span className="tabular-nums opacity-60">{category.sources.length}</span>
            </a>
          );
        })}
      </nav>

      <div className="grid gap-5 lg:grid-cols-2">
        {categories.map((category) => {
          const config = category.tag ? TAG_CONFIG[category.tag] : undefined;
          const Icon = config?.icon ?? Compass;
          const heading = (
            <span className="inline-flex items-center gap-2">
              <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
              {t(category.labelKey)}
              <span className="text-sm font-medium tabular-nums text-muted-foreground">
                {category.sources.length}
              </span>
            </span>
          );

          return (
            <section
              id={`source-category-${category.id}`}
              key={category.id}
              className="scroll-mt-24 rounded-xl border bg-card/40 p-3 shadow-xs sm:p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3 border-b pb-2.5">
                <h3 className="text-lg font-extrabold tracking-tight">
                  {category.tag ? (
                    <LocalizedLink to={tagPath(category.tag)} className="hover:underline">
                      {heading}
                    </LocalizedLink>
                  ) : (
                    heading
                  )}
                </h3>
              </div>
              <ul className="grid gap-x-4 sm:grid-cols-2">
                {category.sources.map((source) => {
                  const host = displayHost(source.url);
                  const title = source.description || `${source.name} - ${host}`;

                  return (
                    <li
                      key={source.id || source.url}
                      className="min-w-0 border-b py-2 last:border-b-0"
                    >
                      {source.id ? (
                        <LocalizedLink
                          to={sourcePath(source.id)}
                          title={title}
                          className="block truncate text-sm font-semibold leading-snug text-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          {source.name}
                        </LocalizedLink>
                      ) : (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={title}
                          className="block truncate text-sm font-semibold leading-snug text-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default SourceDirectory;
