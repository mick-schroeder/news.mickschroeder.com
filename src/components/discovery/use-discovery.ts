import { useEffect, useState } from "react"
import { shuffleEvent } from "@/lib/analytics"
import {
  addToHistory,
  loadSites,
  readFilters,
  readHistory,
  writeFilters,
} from "@/lib/browser-storage"
import {
  filterSites,
  pickSite,
  type Filters,
  type Site,
  type Tag,
} from "@/lib/sites"

const transitionDelay = 250

export function useDiscovery(tags: Tag[]) {
  const [sites, setSites] = useState<Site[]>([])
  const [loadFailed, setLoadFailed] = useState(false)
  const [filters, setFilters] = useState<Filters>()
  const [history, setHistory] = useState<string[]>([])
  const [site, setSite] = useState<Site>()
  const [pendingSite, setPendingSite] = useState<Site>()

  useEffect(() => {
    const controller = new AbortController()
    loadSites(controller.signal)
      .then((loaded) => {
        if (controller.signal.aborted) return
        const saved = readFilters(tags)
        const seen = readHistory()
        setSites(loaded)
        setFilters(saved)
        setHistory(seen)
        setSite(pickSite(filterSites(loaded, saved), seen))
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadFailed(true)
      })
    return () => controller.abort()
  }, [tags])

  useEffect(() => {
    if (!pendingSite) return
    const timer = window.setTimeout(() => {
      setSite(pendingSite)
      setPendingSite(undefined)
    }, transitionDelay)
    return () => window.clearTimeout(timer)
  }, [pendingSite])

  const byId = (id: string) => sites.find((candidate) => candidate.id === id)
  const pool = filters ? filterSites(sites, filters) : []

  function changeFilters(changed: Filters) {
    const nextPool = filterSites(sites, changed)
    setFilters(changed)
    setPendingSite(undefined)
    if (!nextPool.some((candidate) => candidate.id === site?.id)) {
      setSite(pickSite(nextPool, history))
    }
    writeFilters(changed)
  }

  function next(seen = history) {
    if (!site || pendingSite) return
    const others = pool.filter((candidate) => candidate.id !== site.id)
    setPendingSite(pickSite(others.length ? others : pool, seen))
  }

  function shuffle() {
    if (!site || pendingSite) return
    window.open(site.url, "_blank", "noopener,noreferrer")
    window.dispatchEvent(new Event(shuffleEvent))
    const seen = addToHistory(site.id)
    setHistory(seen)
    next(seen)
  }

  function showPrevious() {
    if (!site || pendingSite) return false
    const previous = history
      .slice(history.indexOf(site.id) + 1)
      .map(byId)
      .find((candidate) => candidate !== undefined)
    setPendingSite(previous)
    return Boolean(previous)
  }

  return {
    loadFailed,
    filters,
    site,
    historySites: history
      .map(byId)
      .filter((candidate): candidate is Site =>
        Boolean(candidate && candidate.id !== site?.id)
      ),
    transitioning: Boolean(pendingSite),
    changeFilters,
    next: () => next(),
    shuffle,
    showPrevious,
    showHistorySite: (candidate: Site) => {
      if (!pendingSite) setPendingSite(candidate)
    },
  }
}
