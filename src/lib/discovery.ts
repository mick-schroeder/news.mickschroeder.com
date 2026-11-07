type Destination = {
  name: string
  url: string
  tags: string[]
}

export type Website = Destination & {
  id: string
  editions?: Destination[]
}

export const shufflePath = "/redirect/"

export function filterWebsites(sites: Website[], interests: string[]) {
  const matches = (site: Destination) =>
    site.tags.some((tag) => interests.includes(tag))

  return sites.flatMap((site) => {
    if (!site.editions) return matches(site) ? [site] : []

    const editions = [site, ...site.editions].filter(matches)
    return editions.length ? [{ ...site, editions }] : []
  })
}
export function pickWebsite(
  sites: Website[],
  previous?: string | string[],
  random = Math.random
): Website | undefined {
  const previousList = Array.isArray(previous)
    ? previous
    : previous
      ? [previous]
      : []
  const unvisited = sites.filter((site) => !previousList.includes(site.id))
  const pool = unvisited.length ? unvisited : sites
  const site = pool[Math.floor(random() * pool.length)]
  const editions = site?.editions
  if (!editions?.length) return site

  const edition =
    editions[editions.length === 1 ? 0 : Math.floor(random() * editions.length)]
  return { ...edition, id: site.id }
}

export function parseInterests(
  raw: string | null,
  tags: readonly string[]
): string[] {
  if (raw === null) return tags.filter((tag) => tag !== "Gaeilge")

  try {
    const saved = JSON.parse(raw)?.tags
    if (!Array.isArray(saved)) return []

    return [
      ...new Set(
        saved.filter(
          (tag): tag is string => typeof tag === "string" && tags.includes(tag)
        )
      ),
    ]
  } catch {
    return []
  }
}

export function favicon(url: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(url).hostname)}&sz=64`
}
