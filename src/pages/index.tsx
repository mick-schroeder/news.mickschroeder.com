import * as React from 'react';
import type { PageProps } from 'gatsby';
// import { Link } from "gatsby";
import CardsSources from '../components/sources-gallery';
import RedirectButton from '../components/redirect-button';
import SiteLayout from '../components/site-layout';
import Hero from '../components/hero';
import BookmarkCTA from '../components/bookmark-cta';
import { SEO } from '../components/seo';
import { Trans } from 'gatsby-plugin-react-i18next';
import { graphql } from 'gatsby';
import { Newspaper } from 'lucide-react';
import '../fragments/locale';
type IndexData = {
  allSourcesJson: {
    nodes: any[];
  };
};

const IndexPage: React.FC<PageProps<IndexData>> = ({ data }) => {
  return (
    <SiteLayout>
      <div className="lg:max-w-screen-lg">
        <section className="px-4">
          <Hero />
        </section>
        <section className="px-4">
          <BookmarkCTA />
        </section>
        {
          <section>
            <div className="py-4 px-4 mx-auto max-w-screen-xl lg:px-6">
              <h2 className="text-2xl py-4 font-extrabold text-foreground flex items-center gap-2">
                <Newspaper className="w-6 h-6" aria-hidden="true" />
                <Trans i18nKey="sources" defaults="Sources" />
              </h2>

              <CardsSources items={data.allSourcesJson.nodes} sort="rating" />

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

export const Head = () => <SEO />;

export const query = graphql`
  query IndexPageQuery($language: String!) {
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ...LocaleFields
        }
      }
    }
    allSourcesJson {
      nodes {
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
              quality: 75
              placeholder: DOMINANT_COLOR
              breakpoints: [360, 720]
              sizes: "(min-width:768px) 33vw, (min-width:640px) 50vw, 100vw"
              aspectRatio: 0.5625
            )
          }
        }
      }
    }
  }
`;
