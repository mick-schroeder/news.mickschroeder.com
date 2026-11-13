import { tiers, type Site, type Tag, type Tier } from "./feed.ts"

export type { Site, Tag, Tier } from "./feed.ts"
export { tagLabel, tiers } from "./feed.ts"

export type Filters = {
  topics: string[]
  regions: string[]
  seenOn: string[]
  /** Lowest tier included, e.g. B means S, A and B. */
  lowestTier: Tier
}

export const defaultFilters: Filters = {
  topics: ["news"],
  regions: [],
  seenOn: [],
  lowestTier: "B",
}

export const tierRank = (tier: Tier) => tiers.indexOf(tier)

/** Chip groups for the shuffle controls, in feed order. */
export function facets(tags: Tag[]) {
  const of = (...kinds: Tag["kind"][]) =>
    tags.filter((tag) => kinds.includes(tag.kind))
  return {
    topics: of("tag"),
    regions: of("region", "language"),
    seenOn: of("aggregator"),
  }
}

/** Tags with a browse page: every facet tag. */
export const browsableTags = (tags: Tag[]) => {
  const { topics, regions, seenOn } = facets(tags)
  return [...topics, ...regions, ...seenOn]
}

const matchesAny = (site: Site, wanted: string[]) =>
  !wanted.length || wanted.some((tag) => site.tags.includes(tag))

/** Any match within a facet, all facets must match; empty means any. */
export function filterSites(sites: Site[], filters: Filters) {
  const lowest = tierRank(filters.lowestTier)
  return sites.filter(
    (site) =>
      tierRank(site.tier) <= lowest &&
      matchesAny(site, filters.topics) &&
      matchesAny(site, filters.regions) &&
      matchesAny(site, filters.seenOn)
  )
}

/** A random site, avoiding recent ids while any are left. */
export function pickSite(
  sites: Site[],
  history: readonly string[] = [],
  random = Math.random
): Site | undefined {
  const fresh = sites.filter((site) => !history.includes(site.id))
  const pool = fresh.length ? fresh : sites
  return pool[Math.floor(random() * pool.length)]
}

/** Tier, then title. The order of the directory and prev/next. */
export const directoryOrder = (sites: Site[]) =>
  [...sites].sort(
    (a, b) =>
      tierRank(a.tier) - tierRank(b.tier) ||
      a.title.localeCompare(b.title, "en")
  )

/** Sites grouped by tier, best first; empty tiers left out. */
export function byTier(sites: Site[]) {
  const ordered = directoryOrder(sites)
  return tiers
    .map((tier) => ({
      tier,
      sites: ordered.filter((site) => site.tier === tier),
    }))
    .filter((group) => group.sites.length)
}

/** Sites sharing topics and region, nearest tier first. */
export function similarSites(
  site: Site,
  sites: Site[],
  tags: Tag[],
  limit = 6
) {
  const { topics, regions } = facets(tags)
  const ids = (list: Tag[]) => new Set(list.map((tag) => tag.id))
  const topicIds = ids(topics)
  const regionIds = ids(regions)
  const shared = (other: Site, within: Set<string>) =>
    other.tags.filter((tag) => within.has(tag) && site.tags.includes(tag))
      .length

  return sites
    .filter((other) => other.id !== site.id)
    .map((other) => ({
      other,
      topics: shared(other, topicIds),
      score:
        shared(other, topicIds) * 3 +
        shared(other, regionIds) * 2 -
        Math.abs(tierRank(other.tier) - tierRank(site.tier)),
    }))
    .filter(({ topics }) => topics > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.other.title.localeCompare(b.other.title, "en")
    )
    .slice(0, limit)
    .map(({ other }) => other)
}

/** Neighbours in a list, wrapping around at both ends. */
export function neighbours<T>(items: T[], index: number) {
  const at = (offset: number) =>
    items[(index + offset + items.length) % items.length]
  return { previous: at(-1), next: at(1) }
}

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
      topics: ids(saved.topics),
      regions: ids(saved.regions),
      seenOn: ids(saved.seenOn),
      lowestTier: tiers.includes(saved.lowestTier)
        ? saved.lowestTier
        : defaultFilters.lowestTier,
    }
  } catch {
    return defaultFilters
  }
}

export const hostOf = (url: string) =>
  new URL(url).hostname.replace(/^www\./, "")

/** Cached favicon path; only exists when `site.icon` is true. */
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

/** Letter and stable color for a site without a favicon. */
export function monogram(site: Pick<Site, "id">) {
  const letter = site.id.match(/[\p{L}\p{N}]/u)?.[0]?.toLocaleUpperCase() ?? "?"
  let hash = 0
  for (const char of site.id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return { letter, color: monogramColors[hash % monogramColors.length] }
}

export const shufflePath = "/redirect/"
