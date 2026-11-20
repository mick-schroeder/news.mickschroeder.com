import { defineCollection, reference } from "astro:content"
import { DATA_URL } from "astro:env/server"
import { z } from "astro/zod"
import { tagColorNames } from "@/lib/tag-colors"
import { tagKinds } from "@/lib/tag-kinds"

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
    kind: z.enum(tagKinds.map((kind) => kind.id)),
    description: z.string(),
    /** Lucide icon name. */
    icon: z.string().optional(),
    color: z.enum(tagColorNames).optional(),
    /** ISO 3166-1 alpha-2, shown as a flag. */
    country: z
      .string()
      .regex(/^[A-Z]{2}$/)
      .optional(),
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
