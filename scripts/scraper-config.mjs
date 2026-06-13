export const SCRAPERS = [
  {
    id: 'drudgereport',
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
    url: 'https://www.techmeme.com/lb.opml',
    internalUrls: ['https://www.techmeme.com/', 'https://techmeme.com/'],
    sourceOpml: true,
  },
  {
    id: 'memeorandum',
    label: 'Memeorandum',
    url: 'https://www.memeorandum.com/lb.opml',
    internalUrls: ['https://www.memeorandum.com/', 'https://memeorandum.com/'],
    sourceOpml: true,
  },
  {
    id: 'mediagazer',
    label: 'Mediagazer',
    url: 'https://mediagazer.com/lb.opml',
    internalUrls: ['https://mediagazer.com/', 'https://www.mediagazer.com/'],
    sourceOpml: true,
  },
];

export const getScraperById = (id) => SCRAPERS.find((scraper) => scraper.id === id);
