import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { tagLabel, type Source, type Tag } from "@/lib/sources"
import { translations, type Locale } from "@/i18n/ui"
import { TagIcon } from "@/components/tag-icon"
import { TierBadge } from "@/components/tier-badge"
import { HostLink } from "@/components/sources/host-link"
import { SourceIcon } from "@/components/sources/source-icon"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  HistoryCardFrame,
  historyCardRow,
  sourceCardClassName,
} from "./source-card-frame"

export function SourceCard({
  source,
  tags,
  locale,
  detailsHref,
}: {
  source: Source
  tags: Tag[]
  locale: Locale
  detailsHref: string
}) {
  const t = translations[locale]

  // The whole card opens the source; the title opens its details page instead.
  return (
    <Item
      variant="outline"
      className={cn(
        sourceCardClassName,
        "has-[a[data-source]:hover]:bg-muted motion-reduce:transition-none"
      )}
    >
      <div className="flex w-full min-w-0 items-center gap-3.5">
        <ItemMedia>
          <SourceIcon
            source={source}
            size="md"
            className="size-10 p-1.5 text-lg"
          />
        </ItemMedia>
        <ItemContent className="min-w-0">
          <ItemTitle className="block w-full truncate text-base">
            <a
              href={detailsHref}
              className="relative z-10 underline decoration-muted-foreground/40 underline-offset-4 outline-none hover:decoration-current focus-visible:decoration-current"
            >
              {source.title}
            </a>
          </ItemTitle>
          <ItemDescription className="block truncate text-xs">
            {/* Wrapped, so ItemDescription's always-underlined link style skips it. */}
            <span>
              <HostLink
                url={source.url}
                locale={locale}
                className="relative z-10"
              />
            </span>
          </ItemDescription>
        </ItemContent>
        <TierBadge tier={source.tier} locale={locale} />
      </div>
      <p
        lang="en"
        className="line-clamp-3 min-h-15 w-full text-sm leading-5 text-pretty text-muted-foreground"
      >
        {source.description}
      </p>
      <div className="flex w-full min-w-0 items-center gap-2">
        <ul className="flex min-w-0 flex-1 gap-1.5 overflow-hidden">
          {tags.map((tag) => (
            <li key={tag.id} className="shrink-0">
              <Badge variant="outline" className="text-muted-foreground">
                <TagIcon
                  tag={tag}
                  data-icon="inline-start"
                  aria-hidden="true"
                />
                {tagLabel(tag)}
              </Badge>
            </li>
          ))}
        </ul>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          data-source
          aria-label={`${source.title} (${t.opensInNewTab})`}
          className="rounded-[inherit] text-muted-foreground outline-none after:absolute after:inset-0 after:rounded-[inherit] focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      </div>
    </Item>
  )
}

export function HistoryCard({
  source,
  index,
  depth,
  onSelect,
}: {
  source: Source
  index: number
  depth: number
  onSelect: () => void
}) {
  return (
    <HistoryCardFrame index={index} depth={depth}>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          historyCardRow,
          "w-full rounded-t-[inherit] text-left outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        )}
      >
        <SourceIcon
          source={source}
          size="xs"
          className="opacity-80 grayscale transition group-focus-within:grayscale-0 group-hover:opacity-100 group-hover:grayscale-0"
        />
        <span className="truncate text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          {source.title}
        </span>
      </button>
    </HistoryCardFrame>
  )
}
