export type TierInfo = { id: string; title: string; description: string }

import type { IconNode } from "lucide-react"
import type { TagColor } from "@/lib/tag-colors"
import type { TagKind } from "@/lib/tag-kinds"

export type Tag = {
  id: string
  title: string
  kind: TagKind
  description: string
  url?: string
  color?: TagColor
  /** Lucide icon data, looked up from the tag's icon name at build. */
  iconNode?: IconNode
  /** Country flag SVG, looked up from the tag's country at build. */
  flag?: Flag
}

export type Flag = { viewBox: string; body: string }

export type Source = {
  id: string
  title: string
  url: string
  description: string
  tier: string
  tags: string[]
  icon: string
  similar: string[]
}

/** Tag kinds the shuffle filters on. */
export const facets = ["topic", "region", "feed"] as const satisfies TagKind[]
export type Facet = (typeof facets)[number]

/** Empty means any. */
export type Filters = Record<Facet | "tier", string[]>

/** Default filters derived from the actual tier list; selects the top 3 tiers. */
export function getDefaultFilters(tiers: Pick<TierInfo, "id">[]): Filters {
  return {
    topic: ["news"],
    region: [],
    feed: [],
    tier: tiers.slice(0, 3).map((t) => t.id),
  }
}

const any = (wanted: string[], has: (value: string) => boolean) =>
  !wanted.length || wanted.some(has)

/** Matches any value within a filter and every filter. */
export function matches(
  source: Pick<Source, "tier" | "tags">,
  filters: Filters
) {
  return (
    any(filters.tier, (tier) => tier === source.tier) &&
    facets.every((facet) =>
      any(filters[facet], (tag) => source.tags.includes(tag))
    )
  )
}

export function pickSource<T>(
  sources: T[],
  random = Math.random
): T | undefined {
  return sources[Math.floor(random() * sources.length)]
}

const storageKey = "filters"

/** Saved filters, ignoring values no longer in the data. */
export function readFilters(known: Set<string>, defaults: Filters): Filters {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null")
    if (!saved) return defaults
    // A saved list with nothing left that's known falls back to the default.
    const keep = (key: keyof Filters) => {
      const values: unknown = saved[key]
      if (!Array.isArray(values)) return defaults[key]
      const kept = values.filter((value) => known.has(value))
      return values.length > 0 && kept.length === 0 ? defaults[key] : kept
    }
    return {
      topic: keep("topic"),
      region: keep("region"),
      feed: keep("feed"),
      tier: keep("tier"),
    }
  } catch {
    return defaults
  }
}

export function writeFilters(filters: Filters) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(filters))
  } catch {
    // Storage blocked; filters last for this visit.
  }
}
