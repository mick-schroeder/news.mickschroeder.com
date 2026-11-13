import { existsSync, readdirSync } from "node:fs"
import path from "node:path"
import { getCollection } from "astro:content"
import { tagSchema, type IconNode } from "./feed.ts"
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

/** Lucide icon data by name, read at build time so no glyph map ships. */
const iconNode = async (name: string): Promise<IconNode> => {
  try {
    return (await import(`lucide-react/icons/${name}`)).__iconData.node
  } catch {
    throw new Error(`Unknown Lucide icon: ${name}`)
  }
}

/** All tags in feed order. */
export const getTags = async (): Promise<Tag[]> =>
  Promise.all(
    (await getCollection("tags"))
      .map((entry) => entry.data)
      .sort((a, b) => a.order - b.order)
      .map((data) => tagSchema.parse(data))
      .map(async (tag) =>
        tag.icon ? { ...tag, iconNode: await iconNode(tag.icon) } : tag
      )
  )
