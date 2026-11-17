import { defineCollection } from "astro:content"
import { DATA_URL } from "astro:env/server"
import { z } from "astro/zod"
import { fetchData, sourceSchema, tagSchema } from "./lib/data"

let data: ReturnType<typeof fetchData> | undefined
const loadData = () => (data ??= fetchData(DATA_URL || undefined))

export const collections = {
  tags: defineCollection({
    // Collections come back in id order; keep the data order.
    loader: async () =>
      (await loadData()).tags.map((tag, order) => ({ ...tag, order })),
    schema: tagSchema.extend({ order: z.number() }),
  }),
  sources: defineCollection({
    loader: async () => (await loadData()).sources,
    schema: sourceSchema,
  }),
}
