import * as React from 'react';
import { graphql, type HeadProps, type PageProps } from 'gatsby';
import { Database, ListFilter, Tags } from 'lucide-react';
import SourcesDataTable from '@/components/sources-data-table';
import SiteLayout from '@/components/site-layout';
import { Card, CardContent } from '@/components/ui/card';
import { SEO, type SEOI18n } from '@/components/seo';
import { getSiteConfig } from '../config/getSiteConfig';
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
  const tagCount = React.useMemo(() => {
    const tags = new Set<string>();
    for (const source of sources) {
      for (const tag of source.tags ?? []) tags.add(tag);
    }
    return tags.size;
  }, [sources]);

  return (
    <SiteLayout>
      <main className="mx-auto w-full max-w-screen-xl px-4 py-8 lg:px-6">
        <header className="mb-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Database aria-hidden="true" className="h-4 w-4" />
                Source database
              </p>
              <h1 className="text-4xl font-black tracking-normal text-foreground sm:text-5xl">
                {site.copyOverrides?.sourcesLabel || 'Sources'}
              </h1>
              <p className="mt-3 text-base leading-7 text-muted-foreground">
                Search, sort, and filter every source in News Shuffle.
              </p>
            </div>
          </div>
        </header>

        <section className="mb-5 grid gap-3 sm:grid-cols-3">
          <Card className="rounded-lg shadow-sm">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm text-muted-foreground">Sources</p>
                <p className="text-2xl font-black tabular-nums">{sources.length}</p>
              </div>
              <Database aria-hidden="true" className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
          <Card className="rounded-lg shadow-sm">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm text-muted-foreground">Lists</p>
                <p className="text-2xl font-black tabular-nums">{lists.length}</p>
              </div>
              <ListFilter aria-hidden="true" className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
          <Card className="rounded-lg shadow-sm">
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm text-muted-foreground">Tags</p>
                <p className="text-2xl font-black tabular-nums">{tagCount}</p>
              </div>
              <Tags aria-hidden="true" className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
        </section>

        <SourcesDataTable sources={sources} lists={lists} />
      </main>
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
