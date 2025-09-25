import React from 'react'
import SiteLayout from '../components/site-layout';
import Redirecter from '../components/redirect';
import { SEO } from '../components/seo';
import { graphql } from 'gatsby';
import '../fragments/locale';

const RedirectPage = () => {
  return (
    <SiteLayout>
      <div className="flex items-center justify-center">
        <Redirecter />
      </div>
    </SiteLayout>
  );
};

export default RedirectPage;
export const Head = () => <SEO title="Redirect" noindex />;

export const query = graphql`
  query RedirectPageQuery($language: String!) {
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ...LocaleFields
        }
      }
    }
  }
`;
