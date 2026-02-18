import { drudgeSiteConfig } from './sites/drudge';
import { newsSiteConfig } from './sites/news';

export type SiteVariantKey = 'news' | 'drudge';

export type SiteConfig = {
  key: SiteVariantKey;
  siteName: string;
  siteShortName: string;
  siteDescription: string;
  defaultLanguage: string;
  languages: string[];
  sourcesFile: 'sources.news.json' | 'sources.drudge.json';
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

const SITE_CONFIGS: Record<SiteVariantKey, SiteConfig> = {
  news: newsSiteConfig,
  drudge: drudgeSiteConfig,
};

const isSiteVariantKey = (value: string): value is SiteVariantKey =>
  value === 'news' || value === 'drudge';

export const getSiteConfig = (): SiteConfig => {
  const rawVariant = process.env.GATSBY_SITE_VARIANT || 'news';
  return isSiteVariantKey(rawVariant) ? SITE_CONFIGS[rawVariant] : SITE_CONFIGS.news;
};
