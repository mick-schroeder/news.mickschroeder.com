import * as React from 'react';
import { graphql, navigate, type HeadProps, type PageProps } from 'gatsby';
import { GatsbyImage, getImage, StaticImage } from 'gatsby-plugin-image';
import { useTranslation } from 'gatsby-plugin-react-i18next';
import { ArrowLeft, ArrowRight, ChevronRight, ExternalLink, ListFilter, Shuffle, Tags } from 'lucide-react';
import { TAG_CONFIG } from '@/config/tag-config';
import LocalizedLink from '@/components/LocalizedLink';
import SiteLayout from '@/components/site-layout';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SEO, type SEOI18n } from '@/components/seo';
import { cn } from '@/lib/utils';
import { tagPath } from '@/lib/taxonomy';
import '../fragments/locale';

type SourcePageData = {
  locales?: unknown;
  screenshotFile?: any;
};

type SourcePageSource = {
  id: string;
  name: string;
  description: string;
  url: string;
  canonicalKey: string;
  tags: string[];
  lists: string[];
  score: number;
};

type SourcePageContext = {
  id: string;
  source?: SourcePageSource;
  screenshotBase?: string;
  listNames?: string[];
  sourceLists?: Array<{
    id: string;
    name: string;
    path: string;
  }>;
  navigation?: {
    previous?: SourceNavigationItem;
    next?: SourceNavigationItem;
    sources?: SourceNavigationItem[];
  };
  i18n?: SEOI18n;
};

type SourceNavigationItem = {
  id: string;
  name: string;
  path: string;
};

const fallbackDescription = (name: string, canonicalKey: string): string =>
  `${name} is a News Shuffle source for ${canonicalKey}.`;

const scoreColorClass = (n: number): string => {
  if (n >= 70) return 'bg-green-600 dark:bg-green-500';
  if (n >= 40) return 'bg-amber-500';
  return 'bg-red-600 dark:bg-red-500';
};

