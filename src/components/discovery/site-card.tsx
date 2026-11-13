import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { hostOf, type Site, type Tag } from "@/lib/sites"
import { tagLabel } from "@/lib/tag-display"
import { translations, type Locale } from "@/i18n/ui"
import { TagIcon } from "@/components/tag-icon"
import { TierBadge } from "@/components/tier-badge"
import { SiteIcon } from "@/components/sources/site-icon"
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
  siteCardClassName,
} from "./site-card-frame"

export function SiteCard({
  site,
  tags,
  locale,
  detailsHref,
}: {
  site: Site
  tags: Tag[]
  locale: Locale
  detailsHref: string
}) {
  const t = translations[locale]

  // The whole card opens the site; the title opens its details page instead.
  return (
    <Item
      variant="outline"
      className={cn(
        siteCardClassName,
        "has-[a[data-site]:hover]:bg-muted motion-reduce:transition-none"
      )}
    >
      <div className="flex w-full min-w-0 items-center gap-3.5">
        <ItemMedia>
          <SiteIcon site={site} size="md" className="size-10 p-1.5 text-lg" />
        </ItemMedia>
        <ItemContent className="min-w-0">
          <ItemTitle className="block w-full truncate text-base">
            <a
              href={detailsHref}
              className="relative z-10 underline decoration-muted-foreground/40 underline-offset-4 outline-none hover:decoration-current focus-visible:decoration-current"
            >
              {site.title}
            </a>
          </ItemTitle>
          <ItemDescription className="block truncate text-xs">
            {hostOf(site.url)}
          </ItemDescription>
        </ItemContent>
        <TierBadge tier={site.tier} locale={locale} />
      </div>
      <p
        lang="en"
        className="line-clamp-2 min-h-10 w-full text-sm leading-5 text-pretty text-muted-foreground"
      >
        {site.description}
      </p>
      <div className="flex w-full min-w-0 items-center gap-2">
        <ul className="flex min-w-0 flex-1 gap-1.5 overflow-hidden">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full border border-border px-2 text-xs text-muted-foreground"
            >
              <TagIcon tag={tag} className="size-3" aria-hidden="true" />
              {tagLabel(tag, locale)}
            </li>
          ))}
        </ul>
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          data-site
          aria-label={`${site.title} (${t.opensInNewTab})`}
          className="rounded-[inherit] text-muted-foreground outline-none after:absolute after:inset-0 after:rounded-[inherit] focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      </div>
    </Item>
  )
}

export function HistoryCard({
  site,
  index,
  depth,
  onSelect,
}: {
  site: Site
  index: number
  depth: number
  onSelect: () => void
}) {
  return (
    <HistoryCardFrame index={index} depth={depth}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onSelect}
        className={cn(
          historyCardRow,
          "w-full justify-start rounded-t-[inherit] border-0 text-left hover:bg-transparent focus-visible:ring-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring active:not-aria-[haspopup]:translate-y-0 motion-reduce:transition-none dark:hover:bg-transparent"
        )}
      >
        <SiteIcon
          site={site}
          size="xs"
          className="opacity-80 grayscale transition group-focus-within:grayscale-0 group-hover:opacity-100 group-hover:grayscale-0"
        />
        <span className="truncate text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          {site.title}
        </span>
      </Button>
    </HistoryCardFrame>
  )
}
