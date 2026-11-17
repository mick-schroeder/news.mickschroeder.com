import { parseFilters, type Filters, type Source, type Tag } from "./sources.ts"

const storageKeys = {
  filters: "news-shuffle.preferences.v4",
  history: "news-shuffle.history.v2",
} as const

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/** Saved filters as stored, for useSyncExternalStore. */
export const readFiltersRaw = () => readStorage(storageKeys.filters)

export const readFilters = (tags: Tag[]) => parseFilters(readFiltersRaw(), tags)

/** Fired on window with the new filters whenever they change. */
export const filtersEvent = "news-shuffle:filters"

export function writeFilters(filters: Filters) {
  writeStorage(storageKeys.filters, JSON.stringify(filters))
  window.dispatchEvent(new CustomEvent(filtersEvent, { detail: filters }))
}

/** Recently opened source ids, newest first. */
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

export function addToHistory(id: string, maxItems = 24): string[] {
  const updated = [id, ...readHistory().filter((seen) => seen !== id)].slice(
    0,
    maxItems
  )
  writeStorage(storageKeys.history, JSON.stringify(updated))
  return updated
}

let sources: Promise<Source[]> | undefined

/** The shuffle's source list, built from the data at build time. Fetched once. */
export function loadSources(): Promise<Source[]> {
  sources ??= fetch("/sources.json").then((response) => {
    if (!response.ok) throw new Error(`/sources.json: HTTP ${response.status}`)
    return response.json()
  })
  sources.catch(() => (sources = undefined))
  return sources
}
