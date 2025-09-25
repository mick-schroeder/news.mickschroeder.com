import React from 'react'
import { Link, graphql } from 'gatsby';
import { Trans } from 'gatsby-plugin-react-i18next';
import SiteLayout from '../components/site-layout';
import { SEO } from '../components/seo';
import '../fragments/locale';

const NotFoundPage = () => {
  return (
    <SiteLayout>
      <main className="mx-auto max-w-prose py-16 px-6 text-center">
        <h1 className="mb-6 text-3xl font-bold">
          <Trans i18nKey="notfound.title" />
        </h1>
        <p className="mb-8 text-base text-muted-foreground">
          <Trans i18nKey="notfound.message" />
        </p>
        <Link to="/" className="underline underline-offset-4 hover:no-underline">
          <Trans i18nKey="notfound.gohome" />
        </Link>
      </main>
    </SiteLayout>
  );
};

export default NotFoundPage;
export const Head = () => <SEO title="404 — Not found" noindex />;

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
