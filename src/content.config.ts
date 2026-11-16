import { defineCollection } from "astro:content"
import { DATA_URL } from "astro:env/server"
import { z } from "astro/zod"
import { fetchFeed, siteSchema, tagSchema } from "./lib/feed"

let feed: ReturnType<typeof fetchFeed> | undefined
const loadFeed = () => (feed ??= fetchFeed(DATA_URL || undefined))

export const collections = {
  tags: defineCollection({
    // Collections come back in id order; keep the feed's order.
    loader: async () =>
      (await loadFeed()).tags.map((tag, order) => ({ ...tag, order })),
    schema: tagSchema.extend({ order: z.number() }),
  }),
  sites: defineCollection({
    loader: async () => (await loadFeed()).sites,
    schema: siteSchema,
  }),
}
