import { existsSync, readdirSync } from "node:fs"
import path from "node:path"
import { getCollection } from "astro:content"
import { tagSchema, type IconNode } from "./data.ts"
import { directoryOrder, type Source, type Tag } from "./sources.ts"

// Filled by scripts/fetch-favicons.ts before the build.
const iconDir = path.join(process.cwd(), "public", "favicons")
const icons = new Set(existsSync(iconDir) ? readdirSync(iconDir) : [])
const hasIcon = (id: string) => icons.has(`${id}.png`)

/** All sources in directory order. F is already dropped by the loader. */
export const getSources = async () =>
  directoryOrder(
    (await getCollection("sources")).map((entry) => {
      const source = entry.data as Source
      return { ...source, icon: hasIcon(source.id) }
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

/** All tags in data order. */
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
