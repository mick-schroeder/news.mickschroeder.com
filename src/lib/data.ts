import { z } from "astro/zod"

/** Tiers, best first. */
export const tiers = ["S", "A", "B", "C", "D", "E", "F"] as const
export type Tier = (typeof tiers)[number]

/** Tag kinds the shuffle filters on, in panel order. */
export const facets = ["topic", "region", "feed"] as const
export type Facet = (typeof facets)[number]

const tagKinds = [...facets, "language", "sponsor"] as const

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)

export const tagSchema = z.object({
  id: slug,
  title: z.string().trim().min(1),
  kind: z.enum(tagKinds),
  /** Lucide icon name. */
  icon: slug.optional(),
  description: z.string(),
  /** The feed's own site, for feed tags. */
  url: z.url({ protocol: /^https$/ }).optional(),
})

export const sourceSchema = z.object({
  id: slug,
  title: z.string().trim().min(1),
  url: z.url({ protocol: /^https$/ }),
  // Hand-seeded sources may not be judged yet: unknown tier, no description.
  description: z.string().default(""),
  tier: z.enum(tiers).default("E"),
  tags: z.array(slug).min(1),
})

export type Tag = z.infer<typeof tagSchema> & {
  /** Set by the catalog from the icon name. */
  iconNode?: IconNode
}
export type IconNode = [string, Record<string, string>][]

export const tagLabel = (tag: Tag) => tag.title
export type Source = z.infer<typeof sourceSchema> & {
  /** Set by the catalog when public/favicons/{id}.png exists. */
  icon?: boolean
}

const urlKey = (value: string) => {
  const url = new URL(value)
  return url.hostname.replace(/^www\./, "") + url.pathname.replace(/\/+$/, "")
}

/** Validates the published data and drops tags no source uses. Throws on anything off. */
export function parseData(
  rawSources: unknown,
  rawTags: unknown,
  { minSources = 100 } = {}
): { sources: Source[]; tags: Tag[] } {
  const tags = z.array(tagSchema).min(1).parse(rawTags)
  const sources = z.array(sourceSchema).parse(rawSources)
  if (sources.length < minSources) {
    throw new Error(
      `Data has ${sources.length} sources, expected ${minSources}+`
    )
  }

  const tagIds = new Set<string>()
  for (const tag of tags) {
    if (tagIds.has(tag.id)) throw new Error(`Duplicate tag: ${tag.id}`)
    tagIds.add(tag.id)
  }

  const ids = new Set<string>()
  const urls = new Set<string>()
  for (const source of sources) {
    if (ids.has(source.id)) throw new Error(`Duplicate source id: ${source.id}`)
    ids.add(source.id)
    const key = urlKey(source.url)
    if (urls.has(key)) throw new Error(`Duplicate source URL: ${source.url}`)
    urls.add(key)
    const unknown = source.tags.find((tag) => !tagIds.has(tag))
    if (unknown) throw new Error(`${source.id} has unknown tag: ${unknown}`)
  }

  const used = new Set(sources.flatMap((source) => source.tags))
  return { sources, tags: tags.filter((tag) => used.has(tag.id)) }
}

export const defaultDataUrl = "https://data.news.mickschroeder.com"

async function fetchJson(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`)
  return response.json()
}

/** Fetches and parses both data files. */
export async function fetchData(base = defaultDataUrl) {
  const [sources, tags] = await Promise.all([
    fetchJson(`${base}/sources.json`),
    fetchJson(`${base}/tags.json`),
  ])
  return parseData(sources, tags)
}
