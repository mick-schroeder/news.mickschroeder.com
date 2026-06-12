export const SCRAPERS = [
  {
    id: 'drudge-report',
    label: 'Drudge Report',
    url: 'https://www.drudgereport.com/',
    internalUrls: [
      'https://www.drudgereport.com/',
      'https://drudgereport.com/',
      'https://www.drudgereportarchives.com/',
      'https://drudgereportarchives.com/',
    ],
    pinnedSources: [
      {
        canonicalKey: 'drudgereport.com',
        name: 'Drudge Report',
        url: 'https://drudgereport.com/',
        tags: ['Aggregator'],
      },
    ],
  },
  {
    id: 'skimfeed',
    label: 'Skimfeed',
    url: 'https://skimfeed.com/news.html',
    internalUrls: ['https://skimfeed.com/'],
  },
  {
    id: 'realclearpolitics',
    label: 'RealClearPolitics',
    url: 'https://www.realclearpolitics.com/',
    internalUrls: ['https://www.realclearpolitics.com/', 'https://realclearpolitics.com/'],
  },
  {
    id: 'techmeme',
    label: 'Techmeme',
    url: 'https://www.techmeme.com/',
    internalUrls: ['https://www.techmeme.com/', 'https://techmeme.com/'],
  },
  {
    id: 'memeorandum',
    label: 'Memeorandum',
    url: 'https://www.memeorandum.com/',
    internalUrls: ['https://www.memeorandum.com/', 'https://memeorandum.com/'],
  },
  {
    id: 'mediagazer',
    label: 'Mediagazer',
    url: 'https://mediagazer.com/',
    internalUrls: ['https://mediagazer.com/', 'https://www.mediagazer.com/'],
  },
];

export const getScraperById = (id) => SCRAPERS.find((scraper) => scraper.id === id);
