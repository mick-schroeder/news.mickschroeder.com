import { getRelativeLocaleUrl } from "astro:i18n"
import { useEffect, useEffectEvent, useRef } from "react"
import { ExternalLink, Shuffle } from "lucide-react"
import { historyDepth, historyStep } from "./history-card-style"
import { HistoryCard, SourceCard } from "./source-card"
import { sourceCardHeight } from "./source-card-frame"
import { SourceCardSkeleton } from "./source-card-skeleton"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { translations, type Locale } from "@/i18n/ui"
import { openFiltersEvent } from "@/lib/browser-storage"
import { tagsByFacet, type Source, type Tag } from "@/lib/sources"
import type { useDiscovery } from "./use-discovery"

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
  const deck = useRef<HTMLElement>(null)
  const {
    filters,
    loadFailed,
    source: frontSource,
    historySources,
    transitioning,
    next,
    shuffle,
    showPrevious,
    showHistorySource,
  } = discovery
  const loading = !filters && !loadFailed
  const showSkeleton = loading || transitioning
  const showPeeks = showSkeleton && !frontSource
  const visibleHistory = frontSource
    ? historySources.slice(0, historyDepth)
    : []
  const stackDepth = showPeeks ? historyDepth : visibleHistory.length

  const handleArrowKey = useEffectEvent((event: KeyboardEvent) => {
    if (showSkeleton || !frontSource || event.defaultPrevented) return
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return

    const focused = document.activeElement
    if (focused !== document.body && !deck.current?.contains(focused)) return

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

  return (
    <section
      ref={deck}
      className="relative mx-auto flex w-full max-w-md flex-col justify-center gap-4"
      style={{
        minHeight: `calc(${historyDepth * historyStep + sourceCardHeight}px + 4.5rem)`,
      }}
      aria-labelledby="queue-title"
    >
      <h2 id="queue-title" className="sr-only">
        {t.upNext}
      </h2>
      <div
        className="relative select-none"
        aria-busy={showSkeleton}
        style={{ paddingTop: stackDepth * historyStep }}
      >
        {visibleHistory.map((source, index) => (
          <HistoryCard
            key={source.id}
            source={source}
            index={index}
            depth={stackDepth}
            onSelect={() => showHistorySource(source)}
          />
        ))}

        {showSkeleton ? (
          <SourceCardSkeleton showPeeks={showPeeks} />
        ) : frontSource ? (
          <SourceCard
            key={frontSource.id}
            source={frontSource}
            tags={cardTags(frontSource)}
            locale={locale}
            detailsHref={getRelativeLocaleUrl(
              locale,
              `sources/${frontSource.id}/`
            )}
          />
        ) : null}
      </div>

      <div className="mx-auto flex h-10 w-full max-w-52 justify-center gap-2">
        {(frontSource || showSkeleton) && (
          <>
            <Button
              type="button"
              size="lg"
              className="flex-1 motion-reduce:transition-none"
              disabled={loading || !frontSource}
              aria-disabled={transitioning || undefined}
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
              className="shrink-0 motion-reduce:transition-none"
              aria-label={t.refresh}
              title={t.refresh}
              disabled={loading || !frontSource}
              aria-disabled={transitioning || undefined}
              onClick={next}
            >
              <Shuffle aria-hidden="true" />
            </Button>
          </>
        )}
      </div>
      {!frontSource && !showSkeleton && (
        <Empty
          className="absolute inset-0 border-0 bg-transparent p-4"
          role="status"
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
                onClick={() =>
                  window.dispatchEvent(new Event(openFiltersEvent))
                }
              >
                {t.choose}
              </Button>
            </EmptyContent>
          )}
        </Empty>
      )}
    </section>
  )
}
