import { useEffect, useRef, useState } from "react"
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

/** Cards in the deck: the top card and the ones under it. */
export const deckSize = 3

/** How the top card left, so the deck can animate it. */
export type DeckMove = "skip-left" | "skip-right" | "open" | "recall" | "deal"

// One move per animation; also rate limits the shuffle.
const moveGap = 280

/** Tops the deck up to deckSize, avoiding cards already in it and seen ones. */
function fill(deck: Source[], pool: Source[], seen: readonly string[]) {
  const next = [...deck]
  while (next.length < deckSize) {
    const held = next.map((source) => source.id)
    const free = pool.filter((source) => !held.includes(source.id))
    const pick = pickSource(free, seen)
    if (!pick) break
    next.push(pick)
  }
  return next
}

export function useDiscovery(tags: Tag[]) {
  const [sources, setSources] = useState<Source[]>([])
  const [loadFailed, setLoadFailed] = useState(false)
  const [filters, setFilters] = useState<Filters>()
  const [history, setHistory] = useState<string[]>([])
  const [deck, setDeck] = useState<Source[]>([])
  const [move, setMove] = useState<DeckMove>("deal")
  // Bumped when the whole deck is reshuffled, e.g. on a filter change.
  const [deal, setDeal] = useState(0)
  const lastMove = useRef(0)

  useEffect(() => {
    const controller = new AbortController()
    loadSources()
      .then((loaded) => {
        if (controller.signal.aborted) return
        const saved = readFilters(tags)
        const seen = readHistory()
        setSources(loaded)
        setFilters(saved)
        setHistory(seen)
        setDeck(fill([], filterSources(loaded, saved), seen))
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadFailed(true)
      })
    return () => controller.abort()
  }, [tags])

  const byId = (id: string) => sources.find((candidate) => candidate.id === id)
  const pool = filters ? filterSources(sources, filters) : []
  const top = deck.at(0)

  // Filters are edited in the filter sentence and the feed menu.
  useEffect(() => {
    const onChange = (event: Event) => {
      const changed = (event as CustomEvent<Filters>).detail
      setFilters(changed)
      setMove("deal")
      setDeal((count) => count + 1)
      setDeck(fill([], filterSources(sources, changed), history))
    }
    window.addEventListener(filtersEvent, onChange)
    return () => window.removeEventListener(filtersEvent, onChange)
  })

  /** Applies a move unless one just ran. */
  function play(kind: DeckMove, update: () => void) {
    const now = performance.now()
    if (now - lastMove.current < moveGap) return false
    lastMove.current = now
    setMove(kind)
    update()
    return true
  }

  function next(direction: "left" | "right" = "left") {
    if (!top) return false
    return play(direction === "left" ? "skip-left" : "skip-right", () =>
      // In a small pool the skipped card can come back at the bottom.
      setDeck((current) => {
        const rest = fill(current.slice(1), pool, history)
        return rest.length ? rest : current
      })
    )
  }

  function shuffle() {
    if (!top) return
    const opened = play("open", () => {
      const seen = addToHistory(top.id)
      setHistory(seen)
      setDeck((current) => fill(current.slice(1), pool, seen))
    })
    if (!opened) return
    window.open(top.url, "_blank", "noopener,noreferrer")
    window.dispatchEvent(new Event(shuffleEvent))
  }

  /** Puts a source back on top of the deck. */
  function recall(source: Source) {
    return play("recall", () =>
      setDeck((current) =>
        [source, ...current.filter((card) => card.id !== source.id)].slice(
          0,
          deckSize
        )
      )
    )
  }

  function showPrevious() {
    const index = top ? history.indexOf(top.id) : -1
    const previous = history
      .slice(index + 1)
      .map(byId)
      .find((candidate) => candidate !== undefined)
    return Boolean(previous && recall(previous))
  }

  return {
    loadFailed,
    loading: !filters && !loadFailed,
    deck,
    deal,
    move,
    historySources: history
      .map(byId)
      .filter((candidate): candidate is Source =>
        Boolean(candidate && candidate.id !== top?.id)
      ),
    next,
    shuffle,
    showPrevious,
    showHistorySource: recall,
  }
}
