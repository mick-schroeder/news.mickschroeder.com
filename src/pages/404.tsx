import * as React from "react";
import { Link, HeadFC, PageProps } from "gatsby";
import { Trans } from "gatsby-plugin-react-i18next";
import { graphql } from "gatsby";
import "../fragments/locale";

const pageStyles = {
  color: "#232129",
  padding: "96px",
  fontFamily: "-apple-system, sans-serif, serif",
};
const headingStyles = {
  marginTop: 0,
  marginBottom: 64,
  maxWidth: 320,
};

const paragraphStyles = {
  marginBottom: 48,
};
const codeStyles = {
  color: "#8A6534",
  padding: 4,
  backgroundColor: "#FFF4DB",
  fontSize: "1.25rem",
  borderRadius: 4,
};

const NotFoundPage: React.FC<PageProps> = () => {
  return (
    <main style={pageStyles}>
      <h1 style={headingStyles}>
        <Trans i18nKey="notfound.title" />
      </h1>
      <p style={paragraphStyles}>
        <Trans i18nKey="notfound.message" />
        <br />
        {process.env.NODE_ENV === "development" ? (
          <>
            <br />
            Try creating a page in <code style={codeStyles}>src/pages/</code>.
            <br />
          </>
        ) : null}
        <br />
        <Link to="/"><Trans i18nKey="notfound.gohome" /></Link>.
      </p>
    </main>
  );
};

export default NotFoundPage;

export const Head: HeadFC = () => <title>Not found</title>;

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
