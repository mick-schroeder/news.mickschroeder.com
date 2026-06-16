import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCRAPERS } from './scraper-config.mjs';
import { extractSourceCandidates, loadIgnoreRules } from './lib/source-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const IGNORE_FILE = path.join(ROOT, 'src/data/aggregator-ignore-urls.txt');

const skimfeedFixture = {
  html: `
    <a href="/tech">internal</a>
    <a href="https://arstechnica.com/gadgets/thing">Ars</a>
    <a href="https://x.com/skimfeed">social</a>
  `,
  includes: ['arstechnica.com'],
  excludes: ['skimfeed.com', 'x.com'],
};

const brutalistFixture = {
  html: `
    <nav>
      <a href="/">Home</a>
      <a href="/topic/news?">News</a>
      <a href="https://apps.apple.com/app/brutalist-report/id123">iOS App</a>
    </nav>
    <a href="/source/nytimes">The New York Times</a>
    <a href="https://www.nytimes.com/2026/06/12/us/story.html">NYT Story</a>
    <a href="/source/apnews">AP News</a>
    <a href="https://apnews.com/article/some-story">AP Story</a>
    <a href="https://brutalist.report/about">About</a>
  `,
  includes: ['nytimes.com', 'apnews.com'],
  excludes: ['apps.apple.com', 'brutalist.report'],
};

const fixtures = {
  drudgereport: {
    html: `
      <a href="https://www.drudgereport.com/">internal</a>
      <a href="https://www.nytimes.com/2026/06/12/story.html">NYT</a>
      <a href="https://archive.is/example">archive</a>
      <a href="mailto:test@example.com">mail</a>
    `,
    includes: ['nytimes.com', 'drudgereport.com'],
    excludes: ['archive.is'],
  },
  'skimfeed-news': skimfeedFixture,
  'skimfeed-tech': skimfeedFixture,
  'skimfeed-politics': skimfeedFixture,
  'skimfeed-science': skimfeedFixture,
  'skimfeed-agg': skimfeedFixture,
  realclearpolitics: {
    html: `
      <a href="https://www.realclearpolitics.com/articles/example.html">internal</a>
      <a href="https://www.wsj.com/opinion/example">WSJ</a>
      <a href="https://www.washingtonexaminer.com/news/story">Examiner</a>
    `,
    includes: ['wsj.com', 'washingtonexaminer.com'],
    excludes: ['realclearpolitics.com'],
  },
  techmeme: {
    html: `
      <opml version="1.1">
        <body>
          <outline text="The Verge" type="rss" htmlUrl="https://www.theverge.com/" xmlUrl="https://feeds.example.com/theverge"/>
          <outline text="TechCrunch" type="link" url="https://techcrunch.com/"/>
        </body>
      </opml>
    `,
    includes: ['theverge.com', 'techcrunch.com'],
    excludes: ['feeds.example.com', 'techmeme.com'],
    names: {
      'theverge.com': 'The Verge',
      'techcrunch.com': 'TechCrunch',
    },
  },
  memeorandum: {
    html: `
      <opml version="1.1">
        <body>
          <outline text="Associated Press" type="rss" htmlUrl="https://apnews.com/" xmlUrl="https://feeds.example.com/ap"/>
          <outline text="Politico" type="rss" htmlUrl="https://www.politico.com/" xmlUrl="https://www.politico.com/rss/politicopicks.xml"/>
          <outline text="WeSmirch" type="link" url="https://www.wesmirch.com/"/>
        </body>
      </opml>
    `,
    includes: ['apnews.com', 'politico.com'],
    excludes: ['feeds.example.com', 'memeorandum.com', 'wesmirch.com'],
    names: {
      'apnews.com': 'Associated Press',
      'politico.com': 'Politico',
    },
  },
  mediagazer: {
    html: `
      <opml version="1.1">
        <body>
          <outline text="Nieman Lab" type="rss" htmlUrl="https://www.niemanlab.org/" xmlUrl="https://www.niemanlab.org/feed/"/>
          <outline text="Variety" type="rss" htmlUrl="https://variety.com/" xmlUrl="https://feeds.feedburner.com/variety/headlines"/>
        </body>
      </opml>
    `,
    includes: ['niemanlab.org', 'variety.com'],
    excludes: ['feedburner.com', 'mediagazer.com'],
    names: {
      'niemanlab.org': 'Nieman Lab',
      'variety.com': 'Variety',
    },
  },
  'brutalist-news': {
    ...brutalistFixture,
    includes: [...brutalistFixture.includes, 'brutalist.report'],
    excludes: ['apps.apple.com'],
  },
  'brutalist-tech': brutalistFixture,
  'brutalist-business': brutalistFixture,
  'brutalist-science': brutalistFixture,
  'brutalist-gaming': brutalistFixture,
  'brutalist-culture': brutalistFixture,
  'brutalist-politics': brutalistFixture,
  'clone-fyi': {
    html: JSON.stringify({
      articles: [
        { url: 'https://www.theverge.com/2026/06/12/example' },
        { url: 'https://clone.fyi/items/internal' },
        { url: 'https://x.com/clonefyi/status/123' },
      ],
    }),
    includes: ['theverge.com', 'clone.fyi'],
    excludes: ['x.com'],
  },
};

const main = async () => {
  const ignoreRules = await loadIgnoreRules(IGNORE_FILE);

  for (const scraper of SCRAPERS) {
    const fixture = fixtures[scraper.id];
    assert.ok(fixture, `Missing fixture for ${scraper.id}`);
    const candidates = extractSourceCandidates(fixture.html, scraper, ignoreRules);
    const keys = new Set(candidates.map((candidate) => candidate.canonicalKey));
    const names = new Map(candidates.map((candidate) => [candidate.canonicalKey, candidate.name]));

    for (const key of fixture.includes)
      assert.ok(keys.has(key), `${scraper.id} should include ${key}`);
    for (const key of fixture.excludes)
      assert.ok(!keys.has(key), `${scraper.id} should skip ${key}`);
    for (const [key, name] of Object.entries(fixture.names || {}))
      assert.equal(names.get(key), name, `${scraper.id} should name ${key} as ${name}`);
  }

  console.log(`Scraper fixtures passed for ${SCRAPERS.length} aggregators.`);
};

main().catch((error) => {
  console.error(`[test:scrapers] ${error.message}`);
  process.exit(1);
});
