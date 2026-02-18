import type { SiteConfig } from '../getSiteConfig';

export const newsSiteConfig: SiteConfig = {
  key: 'news',
  siteName: "Mick Schroeder's News Shuffle",
  siteShortName: 'News Shuffle',
  siteDescription:
    "Mick Schroeder's News Shuffle is your shuffle button for the news. Stay informed as we take you across the Internet's top news sites.",
  defaultLanguage: 'en',
  languages: ['en', 'ga'],
  sourcesFile: 'sources.news.json',
  navbarBrandLabel: "Mick Schroeder's News Shuffle",
};
