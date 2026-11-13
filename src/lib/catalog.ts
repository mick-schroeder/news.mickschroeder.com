import { existsSync, readdirSync } from "node:fs"
import path from "node:path"
import { getCollection } from "astro:content"
import { tagSchema } from "./feed.ts"
import { directoryOrder, type Site, type Tag } from "./sites.ts"

// Filled by scripts/fetch-favicons.ts before the build.
const iconDir = path.join(process.cwd(), "public", "favicons")
const icons = new Set(existsSync(iconDir) ? readdirSync(iconDir) : [])
const hasIcon = (id: string) => icons.has(`${id}.png`)

/** All sites in directory order. F is already dropped by the loader. */
export const getSites = async () =>
  directoryOrder(
    (await getCollection("sites")).map((entry) => {
      const site = entry.data as Site
      return { ...site, icon: hasIcon(site.id) }
    })
  )

/** All tags in feed order. */
export const getTags = async (): Promise<Tag[]> =>
  (await getCollection("tags"))
    .map((entry) => entry.data)
    .sort((a, b) => a.order - b.order)
    .map((tag) => tagSchema.parse(tag))
