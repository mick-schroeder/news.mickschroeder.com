import { defineCollection } from "astro:content"
import { z } from "astro/zod"
import { fetchFeed, siteSchema, tagSchema } from "./lib/feed"

// DATA_URL=http://localhost:4400 reads the data repo's out/ folder.
let feed: ReturnType<typeof fetchFeed> | undefined
const loadFeed = () => (feed ??= fetchFeed(process.env.DATA_URL || undefined))

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
