import * as React from 'react';
import { GatsbyImage, getImage, StaticImage } from 'gatsby-plugin-image';
import { useTranslation } from 'gatsby-plugin-react-i18next';
import LocalizedLink from './LocalizedLink';
import ScoreBadge from './score-badge';
import { AspectRatio } from './ui/aspect-ratio';
import { sourcePath } from '@/lib/taxonomy';

type TopSource = {
  id?: string;
  name: string;
  description?: string | null;
  url: string;
  score?: number | string;
  lists?: string[] | null;
  hash?: string;
  screenshot?: any;
};

type TopSourcesProps = {
  items: TopSource[];
  limit?: number;
};

const scoreOf = (score: TopSource['score']): number => {
  const n = parseFloat(String(score ?? '0'));
  return Number.isFinite(n) ? n : 0;
};

const displayUrl = (url: string): string =>
  url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

const TopSources = ({ items, limit = 12 }: TopSourcesProps): JSX.Element | null => {
  const { t } = useTranslation();

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
    <ul className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {ranked.map((source, index) => {
        const image = getImage(source.screenshot);
        const detailPath = source.id ? sourcePath(source.id) : null;

        const screenshot = (
          <div className="relative overflow-hidden rounded-xl border bg-muted shadow-xs motion-safe:transition-colors group-hover:border-primary/40">
            <AspectRatio ratio={9 / 16}>
              {image ? (
                <GatsbyImage
                  image={image}
                  alt={String(t('screenshot_of', { name: source.name }))}
                  loading={index < 6 ? 'eager' : 'lazy'}
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <StaticImage
                  src="../images/placeholder-screenshot.png"
                  alt={String(t('screenshot_of', { name: source.name }))}
                  loading={index < 6 ? 'eager' : 'lazy'}
                  placeholder="blurred"
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.02]"
                  formats={['auto']}
                />
              )}
            </AspectRatio>
            <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-sm font-black tabular-nums shadow backdrop-blur-sm">
              {index + 1}
            </span>
            <div className="absolute bottom-2 right-2">
              <ScoreBadge score={source.score} />
            </div>
          </div>
        );

        return (
          <li key={source.id || source.url} className="flex flex-col gap-1">
            {detailPath ? (
              <LocalizedLink to={detailPath} className="group block">
                {screenshot}
              </LocalizedLink>
            ) : (
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="group block">
                {screenshot}
              </a>
            )}

            {detailPath ? (
              <LocalizedLink
                to={detailPath}
                className="mt-1.5 text-sm font-bold leading-snug hover:underline"
              >
                {source.name}
              </LocalizedLink>
            ) : (
              <p className="mt-1.5 text-sm font-bold leading-snug">{source.name}</p>
            )}

            {source.description ? (
              <p className="line-clamp-2 text-xs leading-4 text-muted-foreground">
                {source.description}
              </p>
            ) : null}

            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-xs text-muted-foreground/60 hover:text-muted-foreground hover:underline"
            >
              {displayUrl(source.url)}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default TopSources;
