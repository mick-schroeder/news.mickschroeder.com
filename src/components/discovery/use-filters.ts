import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import {
  filtersEvent,
  loadSources,
  readFiltersRaw,
  writeFilters,
} from "@/lib/browser-storage"
import {
  parseFilters,
  type Filters,
  type Source,
  type Tag,
} from "@/lib/sources"

const subscribe = (onChange: () => void) => {
  window.addEventListener(filtersEvent, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(filtersEvent, onChange)
    window.removeEventListener("storage", onChange)
  }
}

/** Saved filters, shared by every island through storage. Undefined until hydrated. */
export function useFilters(tags: Tag[]) {
  const raw = useSyncExternalStore(subscribe, readFiltersRaw, () => undefined)
  const filters = useMemo(
    () => (raw === undefined ? undefined : parseFilters(raw, tags)),
    [raw, tags]
  )
  const update = (patch: Partial<Filters>) =>
    filters && writeFilters({ ...filters, ...patch })
  return { filters, update }
}

/** The source list, once loaded. */
export function useSources() {
  const [sources, setSources] = useState<Source[]>()
  useEffect(() => {
    let live = true
    loadSources()
      .then((loaded) => live && setSources(loaded))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])
  return sources
}
