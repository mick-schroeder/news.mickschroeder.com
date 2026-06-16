import assert from 'node:assert/strict';
import { SCRAPERS } from './scraper-config.mjs';
import {
  SCORE_CONFIG,
  applyScores,
  computeScore,
  daysBetween,
  observedBreadthNormalizer,
  pruneStaleSources,
} from './lib/score.mjs';
import { mergeScrapedSources } from './lib/source-utils.mjs';

const NOW = '2026-06-12';
const DAYS_30_AGO = '2026-05-13';
const DAYS_90_AGO = '2026-03-14';
const DAYS_91_AGO = '2026-03-13';
const DAYS_365_AGO = '2025-06-12';

const makeSource = (overrides = {}) => ({
  id: 'example-com',
  name: 'example.com',
  description: '',
  url: 'https://example.com/',
  canonicalKey: 'example.com',
  aliases: [],
  tags: [],
  lists: ['drudgereport'],
  ...overrides,
});

const main = () => {
  assert.equal(daysBetween(DAYS_30_AGO, NOW), 30);
  assert.equal(daysBetween(DAYS_90_AGO, NOW), 90);
  assert.equal(daysBetween(NOW, NOW), 0);
  assert.equal(daysBetween(NOW, DAYS_30_AGO), 0, 'daysBetween clamps negative diffs to 0');
  assert.equal(SCORE_CONFIG.scraperCount, SCRAPERS.length);

  // Curated source in 5 of 18 lists, seen today, zero tenure (first run).
  assert.equal(
    computeScore({ firstSeen: NOW, lastSeen: NOW, foundInCount: 5 }, { isCurated: true, now: NOW }),
    53
  );

  // Calibrating against the observed max keeps the current top tier from
  // topping out around 60 just because total scraper count grew.
  assert.equal(
    computeScore(
      { firstSeen: NOW, lastSeen: NOW, foundInCount: 7 },
      { isCurated: true, now: NOW, breadthNormalizer: 7 }
    ),
    80
  );

  // Curated source in all configured scraped lists after a full year.
  assert.equal(
    computeScore(
      { firstSeen: DAYS_365_AGO, lastSeen: NOW, foundInCount: SCORE_CONFIG.scraperCount },
      { isCurated: true, now: NOW }
    ),
    90
  );

  // Single-list source, 90 days tenure, unseen for 30 days.
  assert.equal(
    computeScore(
      { firstSeen: DAYS_90_AGO, lastSeen: DAYS_30_AGO, foundInCount: 1 },
      { isCurated: false, now: NOW }
    ),
    9
  );

  // Missing metrics: curated floor vs zero.
  assert.equal(computeScore(undefined, { isCurated: true, now: NOW }), 50);
  assert.equal(computeScore(undefined, { isCurated: false, now: NOW }), 0);

  // Scores never exceed the 0..100 clamp.
  assert.ok(
    computeScore(
      { firstSeen: '2000-01-01', lastSeen: NOW, foundInCount: 6 },
      { isCurated: true, now: NOW }
    ) <= 100
  );

  const scrapedListIds = new Set(['drudgereport', 'skimfeed']);
  assert.equal(
    observedBreadthNormalizer([
      makeSource({ metrics: { firstSeen: NOW, lastSeen: NOW, foundInCount: 2 } }),
      makeSource({ metrics: { firstSeen: NOW, lastSeen: NOW, foundInCount: 7 } }),
    ]),
    7
  );

  // applyScores: seen today -> foundInCount recomputed from current lists.
  let [seen] = applyScores(
    [
      makeSource({
        lists: ['drudgereport', 'skimfeed', 'news'],
        metrics: { firstSeen: DAYS_90_AGO, lastSeen: NOW, foundInCount: 0 },
      }),
    ],
    { now: NOW, scrapedListIds }
  );
  assert.equal(seen.metrics.foundInCount, 2, 'news must not count toward foundInCount');
  assert.equal(seen.metrics.firstSeen, DAYS_90_AGO);
  assert.ok(seen.score > 0);

  // applyScores: unseen this run -> metrics frozen, score decayed.
  let [unseen] = applyScores(
    [
      makeSource({
        metrics: { firstSeen: DAYS_90_AGO, lastSeen: DAYS_30_AGO, foundInCount: 1 },
      }),
    ],
    { now: NOW, scrapedListIds }
  );
  assert.deepEqual(unseen.metrics, {
    firstSeen: DAYS_90_AGO,
    lastSeen: DAYS_30_AGO,
    foundInCount: 1,
  });
  assert.equal(unseen.score, 9);

  // applyScores: refresh can calibrate against the observed top evidence count.
  const calibratedScrapedListIds = new Set(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
  let [topTier] = applyScores(
    [
      makeSource({
        lists: [...calibratedScrapedListIds, 'news'],
        metrics: { firstSeen: NOW, lastSeen: NOW, foundInCount: 0 },
      }),
    ],
    {
      now: NOW,
      scrapedListIds: calibratedScrapedListIds,
      calibrateBreadthToObservedMax: true,
    }
  );
  assert.equal(topTier.metrics.foundInCount, 7);
  assert.equal(topTier.score, 80);

  // applyScores: no metrics but scraped membership -> seeded (migration path).
  let [seeded] = applyScores([makeSource({ lists: ['drudgereport', 'skimfeed'] })], {
    now: NOW,
    scrapedListIds,
  });
  assert.deepEqual(seeded.metrics, { firstSeen: NOW, lastSeen: NOW, foundInCount: 2 });

  // applyScores: curated-only source without metrics stays metrics-free at the floor.
  let [curatedOnly] = applyScores([makeSource({ lists: ['news'] })], {
    now: NOW,
    scrapedListIds,
  });
  assert.equal(curatedOnly.metrics, undefined);
  assert.equal(curatedOnly.score, 50);

  // pruneStaleSources: 90 days is kept, 91 is pruned, curated never pruned.
  const atBoundary = makeSource({
    id: 'boundary',
    metrics: { firstSeen: DAYS_91_AGO, lastSeen: DAYS_90_AGO, foundInCount: 1 },
  });
  const past = makeSource({
    id: 'past',
    canonicalKey: 'past.example.com',
    metrics: { firstSeen: DAYS_91_AGO, lastSeen: DAYS_91_AGO, foundInCount: 1 },
  });
  const curatedPast = makeSource({
    id: 'curated-past',
    canonicalKey: 'curated.example.com',
    lists: ['news'],
    metrics: { firstSeen: DAYS_91_AGO, lastSeen: DAYS_91_AGO, foundInCount: 1 },
  });
  const noEvidence = makeSource({
    id: 'no-evidence',
    canonicalKey: 'noevidence.example.com',
    lists: [],
  });
  const detachedToday = makeSource({
    id: 'detached-today',
    canonicalKey: 'detached.example.com',
    lists: [],
    metrics: { firstSeen: NOW, lastSeen: NOW, foundInCount: 0 },
  });
  const { kept, pruned } = pruneStaleSources(
    [atBoundary, past, curatedPast, noEvidence, detachedToday],
    {
      now: NOW,
    }
  );
  assert.deepEqual(
    kept.map((source) => source.id),
    ['boundary', 'curated-past']
  );
  assert.deepEqual(
    pruned.map((source) => source.id),
    ['past', 'no-evidence', 'detached-today']
  );

  const defaultPrune = pruneStaleSources([detachedToday], {
    now: NOW,
  });
  assert.deepEqual(
    defaultPrune.pruned.map((source) => source.id),
    ['detached-today']
  );

  // pruneStaleSources: development override can purge anything not seen today.
  const immediate = pruneStaleSources([atBoundary, past, curatedPast, noEvidence], {
    now: NOW,
    pruneAfterDays: 0,
  });
  assert.deepEqual(
    immediate.kept.map((source) => source.id),
    ['curated-past']
  );
  assert.deepEqual(
    immediate.pruned.map((source) => source.id),
    ['boundary', 'past', 'no-evidence']
  );
  const protectedPast = makeSource({
    id: 'protected-past',
    canonicalKey: 'protected.example.com',
    lists: ['realclearpolitics'],
    metrics: { firstSeen: DAYS_91_AGO, lastSeen: DAYS_91_AGO, foundInCount: 1 },
  });
  const protectedPrune = pruneStaleSources([protectedPast, past], {
    now: NOW,
    pruneAfterDays: 0,
    protectedListIds: new Set(['realclearpolitics']),
  });
  assert.deepEqual(
    protectedPrune.kept.map((source) => source.id),
    ['protected-past']
  );
  assert.deepEqual(
    protectedPrune.pruned.map((source) => source.id),
    ['past']
  );

  // mergeScrapedSources: dropping off a list keeps the source and its metrics.
  const dropped = mergeScrapedSources({
    sources: [
      makeSource({
        metrics: { firstSeen: DAYS_90_AGO, lastSeen: DAYS_30_AGO, foundInCount: 1 },
      }),
    ],
    listId: 'drudgereport',
    candidates: [],
    runDate: NOW,
  });
  assert.equal(dropped.length, 1, 'source must survive dropping off its last list');
  assert.deepEqual(dropped[0].lists, []);
  assert.equal(dropped[0].metrics.firstSeen, DAYS_90_AGO);

  // mergeScrapedSources: found again -> lastSeen advances, firstSeen preserved.
  const refound = mergeScrapedSources({
    sources: [
      makeSource({
        metrics: { firstSeen: DAYS_90_AGO, lastSeen: DAYS_30_AGO, foundInCount: 1 },
      }),
    ],
    listId: 'drudgereport',
    candidates: [{ canonicalKey: 'example.com' }],
    runDate: NOW,
  });
  assert.equal(refound[0].metrics.firstSeen, DAYS_90_AGO);
  assert.equal(refound[0].metrics.lastSeen, NOW);

  // mergeScrapedSources: brand-new source gets seeded metrics and no score yet.
  const created = mergeScrapedSources({
    sources: [],
    listId: 'drudgereport',
    candidates: [{ canonicalKey: 'new.example.com' }],
    runDate: NOW,
  });
  assert.deepEqual(created[0].metrics, { firstSeen: NOW, lastSeen: NOW, foundInCount: 0 });
  assert.equal(created[0].score, undefined);

  console.log('Score tests passed.');
};

try {
  main();
} catch (error) {
  console.error(`[test:score] ${error.message}`);
  process.exit(1);
}
