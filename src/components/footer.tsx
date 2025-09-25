import React from 'react';
import { Trans } from 'gatsby-plugin-react-i18next';
import { useStaticQuery, graphql } from 'gatsby';
// Trans imported above
import { Separator } from './ui/separator';
import LocalizedLink from './LocalizedLink';

const currentYear = new Date().getFullYear();

const FooterBar: React.FC = () => {
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
      <Separator className="my-0" />
      <footer>
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
          <div className="block text-sm text-muted-foreground sm:text-center">
            <p>
              {' '}
              {<Trans i18nKey="brand" />}™ © {data.site.siteMetadata.foundingYear}-{currentYear}{' '}
              <a href={data.site.siteMetadata.authorUrl} className="font-semibold hover:underline">
                {data.site.siteMetadata.author}
              </a>
              .
            </p>
            <p className="mt-2">
              <LocalizedLink
                to="/terms-privacy"
                className="underline hover:no-underline text-foreground"
              >
                <Trans i18nKey="terms_privacy" defaults="Terms & Privacy" />
              </LocalizedLink>
            </p>
            <p className="py-4 md:p-10 text-xs text-justify text-muted-foreground">
              <Trans i18nKey="disclaimer" />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FooterBar;
