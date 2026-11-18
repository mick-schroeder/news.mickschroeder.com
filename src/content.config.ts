import { defineCollection, reference } from "astro:content"
import { DATA_URL } from "astro:env/server"
import { z } from "astro/zod"

const fetchJson = async (file: string) => {
  const response = await fetch(`${DATA_URL}/${file}`)
  if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`)
  return response.json()
}

const tiers = defineCollection({
  loader: () => fetchJson("tiers.json"),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    description: z.string(),
  }),
})

const tags = defineCollection({
  loader: () => fetchJson("tags.json"),
  schema: z.object({
    order: z.number(),
    title: z.string(),
    kind: z.enum(["topic", "region", "feed", "language", "sponsor"]),
    description: z.string(),
    /** Lucide icon name. */
    icon: z.string().optional(),
    url: z.url().optional(),
  }),
})

const sources = defineCollection({
  loader: () => fetchJson("sources.json"),
  schema: z.object({
    title: z.string(),
    url: z.url(),
    description: z.string(),
    tier: reference("tiers"),
    tags: z.array(reference("tags")),
    icon: z.url(),
    similar: z.array(reference("sources")),
  }),
})

export const collections = { tiers, tags, sources }
