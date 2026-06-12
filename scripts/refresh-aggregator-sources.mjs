import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCRAPERS, getScraperById } from './scraper-config.mjs';
import {
  extractSourceCandidates,
  loadIgnoreRules,
  mergeScrapedSources,
  readJson,
  sortSources,
  writeJson,
} from './lib/source-utils.mjs';
import { applyScores, pruneStaleSources } from './lib/score.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SOURCES_FILE = path.join(ROOT, 'src/data/sources.json');
const LISTS_FILE = path.join(ROOT, 'src/data/source-lists.json');
const IGNORE_FILE = path.join(ROOT, 'src/data/aggregator-ignore-urls.txt');

const parseArgs = () => {
  const args = new Map();
  for (const raw of process.argv.slice(2)) {
    const [key, value = 'true'] = raw.replace(/^--/, '').split('=');
    args.set(key, value);
  }
  return args;
};

const selectScrapers = (rawLists) => {
  if (!rawLists) return SCRAPERS;
  return rawLists.split(',').map((id) => {
    const scraper = getScraperById(id.trim());
    if (!scraper) throw new Error(`Unknown scraper/list id: ${id}`);
    return scraper;
  });
};

const fetchHtml = async (scraper) => {
  const response = await fetch(scraper.url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (compatible; WebShuffleBot/1.0; +https://webshuffle.mickschroeder.com)',
    },
  });

  if (!response.ok) {
    throw new Error(`${scraper.label} failed with HTTP ${response.status}`);
  }

  return response.text();
};

const main = async () => {
  const args = parseArgs();
  const dryRun = args.get('dry-run') === 'true';
  const runDate = new Date().toISOString().slice(0, 10);
  const scrapers = selectScrapers(args.get('lists'));
  const lists = await readJson(LISTS_FILE);
  const validListIds = new Set(lists.map((list) => list.id));
  const ignoreRules = await loadIgnoreRules(IGNORE_FILE);
  let sources = await readJson(SOURCES_FILE);

  let succeeded = 0;

  for (const scraper of scrapers) {
    if (!validListIds.has(scraper.id)) {
      throw new Error(`${scraper.id} is not defined in src/data/source-lists.json`);
    }

    try {
      const html = await fetchHtml(scraper);
      const candidates = extractSourceCandidates(html, scraper, ignoreRules);
      if (!candidates.length) throw new Error(`${scraper.label} returned no source candidates.`);

      sources = mergeScrapedSources({
        sources,
        listId: scraper.id,
        candidates,
        runDate,
      });

      succeeded += 1;
      console.log(`${scraper.label}: ${candidates.length} source candidates`);
    } catch (error) {
      console.warn(`[sources:refresh] ${scraper.label} skipped: ${error.message}`);
    }
  }

  if (!succeeded) {
    throw new Error('All scrapers failed; nothing to write.');
  }

  const scrapedListIds = new Set(
    lists.filter((list) => list.kind === 'scraped').map((list) => list.id)
  );
  const seededBefore = sources.filter((source) => source.metrics).length;
  sources = applyScores(sources, { now: runDate, scrapedListIds });
  const seeded = sources.filter((source) => source.metrics).length - seededBefore;

  const { kept, pruned } = pruneStaleSources(sources, { now: runDate });
  sources = kept;
  for (const source of pruned) {
    console.log(`[sources:refresh] Pruned ${source.id} (last seen ${source.metrics?.lastSeen})`);
  }

  sources = sortSources(sources);

  if (dryRun) {
    console.log(
      `[sources:refresh] Dry run complete; ${sources.length} sources would be written ` +
        `(${seeded} metrics seeded, ${pruned.length} pruned).`
    );
    console.log('[sources:refresh] Top 10 by score:');
    for (const source of [...sources].sort((a, b) => b.score - a.score).slice(0, 10)) {
      console.log(
        `  ${source.score.toFixed(2)}  ${source.canonicalKey}  (found in ${
          source.metrics?.foundInCount ?? 0
        }, lists: ${source.lists.join(', ')})`
      );
    }
    return;
  }

  await writeJson(SOURCES_FILE, sources);
  console.log(`[sources:refresh] Wrote ${sources.length} sources to ${SOURCES_FILE}`);
};

main().catch((error) => {
  console.error(`[sources:refresh] ${error.message}`);
  process.exit(1);
});
