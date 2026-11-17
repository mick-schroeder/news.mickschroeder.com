import { useEffect, useState } from "react"
import { shuffleEvent } from "@/lib/analytics"
import {
  addToHistory,
  filtersEvent,
  loadSources,
  readFilters,
  readHistory,
} from "@/lib/browser-storage"
import {
  filterSources,
  pickSource,
  type Filters,
  type Source,
  type Tag,
} from "@/lib/sources"

const transitionDelay = 250

export function useDiscovery(tags: Tag[]) {
  const [sources, setSources] = useState<Source[]>([])
  const [loadFailed, setLoadFailed] = useState(false)
  const [filters, setFilters] = useState<Filters>()
  const [history, setHistory] = useState<string[]>([])
  const [source, setSource] = useState<Source>()
  const [pendingSource, setPendingSource] = useState<Source>()

  useEffect(() => {
    const controller = new AbortController()
    loadSources(controller.signal)
      .then((loaded) => {
        if (controller.signal.aborted) return
        const saved = readFilters(tags)
        const seen = readHistory()
        setSources(loaded)
        setFilters(saved)
        setHistory(seen)
        setSource(pickSource(filterSources(loaded, saved), seen))
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadFailed(true)
      })
    return () => controller.abort()
  }, [tags])

  useEffect(() => {
    if (!pendingSource) return
    const timer = window.setTimeout(() => {
      setSource(pendingSource)
      setPendingSource(undefined)
    }, transitionDelay)
    return () => window.clearTimeout(timer)
  }, [pendingSource])

  const byId = (id: string) => sources.find((candidate) => candidate.id === id)
  const pool = filters ? filterSources(sources, filters) : []

  // Filters are edited in the header's Your shuffle menu.
  useEffect(() => {
    const onChange = (event: Event) => {
      const changed = (event as CustomEvent<Filters>).detail
      const nextPool = filterSources(sources, changed)
      setFilters(changed)
      setPendingSource(undefined)
      if (!nextPool.some((candidate) => candidate.id === source?.id)) {
        setSource(pickSource(nextPool, history))
      }
    }
    window.addEventListener(filtersEvent, onChange)
    return () => window.removeEventListener(filtersEvent, onChange)
  })

  function next(seen = history) {
    if (!source || pendingSource) return
    const others = pool.filter((candidate) => candidate.id !== source.id)
    setPendingSource(pickSource(others.length ? others : pool, seen))
  }

  function shuffle() {
    if (!source || pendingSource) return
    window.open(source.url, "_blank", "noopener,noreferrer")
    window.dispatchEvent(new Event(shuffleEvent))
    const seen = addToHistory(source.id)
    setHistory(seen)
    next(seen)
  }

  function showPrevious() {
    if (!source || pendingSource) return false
    const previous = history
      .slice(history.indexOf(source.id) + 1)
      .map(byId)
      .find((candidate) => candidate !== undefined)
    setPendingSource(previous)
    return Boolean(previous)
  }

  return {
    loadFailed,
    filters,
    source,
    historySources: history
      .map(byId)
      .filter((candidate): candidate is Source =>
        Boolean(candidate && candidate.id !== source?.id)
      ),
    transitioning: Boolean(pendingSource),
    next: () => next(),
    shuffle,
    showPrevious,
    showHistorySource: (candidate: Source) => {
      if (!pendingSource) setPendingSource(candidate)
    },
  }
}
