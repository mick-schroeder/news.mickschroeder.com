import { getRelativeLocaleUrl } from "astro:i18n"
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  Shuffle,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { TierBadge } from "@/components/tier-badge"
import type { Locale } from "@/i18n/locales"
import { translations } from "@/i18n/ui"
import {
  facets,
  hostOf,
  tagsByFacet,
  type Source,
  type Tag,
} from "@/lib/sources"
import { cn } from "@/lib/utils"
import { SourceIcon } from "./source-icon"
import { HostLink } from "./host-link"
import { TagChips } from "./tag-chips"

const external = { target: "_blank", rel: "noopener noreferrer" } as const

/** A source: identity and tier up top, description, then its tags. */
export function SourceDetails({
  source,
  tags,
  locale,
}: {
  source: Source
  /** All tags; the source's own are picked out by kind. */
  tags: Tag[]
  locale: Locale
}) {
  const t = translations[locale]
  const own = (list: Tag[]) =>
    list.filter((tag) => source.tags.includes(tag.id))
  const groups = tagsByFacet(tags)
  const rows = facets
    .map((facet) => ({
      label: t[facet],
      tags: own(groups[facet]),
      variant: facet === "feed" ? ("secondary" as const) : undefined,
    }))
    .filter((row) => row.tags.length)

  return (
    <Card className="min-w-0">
      <CardHeader className="items-center">
        <div className="flex min-w-0 items-center gap-4">
          <SourceIcon source={source} size="md" />
          <div className="min-w-0 space-y-1">
            {/* Title and host styled like the home page Up next card. */}
            <CardTitle className="text-lg leading-snug font-medium break-words sm:text-xl">
              <h1>{source.title}</h1>
            </CardTitle>
            <CardDescription>
              <HostLink url={source.url} locale={locale} />
            </CardDescription>
          </div>
        </div>
        <CardAction className="self-center">
          <a
            href={`${getRelativeLocaleUrl(locale, "sources/")}#tier-${source.tier.toLowerCase()}`}
            className="inline-flex rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <TierBadge
              tier={source.tier}
              locale={locale}
              className="size-11 rounded-lg text-xl"
            />
          </a>
        </CardAction>
      </CardHeader>
      {/* Same height whatever the text, so the controls below stay put. */}
      <CardContent className="min-h-26">
        {source.description ? (
          <p
            lang="en"
            className="line-clamp-4 text-base leading-relaxed text-pretty"
            title={source.description}
          >
            {source.description}
          </p>
        ) : (
          <Empty className="gap-2 border p-4">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText aria-hidden="true" />
              </EmptyMedia>
              <EmptyDescription>{t.noDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
      <Separator />
      <CardContent>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          {rows.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-xs font-semibold text-muted-foreground">
                {row.label}
              </dt>
              <dd className="min-w-0">
                <TagChips
                  locale={locale}
                  tags={row.tags}
                  label={row.label}
                  variant={row.variant}
                />
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

/**
 * Previous, Open, random and next as one group. Links styled with
 * buttonVariants, not <Button render>, which would give them role="button".
 */
export function SourceNav({
  source,
  previous,
  next,
  random,
  locale,
}: {
  source: Source
  previous: Source
  next: Source
  /** Fallback pick; a script swaps in a fresh one per click. */
  random: Source
  locale: Locale
}) {
  const t = translations[locale]
  const href = (source: Source) =>
    getRelativeLocaleUrl(locale, `sources/${source.id}/`)
  // Secondary, like the shuffle button beside Open on the home page.
  const icon = buttonVariants({ variant: "secondary", size: "icon-lg" })
  return (
    <ButtonGroup className="mx-auto" aria-label={source.title}>
      <a
        href={href(previous)}
        rel="prev"
        data-astro-prefetch
        data-slot="button"
        className={icon}
        aria-label={t.previous}
        title={previous.title}
      >
        <ChevronLeft aria-hidden="true" />
      </a>
      <a
        href={source.url}
        {...external}
        data-slot="button"
        className={cn(buttonVariants({ size: "lg" }), "w-32")}
      >
        {t.open}
        <span className="sr-only">({t.opensInNewTab})</span>
        <ExternalLink data-icon="inline-end" aria-hidden="true" />
      </a>
      <a
        href={href(random)}
        data-random-source={source.id}
        data-slot="button"
        className={icon}
        aria-label={t.randomSource}
        title={t.randomSource}
      >
        <Shuffle aria-hidden="true" />
      </a>
      <a
        href={href(next)}
        rel="next"
        data-astro-prefetch
        data-slot="button"
        className={icon}
        aria-label={t.next}
        title={next.title}
      >
        <ChevronRight aria-hidden="true" />
      </a>
    </ButtonGroup>
  )
}

/** Links to similar sources, each with its tier. */
export function SimilarSources({
  sources,
  locale,
}: {
  sources: Source[]
  locale: Locale
}) {
  const t = translations[locale]
  if (!sources.length) return null
  return (
    <section aria-labelledby="similar-title" className="space-y-3">
      <h2 id="similar-title" className="heading-section">
        {t.similarSources}
      </h2>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {sources.map((source) => (
          <li key={source.id}>
            <Item
              variant="outline"
              size="sm"
              className="flex-nowrap"
              render={
                <a
                  href={getRelativeLocaleUrl(locale, `sources/${source.id}/`)}
                />
              }
            >
              <ItemMedia>
                <SourceIcon source={source} size="sm" className="size-8" />
              </ItemMedia>
              <ItemContent className="min-w-0 gap-0">
                <ItemTitle className="w-full truncate">
                  {source.title}
                </ItemTitle>
                <ItemDescription className="truncate text-xs">
                  {hostOf(source.url)}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <TierBadge tier={source.tier} locale={locale} />
                <ChevronRight
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </ItemActions>
            </Item>
          </li>
        ))}
      </ul>
    </section>
  )
}
