/**
 * Evidence-based source scoring.
 *
 * Each source carries scraper-derived metrics:
 *   "metrics": { "firstSeen": "2026-06-01", "lastSeen": "2026-06-12", "foundInCount": 3 }
 *
 * Score formula (0–100 integer):
 *   breadth = 70 * log2(1 + foundInCount) / log2(1 + breadthNormalizer)
 *                                                             // first list matters most
 *   tenure  = 10 * min(daysSince(firstSeen), 365) / 365
 *   decay   = 0.5 ^ (daysSince(lastSeen) / 30)             // half-life 30 days
 *   score   = (breadth + tenure) * decay + (curated ? 10 : 0)
 *   curated sources never sink below 50 (floor covers curated-only
 *   sources that no scraper has ever found).
 */

export const SCORE_CONFIG = {
  maxBreadth: 70,
  scraperCount: 18,
  maxTenure: 10,
  tenureCapDays: 365,
  decayHalfLifeDays: 30,
  curatedBonus: 10,
  curatedFloor: 50,
  pruneAfterDays: 90,
};

export const CURATED_LIST_ID = 'news';

export const observedBreadthNormalizer = (sources) =>
  Math.max(1, ...sources.map((source) => source.metrics?.foundInCount || 0));

export const daysBetween = (isoA, isoB) => {
  const a = Date.parse(`${isoA}T00:00:00Z`);
  const b = Date.parse(`${isoB}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
};

export const computeScore = (
  metrics,
  { isCurated, now, breadthNormalizer = SCORE_CONFIG.scraperCount }
) => {
  const config = SCORE_CONFIG;
  const normalizedBreadthCap = Math.max(
    1,
    Math.min(config.scraperCount, Number(breadthNormalizer) || config.scraperCount)
  );
  let score = 0;

  if (metrics) {
    const foundInCount = Math.min(metrics.foundInCount || 0, normalizedBreadthCap);
    const breadth =
      (config.maxBreadth * Math.log2(1 + foundInCount)) / Math.log2(1 + normalizedBreadthCap);
    const tenure =
      (config.maxTenure * Math.min(daysBetween(metrics.firstSeen, now), config.tenureCapDays)) /
      config.tenureCapDays;
    const decay = 0.5 ** (daysBetween(metrics.lastSeen, now) / config.decayHalfLifeDays);
    score = (breadth + tenure) * decay;
  }

  if (isCurated) {
    score = Math.max(score + config.curatedBonus, config.curatedFloor);
  }

  return Math.round(Math.min(Math.max(score, 0), 100));
};

export const applyScores = (
  sources,
  { now, scrapedListIds, calibrateBreadthToObservedMax = false, breadthNormalizer }
) => {
  const sourcesWithMetrics = sources.map((source) => {
    const lists = source.lists || [];
    const scrapedCount = lists.filter((id) => scrapedListIds.has(id)).length;
    let metrics = source.metrics;

    if (metrics && metrics.lastSeen === now) {
      metrics = { ...metrics, foundInCount: scrapedCount };
    } else if (!metrics && scrapedCount > 0) {
      // First run or failed-scraper protection: seed from current membership.
      metrics = { firstSeen: now, lastSeen: now, foundInCount: scrapedCount };
    }

    return metrics ? { ...source, metrics } : source;
  });

  const effectiveBreadthNormalizer = calibrateBreadthToObservedMax
    ? observedBreadthNormalizer(sourcesWithMetrics)
    : breadthNormalizer;

  return sourcesWithMetrics.map((source) => {
    const lists = source.lists || [];
    const score = computeScore(source.metrics, {
      isCurated: lists.includes(CURATED_LIST_ID),
      now,
      breadthNormalizer: effectiveBreadthNormalizer,
    });

    return { ...source, score };
  });
};

export const pruneStaleSources = (
  sources,
  { now, pruneAfterDays = SCORE_CONFIG.pruneAfterDays, protectedListIds = new Set() }
) => {
  const kept = [];
  const pruned = [];
  for (const source of sources) {
    const lists = source.lists || [];
    const isCurated = lists.includes(CURATED_LIST_ID);
    const isProtected = lists.some((id) => protectedListIds.has(id));
    // A non-curated source with no active lists has nothing keeping it in
    // the shuffle, even if it was dropped during today's refresh.
    const detached = lists.length === 0;
    const stale = source.metrics
      ? daysBetween(source.metrics.lastSeen, now) > pruneAfterDays
      : true;
    if (!isCurated && !isProtected && (detached || stale)) {
      pruned.push(source);
    } else {
      kept.push(source);
    }
  }
  return { kept, pruned };
};
