import * as React from 'react';
import SiteLayout from '../components/site-layout';
import Redirecter from '../components/redirect';
import { SEO } from '../components/seo';
import type { SEOLocaleData, SEOI18n } from '../components/seo';
import { graphql, HeadProps } from 'gatsby';
import '../fragments/locale';

const RedirectPage: React.FC = () => {
  return (
    <SiteLayout>
      <div className="flex items-center justify-center">
        <Redirecter />
      </div>
    </SiteLayout>
  );
};

export default RedirectPage;
type I18nPageContext = {
  i18n?: SEOI18n;
};

export const Head = ({
  data,
  pageContext,
  location,
}: HeadProps<SEOLocaleData, I18nPageContext>) => {
  return (
    <SEO
      titleKey="redirect.head_title"
      titleFallback="Redirect"
      localeData={data}
      noindex
      disableAds
      pathname={location?.pathname}
      i18n={pageContext?.i18n}
    />
  );
};

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
