import { useState, type MouseEvent } from "react"
import { ChevronDown, RotateCcw, Shuffle as ShuffleIcon } from "lucide-react"
import { FilterSentence, TagMenu } from "@/components/filter-sentence"
import { SourceCard } from "@/components/source-card"
import { ExternalLink } from "@/components/external-link"
import { Button } from "@/components/ui/button"
import { usePick } from "@/hooks/use-pick"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  defaultFilters,
  matches,
  pickSource,
  readFilters,
  writeFilters,
  type Filters,
  type Source,
  type Tag,
  type TierInfo,
} from "@/lib/shuffle"

type Pick = Omit<Source, "similar">

/** The home page: filters, a random matching source, and buttons to open it or pick again. */
export function Shuffle({
  sources,
  tags,
  tiers,
}: {
  sources: Omit<Source, "similar">[]
  tags: Tag[]
  tiers: TierInfo[]
}) {
  // Rendered with client:only, so localStorage is available here.
  const [filters, setFilters] = useState(() =>
    readFilters(new Set([...tags, ...tiers].map((item) => item.id)))
  )
  const matching = sources.filter((source) => matches(source, filters))
  // First pick skips the minimum; the page's fallback skeleton already showed.
  const [card, pick] = usePick(() => pickSource(matching), 0)
  const current = card.status === "empty" ? undefined : card.source
  const loading = card.status === "loading"
  const feeds = tags.filter((tag) => tag.kind === "feed")
  const isDefault = JSON.stringify(filters) === JSON.stringify(defaultFilters)

  function update(next: Filters) {
    writeFilters(next)
    setFilters(next)
    pick(pickSource(sources.filter((source) => matches(source, next))))
  }

  function pickAgain() {
    if (loading) return
    const others = matching.filter((source) => source !== current)
    pick(pickSource(others.length ? others : matching))
  }

  function open(event: MouseEvent) {
    if (loading) return event.preventDefault()
    window.gtag?.("event", "shuffle")
    pickAgain()
  }

  // Kept mounted across picks, so focus stays put.
  const actions = (source: Pick) => (
    <>
      <Button
        size="xl"
        className="flex-1"
        disabled={loading}
        focusableWhenDisabled
        onClick={pickAgain}
      >
        <ShuffleIcon data-icon="inline-start" aria-hidden="true" />
        Shuffle
      </Button>
      <ExternalLink
        href={source.url}
        button={{ variant: "outline", size: "xl" }}
        aria-disabled={loading}
        onClick={open}
      >
        Open
      </ExternalLink>
    </>
  )

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pt-2">
      <FilterSentence
        tags={tags}
        tiers={tiers}
        filters={filters}
        onChange={update}
      />
      <div className="-mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span aria-live="polite">
          {matching.length === 1 ? "1 source" : `${matching.length} sources`}
        </span>
        <span aria-hidden="true">·</span>
        <TagMenu
          label="Feeds"
          any="All feeds"
          tags={feeds}
          selected={filters.feed}
          onChange={(feed) => update({ ...filters, feed })}
          trigger={<Button variant="ghost" size="sm" />}
        >
          {filters.feed.length
            ? `${filters.feed.length} feed${filters.feed.length > 1 ? "s" : ""}`
            : "All feeds"}
          <ChevronDown data-icon="inline-end" aria-hidden="true" />
        </TagMenu>
        {!isDefault && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Reset filters"
            title="Reset filters"
            onClick={() => update(defaultFilters)}
          >
            <RotateCcw aria-hidden="true" />
          </Button>
        )}
      </div>

      <div className="mx-auto w-full max-w-xl space-y-6">
        {current ? (
          <div aria-busy={loading}>
            <SourceCard
              source={current}
              tier={tiers.find((tier) => tier.id === current.tier)}
              tags={tags.filter((tag) => current.tags.includes(tag.id))}
              loading={loading}
            >
              {actions(current)}
            </SourceCard>
          </div>
        ) : (
          <Empty className="border">
            <EmptyHeader>
              <EmptyTitle>No sources match</EmptyTitle>
              <EmptyDescription>
                Try more tiers or fewer filters.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => update(defaultFilters)}>
                Reset filters
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </div>
  )
}
