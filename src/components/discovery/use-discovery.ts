import { useEffect, useState } from "react"
import { tags } from "@/data/interest-tags"
import { loadCatalog } from "@/lib/load-catalog"
import { shuffleEvent } from "@/lib/analytics"
import {
  addToHistory,
  readHistory,
  readInterests,
  writeInterests,
} from "@/lib/browser-storage"
import { filterWebsites, pickWebsite, type Website } from "@/lib/discovery"

const transitionDelay = 250

export function useDiscovery() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loadFailed, setLoadFailed] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [interests, setInterests] = useState<string[]>()
  const [history, setHistory] = useState<string[]>([])
  const [site, setSite] = useState<Website>()
  const [pendingSite, setPendingSite] = useState<Website>()

  useEffect(() => {
    const controller = new AbortController()
    loadCatalog(controller.signal)
      .then((catalog) => {
        if (controller.signal.aborted) return
        const savedInterests = readInterests(tags)
        const visits = readHistory()
        setWebsites(catalog)
        setInterests(savedInterests)
        setHistory(visits)
        setSite(pickWebsite(filterWebsites(catalog, savedInterests), visits))
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadFailed(true)
      })
    return () => controller.abort()
  }, [loadAttempt])

  useEffect(() => {
    if (!pendingSite) return
    const timer = window.setTimeout(() => {
      setSite(pendingSite)
      setPendingSite(undefined)
    }, transitionDelay)
    return () => window.clearTimeout(timer)
  }, [pendingSite])

  function selectInterests(selected: string[]) {
    const pool = filterWebsites(websites, selected)
    setInterests(selected)
    setPendingSite(undefined)
    if (!pool.some((candidate) => candidate.url === site?.url)) {
      setSite(pickWebsite(pool, history))
    }
    writeInterests(selected)
  }

  function next(visits = history) {
    if (!site || !interests || pendingSite) return
    const pool = filterWebsites(websites, interests)
    const otherSites = pool.filter((candidate) => candidate.url !== site.url)
    setPendingSite(pickWebsite(otherSites.length ? otherSites : pool, visits))
  }

  function shuffle() {
    if (!site || pendingSite) return
    window.open(site.url, "_blank", "noopener,noreferrer")
    window.dispatchEvent(new Event(shuffleEvent))
    const visits = addToHistory(site.url)
    setHistory(visits)
    next(visits)
  }

  function showPrevious() {
    if (!site || pendingSite) return false
    const previous = history
      .slice(history.indexOf(site.url) + 1)
      .map((url) => websites.find((candidate) => candidate.url === url))
      .find((candidate) => candidate !== undefined)
    setPendingSite(previous)
    return Boolean(previous)
  }

  return {
    loadFailed,
    retry: () => {
      setLoadFailed(false)
      setLoadAttempt((attempt) => attempt + 1)
    },
    interests,
    site,
    historySites: history
      .map((url) => websites.find((candidate) => candidate.url === url))
      .filter((candidate): candidate is Website =>
        Boolean(candidate && candidate.url !== site?.url)
      ),
    transitioning: Boolean(pendingSite),
    selectInterests,
    next: () => next(),
    shuffle,
    showPrevious,
    showHistorySite: (candidate: Website) => {
      if (!pendingSite) setPendingSite(candidate)
    },
  }
}
