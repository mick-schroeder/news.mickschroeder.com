import * as React from 'react';
import { Link, graphql, HeadProps } from 'gatsby';
import { Trans } from 'gatsby-plugin-react-i18next';
import { House } from 'lucide-react';
import SiteLayout from '../components/site-layout';
import { Button } from '../components/ui/button';
import { SEO } from '../components/seo';
import type { SEOLocaleData, SEOI18n } from '../components/seo';
import '../fragments/locale';

const NotFoundPage: React.FC = () => {
  return (
    <SiteLayout>
      <main className="mx-auto max-w-prose px-6 py-20 text-center">
        <p
          aria-hidden="true"
          className="text-7xl font-black tracking-tight text-muted-foreground/30"
        >
          404
        </p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">
          <Trans i18nKey="notfound.title" />
        </h1>
        <p className="mt-4 text-pretty text-base text-muted-foreground">
          <Trans i18nKey="notfound.message" />
        </p>
        <Button asChild size="lg" className="mt-8 rounded-full px-7">
          <Link to="/">
            <House aria-hidden="true" className="h-4 w-4" />
            <Trans i18nKey="notfound.gohome" />
          </Link>
        </Button>
      </main>
    </SiteLayout>
  );
};

export default NotFoundPage;
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
      titleKey="notfound.head_title"
      titleFallback="404 — Page not found"
      localeData={data}
      noindex
      disableAds
      pathname={location?.pathname}
      i18n={pageContext?.i18n}
    />
  );
};

export const query = graphql`
  query NotFoundPageQuery($language: String!) {
    locales: allLocale(filter: { language: { eq: $language } }) {
      edges {
        node {
          ...LocaleFields
        }
      }
    }
  }
`;
