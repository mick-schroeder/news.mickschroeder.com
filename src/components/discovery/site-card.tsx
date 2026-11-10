import { ExternalLink, Globe } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { favicon, type Website } from "@/lib/discovery"
import {
  Item,
  ItemActions,
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
  opensInNewTab,
}: {
  site: Website
  opensInNewTab: string
}) {
  const hostname = new URL(site.url).hostname.replace(/^www\./, "")

  return (
    <Item
      variant="outline"
      className={cn(siteCardClassName, "motion-reduce:transition-none")}
      render={
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${site.name} (${opensInNewTab})`}
        />
      }
    >
      <ItemMedia>
        <Avatar size="lg">
          <AvatarImage
            src={favicon(site.url)}
            alt=""
            referrerPolicy="no-referrer"
            className="object-contain"
          />
          <AvatarFallback>
            <Globe className="size-5" />
          </AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle className="block w-full truncate">{site.name}</ItemTitle>
        <ItemDescription className="block truncate text-xs">
          {hostname}
        </ItemDescription>
      </ItemContent>
      <ItemActions aria-hidden="true" className="text-muted-foreground">
        <ExternalLink className="size-4" />
      </ItemActions>
    </Item>
  )
}

export function HistoryCard({
  site,
  index,
  depth,
  onSelect,
}: {
  site: Website
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
        <Avatar
          size="sm"
          className="size-4.5 shrink-0 rounded-xs border border-border/60 bg-background/80 p-0.5 opacity-80 transition-opacity group-hover:opacity-100 after:rounded-xs"
        >
          <AvatarImage
            src={favicon(site.url)}
            alt=""
            referrerPolicy="no-referrer"
            className="rounded-xs object-contain grayscale group-focus-within:grayscale-0 group-hover:grayscale-0"
          />
          <AvatarFallback className="rounded-xs text-[8px]">
            <Globe className="size-2.5" />
          </AvatarFallback>
        </Avatar>
        <span className="truncate text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          {site.name}
        </span>
      </Button>
    </HistoryCardFrame>
  )
}
