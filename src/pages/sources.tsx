import * as React from 'react';
import { graphql, type HeadProps, type PageProps } from 'gatsby';
import SourcesDataTable from '@/components/sources-data-table';
import SiteLayout from '@/components/site-layout';
import SourceBrowserShell from '@/components/source-browser-shell';
import { SEO, type SEOI18n } from '@/components/seo';
import { getSiteConfig } from '../config/getSiteConfig';
import { tagPath, listPath } from '../lib/taxonomy';
import '../fragments/locale';
import '../fragments/news-source';

const site = getSiteConfig();

type SourcesPageSource = {
  id?: string;
  name: string;
  description?: string | null;
  url: string;
  canonicalKey?: string | null;
  tags?: string[] | null;
  lists?: string[] | null;
  score?: number | string | null;
};

type SourcesPageList = {
  id: string;
  name: string;
};

type SourcesPageData = {
  sourcesData?: {
    lists?: SourcesPageList[] | null;
    sources?: SourcesPageSource[] | null;
  } | null;
};

type SourcesPageContext = {
  i18n?: SEOI18n;
};

const SourcesPage: React.FC<PageProps<SourcesPageData, SourcesPageContext>> = ({ data }) => {
  const sources = data?.sourcesData?.sources ?? [];
  const lists = data?.sourcesData?.lists ?? [];

  const sidebarTags = React.useMemo(() => {
    const countMap = new Map<string, number>();
    for (const source of sources) {
      for (const tag of source.tags ?? []) {
        countMap.set(tag, (countMap.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(countMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count, path: tagPath(name) }));
  }, [sources]);

  const sidebarLists = React.useMemo(() => {
    const countMap = new Map<string, number>();
    for (const source of sources) {
      for (const listId of source.lists ?? []) {
        countMap.set(listId, (countMap.get(listId) ?? 0) + 1);
      }
    }
    return lists
      .map((list) => ({
        id: list.id,
        name: list.name,
        count: countMap.get(list.id) ?? 0,
        path: listPath(list.id),
      }))
      .filter((l) => l.count > 0);
  }, [sources, lists]);

  return (
    <SiteLayout fullWidthMain>
      <SourceBrowserShell tags={sidebarTags} lists={sidebarLists}>
        <div className="px-4 pt-6 pb-2 lg:px-6">
          <p className="text-sm font-semibold text-muted-foreground">Source database</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-foreground">
            {site.copyOverrides?.sourcesLabel || 'Sources'}
          </h1>
        </div>
        <SourcesDataTable sources={sources} lists={lists} />
      </SourceBrowserShell>
    </SiteLayout>
  );
};

export default SourcesPage;

export const Head = ({ pageContext, location }: HeadProps<SourcesPageData, SourcesPageContext>) => (
  <SEO
    title="Sources | News Shuffle"
    description="Search, sort, and filter every source in News Shuffle."
    pathname={location?.pathname}
    i18n={pageContext?.i18n}
  />
);

export const query = graphql`
  query SourcesPageQuery($language: String!) {
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
