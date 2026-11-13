import { ExternalLink } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TierBadge } from "@/components/tier-badge"
import type { Locale } from "@/i18n/locales"
import { translations } from "@/i18n/ui"
import { localePath } from "@/lib/paths"
import { facets, hostOf, type Site, type Tag } from "@/lib/sites"
import { cn } from "@/lib/utils"
import { SiteIcon } from "./site-icon"
import { TagChips } from "./tag-chips"

const external = { target: "_blank", rel: "noopener noreferrer" } as const

/** A source: identity and Visit up top, description, then its tags. */
export function SourceDetails({
  source,
  tags,
  locale,
}: {
  source: Site
  /** All tags; the source's own are picked out by kind. */
  tags: Tag[]
  locale: Locale
}) {
  const t = translations[locale]
  const own = (list: Tag[]) =>
    list.filter((tag) => source.tags.includes(tag.id))
  const { topics, regions, seenOn } = facets(tags)
  const rows = [
    { label: t.topics, tags: own(topics) },
    { label: t.where, tags: own(regions) },
    { label: t.seenOn, tags: own(seenOn) },
  ].filter((row) => row.tags.length)

  return (
    <Card className="min-w-0">
      <CardHeader className="items-center">
        <div className="flex min-w-0 items-center gap-4">
          <SiteIcon url={source.url} size="lg" />
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-xl leading-tight font-bold tracking-tight break-words sm:text-2xl">
              <h1>{source.title}</h1>
            </CardTitle>
            <CardDescription className="truncate">
              {hostOf(source.url)}
            </CardDescription>
          </div>
        </div>
        <CardAction className="self-center">
          <a
            href={source.url}
            {...external}
            data-slot="button"
            className={cn(buttonVariants({ size: "lg" }), "font-bold")}
          >
            {t.visit}
            <span className="sr-only">({t.opensInNewTab})</span>
            <ExternalLink data-icon="inline-end" aria-hidden="true" />
          </a>
        </CardAction>
      </CardHeader>
      {source.description && (
        <CardContent>
          <p lang="en" className="text-base leading-relaxed text-pretty">
            {source.description}
          </p>
        </CardContent>
      )}
      <Separator />
      <CardContent>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          <dt className="text-xs font-semibold text-muted-foreground">
            {t.tier}
          </dt>
          <dd>
            <a
              href={localePath(
                locale,
                `sources/#tier-${source.tier.toLowerCase()}`
              )}
              className="inline-flex rounded-md underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <TierBadge tier={source.tier} locale={locale} />
            </a>
          </dd>
          {rows.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-xs font-semibold text-muted-foreground">
                {row.label}
              </dt>
              <dd className="min-w-0">
                <TagChips locale={locale} tags={row.tags} label={row.label} />
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

/** Links to similar sources, each with its tier. */
export function SimilarSites({
  sites,
  locale,
}: {
  sites: Site[]
  locale: Locale
}) {
  const t = translations[locale]
  if (!sites.length) return null
  return (
    <section aria-labelledby="similar-title" className="space-y-3">
      <h2
        id="similar-title"
        className="text-lg font-bold tracking-tight text-foreground"
      >
        {t.similarSites}
      </h2>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {sites.map((site) => (
          <li key={site.id}>
            <a
              href={localePath(locale, `sources/${site.id}/`)}
              className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <SiteIcon url={site.url} size="sm" className="size-8" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {site.title}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {hostOf(site.url)}
                </span>
              </span>
              <TierBadge tier={site.tier} locale={locale} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
