export type SiteVariantKey = 'webshuffle';

export type SiteConfig = {
  key: SiteVariantKey;
  siteName: string;
  siteShortName: string;
  siteDescription: string;
  defaultLanguage: string;
  languages: string[];
  navbarBrandLabel: string;
  copyOverrides?: {
    heroHeadline?: string;
    heroTagline?: string;
    sourcesLabel?: string;
    shuffleLabel?: string;
    bookmarkTitle?: string;
    bookmarkDescription?: string;
    bookmarkLinkLabel?: string;
    footerLicense?: string;
    footerDisclaimer?: string;
  };
};

const WEB_SHUFFLE_CONFIG: SiteConfig = {
  key: 'webshuffle',
  siteName: "Mick Schroeder's News Shuffle",
  siteShortName: 'News Shuffle',
  siteDescription:
    "Mick Schroeder's News Shuffle is your shuffle button for curated news and aggregator source lists across the web.",
  defaultLanguage: 'en',
  languages: ['en', 'ga'],
  navbarBrandLabel: "Mick Schroeder's News Shuffle",
};

export const getSiteConfig = (): SiteConfig => WEB_SHUFFLE_CONFIG;
