import { defineCollection } from "astro:content"
import { file } from "astro/loaders"
import { z } from "astro/zod"
import { tags } from "./data/interest-tags"

const destination = z.strictObject({
  name: z.string().trim().min(1),
  url: z.url({ protocol: /^https$/ }).refine((value) => {
    const url = new URL(value)
    return !url.username && !url.password
  }, "Destination URLs cannot contain credentials"),
  tags: z.array(z.enum(tags)).min(1),
})

export const collections = {
  sources: defineCollection({
    loader: file("src/data/sources.json"),
    schema: destination.extend({
      id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      editions: z.array(destination).min(1).optional(),
    }),
  }),
}
