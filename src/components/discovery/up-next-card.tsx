import { getRelativeLocaleUrl } from "astro:i18n"
import { useEffect, useEffectEvent, useRef } from "react"
import { ExternalLink, Shuffle } from "lucide-react"
import { SourceCard, sourceCardFrame, sourceCardHeight } from "./source-card"
import { Button } from "@/components/ui/button"
import { CardSwipeDeck, type DeckExit } from "@/components/ui/card-swipe-deck"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { translations, type Locale } from "@/i18n/ui"
import { writeFilters } from "@/lib/browser-storage"
import {
  defaultFilters,
  tagsByFacet,
  type Source,
  type Tag,
} from "@/lib/sources"
import { cn } from "@/lib/utils"
import { deckSize, type DeckMove, type useDiscovery } from "./use-discovery"

// How the top card leaves for each move.
const exits: Record<DeckMove, DeckExit> = {
  "skip-left": "left",
  "skip-right": "right",
  open: "up",
  recall: "left",
  deal: "left",
}

/** The deck section, scrolled to when a recent source goes back on top. */
export const deckId = "deck"

type UpNextCardProps = {
  locale: Locale
  tags: Tag[]
  discovery: ReturnType<typeof useDiscovery>
}

export function UpNextCard({ locale, tags, discovery }: UpNextCardProps) {
  const t = translations[locale]
  const { topic, region } = tagsByFacet(tags)
  const cardTags = (source: Source) =>
    [...topic, ...region].filter((tag) => source.tags.includes(tag.id))
  const section = useRef<HTMLElement>(null)
  const {
    loadFailed,
    loading,
    deck,
    deal,
    move,
    next,
    shuffle,
    showPrevious,
    showHistorySource,
  } = discovery
  const top = deck.at(0)

  const handleArrowKey = useEffectEvent((event: KeyboardEvent) => {
    if (!top || event.defaultPrevented) return
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return

    const focused = document.activeElement
    if (focused !== document.body && !section.current?.contains(focused)) return

    if (event.key === "ArrowLeft" && showPrevious()) event.preventDefault()
    if (event.key === "ArrowRight") {
      event.preventDefault()
      next()
    }
  })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      handleArrowKey(event)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const empty = !top && !loading

  return (
    <section
      ref={section}
      id={deckId}
      data-needs-js
      className="mx-auto flex w-full max-w-lg flex-col items-center gap-6"
      aria-labelledby="queue-title"
      aria-busy={loading}
    >
      <h2 id="queue-title" className="sr-only">
        {t.upNext}
      </h2>

      {empty ? (
        <Empty
          role="status"
          className={cn(
            sourceCardFrame,
            "w-full gap-3 rounded-3xl border-dashed p-4"
          )}
        >
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Shuffle aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="font-semibold">
              {loadFailed ? t.catalogError : t.noMatchesTitle}
            </EmptyTitle>
            <EmptyDescription>
              {loadFailed ? t.reloadHint : t.noMatchesHint}
            </EmptyDescription>
          </EmptyHeader>
          {!loadFailed && (
            <EmptyContent>
              <Button
                variant="outline"
                size="sm"
                onClick={() => writeFilters(defaultFilters)}
              >
                {t.resetFilters}
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <CardSwipeDeck
          items={deck}
          exit={exits[move]}
          dealKey={deal}
          height={sourceCardHeight}
          stackSize={deckSize}
          onSwipe={(_, direction) => next(direction)}
          onLift={showHistorySource}
          renderItem={(source, front) => (
            <SourceCard
              source={source}
              tags={cardTags(source)}
              locale={locale}
              detailsHref={getRelativeLocaleUrl(
                locale,
                `sources/${source.id}/`
              )}
              top={front}
            />
          )}
        />
      )}

      <div className="flex h-11 w-full max-w-64 justify-center gap-2">
        {!empty && (
          <>
            <Button
              type="button"
              size="lg"
              className="h-11 flex-1 text-[0.9375rem]"
              disabled={!top}
              onClick={shuffle}
            >
              {t.shuffle}
              <span className="sr-only">({t.opensInNewTab})</span>
              <ExternalLink data-icon="inline-end" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              size="icon-lg"
              variant="secondary"
              className="size-11 shrink-0"
              aria-label={t.refresh}
              title={t.refresh}
              disabled={!top}
              onClick={() => next()}
            >
              <Shuffle aria-hidden="true" />
            </Button>
          </>
        )}
      </div>
    </section>
  )
}
