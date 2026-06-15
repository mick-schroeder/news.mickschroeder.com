import * as React from 'react';
import { graphql, type HeadProps, type PageProps } from 'gatsby';
import { ExternalLink, ListFilter, Tags } from 'lucide-react';
import { TAG_CONFIG } from '@/config/tag-config';
import { Trans } from 'gatsby-plugin-react-i18next';
import SourcesDataTable from '@/components/sources-data-table';
import SiteLayout from '@/components/site-layout';
import SourceBrowserShell from '@/components/source-browser-shell';
import { Button } from '@/components/ui/button';
import { SEO, type SEOI18n } from '@/components/seo';
import type { SourceSummary, TaxonomyItem } from '@/lib/taxonomy';
import { tagPath, listPath } from '@/lib/taxonomy';
import '../fragments/locale';
import '../fragments/news-source';

type TaxonomyKind = 'lists' | 'tags';

type TaxonomySource = {
  id?: string;
  name: string;
  description?: string | null;
  url: string;
  canonicalKey?: string | null;
  tags?: string[] | null;
  lists?: string[] | null;
  score?: number | string | null;
};

type TaxonomyList = {
  id: string;
  name: string;
};

type TaxonomyDetailPageData = {
  locales?: unknown;
  sourcesData?: {
    lists?: TaxonomyList[] | null;
    sources?: TaxonomySource[] | null;
  } | null;
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
    Icon: ListFilter,
  },
  tags: {
    labelKey: 'tags',
    labelDefault: 'Tags',
    Icon: Tags,
  },
} satisfies Record<
  TaxonomyKind,
  {
    labelKey: string;
    labelDefault: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }
>;

const TaxonomyDetailPage: React.FC<
  PageProps<TaxonomyDetailPageData, TaxonomyDetailPageContext>
> = ({ data, pageContext }) => {
  const { item } = pageContext;
  const config = taxonomyConfig[pageContext.kind];
  const Icon =
    pageContext.kind === 'tags' ? (TAG_CONFIG[item.name]?.icon ?? config.Icon) : config.Icon;
  const description =
    item.description ??
    (pageContext.kind === 'tags' ? TAG_CONFIG[item.name]?.description : undefined);

  const allSources = data?.sourcesData?.sources ?? [];
  const allLists = data?.sourcesData?.lists ?? [];

  const initialList = pageContext.kind === 'lists' ? item.id : undefined;
  const initialTag = pageContext.kind === 'tags' ? item.name : undefined;

  const filteredSourceCount = React.useMemo(
    () =>
      allSources.filter((s) => {
        if (initialList) return (s.lists ?? []).includes(initialList);
        if (initialTag) return (s.tags ?? []).includes(initialTag);
        return true;
      }).length,
    [allSources, initialList, initialTag]
  );

  const sidebarTags = React.useMemo(() => {
    const countMap = new Map<string, number>();
    for (const source of allSources) {
      for (const tag of source.tags ?? []) {
        countMap.set(tag, (countMap.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, path: tagPath(name) }));
  }, [allSources]);

  const sidebarLists = React.useMemo(() => {
    const countMap = new Map<string, number>();
    for (const source of allSources) {
      for (const listId of source.lists ?? []) {
        countMap.set(listId, (countMap.get(listId) ?? 0) + 1);
      }
    }
    return allLists
      .map((list) => ({
        id: list.id,
        name: list.name,
        count: countMap.get(list.id) ?? 0,
        path: listPath(list.id),
      }))
      .filter((l) => l.count > 0);
  }, [allSources, allLists]);

  return (
    <SiteLayout fullWidthMain>
      <SourceBrowserShell
        tags={sidebarTags}
        lists={sidebarLists}
        activeTag={initialTag}
        activeList={initialList}
      >
        <div className="px-4 pt-6 pb-2 lg:px-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Icon aria-hidden="true" className="h-4 w-4" />
            <Trans i18nKey={config.labelKey} defaults={config.labelDefault} />
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-foreground">{item.name}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">
              <Trans
                i18nKey="taxonomy.source_count"
                defaults="{{count}} sources"
                values={{ count: filteredSourceCount }}
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
        </div>

        <SourcesDataTable
          sources={allSources}
          lists={allLists}
          initialList={initialList}
          initialTag={initialTag}
        />
      </SourceBrowserShell>
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
    sourcesData: generatedJson {
      lists {
        id
        name
      }
      sources {
        ...NewsSourceCardFields
      }
    }
  }
`;
