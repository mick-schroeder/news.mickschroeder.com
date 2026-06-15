import * as React from 'react';
import { GatsbyImage, getImage, StaticImage } from 'gatsby-plugin-image';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { AspectRatio } from './ui/aspect-ratio';
import { ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { useTranslation } from 'gatsby-plugin-react-i18next';
import { filterSources, useSourceFilterContext } from './context/source-filter-context';
import LocalizedLink from './LocalizedLink';
import { sourcePath } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';
import { TAG_CONFIG } from '@/config/tag-config';

type Source = {
  id?: string;
  name: string;
  description?: string;
  score?: number | string;
  tags: string[];
  lists: string[];
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
  const { selectedLists, selectedTags } = useSourceFilterContext();

  const filteredItems = React.useMemo(() => {
    return filterSources(items, selectedLists, selectedTags);
  }, [items, selectedLists, selectedTags]);

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
          const { name, url, hash, screenshot, tags, description } = node;
          const image = getImage(screenshot);
          const eager: 'eager' | 'lazy' = idx < 3 ? 'eager' : 'lazy';
          const fetchP = idx < 3 ? 'high' : undefined;
          const titleId = `card-title-${hash || idx}`;
          const detailPath = node.id ? sourcePath(node.id) : null;
          let host = url;
          try {
            host = new URL(url).host;
          } catch {}
          return (
            <Card
              key={hash || url}
              className="group flex h-full flex-col overflow-hidden motion-safe:transition-shadow hover:shadow-lg hover:ring-1 hover:ring-primary/30 [content-visibility:auto] [contain-intrinsic-size:720px_1280px]"
            >
              <CardHeader className="p-4 pb-3">
                <CardTitle className="truncate text-card-foreground">
                  {detailPath ? (
                    <LocalizedLink id={titleId} to={detailPath} className="hover:underline">
                      {name}
                    </LocalizedLink>
                  ) : (
                    <a
                      id={titleId}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {name}
                    </a>
                  )}
                </CardTitle>
                {(tags ?? []).length > 0 ? (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {(tags ?? []).map((tag) => {
                      const cfg = TAG_CONFIG[tag];
                      const Icon = cfg?.icon;
                      return (
                        <span
                          key={tag}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold',
                            cfg?.colorClass ?? 'bg-secondary text-secondary-foreground border-transparent'
                          )}
                        >
                          {Icon && <Icon aria-hidden="true" className="h-3 w-3 shrink-0" />}
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                ) : null}
              </CardHeader>
              <CardContent className="p-0">
                {detailPath ? (
                  <LocalizedLink to={detailPath} aria-labelledby={titleId} className="block">
                    <AspectRatio ratio={9 / 16} className="bg-muted">
                      {image ? (
                        <GatsbyImage
                          image={image}
                          alt=""
                          loading={eager}
                          fetchPriority={fetchP}
                          className="h-full w-full"
                          imgClassName="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.01]"
                        />
                      ) : (
                        <StaticImage
                          src="../images/placeholder-screenshot.png"
                          alt=""
                          loading={eager}
                          placeholder="blurred"
                          className="h-full w-full"
                          imgClassName="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.01]"
                          formats={['auto', 'webp', 'avif']}
                        />
                      )}
                    </AspectRatio>
                  </LocalizedLink>
                ) : (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                    <AspectRatio ratio={9 / 16} className="bg-muted">
                      {image ? (
                        <GatsbyImage
                          image={image}
                          alt={String(t('screenshot_of', { name }))}
                          loading={eager}
                          fetchPriority={fetchP}
                          className="h-full w-full"
                          imgClassName="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.01]"
                        />
                      ) : (
                        <StaticImage
                          src="../images/placeholder-screenshot.png"
                          alt={String(t('screenshot_of', { name }))}
                          loading={eager}
                          placeholder="blurred"
                          className="h-full w-full"
                          imgClassName="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.01]"
                          formats={['auto', 'webp', 'avif']}
                        />
                      )}
                    </AspectRatio>
                  </a>
                )}
              </CardContent>
              <CardFooter className="mt-auto justify-center gap-3 p-4 sm:p-4">
                <div className="min-w-0 flex-1">
                  {description ? (
                    <p className="mb-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                      {description}
                    </p>
                  ) : null}
                  <Button asChild variant="outline" className="gap-2 px-5">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={String(t('open_site', { name }))}
                    >
                      {host}
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
