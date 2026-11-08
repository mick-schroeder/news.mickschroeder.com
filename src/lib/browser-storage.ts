import { parseInterests } from "./discovery.ts"

export const storageKeys = {
  preferences: "news-shuffle.preferences.v1",
  history: "news-shuffle.history.urls.v1",
  locale: "news-shuffle.locale",
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

export function readInterests(tags: readonly string[]) {
  return parseInterests(readStorage(storageKeys.preferences), tags)
}

export function writeInterests(interests: string[]) {
  writeStorage(storageKeys.preferences, JSON.stringify({ tags: interests }))
}

export function readHistory(): string[] {
  try {
    const raw = readStorage(storageKeys.history)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.filter((url): url is string => typeof url === "string")
      }
    }
  } catch {
    // fallback
  }
  return []
}

export function addToHistory(url: string, maxItems = 7): string[] {
  const current = readHistory().filter((visited) => visited !== url)
  const updated = [url, ...current].slice(0, maxItems)
  writeStorage(storageKeys.history, JSON.stringify(updated))
  return updated
}
