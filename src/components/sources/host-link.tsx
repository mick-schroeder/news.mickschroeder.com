import { ExternalLink } from "lucide-react"
import { translations, type Locale } from "@/i18n/ui"
import { hostOf } from "@/lib/sources"
import { cn } from "@/lib/utils"

/** A source's host, opening the source in a new tab. */
export function HostLink({
  url,
  locale,
  className,
}: {
  url: string
  locale: Locale
  className?: string
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-sm no-underline underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <span className="truncate">{hostOf(url)}</span>
      <span className="sr-only">({translations[locale].opensInNewTab})</span>
      <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
    </a>
  )
}
