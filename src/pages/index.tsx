import * as React from 'react';
import type { HeadProps, PageProps } from 'gatsby';
import RedirectButton from '../components/redirect-button';
import SiteLayout from '../components/site-layout';
import Hero from '../components/hero';
import TagPills from '../components/tag-pills';
import TopSources from '../components/top-sources';
import SourceShelf from '../components/source-shelf';
import SourceDirectory from '../components/source-directory';
import { SEO } from '../components/seo';
import type { SEOI18n } from '../components/seo';
import { Trans } from 'gatsby-plugin-react-i18next';
import { graphql } from 'gatsby';
import { LayoutList, Newspaper, TrendingUp } from 'lucide-react';
import { getSiteConfig } from '../config/getSiteConfig';
import '../fragments/locale';
import '../fragments/news-source';

const site = getSiteConfig();

type HomeSource = {
  id?: string;
  name: string;
  description?: string | null;
  url: string;
  score?: number | string;
  tags?: string[] | null;
  lists?: string[] | null;
  hash?: string;
  screenshot?: any;
};

type HomeList = {
  id: string;
  name: string;
};

const scoreOf = (score: HomeSource['score']): number => {
  const n = parseFloat(String(score ?? '0'));
  return Number.isFinite(n) ? n : 0;
};

const IndexPage: React.FC<PageProps<any>> = ({ data }) => {
  const items: HomeSource[] = data?.sourcesData?.sources ?? [];
  const lists: HomeList[] = data?.sourcesData?.lists ?? [];

  const shelves = React.useMemo(() => {
    return lists
      .map((list) => ({
        list,
        items: items
          .filter((source) => source.lists?.includes(list.id))
          .sort((a, b) => scoreOf(b.score) - scoreOf(a.score)),
      }))
      .filter((shelf) => shelf.items.length > 0)
      .sort((a, b) => {
        if (a.list.id === 'news') return -1;
        if (b.list.id === 'news') return 1;
        return b.items.length - a.items.length;
      });
  }, [items, lists]);

  return (
    <SiteLayout>
      <div className="lg:max-w-screen-lg md:pt-7 lg:pt-10">
        <section className="px-4">
          <Hero />
          <TagPills sources={items} className="mx-auto max-w-screen-md py-4" />
        </section>

        <section className="py-8 px-4 mx-auto max-w-screen-xl lg:px-6">
          <h2 className="text-2xl py-2 font-extrabold tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" aria-hidden="true" />
            <Trans i18nKey="home_page.top_sources" defaults="Top sources" />
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            <Trans
              i18nKey="home_page.top_sources_hint"
              defaults="The highest-rated sources across all lists."
            />
          </p>
          <TopSources items={items} />
        </section>

        <section
          id="sources-gallery"
          className="scroll-mt-6 py-8 px-4 mx-auto max-w-screen-xl lg:px-6"
          style={{ scrollMarginTop: 'calc(var(--nav-h, 4rem) + 1rem)' }}
        >
          <h2 className="text-2xl py-2 font-extrabold tracking-tight flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-primary" aria-hidden="true" />
            {site.copyOverrides?.sourcesLabel || <Trans i18nKey="sources" defaults="Sources" />}
          </h2>
          <div className="mt-2 flex flex-col gap-10">
            {shelves.map((shelf, idx) => (
              <SourceShelf
                key={shelf.list.id}
                listId={shelf.list.id}
                listName={shelf.list.name}
                items={shelf.items}
                eager={idx === 0}
              />
            ))}
          </div>
        </section>

        <section className="py-8 px-4 mx-auto max-w-screen-xl lg:px-6">
          <h2 className="text-2xl py-2 font-extrabold tracking-tight flex items-center gap-2">
            <LayoutList className="w-6 h-6 text-primary" aria-hidden="true" />
            <Trans i18nKey="home_page.all_sources" defaults="All sources" />
            <span className="text-base font-normal tabular-nums text-muted-foreground">
              {items.length}
            </span>
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            <Trans i18nKey="home_page.all_sources_hint" defaults="Every source, A to Z." />
          </p>
          <SourceDirectory items={items} />

          <div className="text-center mt-10">
            <RedirectButton />
          </div>
        </section>
      </div>
    </SiteLayout>
  );
};

export default IndexPage;

type I18nPageContext = {
  i18n?: SEOI18n;
};

export const Head = ({ pageContext, location }: HeadProps<any, I18nPageContext>) => (
  <SEO pathname={location?.pathname} i18n={pageContext?.i18n} />
);

export const query = graphql`
  query IndexPageQuery($language: String!) {
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
