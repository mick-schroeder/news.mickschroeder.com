import * as React from 'react';
import { GatsbyImage, getImage, StaticImage } from 'gatsby-plugin-image';
import { Trans, useTranslation } from 'gatsby-plugin-react-i18next';
import { ChevronRight } from 'lucide-react';
import LocalizedLink from './LocalizedLink';
import { AspectRatio } from './ui/aspect-ratio';
import { Button } from './ui/button';
import { listPath, sourcePath } from '@/lib/taxonomy';

type ShelfSource = {
  id?: string;
  name: string;
  description?: string | null;
  url: string;
  tags?: string[] | null;
  hash?: string;
  screenshot?: any;
};

type SourceShelfProps = {
  listId: string;
  listName: string;
  path?: string;
  items: ShelfSource[];
  limit?: number;
  eager?: boolean;
};

const SourceShelf = ({
  listId,
  listName,
  path,
  items,
  limit = 10,
  eager = false,
}: SourceShelfProps): React.ReactElement | null => {
  const shelfPath = path ?? shelfPath;
  const { t } = useTranslation();

  if (!items.length) return null;

  const shelfItems = items.slice(0, limit);
  const remaining = items.length - shelfItems.length;

  return (
    <section aria-label={listName}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 truncate text-lg font-bold">
          <LocalizedLink to={shelfPath} className="hover:underline">
            {listName}
          </LocalizedLink>
          <span className="ms-2 text-sm font-normal tabular-nums text-muted-foreground">
            <Trans
              i18nKey="filter_selector.source_count"
              defaults="{{count}} sources"
              values={{ count: items.length }}
            />
          </span>
        </h3>
        <Button asChild variant="ghost" size="sm" className="shrink-0 gap-1 text-muted-foreground">
          <LocalizedLink to={shelfPath}>
            <Trans i18nKey="home_page.see_all" defaults="See all" />
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </LocalizedLink>
        </Button>
      </div>

      <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:thin]">
        {shelfItems.map((source, idx) => {
          const image = getImage(source.screenshot);
          const loading: 'eager' | 'lazy' = eager && idx < 4 ? 'eager' : 'lazy';
          const detailPath = source.id ? sourcePath(source.id) : null;
          const tagsText = (source.tags ?? []).join(', ');
          const card = (
            <>
              <div className="overflow-hidden rounded-xl border bg-muted shadow-xs motion-safe:transition-colors group-hover:border-primary/40">
                <AspectRatio ratio={9 / 16}>
                  {image ? (
                    <GatsbyImage
                      image={image}
                      alt={String(t('screenshot_of', { name: source.name }))}
                      loading={loading}
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <StaticImage
                      src="../images/placeholder-screenshot.png"
                      alt={String(t('screenshot_of', { name: source.name }))}
                      loading={loading}
                      placeholder="blurred"
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.02]"
                      formats={['auto', 'webp', 'avif']}
                    />
                  )}
                </AspectRatio>
              </div>
              <p className="mt-2 truncate text-sm font-medium group-hover:underline">
                {source.name}
              </p>
              {source.description ? (
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {source.description}
                </p>
              ) : null}
            </>
          );

          return (
            <li key={source.hash || source.url} className="w-36 shrink-0 snap-start sm:w-40">
              {detailPath ? (
                <LocalizedLink to={detailPath} className="group block">
                  {card}
                </LocalizedLink>
              ) : (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  {card}
                </a>
              )}
            </li>
          );
        })}

        {remaining > 0 ? (
          <li className="w-36 shrink-0 snap-start sm:w-40">
            <LocalizedLink to={shelfPath} className="group block">
              <div className="rounded-xl border border-dashed bg-muted/50 motion-safe:transition-colors group-hover:border-primary/40 group-hover:bg-muted">
                <AspectRatio ratio={9 / 16}>
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                    <span className="text-lg font-bold tabular-nums">+{remaining}</span>
                    <span className="text-xs">
                      <Trans i18nKey="home_page.see_all" defaults="See all" />
                    </span>
                  </div>
                </AspectRatio>
              </div>
            </LocalizedLink>
          </li>
        ) : null}
      </ul>
    </section>
  );
};

export default SourceShelf;
