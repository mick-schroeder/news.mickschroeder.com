import * as React from 'react';
import { graphql, type HeadProps, type PageProps } from 'gatsby';
import { ArrowRight, ExternalLink, ListFilter, Tags } from 'lucide-react';
import { TAG_CONFIG } from '@/config/tag-config';
import { Trans, useTranslation } from 'gatsby-plugin-react-i18next';
import SiteLayout from '@/components/site-layout';
import LocalizedLink from '@/components/LocalizedLink';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SEO, type SEOI18n } from '@/components/seo';
import type { TaxonomyItem } from '@/lib/taxonomy';
import { cn } from '@/lib/utils';
import '../fragments/locale';

type TaxonomyKind = 'lists' | 'tags';

type TaxonomyIndexPageData = {
  locales?: unknown;
};

type TaxonomyIndexPageContext = {
  kind: TaxonomyKind;
  items: TaxonomyItem[];
  i18n?: SEOI18n;
};

const taxonomyConfig = {
  lists: {
    titleKey: 'taxonomy.lists_title',
    titleDefault: 'Lists',
    descriptionKey: 'taxonomy.lists_description',
    descriptionDefault: 'Browse the source lists that power News Shuffle.',
    emptyKey: 'taxonomy.no_lists',
    emptyDefault: 'No lists found.',
    Icon: ListFilter,
  },
  tags: {
    titleKey: 'taxonomy.tags_title',
    titleDefault: 'Tags',
    descriptionKey: 'taxonomy.tags_description',
    descriptionDefault: 'Browse sources by tag.',
    emptyKey: 'taxonomy.no_tags',
    emptyDefault: 'No tags found.',
    Icon: Tags,
  },
} satisfies Record<
  TaxonomyKind,
  {
    titleKey: string;
    titleDefault: string;
    descriptionKey: string;
    descriptionDefault: string;
    emptyKey: string;
    emptyDefault: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }
>;

const TaxonomyIndexPage: React.FC<PageProps<TaxonomyIndexPageData, TaxonomyIndexPageContext>> = ({
  pageContext,
}) => {
  const { t } = useTranslation();
  const config = taxonomyConfig[pageContext.kind];
  const Icon = config.Icon;
  const sortedItems = React.useMemo(
    () =>
      [...pageContext.items].sort((a, b) =>
        pageContext.kind === 'tags' ? b.count - a.count || a.name.localeCompare(b.name) : 0
      ),
    [pageContext.items, pageContext.kind]
  );

  return (
    <SiteLayout>
      <section className="mx-auto max-w-screen-lg px-4 py-8">
        <header className="mb-6">
          <div className="flex items-center gap-3">
            <Icon aria-hidden="true" className="h-6 w-6 text-primary" />
            <h1 className="text-4xl font-black tracking-normal text-foreground">
              <Trans i18nKey={config.titleKey} defaults={config.titleDefault} />
            </h1>
          </div>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            <Trans i18nKey={config.descriptionKey} defaults={config.descriptionDefault} />
          </p>
        </header>

        {sortedItems.length ? (
          pageContext.kind === 'lists' ? (
            <div className="grid gap-4">
              {sortedItems.map((item) => (
                <Card
                  key={item.id}
                  className={`overflow-hidden rounded-lg shadow-sm${item.count === 0 ? ' opacity-60' : ''}`}
                >
                  <CardContent className="p-0">
                    <div className="grid gap-4 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          {item.count === 0 ? (
                            <span className="text-lg font-semibold leading-7 text-muted-foreground">
                              {item.name}
                            </span>
                          ) : (
                            <LocalizedLink
                              to={item.path}
                              className="text-lg font-semibold leading-7 text-card-foreground hover:underline"
                            >
                              {item.name}
                            </LocalizedLink>
                          )}
                          {item.count === 0 ? (
                            <Badge variant="destructive" className="shrink-0">
                              <Trans i18nKey="taxonomy.unavailable" defaults="Unavailable" />
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="shrink-0">
                              {t('taxonomy.source_count', {
                                count: item.count,
                                defaultValue: '{{count}} sources',
                              })}
                            </Badge>
                          )}
                        </div>
                        {item.sourceUrl ? (
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener"
                            className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:underline"
                          >
                            <ExternalLink aria-hidden="true" className="h-3 w-3 shrink-0" />
                            {item.sourceUrl}
                          </a>
                        ) : null}
                        {item.description ? (
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                            {item.description}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        <Button asChild size="sm" disabled={item.count === 0}>
                          {item.count === 0 ? (
                            <span>
                              <Trans i18nKey="taxonomy.browse_list" defaults="Browse list" />
                              <ArrowRight aria-hidden="true" className="h-4 w-4" />
                            </span>
                          ) : (
                            <LocalizedLink to={item.path}>
                              <Trans i18nKey="taxonomy.browse_list" defaults="Browse list" />
                              <ArrowRight aria-hidden="true" className="h-4 w-4" />
                            </LocalizedLink>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap gap-2">
                {sortedItems.map((item) => {
                  const cfg = TAG_CONFIG[item.name];
                  const Icon = cfg?.icon;
                  return (
                    <LocalizedLink
                      key={item.id}
                      to={item.path}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors hover:opacity-80',
                        cfg?.colorClass ?? badgeVariants({ variant: 'secondary' })
                      )}
                    >
                      {Icon && <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
                      {item.name}
                      <span className="ms-1 tabular-nums opacity-60">{item.count}</span>
                    </LocalizedLink>
                  );
                })}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                <Trans
                  i18nKey="taxonomy.tags_hint"
                  defaults="Tags are ordered by source count so the broadest topics are easiest to scan first."
                />
              </p>
            </div>
          )
        ) : (
          <p className="text-sm text-muted-foreground">
            <Trans i18nKey={config.emptyKey} defaults={config.emptyDefault} />
          </p>
        )}
      </section>
    </SiteLayout>
  );
};

export default TaxonomyIndexPage;

export const Head = ({
  pageContext,
  location,
}: HeadProps<TaxonomyIndexPageData, TaxonomyIndexPageContext>) => {
  const config = taxonomyConfig[pageContext.kind];

  return (
    <SEO
      titleFallback={`${config.titleDefault} | News Shuffle`}
      titleKey={config.titleKey}
      pathname={location?.pathname}
      i18n={pageContext?.i18n}
    />
  );
};

export const query = graphql`
  query TaxonomyIndexPageTemplate($language: String!) {
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ...LocaleFields
        }
      }
    }
  }
`;
