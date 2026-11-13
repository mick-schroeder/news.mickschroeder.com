import { getCollection } from "astro:content"
import { tagSchema } from "./feed.ts"
import { directoryOrder, type Site, type Tag } from "./sites.ts"

/** All sites in directory order. F is already dropped by the loader. */
export const getSites = async () =>
  directoryOrder(
    (await getCollection("sites")).map((entry) => entry.data as Site)
  )

/** All tags in feed order. */
export const getTags = async (): Promise<Tag[]> =>
  (await getCollection("tags"))
    .map((entry) => entry.data)
    .sort((a, b) => a.order - b.order)
    .map((tag) => tagSchema.parse(tag))
