import React from 'react';
import { Trans } from 'gatsby-plugin-react-i18next';
import { useStaticQuery, graphql } from 'gatsby';
// Trans imported above
import { Separator } from './ui/separator';
import LocalizedLink from './LocalizedLink';
import { getSiteConfig } from '../config/getSiteConfig';

const currentYear = new Date().getFullYear();
const site = getSiteConfig();

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
  const licenseUrl = 'https://github.com/mick-schroeder/news.mickschroeder.com/blob/main/LICENSE';
  const contentLicenseUrl = 'https://creativecommons.org/licenses/by/4.0/';
  const repoUrl = 'https://github.com/mick-schroeder/news.mickschroeder.com';
  const contactEmail = 'contact@mickschroeder.com';

  return (
    <div>
      <Separator className="my-0" />
      <footer>
        <div className="mx-auto w-full max-w-screen-md px-4 py-10">
          <div className="text-center text-sm text-muted-foreground">
            <p className="text-foreground">
              {site.siteName}™ © {data.site.siteMetadata.foundingYear}-{currentYear}{' '}
              <a href={data.site.siteMetadata.authorUrl} className="font-semibold hover:underline">
                {data.site.siteMetadata.author}
              </a>
              .
            </p>
            <p className="mt-3">
              <LocalizedLink
                to="/terms-privacy"
                className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
              >
                <Trans i18nKey="footer.terms_privacy" defaults="Terms & Privacy" />
              </LocalizedLink>
            </p>

            <div className="mt-6 space-y-1.5 text-xs leading-relaxed">
              <p>
                {site.copyOverrides?.footerLicense ? (
                  site.copyOverrides.footerLicense
                ) : (
                  <Trans
                    i18nKey="footer.license"
                    components={{
                      link: (
                        <a
                          href={licenseUrl}
                          className="underline hover:no-underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      ),
                    }}
                  />
                )}
              </p>
              <p>
                <Trans
                  i18nKey="footer.content_license"
                  values={{ url: repoUrl }}
                  components={{
                    cc: (
                      <a
                        href={contentLicenseUrl}
                        className="underline hover:no-underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                    repo: (
                      <a
                        href={repoUrl}
                        className="underline hover:no-underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                  }}
                />
              </p>
              <p>
                <Trans i18nKey="footer.rights_reserved" />
              </p>
              <p>
                <Trans
                  i18nKey="footer.contact"
                  values={{ email: contactEmail }}
                  components={{
                    email: (
                      <a href={`mailto:${contactEmail}`} className="underline hover:no-underline" />
                    ),
                  }}
                />
              </p>
            </div>

            <p className="mx-auto mt-6 max-w-prose text-pretty text-xs leading-relaxed text-muted-foreground/80">
              {site.copyOverrides?.footerDisclaimer || <Trans i18nKey="footer.disclaimer" />}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FooterBar;
