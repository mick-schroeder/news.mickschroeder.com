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
  TextureCard,
  TextureCardContent,
  TextureCardHeader,
  TextureSeparator,
} from "@/components/ui/texture-card"
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
import {
  cardIconClass,
  cardIconMotion,
  cardMotion,
  iconMotion,
  SourceIcon,
} from "./source-icon"
import { HostLink } from "./host-link"
import { labelBody, labelHost, labelTitle } from "./label-type"
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
    <TextureCard className="min-w-0" style={cardMotion(source.id)}>
      {/* Set like the shuffle card: label title, tracked host, a rule. */}
      <TextureCardHeader className="flex items-center gap-4 pb-5">
        <SourceIcon
          source={source}
          size="md"
          className={cn("size-14 shrink-0 rounded-2xl p-2", cardIconClass)}
          style={cardIconMotion(source.id)}
        />
        <div className="min-w-0 flex-1 space-y-2">
          <h1
            className={cn(
              labelTitle,
              "text-[1.625rem] break-words sm:text-[2rem]"
            )}
          >
            {source.title}
          </h1>
          <p className={cn(labelHost, "text-muted-foreground")}>
            <HostLink
              url={source.url}
              locale={locale}
              className="[&_svg]:size-3"
            />
          </p>
        </div>
        <a
          href={`${getRelativeLocaleUrl(locale, "sources/")}#tier-${source.tier.toLowerCase()}`}
          className="inline-flex shrink-0 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <TierBadge tier={source.tier} locale={locale} size="lg" />
        </a>
      </TextureCardHeader>
      <TextureSeparator className="mx-6" />
      {/* Same height whatever the text, so the controls below stay put. */}
      <TextureCardContent className="min-h-26 py-5">
        {source.description ? (
          <p
            lang="en"
            className={cn(labelBody, "line-clamp-4 text-base")}
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
      </TextureCardContent>
      <TextureSeparator className="mx-6" />
      <TextureCardContent className="pt-5 pb-6">
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
      </TextureCardContent>
    </TextureCard>
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
        data-motion="back"
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
        data-motion="next"
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
        data-motion="next"
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
                <SourceIcon
                  source={source}
                  size="sm"
                  className="size-8"
                  style={iconMotion(source.id)}
                />
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
