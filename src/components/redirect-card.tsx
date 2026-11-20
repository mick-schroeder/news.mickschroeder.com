import { useEffect } from "react"
import { SourceIcon } from "@/components/source-icon"
import { TierBadge } from "@/components/tier-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { minLoadingMs, usePick } from "@/hooks/use-pick"
import {
  matches,
  pickSource,
  readFilters,
  type Source,
  type TierInfo,
} from "@/lib/shuffle"
import { hostOf } from "@/lib/utils"

export type RedirectSource = Pick<
  Source,
  "title" | "url" | "icon" | "tier" | "tags"
>

/** How long the ready pick shows before leaving; with loading, about 1.2s. */
const showMs = 700

const frame = "w-full max-w-md flex-none bg-card ring-1 ring-foreground/10"

/** "Redirecting…" with the pick, or its skeleton while it loads. */
export function RedirectCard({
  source,
  tier,
  loading = false,
}: {
  source?: RedirectSource
  tier?: TierInfo
  loading?: boolean
}) {
  const shown = !loading && source && tier
  return (
    <Empty className={frame}>
      <EmptyHeader>
        <EmptyMedia>
          <Spinner className="size-8 text-primary" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle className="font-heading text-3xl font-semibold">
          <h1>Redirecting…</h1>
        </EmptyTitle>
      </EmptyHeader>
      <EmptyContent className="gap-4">
        <div
          aria-live="polite"
          aria-busy={!shown}
          className="flex w-full items-center gap-3 rounded-xl p-3 text-left ring-1 ring-foreground/10"
        >
          {shown ? (
            <>
              <SourceIcon source={source} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {source.title}
                </span>
                <span className="block truncate text-sm text-muted-foreground">
                  {hostOf(source.url)}
                </span>
              </span>
              <TierBadge tier={tier} className="size-7" />
            </>
          ) : (
            <>
              <Skeleton className="size-10 shrink-0 rounded-[22%]" />
              <span className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </span>
              <Skeleton className="size-7 shrink-0 rounded-full" />
            </>
          )}
        </div>
        <EmptyDescription>
          If you don't wish to wait,{" "}
          <a href={source?.url ?? "/"} className="break-all">
            go now
          </a>
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  )
}

/** Picks a source, shows it like the shuffle card does, then goes there. */
export function Redirect({
  sources,
  tiers,
  savedFilters = false,
}: {
  sources: RedirectSource[]
  tiers: TierInfo[]
  /** Use the visitor's saved filters. */
  savedFilters?: boolean
}) {
  // Rendered with client:only, so localStorage is available here.
  const [pick] = usePick(() => {
    if (!savedFilters) return pickSource(sources)
    const known = new Set(sources.flatMap((s) => [s.tier, ...s.tags]))
    const filters = readFilters(known)
    return pickSource(sources.filter((source) => matches(source, filters)))
  }, minLoadingMs)

  useEffect(() => {
    if (pick.status !== "ready") return
    const timer = setTimeout(() => location.replace(pick.source.url), showMs)
    return () => clearTimeout(timer)
  }, [pick])

  if (pick.status === "empty") {
    return (
      <Empty className={frame}>
        <EmptyHeader>
          <EmptyTitle className="font-heading text-3xl font-semibold">
            <h1>No sources match</h1>
          </EmptyTitle>
          <EmptyDescription>Try more tiers or fewer filters.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <a href="/" className={buttonVariants()}>
            Change your filters
          </a>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <RedirectCard
      source={pick.source}
      tier={tiers.find((tier) => tier.id === pick.source.tier)}
      loading={pick.status === "loading"}
    />
  )
}
