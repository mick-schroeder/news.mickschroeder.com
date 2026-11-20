import { getCollection } from "astro:content"
import { icons, type IconNode } from "lucide"
import * as flags from "country-flag-icons/string/3x2"
import type { Flag, Source, Tag, TierInfo } from "@/lib/shuffle"

/** Tiers, best first. */
export async function getTiers(): Promise<TierInfo[]> {
  return (await getCollection("tiers"))
    .sort((a, b) => a.data.order - b.data.order)
    .map(({ id, data }) => ({
      id,
      title: data.title,
      description: data.description,
    }))
}

/** Lucide's icon data for a name like "flask-conical". */
function iconNode(name: string) {
  const key = name.replace(/(^|-)(\w)/g, (_, __, char) => char.toUpperCase())
  const node = icons[key as keyof typeof icons]
  if (!node) throw new Error(`Unknown Lucide icon: ${name}`)
  return node as IconNode
}

/** A country's 3:2 flag, split into viewBox and contents. */
function flag(country: string): Flag {
  const svg = flags[country as keyof typeof flags]
  const match = svg?.match(/viewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>/)
  if (!match) throw new Error(`Unknown flag: ${country}`)
  return { viewBox: match[1], body: match[2] }
}

/** Tags in display order. */
export async function getTags(): Promise<Tag[]> {
  return (await getCollection("tags"))
    .sort((a, b) => a.data.order - b.data.order)
    .map(({ id, data: { icon, country, ...data } }) => ({
      id,
      ...data,
      ...(icon && { iconNode: iconNode(icon) }),
      ...(country && { flag: flag(country) }),
    }))
}

/** Sources by tier, then title, with references as ids. */
export async function getSources(): Promise<Source[]> {
  const rank = (await getTiers()).map((tier) => tier.id)
  return (await getCollection("sources"))
    .map(({ id, data }) => ({
      id,
      ...data,
      tier: data.tier.id,
      tags: data.tags.map((tag) => tag.id),
      similar: data.similar.map((source) => source.id),
    }))
    .sort(
      (a, b) =>
        rank.indexOf(a.tier) - rank.indexOf(b.tier) ||
        a.title.localeCompare(b.title)
    )
}
