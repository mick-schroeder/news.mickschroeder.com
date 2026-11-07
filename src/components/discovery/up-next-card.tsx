import { useEffect, useEffectEvent, useRef } from "react"
import { ArrowDown, ExternalLink, Shuffle } from "lucide-react"
import { historyDepth, historyStep } from "./history-card-style"
import { HistoryCard, SiteCard } from "./site-card"
import { SiteCardSkeleton } from "./site-card-skeleton"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { translations, type Locale } from "@/i18n/ui"
import type { useDiscovery } from "./use-discovery"

type UpNextCardProps = {
  locale: Locale
  discovery: ReturnType<typeof useDiscovery>
  onChooseInterests: () => void
}

export function UpNextCard({
  locale,
  discovery,
  onChooseInterests,
}: UpNextCardProps) {
  const t = translations[locale]
  const deck = useRef<HTMLElement>(null)
  const {
    interests,
    loadFailed,
    retry,
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
      className="mx-auto flex w-full max-w-md flex-col gap-6 md:max-w-none"
      aria-labelledby="queue-title"
    >
      <h2 id="queue-title" className="sr-only">
        {t.upNext}
      </h2>
      <div
        className="relative mx-5 mt-4 select-none sm:mx-8"
        aria-busy={showSkeleton}
        style={{
          paddingTop:
            showSkeleton || frontSite ? historyDepth * historyStep : 0,
        }}
      >
        {frontSite &&
          !loading &&
          historySites
            .slice(0, historyDepth)
            .map((site, index) => (
              <HistoryCard
                key={site.id}
                site={site}
                index={index}
                onSelect={() => showHistorySite(site)}
              />
            ))}

        {showSkeleton ? (
          <SiteCardSkeleton showPeeks={!frontSite || loading} />
        ) : frontSite ? (
          <SiteCard
            key={frontSite.id}
            site={frontSite}
            opensInNewTab={t.opensInNewTab}
          />
        ) : (
          <Card className="flex min-h-[314px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-6 text-center shadow-xs">
            <Empty className="border-0 bg-transparent p-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Shuffle
                    className="size-6 text-muted-foreground"
                    aria-hidden="true"
                  />
                </EmptyMedia>
                <EmptyTitle className="text-base font-bold text-foreground">
                  {loadFailed
                    ? t.catalogError
                    : hasInterests
                      ? t.empty
                      : t.ready}
                </EmptyTitle>
              </EmptyHeader>
              {loadFailed ? (
                <Button type="button" size="sm" onClick={retry}>
                  {t.retry}
                </Button>
              ) : (
                !hasInterests && (
                  <Button
                    type="button"
                    size="sm"
                    className="group"
                    onClick={onChooseInterests}
                  >
                    {t.choose}
                    <ArrowDown className="nudge-icon" aria-hidden="true" />
                  </Button>
                )
              )}
            </Empty>
          </Card>
        )}
      </div>

      {(frontSite || showSkeleton) && (
        <div className="mx-auto flex w-full max-w-52 gap-2">
          <Button
            type="button"
            size="lg"
            className="group h-12 flex-1 rounded-xl text-base font-bold motion-reduce:transition-none"
            disabled={loading || !frontSite}
            aria-disabled={transitioning || undefined}
            onClick={shuffle}
          >
            <span>{t.shuffle}</span>
            <span className="sr-only">({t.opensInNewTab})</span>
            <ExternalLink
              className="size-4 nudge-icon opacity-75"
              aria-hidden="true"
            />
          </Button>
          <Button
            type="button"
            size="icon-lg"
            variant="secondary"
            className="group size-12 shrink-0 rounded-xl motion-reduce:transition-none"
            aria-label={t.refresh}
            title={t.refresh}
            disabled={loading || !frontSite}
            aria-disabled={transitioning || undefined}
            onClick={next}
          >
            <Shuffle className="size-5 nudge-icon" aria-hidden="true" />
          </Button>
        </div>
      )}
    </section>
  )
}
