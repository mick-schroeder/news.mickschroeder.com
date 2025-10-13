import * as React from 'react';
import { GatsbyImage, getImage, StaticImage } from 'gatsby-plugin-image';
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {sortedSources.map((node, idx) => {
          const { name, url, hash, screenshot, categories } = node;
          const image = getImage(screenshot);
          const eager: 'eager' | 'lazy' = idx < 3 ? 'eager' : 'lazy';
          const fetchP = idx < 3 ? 'high' : undefined;
          const categoriesText = (categories ?? []).join(', ');
          const titleId = `card-title-${hash || idx}`;
          let host = url;
          try {
            host = new URL(url).host;
          } catch {}
          return (
            <Card
              key={hash || url}
              className="flex h-full flex-col overflow-hidden motion-safe:transition-shadow cursor-pointer hover:shadow-lg hover:ring-1 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 [content-visibility:auto] [contain-intrinsic-size:720px_1280px]"
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
                <div className="flex flex-wrap items-start gap-2 sm:items-center sm:justify-between">
                  <CardTitle className="min-w-0 flex-1 truncate text-card-foreground">
                    <span id={titleId} className="sr-only">
                      {name}
                    </span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener"
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
                    <Badge
                      variant="outline"
                      className="max-w-full whitespace-normal break-words text-xs leading-tight sm:shrink-0"
                    >
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
                      alt={String(t('screenshot_of', { name }))}
                      loading={eager}
                      fetchpriority={fetchP}
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover"
                    />
                  ) : (
                    <StaticImage
                      src="../images/placeholder-screenshot.png"
                      alt={String(t('screenshot_of', { name }))}
                      loading={eager}
                      placeholder="blurred"
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover"
                      formats={['auto', 'webp', 'avif']}
                    />
                  )}
                </AspectRatio>
              </CardContent>
              <CardFooter className="mt-auto justify-center gap-3 p-4 sm:p-4">
                <Button asChild variant="ghost" className="gap-2 px-5">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener"
                    aria-label={String(t('open_site', { name }))}
                    tabIndex={-1}
                    aria-hidden="true"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    {host}
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
});

export default SourcesGallery;
