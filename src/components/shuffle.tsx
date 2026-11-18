import { useState } from "react"
import {
  ChevronDown,
  ExternalLink,
  RotateCcw,
  Shuffle as ShuffleIcon,
} from "lucide-react"
import { FilterSentence, TagMenu } from "@/components/filter-sentence"
import { SourceCard } from "@/components/source-card"
import { Button, buttonVariants } from "@/components/ui/button"
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

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

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
  const [current, setCurrent] = useState(() => pickSource(matching))
  const feeds = tags.filter((tag) => tag.kind === "feed")
  const isDefault = JSON.stringify(filters) === JSON.stringify(defaultFilters)

  function update(next: Filters) {
    writeFilters(next)
    setFilters(next)
    setCurrent(pickSource(sources.filter((source) => matches(source, next))))
  }

  function pickAgain() {
    const others = matching.filter((source) => source !== current)
    setCurrent(pickSource(others.length ? others : matching))
  }

  function open() {
    window.gtag?.("event", "shuffle")
    pickAgain()
  }

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
          <SourceCard
            source={current}
            tier={tiers.find((tier) => tier.id === current.tier)!}
            tags={tags.filter((tag) => current.tags.includes(tag.id))}
          >
            <Button size="xl" className="flex-1" onClick={pickAgain}>
              <ShuffleIcon data-icon="inline-start" aria-hidden="true" />
              Shuffle
            </Button>
            <a
              href={current.url}
              target="_blank"
              rel="noopener"
              onClick={open}
              className={buttonVariants({ variant: "outline", size: "xl" })}
            >
              Open
              <ExternalLink data-icon="inline-end" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </SourceCard>
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
