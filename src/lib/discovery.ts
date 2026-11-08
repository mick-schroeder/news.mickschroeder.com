export type Website = {
  name: string
  url: string
  tags: string[]
}

export const shufflePath = "/redirect/"

export function filterWebsites(sites: Website[], interests: string[]) {
  return sites.filter((site) =>
    site.tags.some((tag) => interests.includes(tag))
  )
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
  const unvisited = sites.filter((site) => !previousList.includes(site.url))
  const pool = unvisited.length ? unvisited : sites
  return pool[Math.floor(random() * pool.length)]
}

export function parseInterests(
  raw: string | null,
  tags: readonly string[]
): string[] {
  if (raw === null) return tags.filter((tag) => tag === "News")

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
