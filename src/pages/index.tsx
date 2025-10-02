import * as React from 'react';
import type { HeadProps, PageProps } from 'gatsby';
import CardsSources from '../components/sources-gallery';
import RedirectButton from '../components/redirect-button';
import SiteLayout from '../components/site-layout';
import Hero from '../components/hero';
import { SEO } from '../components/seo';
import type { SEOI18n } from '../components/seo';
import { Trans } from 'gatsby-plugin-react-i18next';
import { graphql } from 'gatsby';
import { Newspaper } from 'lucide-react';
import '../fragments/locale';

const IndexPage: React.FC<PageProps<any>> = ({ data }) => {
  const items = data.allDataJson?.nodes?.[0]?.sources ?? [];
  return (
    <SiteLayout>
      <div className="lg:max-w-screen-lg md:pt-7 lg:pt-14">
        <section className="px-4">
          <Hero />
        </section>
        {
          <section>
            <div className="py-4 px-4 mx-auto max-w-screen-xl lg:px-6">
              <h2 className="text-2xl py-4 font-extrabold flex items-center gap-2">
                <Newspaper className="w-6 h-6 text-primary" aria-hidden="true" />
                <Trans i18nKey="sources" defaults="Sources" />
              </h2>

              <CardsSources items={items} sort="rating" />

              <div className="text-center mt-8">
                {' '}
                <RedirectButton />
              </div>
            </div>
          </section>
        }
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
    allDataJson {
      nodes {
        sources {
          name
          score
          categories
          url
          hash
          screenshot {
            childImageSharp {
              gatsbyImageData(
                width: 720
                formats: [AUTO, WEBP, AVIF]
                placeholder: BLURRED
                breakpoints: [360, 720]
                sizes: "(min-width:768px) 33vw, (min-width:640px) 50vw, 100vw"
                aspectRatio: 0.5625
              )
            }
          }
        }
      }
    }
  }
`;
