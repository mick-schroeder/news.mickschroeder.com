import { z } from "astro/zod"
import { tags } from "./interest-tags.ts"

export function catalogUrlKey(value: string) {
  const url = new URL(value)
  url.hostname = url.hostname.replace(/^www\./, "")
  url.pathname = url.pathname.replace(/\/+$/, "")
  url.hash = ""
  return url.href
}

/** A new source's page id: host and path, e.g. "bbc.com/news" → "bbc-com-news". */
export function idFromUrl(value: string) {
  const { hostname, pathname } = new URL(value)
  return (hostname.replace(/^www\./, "") + pathname)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export const websiteSchema = z.strictObject({
  /** Page address: /sources/{id}/. */
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  name: z.string().trim().min(1),
  url: z.url({ protocol: /^https$/ }).refine((value) => {
    const url = new URL(value)
    return !url.username && !url.password
  }, "URLs cannot contain credentials"),
  tags: z.array(z.enum(tags)).min(1),
})

export const catalogSchema = z
  .array(websiteSchema)
  .min(1)
  .superRefine((sites, context) => {
    const seen = new Set<string>()
    const ids = new Set<string>()
    for (const [index, site] of sites.entries()) {
      if (ids.has(site.id)) {
        context.addIssue({
          code: "custom",
          path: [index, "id"],
          message: `Duplicate id: ${site.id}`,
        })
      }
      ids.add(site.id)
      if (!URL.canParse(site.url)) continue
      const key = catalogUrlKey(site.url)
      if (seen.has(key)) {
        context.addIssue({
          code: "custom",
          path: [index, "url"],
          message: `Duplicate URL: ${site.url}`,
        })
      }
      seen.add(key)
    }
  })
