import * as React from 'react';
import { graphql, type HeadProps, type PageProps } from 'gatsby';
import { ExternalLink, ListFilter, Tags } from 'lucide-react';
import { Trans } from 'gatsby-plugin-react-i18next';
import LinkedSourceList from '@/components/linked-source-list';
import SiteLayout from '@/components/site-layout';
import { Button } from '@/components/ui/button';
import { SEO, type SEOI18n } from '@/components/seo';
import type { SourceSummary, TaxonomyItem } from '@/lib/taxonomy';
import '../fragments/locale';

type TaxonomyKind = 'lists' | 'tags';

type TaxonomyDetailPageData = {
  locales?: unknown;
};

type TaxonomyDetailPageContext = {
  kind: TaxonomyKind;
  item: TaxonomyItem;
  sources: SourceSummary[];
  i18n?: SEOI18n;
};

const taxonomyConfig = {
  lists: {
    labelKey: 'lists',
    labelDefault: 'Lists',
    emptyKey: 'taxonomy.no_sources_for_list',
    emptyDefault: 'No sources are linked to this list yet.',
    Icon: ListFilter,
  },
  tags: {
    labelKey: 'tags',
    labelDefault: 'Tags',
    emptyKey: 'taxonomy.no_sources_for_tag',
    emptyDefault: 'No sources are linked to this tag yet.',
    Icon: Tags,
  },
} satisfies Record<
  TaxonomyKind,
  {
    labelKey: string;
    labelDefault: string;
    emptyKey: string;
    emptyDefault: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }
>;

const TaxonomyDetailPage: React.FC<
  PageProps<TaxonomyDetailPageData, TaxonomyDetailPageContext>
> = ({ pageContext }) => {
  const { item, sources } = pageContext;
  const config = taxonomyConfig[pageContext.kind];
  const Icon = config.Icon;

  return (
    <SiteLayout>
      <article className="mx-auto max-w-screen-md px-4 py-8">
        <header className="mb-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Icon aria-hidden="true" className="h-4 w-4" />
            <Trans i18nKey={config.labelKey} defaults={config.labelDefault} />
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-normal text-foreground">{item.name}</h1>
          {item.description ? (
            <p className="mt-4 text-base leading-7 text-muted-foreground">{item.description}</p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium text-muted-foreground">
              <Trans
                i18nKey="taxonomy.source_count"
                defaults="{{count}} sources"
                values={{ count: sources.length }}
              />
            </p>
            {item.sourceUrl ? (
              <Button asChild variant="outline" size="sm">
                <a href={item.sourceUrl} target="_blank" rel="noopener">
                  <Trans i18nKey="taxonomy.view_original_list" defaults="View original list" />
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                </a>
              </Button>
            ) : null}
          </div>
        </header>

        <LinkedSourceList
          sources={sources}
          emptyMessage={<Trans i18nKey={config.emptyKey} defaults={config.emptyDefault} />}
        />
      </article>
    </SiteLayout>
  );
};

export default TaxonomyDetailPage;

export const Head = ({
  pageContext,
  location,
}: HeadProps<TaxonomyDetailPageData, TaxonomyDetailPageContext>) => {
  const title = `${pageContext.item.name} | News Shuffle`;
  const description =
    pageContext.item.description ||
    `${pageContext.item.name} sources on Mick Schroeder's News Shuffle.`;

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
  query TaxonomyDetailPageTemplate($language: String!) {
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ...LocaleFields
        }
      }
    }
  }
`;
