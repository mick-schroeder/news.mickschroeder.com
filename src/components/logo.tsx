import React from 'react'
import { graphql, useStaticQuery } from 'gatsby';
import { Trans } from 'gatsby-plugin-react-i18next';
import logo from '../images/logo-circle.svg';
import LocalizedLink from './LocalizedLink';

type LogoProps = { showAuthor?: boolean };

const Logo = ({ showAuthor = false }: LogoProps) => {
  const data = useStaticQuery(graphql`
    query LogoAuthorUrlQuery {
      site {
        siteMetadata {
          authorUrl
        }
      }
    }
  `);
  const authorUrl: string | undefined = data?.site?.siteMetadata?.authorUrl;

  return (
    <span className="inline-flex items-center">
      <LocalizedLink to="/" className="inline-flex items-center">
        <img src={logo} className="h-6 mr-2" alt="Logo" />
        <span className="text-xl font-black tracking-tighter self-center whitespace-nowrap text-foreground">
          <Trans i18nKey="brand" />
        </span>
      </LocalizedLink>
      {showAuthor && (
        <a
          href={authorUrl || '/'}
          target="_blank"
          rel="noreferrer"
          className="ml-1 text-lg tracking-tighter font-semibold text-foreground/60 hover:underline"
        >
          <Trans i18nKey="by_author" />
        </a>
      )}
    </span>
  );
};

export default Logo;
