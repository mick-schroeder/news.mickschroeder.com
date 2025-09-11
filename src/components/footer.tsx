import React from "react";
import { Link } from "gatsby";
import logo from "../images/logo.svg";
import { useStaticQuery, graphql } from "gatsby";
import { Trans } from "gatsby-plugin-react-i18next";

const currentYear = new Date().getFullYear();

const FooterBar = () => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          author
          authorUrl
          foundingYear
        }
      }
    }
  `);

  return (
    <div>
      <footer className="border-t border-neutral-300 dark:border-neutral-700">
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
          <div className="block text-sm text-neutral-500 sm:text-center dark:text-neutral-400">
            <p>
              {" "}
              {<Trans i18nKey="brand" />}™ ©{" "}
              {data.site.siteMetadata.foundingYear}-{currentYear}{" "}
              <a
                href={data.site.siteMetadata.authorUrl}
                className="font-semibold hover:underline"
              >
                {data.site.siteMetadata.author}
              </a>
              .
            </p>
            <p className="py-4 md:p-10 text-xs text-justify text-neutral-500 dark:text-neutral-400">
              <Trans i18nKey="disclaimer" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FooterBar;
