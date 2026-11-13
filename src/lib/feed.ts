import { z } from "astro/zod"

/** Tiers the site shows, best first. F is dropped at load. */
export const tiers = ["S", "A", "B", "C", "D", "E"] as const
export type Tier = (typeof tiers)[number]

export const tagKinds = [
  "tag",
  "region",
  "language",
  "aggregator",
  "tier",
] as const

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)

export const tagSchema = z.object({
  id: slug,
  title: z.string().trim().min(1),
  kind: z.enum(tagKinds),
  description: z.string(),
  /** The aggregator's own site, for aggregator tags. */
  url: z.url({ protocol: /^https$/ }).optional(),
})

export const siteSchema = z.object({
  id: slug,
  title: z.string().trim().min(1),
  url: z.url({ protocol: /^https$/ }),
  // Hand-seeded sites may not be judged yet: unknown tier, no description.
  description: z.string().default(""),
  tier: z.enum([...tiers, "F"]).default("E"),
  tags: z.array(slug).min(1),
})

export type Tag = z.infer<typeof tagSchema>
export type Site = Omit<z.infer<typeof siteSchema>, "tier"> & { tier: Tier }

const urlKey = (value: string) => {
  const url = new URL(value)
  return url.hostname.replace(/^www\./, "") + url.pathname.replace(/\/+$/, "")
}

/** Validates the published feed and drops tier F. Throws on anything off. */
export function parseFeed(
  rawSites: unknown,
  rawTags: unknown,
  { minSites = 100 } = {}
): { sites: Site[]; tags: Tag[] } {
  const tags = z.array(tagSchema).min(1).parse(rawTags)
  const sites = z.array(siteSchema).parse(rawSites)
  if (sites.length < minSites) {
    throw new Error(`Feed has ${sites.length} sites, expected ${minSites}+`)
  }

  const tagIds = new Set<string>()
  for (const tag of tags) {
    if (tagIds.has(tag.id)) throw new Error(`Duplicate tag: ${tag.id}`)
    tagIds.add(tag.id)
  }

  const ids = new Set<string>()
  const urls = new Set<string>()
  for (const site of sites) {
    if (ids.has(site.id)) throw new Error(`Duplicate site id: ${site.id}`)
    ids.add(site.id)
    const key = urlKey(site.url)
    if (urls.has(key)) throw new Error(`Duplicate site URL: ${site.url}`)
    urls.add(key)
    const unknown = site.tags.find((tag) => !tagIds.has(tag))
    if (unknown) throw new Error(`${site.id} has unknown tag: ${unknown}`)
  }

  return {
    sites: sites.filter((site): site is Site => site.tier !== "F"),
    tags,
  }
}

export const defaultFeedUrl = "https://data.news.mickschroeder.com"

async function fetchJson(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  return response.json()
}

/** Fetches and parses both feed files. */
export async function fetchFeed(base = defaultFeedUrl) {
  const [sites, tags] = await Promise.all([
    fetchJson(`${base}/sources.json`),
    fetchJson(`${base}/tags.json`),
  ])
  return parseFeed(sites, tags)
}
