import { z } from "astro/zod"
import { tags } from "./interest-tags.ts"

export function catalogUrlKey(value: string) {
  const url = new URL(value)
  url.hostname = url.hostname.replace(/^www\./, "")
  url.pathname = url.pathname.replace(/\/+$/, "")
  url.hash = ""
  return url.href
}

export const websiteSchema = z.strictObject({
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
    for (const [index, site] of sites.entries()) {
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
