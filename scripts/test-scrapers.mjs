import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCRAPERS } from './scraper-config.mjs';
import { extractSourceCandidates, loadIgnoreRules } from './lib/source-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const IGNORE_FILE = path.join(ROOT, 'src/data/aggregator-ignore-urls.txt');

const fixtures = {
  'drudge-report': {
    html: `
      <a href="https://www.drudgereport.com/">internal</a>
      <a href="https://www.nytimes.com/2026/06/12/story.html">NYT</a>
      <a href="https://archive.is/example">archive</a>
      <a href="mailto:test@example.com">mail</a>
    `,
    includes: ['nytimes.com', 'drudgereport.com'],
    excludes: ['archive.is'],
  },
  'skimfeed': {
    html: `
      <a href="/tech">internal</a>
      <a href="https://arstechnica.com/gadgets/thing">Ars</a>
      <a href="https://x.com/skimfeed">social</a>
    `,
    includes: ['arstechnica.com'],
    excludes: ['skimfeed.com', 'x.com'],
  },
  'realclearpolitics': {
    html: `
      <a href="https://www.realclearpolitics.com/articles/example.html">internal</a>
      <a href="https://www.wsj.com/opinion/example">WSJ</a>
      <a href="https://www.washingtonexaminer.com/news/story">Examiner</a>
    `,
    includes: ['wsj.com', 'washingtonexaminer.com'],
    excludes: ['realclearpolitics.com'],
  },
  'techmeme': {
    html: `
      <a href="https://www.techmeme.com/260612/p1">internal</a>
      <a href="https://www.theverge.com/2026/6/12/story">The Verge</a>
      <a href="https://techcrunch.com/2026/06/12/story/">TechCrunch</a>
    `,
    includes: ['theverge.com', 'techcrunch.com'],
    excludes: ['techmeme.com'],
  },
  'memeorandum': {
    html: `
      <a href="https://www.memeorandum.com/260612/p1">internal</a>
      <a href="https://apnews.com/article/example">AP</a>
      <a href="https://www.politico.com/news/2026/06/12/story">Politico</a>
      <a href="https://www.wesmirch.com/">WeSmirch</a>
    `,
    includes: ['apnews.com', 'politico.com'],
    excludes: ['memeorandum.com', 'wesmirch.com'],
  },
  'mediagazer': {
    html: `
      <a href="https://mediagazer.com/260612/p1">internal</a>
      <a href="https://www.niemanlab.org/2026/06/story/">Nieman Lab</a>
      <a href="https://variety.com/2026/tv/news/story/">Variety</a>
    `,
    includes: ['niemanlab.org', 'variety.com'],
    excludes: ['mediagazer.com'],
  },
};

const main = async () => {
  const ignoreRules = await loadIgnoreRules(IGNORE_FILE);

  for (const scraper of SCRAPERS) {
    const fixture = fixtures[scraper.id];
    assert.ok(fixture, `Missing fixture for ${scraper.id}`);
    const keys = new Set(
      extractSourceCandidates(fixture.html, scraper, ignoreRules).map(
        (candidate) => candidate.canonicalKey
      )
    );

    for (const key of fixture.includes)
      assert.ok(keys.has(key), `${scraper.id} should include ${key}`);
    for (const key of fixture.excludes)
      assert.ok(!keys.has(key), `${scraper.id} should skip ${key}`);
  }

  console.log(`Scraper fixtures passed for ${SCRAPERS.length} aggregators.`);
};

main().catch((error) => {
  console.error(`[test:scrapers] ${error.message}`);
  process.exit(1);
});
