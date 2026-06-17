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
import type { TaxonomyItem } from '@/lib/taxonomy';
import '../fragments/locale';

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

type SidebarTag = {
  name: string;
  count: number;
  path: string;
};

type SidebarList = {
  id: string;
  name: string;
  count: number;
  path: string;
};

type TaxonomyDetailPageData = {
  locales?: unknown;
};

type TaxonomyDetailPageContext = {
  kind: TaxonomyKind;
  item: TaxonomyItem;
  sources: TaxonomySource[];
  lists: TaxonomyList[];
  sidebarTags: SidebarTag[];
  sidebarLists: SidebarList[];
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
> = ({ pageContext }) => {
  const { item } = pageContext;
  const config = taxonomyConfig[pageContext.kind];
  const Icon =
    pageContext.kind === 'tags' ? (TAG_CONFIG[item.name]?.icon ?? config.Icon) : config.Icon;
  const description =
    item.description ??
    (pageContext.kind === 'tags' ? TAG_CONFIG[item.name]?.description : undefined);

  const sources = pageContext.sources ?? [];
  const lists = pageContext.lists ?? [];
  const sidebarTags = pageContext.sidebarTags ?? [];
  const sidebarLists = pageContext.sidebarLists ?? [];

  const initialList = pageContext.kind === 'lists' ? item.id : undefined;
  const initialTag = pageContext.kind === 'tags' ? item.name : undefined;

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
                values={{ count: item.count }}
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
          sources={sources}
          lists={lists}
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
  }
`;
