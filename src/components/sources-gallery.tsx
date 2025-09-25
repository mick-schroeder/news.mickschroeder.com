import * as React from 'react';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { AspectRatio } from './ui/aspect-ratio';
import { ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from 'gatsby-plugin-react-i18next';
import { Badge } from './ui/badge';
import { useSourceCategoryContext } from './context/SourceCategoryContext';

type Source = {
  name: string;
  score?: number | string;
  categories: string[];
  url: string;
  hash?: string;
  screenshot?: any;
};

type Props = {
  items: Source[];
  limit?: number;
  sort?: 'alphabetical' | 'rating';
};

const SourcesGallery = React.memo<Props>(({ items, limit, sort }): JSX.Element | null => {
  const { selectedCategories } = useSourceCategoryContext();

  // Filter items by selected categories (empty = all)
  const filteredItems = React.useMemo(() => {
    if (!selectedCategories.length) return items;
    return items.filter((item) => item.categories.some((cat) => selectedCategories.includes(cat)));
  }, [items, selectedCategories]);

  const sortedSources = React.useMemo(() => {
    const list = [...filteredItems];
    switch (sort) {
      case 'alphabetical':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating': {
        const scoreOf = (s: any) => {
          const n = parseFloat(String(s ?? '0'));
          return Number.isFinite(n) ? n : 0;
        };
        list.sort((a, b) => scoreOf(b.score) - scoreOf(a.score));
        break;
      }
      default: {
        const scoreOf = (s: any) => {
          const n = parseFloat(String(s ?? '0'));
          return Number.isFinite(n) ? n : 0;
        };
        list.sort((a, b) => scoreOf(b.score) - scoreOf(a.score));
        break;
      }
    }
    return limit ? list.slice(0, limit) : list;
  }, [filteredItems, limit, sort]);

  const { t } = useTranslation();

  if (!sortedSources.length) return null;

  return (
    <section
      id="sources-gallery"
      className="scroll-mt-6"
      style={{ scrollMarginTop: 'calc(var(--nav-h, 4rem) + 1rem)' }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {sortedSources.map((node, idx) => {
          const { name, url, hash, screenshot, categories } = node;
          const image = getImage(screenshot);
          const eager: 'eager' | 'lazy' = idx < 3 ? 'eager' : 'lazy';
          const fetchP = idx < 3 ? 'high' : undefined;
          const categoriesText = categories.join(', ');
          const titleId = `card-title-${hash || idx}`;
          let host = url;
          try {
            host = new URL(url).host;
          } catch {}
          return (
            <Card
              key={hash || url}
              className="overflow-hidden motion-safe:transition-shadow cursor-pointer hover:shadow-lg hover:ring-1 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 [content-visibility:auto] [contain-intrinsic-size:720px_1280px]"
              role="link"
              tabIndex={0}
              aria-labelledby={titleId}
              onClick={() => {
                if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener');
                }
              }}
            >
              <CardHeader className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="truncate text-card-foreground">
                    <span id={titleId} className="sr-only">
                      {name}
                    </span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      tabIndex={-1}
                      aria-hidden="true"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      {name}
                    </a>
                  </CardTitle>
                  {categoriesText ? (
                    <Badge variant="secondary" className="shrink-0">
                      {categoriesText}
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <AspectRatio ratio={9 / 16} className="bg-muted">
                  {image ? (
                    <GatsbyImage
                      image={image}
                      alt={`Screenshot of ${name}`}
                      loading={eager}
                      fetchPriority={fetchP}
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={`/screenshots/${hash}.webp`}
                      alt={`Screenshot of ${name}`}
                      loading={eager}
                      fetchPriority={fetchP}
                      decoding="async"
                      className="h-full w-full object-cover"
                      width="720"
                      height="1280"
                    />
                  )}
                </AspectRatio>
              </CardContent>
              <CardFooter className="p-4">
                <div className="flex w-full items-center justify-between gap-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-xs font-semibold text-primary hover:underline flex-1 min-w-0"
                    title={url}
                    aria-label={String(t('open_site', { name }))}
                    tabIndex={-1}
                    aria-hidden="true"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    {host}
                  </a>

                  <Button asChild size="icon" variant="ghost">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={String(t('open_site', { name }))}
                      tabIndex={-1}
                      aria-hidden="true"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
});

export default SourcesGallery;
