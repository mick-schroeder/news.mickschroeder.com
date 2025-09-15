import React from 'react';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import { Script } from 'gatsby';
import { useI18next } from 'gatsby-plugin-react-i18next';

type SEOProps = {
  title?: string;
  description?: string;
  pathname?: string;
  noindex?: boolean;
  children?: React.ReactNode;
};

export const SEO: React.FC<SEOProps> = ({ title, description, pathname, noindex, children }) => {
  const {
    title: defaultTitle,
    description: defaultDescription,
    image,
    siteUrl,
    twitterUsername,
  } = useSiteMetadata();
  const { language, languages, originalPath, defaultLanguage } = useI18next() as any;

  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: `${siteUrl}${image}`,
    url: `${siteUrl}${pathname || originalPath || ''}`,
    twitterUsername,
  };

  const ogLocale = (language || defaultLanguage || 'en').toString().replace('-', '_');

  return (
    <>
      <html lang={(language || defaultLanguage || 'en').toLowerCase()} />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="google-adsense-account" content="ca-pub-6344797609391119" />
      <meta name="image" content={seo.image} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      <meta name="twitter:creator" content={seo.twitterUsername} />
      <meta name="twitter:site" content={seo.twitterUsername} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={defaultTitle} />
      <meta property="og:locale" content={ogLocale} />
      {languages &&
        defaultLanguage &&
        languages
          .filter((lng) => lng !== language)
          .map((lng) => (
            <meta key={lng} property="og:locale:alternate" content={lng.replace('-', '_')} />
          ))}
      <link rel="canonical" href={seo.url} />
      {languages &&
        defaultLanguage &&
        languages.map((lng) => {
          const href = `${siteUrl}${lng === defaultLanguage ? originalPath || '' : `/${lng}${originalPath || ''}`}`;
          return <link key={lng} rel="alternate" hrefLang={lng} href={href} />;
        })}
      {defaultLanguage && (
        <link rel="alternate" hrefLang="x-default" href={`${siteUrl}${originalPath || ''}`} />
      )}
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <script type="application/ld+json">
        {`
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "url": "${seo.url}",
        "name": "${seo.title}",
        "logo": "${siteUrl}/icons/icon-512x512.png"
      }`}
      </script>
      <script type="application/ld+json">
        {`
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "url": "${siteUrl}",
        "name": "${defaultTitle}"
      }`}
      </script>
      {process.env.NODE_ENV === 'production' && (
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6344797609391119"
          crossOrigin="anonymous"
          strategy="post-hydrate"
        />
      )}
      {children}
    </>
  );
};