const SourcePage: React.FC<PageProps<SourcePageData, SourcePageContext>> = ({
  data,
  pageContext,
}) => {
  const { t } = useTranslation();
  const source = pageContext.source;
  const navigation = pageContext.navigation;
  const image = getImage(data?.screenshotFile);
  const sourceLists =
    pageContext.sourceLists ??
    (pageContext.listNames ?? []).map((name) => ({
      id: name,
      name,
      path: `/lists/${name}/`,
    }));
  const localizedPath = React.useCallback(
    (path: string) => {
      const i18n = pageContext.i18n;
      if (!i18n || i18n.language === i18n.defaultLanguage) return path;
      return `/${i18n.language}${path}`;
    },
    [pageContext.i18n]
  );
  const goToRandomSource = React.useCallback(() => {
    const candidates = (navigation?.sources ?? []).filter((item) => item.id !== source?.id);
    if (!candidates.length) return;

    const randomSource = candidates[Math.floor(Math.random() * candidates.length)];
    navigate(localizedPath(randomSource.path));
  }, [localizedPath, navigation?.sources, source?.id]);

  React.useEffect(() => {
    if (!source || !navigation) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const isTypingTarget =
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName));

      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        isTypingTarget
      ) {
        return;
      }

      if (event.key === 'ArrowLeft' && navigation.previous) {
        event.preventDefault();
        navigate(localizedPath(navigation.previous.path));
      }

      if (event.key === 'ArrowRight' && navigation.next) {
        event.preventDefault();
        navigate(localizedPath(navigation.next.path));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [localizedPath, navigation, source]);

  if (!source) {
    return (
      <SiteLayout>
        <section className="mx-auto max-w-screen-md px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Source not found</CardTitle>
            </CardHeader>
          </Card>
        </section>
      </SiteLayout>
    );
  }

  const hasLists = sourceLists.length > 0;
  const hasTags = source.tags.length > 0;

  const description = source.description || fallbackDescription(source.name, source.canonicalKey);

  return (
    <SiteLayout>
      <article className="mx-auto max-w-screen-lg px-4 py-8">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(240px,340px)] md:items-start">
          {/* Left column — all source info */}
          <div>
            <p className="text-sm font-semibold text-muted-foreground">{source.canonicalKey}</p>

            <div className="mt-3 flex items-start gap-5">
              {Number.isFinite(source.score) && (
                <div className="flex shrink-0 flex-col items-center">
                  <div
                    className={cn(
                      'flex h-20 w-20 items-center justify-center rounded-xl text-4xl font-black tabular-nums text-white shadow-md',
                      scoreColorClass(Math.round(source.score))
                    )}
                    aria-label={`Score: ${Math.round(source.score)}%`}
                  >
                    {Math.round(source.score)}
                  </div>
                  <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Score
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-4xl font-black tracking-normal text-foreground">
                  {source.name}
                </h1>
                <p className="mt-3 text-base leading-7 text-muted-foreground">{description}</p>
              </div>
            </div>

            <div className="mt-6">
              <Button asChild size="lg">
                <a href={source.url} target="_blank" rel="noopener">
                  Visit Source
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                </a>
              </Button>
            </div>

            {(hasLists || hasTags) && <Separator className="my-7" />}

            {hasLists && (
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <ListFilter aria-hidden="true" className="h-3.5 w-3.5" />
                  Appears in
                </p>
                <div className="-mx-2 mt-1">
                  {sourceLists.map((list) => (
                    <LocalizedLink
                      key={list.id}
                      to={list.path}
                      className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span className="truncate">{list.name}</span>
                      <ChevronRight aria-hidden="true" className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </LocalizedLink>
                  ))}
                </div>
              </div>
            )}

            {hasTags && (
              <div className={hasLists ? 'mt-6' : ''}>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Tags aria-hidden="true" className="h-3.5 w-3.5" />
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {source.tags.map((tag) => {
                    const cfg = TAG_CONFIG[tag];
                    const Icon = cfg?.icon;
                    return (
                      <LocalizedLink
                        key={tag}
                        to={tagPath(tag)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors hover:opacity-80',
                          cfg?.colorClass ?? badgeVariants({ variant: 'outline' })
                        )}
                      >
                        {Icon && <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
                        {tag}
                      </LocalizedLink>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right column — screenshot, sticky on desktop */}
          <a
            href={source.url}
            target="_blank"
            rel="noopener"
            className="group block overflow-hidden rounded-xl border bg-muted shadow-sm motion-safe:transition-all hover:border-primary/40 hover:shadow-md md:sticky md:top-24"
          >
            <AspectRatio ratio={9 / 16}>
              {image ? (
                <GatsbyImage
                  image={image}
                  alt={String(t('screenshot_of', { name: source.name }))}
                  loading="eager"
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.01]"
                />
              ) : (
                <StaticImage
                  src="../images/placeholder-screenshot.png"
                  alt={String(t('screenshot_of', { name: source.name }))}
                  loading="eager"
                  placeholder="blurred"
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-[1.01]"
                  formats={['auto']}
                />
              )}
            </AspectRatio>
          </a>
        </div>

        {navigation ? (
          <nav
            aria-label="Source navigation"
            className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t pt-6"
          >
            {navigation.previous ? (
              <Button asChild variant="outline">
                <LocalizedLink
                  to={navigation.previous.path}
                  aria-label={`Previous source: ${navigation.previous.name}`}
                >
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                  Previous
                </LocalizedLink>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="secondary"
              onClick={goToRandomSource}
              disabled={!navigation.sources || navigation.sources.length < 2}
            >
              <Shuffle aria-hidden="true" className="h-4 w-4" />
              Shuffle
            </Button>
            {navigation.next ? (
              <Button asChild variant="outline">
                <LocalizedLink
                  to={navigation.next.path}
                  aria-label={`Next source: ${navigation.next.name}`}
                >
                  Next
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </LocalizedLink>
              </Button>
            ) : null}
          </nav>
        ) : null}
      </article>
    </SiteLayout>
  );
};

export default SourcePage;

export const Head = ({ pageContext, location }: HeadProps<SourcePageData, SourcePageContext>) => {
  const source = pageContext.source;
  const title = source ? `${source.name} | News Shuffle` : 'Source | News Shuffle';
  const description = source
    ? source.description || fallbackDescription(source.name, source.canonicalKey)
    : undefined;

  return (
    <SEO
      title={title}
      description={description}
      pathname={location?.pathname}
      i18n={pageContext?.i18n}
    />
  );
};

export const query = graphql`
  query SourcePageTemplate($language: String!, $screenshotBase: String!) {
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ...LocaleFields
        }
      }
    }
    screenshotFile: file(sourceInstanceName: { eq: "screenshots" }, base: { eq: $screenshotBase }) {
      childImageSharp {
        gatsbyImageData(
          layout: CONSTRAINED
          width: 720
          height: 1280
          formats: [AUTO, WEBP, AVIF]
          placeholder: DOMINANT_COLOR
          breakpoints: [360, 540, 720]
          sizes: "(min-width:768px) 320px, 100vw"
          transformOptions: { fit: COVER, cropFocus: ATTENTION }
        )
      }
    }
  }
`;
