import { catalogSchema } from "./catalog-schema.ts"
import sources from "./sources.json"
import { tags } from "./interest-tags.ts"
import { tagSlug } from "../lib/source-pages.ts"

export const getWebsites = () => catalogSchema.parse(sources)

/** Sources in name order, for browsing. */
export const getSources = () =>
  getWebsites().sort((a, b) => a.name.localeCompare(b.name, "en"))

export const tagPages = tags.map((tag) => ({ tag, slug: tagSlug(tag) }))
