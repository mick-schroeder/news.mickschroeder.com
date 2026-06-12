/**
 * Evidence-based source scoring.
 *
 * Each source carries scraper-derived metrics:
 *   "metrics": { "firstSeen": "2026-06-01", "lastSeen": "2026-06-12", "foundInCount": 3 }
 *
 * Score formula (0..5, rounded to 2 decimals):
 *   breadth = 3.5 * log2(1 + foundInCount) / log2(1 + 6)   // first list matters most
 *   tenure  = 0.5 * min(daysSince(firstSeen), 365) / 365
 *   decay   = 0.5 ^ (daysSince(lastSeen) / 30)             // half-life 30 days
 *   score   = (breadth + tenure) * decay + (curated ? 0.5 : 0)
 *   curated sources never sink below 2.5 (floor covers curated-only
 *   sources that no scraper has ever found).
 */

export const SCORE_CONFIG = {
  maxBreadth: 3.5,
  scraperCount: 6,
  maxTenure: 0.5,
  tenureCapDays: 365,
  decayHalfLifeDays: 30,
  curatedBonus: 0.5,
  curatedFloor: 2.5,
  pruneAfterDays: 90,
};

export const CURATED_LIST_ID = 'news';

export const daysBetween = (isoA, isoB) => {
  const a = Date.parse(`${isoA}T00:00:00Z`);
  const b = Date.parse(`${isoB}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
};

export const computeScore = (metrics, { isCurated, now }) => {
  const config = SCORE_CONFIG;
  let score = 0;

  if (metrics) {
    const breadth =
      (config.maxBreadth * Math.log2(1 + (metrics.foundInCount || 0))) /
      Math.log2(1 + config.scraperCount);
    const tenure =
      (config.maxTenure * Math.min(daysBetween(metrics.firstSeen, now), config.tenureCapDays)) /
      config.tenureCapDays;
    const decay = 0.5 ** (daysBetween(metrics.lastSeen, now) / config.decayHalfLifeDays);
    score = (breadth + tenure) * decay;
  }

  if (isCurated) {
    score = Math.max(score + config.curatedBonus, config.curatedFloor);
  }

  return Math.round(Math.min(Math.max(score, 0), 5) * 100) / 100;
};

export const applyScores = (sources, { now, scrapedListIds }) =>
  sources.map((source) => {
    const lists = source.lists || [];
    const scrapedCount = lists.filter((id) => scrapedListIds.has(id)).length;
    let metrics = source.metrics;

    if (metrics && metrics.lastSeen === now) {
      metrics = { ...metrics, foundInCount: scrapedCount };
    } else if (!metrics && scrapedCount > 0) {
      // First run or failed-scraper protection: seed from current membership.
      metrics = { firstSeen: now, lastSeen: now, foundInCount: scrapedCount };
    }

    const score = computeScore(metrics, {
      isCurated: lists.includes(CURATED_LIST_ID),
      now,
    });

    return metrics ? { ...source, metrics, score } : { ...source, score };
  });

export const pruneStaleSources = (sources, { now }) => {
  const kept = [];
  const pruned = [];
  for (const source of sources) {
    const isCurated = (source.lists || []).includes(CURATED_LIST_ID);
    // No metrics after applyScores means no scraper evidence at all;
    // non-curated sources without evidence have nothing keeping them.
    const stale = source.metrics
      ? daysBetween(source.metrics.lastSeen, now) > SCORE_CONFIG.pruneAfterDays
      : true;
    if (!isCurated && stale) {
      pruned.push(source);
    } else {
      kept.push(source);
    }
  }
  return { kept, pruned };
};
