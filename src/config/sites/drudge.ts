import type { SiteConfig } from '../getSiteConfig';

export const drudgeSiteConfig: SiteConfig = {
  key: 'drudge',
  siteName: 'Mick Schroeder\'s Drudge Report Shuffle',
  siteShortName: 'Drudge Shuffle',
  siteDescription: 'Shuffle through the sources linked on the Drudge Report.',
  defaultLanguage: 'en',
  languages: ['en'],
  sourcesFile: 'sources.drudge.json',
  navbarBrandLabel: 'Mick Schroeder\'s Drudge Report Shuffle',
  copyOverrides: {
    heroHeadline: 'Shuffle through sources linked by Drudge.',
    heroTagline:
      'Drudge Shuffle sends you straight to sites currently linked from Drudge Report, without added commentary or clickbait wrappers.',
    sourcesLabel: 'Drudge Sources',
    shuffleLabel: 'Drudge Shuffle',
    bookmarkTitle: 'Bookmark the Drudge Shuffle link',
    bookmarkDescription:
      'Drag this link to your bookmarks bar, or right-click it and choose Bookmark link for fast access.',
    bookmarkLinkLabel: 'Drudge Shuffle',
    footerLicense: 'Drudge Shuffle is open-source and available under the MIT License.',
    footerDisclaimer:
      'Drudge Shuffle provides outbound links for convenience. We do not control or endorse third-party content and are not responsible for external site accuracy, availability, or policies.',
  },
};
