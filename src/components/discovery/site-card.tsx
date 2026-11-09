import { ExternalLink, Globe } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { favicon, type Website } from "@/lib/discovery"
import {
  HistoryCardFrame,
  historyCardRow,
  SiteCardFrame,
  siteCardBody,
  SiteCardRow,
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
    <SiteCardFrame>
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${site.name} (${opensInNewTab})`}
        className={cn(
          siteCardBody,
          "rounded-[inherit] transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring active:bg-muted motion-reduce:transition-none"
        )}
      >
        <SiteCardRow
          icon={
            <Avatar
              size="lg"
              className="size-12 shrink-0 rounded-xl border border-border/80 bg-muted/40 p-1 shadow-2xs after:rounded-xl"
            >
              <AvatarImage
                src={favicon(site.url)}
                alt=""
                referrerPolicy="no-referrer"
                className="rounded-lg object-contain p-1"
              />
              <AvatarFallback className="rounded-lg">
                <Globe className="size-5" />
              </AvatarFallback>
            </Avatar>
          }
          label={
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-xl font-bold tracking-tight text-foreground">
                {site.name}
              </h3>
              <p className="truncate text-xs font-medium text-muted-foreground">
                {hostname}
              </p>
            </div>
          }
          action={
            <span
              aria-hidden="true"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground motion-reduce:transition-none"
            >
              <ExternalLink className="size-4" />
            </span>
          }
        />
      </a>
    </SiteCardFrame>
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
