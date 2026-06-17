import * as React from 'react';
import type { HeadProps, PageProps } from 'gatsby';
import SiteLayout from '../components/site-layout';
import Hero from '../components/hero';
import TagPills from '../components/tag-pills';
import TopSources from '../components/top-sources';
import SourceDirectory from '../components/source-directory';
import { SEO } from '../components/seo';
import type { SEOI18n } from '../components/seo';
import { Trans } from 'gatsby-plugin-react-i18next';
import { graphql } from 'gatsby';
import { Newspaper, TrendingUp } from 'lucide-react';
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

const IndexPage: React.FC<PageProps<any>> = ({ data }) => {
  const items: HomeSource[] = data?.sourcesData?.sources ?? [];

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
          <div className="mb-4 flex flex-col gap-1 pb-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl py-2 font-extrabold tracking-tight flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-primary" aria-hidden="true" />
                {site.copyOverrides?.sourcesLabel || <Trans i18nKey="sources" defaults="Sources" />}
              </h2>
            </div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              <Trans
                i18nKey="home_page.sources_count"
                defaults="{{count}} SOURCES"
                values={{ count: items.length }}
              />
            </p>
          </div>
          <SourceDirectory items={items} />
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
      sources {
        ...NewsSourceCardFields
      }
    }
  }
`;
