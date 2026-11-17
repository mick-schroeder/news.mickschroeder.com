import {
  facets,
  tiers,
  type Facet,
  type Source,
  type Tag,
  type Tier,
} from "./data.ts"

export type { Facet, Source, Tag, Tier } from "./data.ts"
export { facets, tagLabel, tiers } from "./data.ts"

export type Filters = Record<Facet, string[]> & { tier: Tier[] }

export const defaultFilters: Filters = {
  topic: ["news"],
  region: [],
  feed: [],
  tier: ["S", "A", "B"],
}

export const tierRank = (tier: Tier) => tiers.indexOf(tier)

/** Tags by facet, in data order. */
export const tagsByFacet = (tags: Tag[]) =>
  Object.fromEntries(
    facets.map((facet) => [facet, tags.filter((tag) => tag.kind === facet)])
  ) as Record<Facet, Tag[]>

/** Tags with a browse page: every facet tag, in facet order. */
export const browsableTags = (tags: Tag[]) =>
  Object.values(tagsByFacet(tags)).flat()

const matchesAny = (source: Source, wanted: string[]) =>
  !wanted.length || wanted.some((tag) => source.tags.includes(tag))

/** Any match within a facet, all facets must match; empty means any. */
export function filterSources(sources: Source[], filters: Filters) {
  return sources.filter(
    (source) =>
      (!filters.tier.length || filters.tier.includes(source.tier)) &&
      facets.every((facet) => matchesAny(source, filters[facet]))
  )
}

/** A random source, avoiding recent ids while any are left. */
export function pickSource(
  sources: Source[],
  history: readonly string[] = [],
  random = Math.random
): Source | undefined {
  const fresh = sources.filter((source) => !history.includes(source.id))
  const pool = fresh.length ? fresh : sources
  return pool[Math.floor(random() * pool.length)]
}

/** Tier, then title. The order of the directory and prev/next. */
export const directoryOrder = (sources: Source[]) =>
  [...sources].sort(
    (a, b) =>
      tierRank(a.tier) - tierRank(b.tier) ||
      a.title.localeCompare(b.title, "en")
  )

/** Sources grouped by tier, best first; empty tiers left out. */
export function byTier(sources: Source[]) {
  const ordered = directoryOrder(sources)
  return tiers.map((tier) => ({
    tier,
    sources: ordered.filter((source) => source.tier === tier),
  }))
}

export const hashOf = (text: string) => {
  let hash = 2166136261
  for (const char of text)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0
  return hash
}

/** Deterministic random numbers in [0, 1) from a seed (mulberry32). */
export function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Sources sharing topics and region: a per-source random pick from the best
 * matches, so neighbouring pages don't repeat the same list.
 */
export function similarSources(
  source: Source,
  sources: Source[],
  tags: Tag[],
  limit = 6,
  exclude: readonly string[] = []
) {
  const { topic, region } = tagsByFacet(tags)
  const ids = (list: Tag[]) => new Set(list.map((tag) => tag.id))
  const topicIds = ids(topic)
  const regionIds = ids(region)
  const shared = (other: Source, within: Set<string>) =>
    other.tags.filter((tag) => within.has(tag) && source.tags.includes(tag))
      .length

  const random = seededRandom(hashOf(source.id))
  const pool = sources
    .filter((other) => other.id !== source.id && !exclude.includes(other.id))
    .map((other) => ({
      other,
      topics: shared(other, topicIds),
      // Jitter lets near-equal matches swap places between pages.
      score:
        shared(other, topicIds) * 3 +
        shared(other, regionIds) * 2 -
        Math.abs(tierRank(other.tier) - tierRank(source.tier)) +
        random() * 3,
    }))
    .filter(({ topics }) => topics > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit * 4)

  // Random sample from the pool, then best match first.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool
    .slice(0, limit)
    .sort((a, b) => b.score - a.score)
    .map(({ other }) => other)
}

/** Neighbours in a list, wrapping around at both ends. */
export function neighbours<T>(items: T[], index: number) {
  const at = (offset: number) =>
    items[(index + offset + items.length) % items.length]
  return { previous: at(-1), next: at(1) }
}

const parseTiers = (value: unknown): Tier[] =>
  Array.isArray(value) ? tiers.filter((tier) => value.includes(tier)) : []

/** Saved filters, keeping only known tag ids. Null means a first visit. */
export function parseFilters(raw: string | null, tags: Tag[]): Filters {
  if (raw === null) return defaultFilters
  const known = new Set(tags.map((tag) => tag.id))
  const ids = (value: unknown) =>
    Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (id): id is string => typeof id === "string" && known.has(id)
            )
          ),
        ]
      : []
  try {
    const saved = JSON.parse(raw) ?? {}
    return {
      ...(Object.fromEntries(
        facets.map((facet) => [facet, ids(saved[facet])])
      ) as Record<Facet, string[]>),
      tier: parseTiers(saved.tier),
    }
  } catch {
    return defaultFilters
  }
}

export const hostOf = (url: string) =>
  new URL(url).hostname.replace(/^www\./, "")

/** Cached favicon path; only exists when `source.icon` is true. */
export const iconPath = (id: string) => `/favicons/${id}.png`

// Literal class names, so Tailwind generates them. White text passes AA on each.
const monogramColors = [
  "bg-red-700",
  "bg-orange-700",
  "bg-amber-700",
  "bg-lime-700",
  "bg-emerald-700",
  "bg-cyan-700",
  "bg-blue-700",
  "bg-violet-700",
  "bg-fuchsia-700",
  "bg-rose-700",
]

/** Letter and stable color for a source without a favicon. */
export function monogram(source: Pick<Source, "id">) {
  const letter =
    source.id.match(/[\p{L}\p{N}]/u)?.[0]?.toLocaleUpperCase() ?? "?"
  let hash = 0
  for (const char of source.id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return { letter, color: monogramColors[hash % monogramColors.length] }
}

export const shufflePath = "/redirect/"
