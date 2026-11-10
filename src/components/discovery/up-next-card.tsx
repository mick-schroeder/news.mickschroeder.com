import { useEffect, useEffectEvent, useRef } from "react"
import { ExternalLink, Shuffle } from "lucide-react"
import { historyDepth, historyStep } from "./history-card-style"
import { HistoryCard, SiteCard } from "./site-card"
import { siteCardHeight } from "./site-card-frame"
import { SiteCardSkeleton } from "./site-card-skeleton"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { translations, type Locale } from "@/i18n/ui"
import type { useDiscovery } from "./use-discovery"

type UpNextCardProps = {
  locale: Locale
  discovery: ReturnType<typeof useDiscovery>
}

export function UpNextCard({ locale, discovery }: UpNextCardProps) {
  const t = translations[locale]
  const deck = useRef<HTMLElement>(null)
  const {
    interests,
    loadFailed,
    site: frontSite,
    historySites,
    transitioning,
    next,
    shuffle,
    showPrevious,
    showHistorySite,
  } = discovery
  const loading = !interests && !loadFailed
  const hasInterests = Boolean(interests?.length)
  const showSkeleton = loading || transitioning
  const showPeeks = showSkeleton && !frontSite
  const visibleHistory = frontSite ? historySites.slice(0, historyDepth) : []
  const stackDepth = showPeeks ? historyDepth : visibleHistory.length

  const handleArrowKey = useEffectEvent((event: KeyboardEvent) => {
    if (showSkeleton || !frontSite || event.defaultPrevented) return
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
      className="relative mx-auto flex w-full max-w-md flex-col justify-center gap-4 lg:max-w-none"
      style={{
        minHeight: `calc(${historyDepth * historyStep + siteCardHeight}px + 4.5rem)`,
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
        {visibleHistory.map((site, index) => (
          <HistoryCard
            key={site.url}
            site={site}
            index={index}
            depth={stackDepth}
            onSelect={() => showHistorySite(site)}
          />
        ))}

        {showSkeleton ? (
          <SiteCardSkeleton showPeeks={showPeeks} />
        ) : frontSite ? (
          <SiteCard
            key={frontSite.url}
            site={frontSite}
            opensInNewTab={t.opensInNewTab}
          />
        ) : null}
      </div>

      <div className="mx-auto flex h-10 w-full max-w-52 justify-center gap-2">
        {(frontSite || showSkeleton) && (
          <>
            <Button
              type="button"
              size="lg"
              className="flex-1 font-bold motion-reduce:transition-none dark:bg-green-800 dark:text-white dark:hover:bg-green-900"
              disabled={loading || !frontSite}
              aria-disabled={transitioning || undefined}
              onClick={shuffle}
            >
              <span>{t.shuffle}</span>
              <span className="sr-only">({t.opensInNewTab})</span>
              <ExternalLink
                className="size-4"
                strokeWidth={2.75}
                aria-hidden="true"
              />
            </Button>
            <Button
              type="button"
              size="icon-lg"
              variant="secondary"
              className="shrink-0 motion-reduce:transition-none"
              aria-label={t.refresh}
              title={t.refresh}
              disabled={loading || !frontSite}
              aria-disabled={transitioning || undefined}
              onClick={next}
            >
              <Shuffle
                strokeWidth={3}
                className="size-5"
                aria-hidden="true"
              />
            </Button>
          </>
        )}
      </div>
      {!frontSite && !showSkeleton && (
        <Empty
          className="absolute inset-0 border-0 bg-transparent p-4"
          role="status"
        >
          <EmptyHeader>
            <EmptyMedia className="mb-0 text-muted-foreground">
              <Shuffle strokeWidth={3} className="size-6" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="font-semibold">
              {loadFailed
                ? t.catalogError
                : hasInterests
                  ? t.noMatchesTitle
                  : t.choose}
            </EmptyTitle>
            <EmptyDescription>
              {loadFailed
                ? t.reloadHint
                : hasInterests
                  ? t.noMatchesHint
                  : t.ready}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </section>
  )
}
