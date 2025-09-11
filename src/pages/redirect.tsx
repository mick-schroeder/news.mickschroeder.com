import React, { useEffect } from "react";
import { useNextSiteContext } from "../components/next-site-context";
import SiteLayout from "../components/site-layout"; // Import the Layout component
import Redirecter from "../components/redirect";
import { SEO } from "../components/seo";
import { Trans } from "gatsby-plugin-react-i18next";
import { graphql } from "gatsby";
import "../fragments/locale";

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
export const Head = () => <SEO title="Redirect" />;

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
