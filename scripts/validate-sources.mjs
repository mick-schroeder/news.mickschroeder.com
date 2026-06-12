import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson } from './lib/source-utils.mjs';
import { SCORE_CONFIG } from './lib/score.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SOURCES_FILE = path.join(ROOT, 'src/data/sources.json');
const LISTS_FILE = path.join(ROOT, 'src/data/source-lists.json');

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const assertStringArray = (value, label) => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new Error(`${label} must be an array of non-empty strings.`);
  }
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const assertMetrics = (metrics, label) => {
  if (typeof metrics !== 'object' || metrics === null || Array.isArray(metrics)) {
    throw new Error(`${label} must be an object.`);
  }
  for (const field of ['firstSeen', 'lastSeen']) {
    if (typeof metrics[field] !== 'string' || !ISO_DATE.test(metrics[field])) {
      throw new Error(`${label}.${field} must be a YYYY-MM-DD date.`);
    }
  }
  if (metrics.firstSeen > metrics.lastSeen) {
    throw new Error(`${label}.firstSeen must not be after lastSeen.`);
  }
  if (
    !Number.isInteger(metrics.foundInCount) ||
    metrics.foundInCount < 0 ||
    metrics.foundInCount > SCORE_CONFIG.scraperCount
  ) {
    throw new Error(`${label}.foundInCount must be an integer 0..${SCORE_CONFIG.scraperCount}.`);
  }
};

const main = async () => {
  const sources = await readJson(SOURCES_FILE);
  const lists = await readJson(LISTS_FILE);

  if (!Array.isArray(sources)) throw new Error('src/data/sources.json must be an array.');
  if (!Array.isArray(lists)) throw new Error('src/data/source-lists.json must be an array.');

  const listIds = new Set();
  for (const list of lists) {
    if (!list.id || typeof list.id !== 'string') throw new Error('Every list needs an id.');
    if (listIds.has(list.id)) throw new Error(`Duplicate list id: ${list.id}`);
    listIds.add(list.id);
    if (!list.name || typeof list.name !== 'string') throw new Error(`${list.id} needs a name.`);
    if (list.kind !== 'curated' && list.kind !== 'scraped') {
      throw new Error(`${list.id} must have kind curated or scraped.`);
    }
    if (list.sourceUrl && !isHttpUrl(list.sourceUrl)) {
      throw new Error(`${list.id} has invalid sourceUrl: ${list.sourceUrl}`);
    }
  }

  const sourceIds = new Set();
  const sourceKeys = new Map();
  for (const source of sources) {
    if (!source.id || typeof source.id !== 'string') throw new Error('Every source needs an id.');
    if (sourceIds.has(source.id)) throw new Error(`Duplicate source id: ${source.id}`);
    sourceIds.add(source.id);

    if (!source.name || typeof source.name !== 'string') {
      throw new Error(`${source.id} needs a name.`);
    }
    if (typeof source.description !== 'string') {
      throw new Error(`${source.id}.description must be a string.`);
    }
    if (!isHttpUrl(source.url)) throw new Error(`${source.id} has invalid url: ${source.url}`);
    if (!source.canonicalKey || typeof source.canonicalKey !== 'string') {
      throw new Error(`${source.id} needs a canonicalKey.`);
    }
    assertStringArray(source.tags, `${source.id}.tags`);
    assertStringArray(source.lists, `${source.id}.lists`);
    if (source.aliases !== undefined) assertStringArray(source.aliases, `${source.id}.aliases`);
    if (!Number.isFinite(source.score) || source.score < 0 || source.score > 5) {
      throw new Error(`${source.id}.score must be a number between 0 and 5.`);
    }
    if (source.metrics !== undefined) assertMetrics(source.metrics, `${source.id}.metrics`);

    for (const listId of source.lists) {
      if (!listIds.has(listId)) throw new Error(`${source.id} references unknown list ${listId}.`);
    }

    for (const key of [source.canonicalKey, ...(source.aliases || [])]) {
      const existing = sourceKeys.get(key);
      if (existing && existing !== source.id) {
        throw new Error(`Duplicate source key ${key}: ${existing} and ${source.id}`);
      }
      sourceKeys.set(key, source.id);
    }
  }

  console.log(
    `Validated ${sources.length} sources, ${lists.length} lists, and ${sourceKeys.size} keys.`
  );
};

main().catch((error) => {
  console.error(`[sources:validate] ${error.message}`);
  process.exit(1);
});
