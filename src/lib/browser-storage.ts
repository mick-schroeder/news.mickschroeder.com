import { parseFilters, type Filters, type Site, type Tag } from "./sites.ts"

export const storageKeys = {
  filters: "news-shuffle.preferences.v2",
  history: "news-shuffle.history.v2",
} as const

export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export const readFilters = (tags: Tag[]) =>
  parseFilters(readStorage(storageKeys.filters), tags)

/** Fired on window with the new filters whenever they change. */
export const filtersEvent = "news-shuffle:filters"

/** Fired on window to open the Your shuffle menu. */
export const openFiltersEvent = "news-shuffle:open-filters"

export function writeFilters(filters: Filters) {
  writeStorage(storageKeys.filters, JSON.stringify(filters))
  window.dispatchEvent(new CustomEvent(filtersEvent, { detail: filters }))
}

/** Recently opened site ids, newest first. */
export function readHistory(): string[] {
  try {
    const parsed = JSON.parse(readStorage(storageKeys.history) ?? "[]")
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is string => typeof id === "string")
    }
  } catch {
    // corrupt
  }
  return []
}

export function addToHistory(id: string, maxItems = 7): string[] {
  const updated = [id, ...readHistory().filter((seen) => seen !== id)].slice(
    0,
    maxItems
  )
  writeStorage(storageKeys.history, JSON.stringify(updated))
  return updated
}

/** The shuffle's site list, built from the feed at build time. */
export async function loadSites(signal: AbortSignal): Promise<Site[]> {
  const response = await fetch("/sites.json", { signal })
  if (!response.ok) throw new Error(`/sites.json: HTTP ${response.status}`)
  return response.json()
}
