import { ExternalLink, Globe } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { favicon, type Website } from "@/lib/discovery"
import { historyCardStyle } from "./history-card-style"

export function SiteCard({
  site,
  opensInNewTab,
}: {
  site: Website
  opensInNewTab: string
}) {
  const hostname = new URL(site.url).hostname.replace(/^www\./, "")

  return (
    <Card className="group relative z-40 h-[90px] rounded-2xl py-0 shadow-md transition-[border-color,box-shadow] hover:border-ring/50 hover:shadow-lg active:shadow-sm motion-reduce:transition-none">
      <a
        href={site.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${site.name} (${opensInNewTab})`}
        className="flex min-h-[88px] flex-col justify-center rounded-[inherit] p-5 transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring active:bg-muted motion-reduce:transition-none"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3.5">
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
            <div className="min-w-0">
              <h3 className="line-clamp-1 text-xl font-bold tracking-tight text-foreground">
                {site.name}
              </h3>
              <p className="truncate text-xs font-medium text-muted-foreground">
                {hostname}
              </p>
            </div>
          </div>
          <span
            aria-hidden="true"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/30 text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground motion-reduce:transition-none"
          >
            <ExternalLink className="size-4" />
          </span>
        </div>
      </a>
    </Card>
  )
}

export function HistoryCard({
  site,
  index,
  onSelect,
}: {
  site: Website
  index: number
  onSelect: () => void
}) {
  return (
    <Card
      style={historyCardStyle(index)}
      className="group absolute inset-x-0 bottom-0 origin-top rounded-2xl border-border/80 bg-muted py-0 text-muted-foreground transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:border-foreground/30 hover:text-foreground motion-safe:hover:-translate-y-1 motion-reduce:transition-none"
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex h-8 w-full min-w-0 shrink-0 items-center gap-2 rounded-t-[inherit] px-3.5 text-left select-none focus-visible:-outline-offset-2"
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
      </button>
    </Card>
  )
}
