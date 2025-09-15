import React, { useEffect } from 'react';
import { useSiteMetadata } from '../hooks/use-site-metadata';
import { useI18next } from 'gatsby-plugin-react-i18next';
import { loadAdSense } from '../lib/adsense';
import { readConsent } from '../lib/consent';

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
  } = useSiteMetadata();
  const { language, languages, originalPath, defaultLanguage } = useI18next() as any;

  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: `${siteUrl}${image}`,
    url: `${siteUrl}${pathname || originalPath || ''}`,
  };

  const ogLocale = (language || defaultLanguage || 'en').toString().replace('-', '_');

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    const consent = readConsent();
    const client = process.env.GATSBY_GOOGLE_ADSENSE_ID;
    if (consent?.ads && client) {
      loadAdSense(client);
    }
  }, []);

  return (
    <>
      <html lang={(language || defaultLanguage || 'en').toLowerCase()} />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="google-adsense-account" content={process.env.GATSBY_GOOGLE_ADSENSE_ID} />
      <meta name="image" content={seo.image} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
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
      {children}
    </>
  );
};
