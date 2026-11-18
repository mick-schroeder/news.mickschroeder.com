import { getCollection } from "astro:content"
import { icons } from "lucide"
import type { IconNode } from "lucide-react"
import type { Source, Tag, TierInfo } from "@/lib/shuffle"

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

/** Tags in display order. */
export async function getTags(): Promise<Tag[]> {
  return (await getCollection("tags"))
    .sort((a, b) => a.data.order - b.data.order)
    .map(({ id, data: { icon, ...data } }) => ({
      id,
      ...data,
      ...(icon && { iconNode: iconNode(icon) }),
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
