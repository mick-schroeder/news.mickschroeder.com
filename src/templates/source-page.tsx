import * as React from 'react';
import { graphql, navigate, type HeadProps, type PageProps } from 'gatsby';
import { GatsbyImage, getImage, StaticImage } from 'gatsby-plugin-image';
import { useTranslation } from 'gatsby-plugin-react-i18next';
import { ArrowLeft, ArrowRight, ExternalLink, ListFilter, Shuffle, Tags } from 'lucide-react';
import LocalizedLink from '@/components/LocalizedLink';
import SiteLayout from '@/components/site-layout';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO, type SEOI18n } from '@/components/seo';
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

  const description = source.description || fallbackDescription(source.name, source.canonicalKey);

  return (
    <SiteLayout>
      <article className="mx-auto max-w-screen-lg px-4 py-8">
        <header className="mb-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(220px,320px)] md:items-start">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">{source.canonicalKey}</p>
            <h1 className="mt-2 text-4xl font-black tracking-normal text-foreground">
              {source.name}
            </h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <a href={source.url} target="_blank" rel="noopener">
                  Visit Source
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                </a>
              </Button>
              {Number.isFinite(source.score) && (
                <Badge variant="outline" className="h-10 px-3 text-muted-foreground">
                  Score {source.score.toFixed(1)}
                </Badge>
              )}
            </div>
          </div>

          <a
            href={source.url}
            target="_blank"
            rel="noopener"
            className="group block overflow-hidden rounded-xl border bg-muted shadow-sm motion-safe:transition-all hover:border-primary/40 hover:shadow-md"
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
                  formats={['auto', 'webp', 'avif']}
                />
              )}
            </AspectRatio>
          </a>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ListFilter aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                Lists
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {sourceLists.map((list) => (
                <LocalizedLink
                  key={list.id}
                  to={list.path}
                  className={badgeVariants({ variant: 'secondary' })}
                >
                  {list.name}
                </LocalizedLink>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Tags aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {source.tags.map((tag) => (
                <LocalizedLink
                  key={tag}
                  to={tagPath(tag)}
                  className={badgeVariants({ variant: 'outline' })}
                >
                  {tag}
                </LocalizedLink>
              ))}
            </CardContent>
          </Card>
        </div>

        {navigation ? (
          <nav
            aria-label="Source navigation"
            className="mt-8 flex flex-wrap items-center justify-center gap-2 border-t pt-6"
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
