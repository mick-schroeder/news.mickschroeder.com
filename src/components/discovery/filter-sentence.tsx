import { ChevronDown, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TagIcon } from "@/components/tag-icon"
import { TierBadge } from "@/components/tier-badge"
import { format, translations, type Locale } from "@/i18n/ui"
import {
  defaultFilters,
  filterSources,
  tagLabel,
  tagsByFacet,
  tiers,
  type Tag,
} from "@/lib/sources"
import { cn } from "@/lib/utils"
import { FilterMenu, summary } from "./filter-menu"
import { useFilters, useSources } from "./use-filters"

// Inline word trigger; the dotted underline marks a menu.
const wordTrigger =
  "h-auto gap-[0.15em] rounded-md px-[0.15em] py-0 font-headline text-[length:inherit] leading-[inherit] font-semibold tracking-[inherit] text-foreground decoration-primary decoration-dotted decoration-[0.06em] underline-offset-[0.16em] [&_svg:not([class*='size-'])]:size-[0.45em]"
const menuButton = (
  <Button variant="ghost" className={cn(wordTrigger, "underline")} />
)
// Chips can't carry an underline, so their row gets a dotted rule instead.
const tierButton = <Button variant="ghost" className={wordTrigger} />

const tagItems = (tags: Tag[]) =>
  tags.map((tag) => ({
    id: tag.id,
    label: (
      <>
        <TagIcon tag={tag} aria-hidden="true" />
        {tagLabel(tag)}
      </>
    ),
  }))

/** "Show me news from anywhere ranked S A B": the shuffle's filters as a sentence. */
export function FilterSentence({
  locale,
  tags,
}: {
  locale: Locale
  tags: Tag[]
}) {
  const t = translations[locale]
  const { filters, update } = useFilters(tags)
  const sources = useSources()
  const { topic, region } = tagsByFacet(tags)
  const chosenTiers = (filters ?? defaultFilters).tier
  const count =
    filters && sources ? filterSources(sources, filters).length : undefined
  const isDefault =
    !filters || JSON.stringify(filters) === JSON.stringify(defaultFilters)
  const tierItems = tiers.map((tier) => ({
    id: tier,
    label: <TierBadge tier={tier} locale={locale} size="sm" />,
  }))

  return (
    <section
      aria-label={t.yourShuffle}
      className="flex flex-col items-center gap-3 pt-2 pb-4 text-center"
    >
      <p className="font-headline text-3xl leading-snug font-medium tracking-tight text-balance text-muted-foreground sm:text-4xl sm:leading-tight">
        <span>{t.showMe}</span>
        <FilterMenu
          trigger={menuButton}
          label={t.topic}
          anyLabel={t.everything}
          items={tagItems(topic)}
          selected={filters?.topic}
          onChange={(ids) => update({ topic: ids })}
        >
          {summary(topic, filters?.topic, t.everything, t.and, true)}
          <ChevronDown data-icon="inline-end" aria-hidden="true" />
        </FilterMenu>
        <span>{t.from}</span>
        <FilterMenu
          trigger={menuButton}
          label={t.region}
          anyLabel={t.anywhere}
          items={tagItems(region)}
          selected={filters?.region}
          onChange={(ids) => update({ region: ids })}
        >
          {summary(region, filters?.region, t.anywhere, t.and)}
          <ChevronDown data-icon="inline-end" aria-hidden="true" />
        </FilterMenu>
        <span>{t.ranked}</span>
        <FilterMenu
          trigger={tierButton}
          label={t.tiers}
          anyLabel={t.anyTier}
          items={tierItems}
          selected={filters?.tier}
          onChange={(ids) => update({ tier: ids })}
        >
          {chosenTiers.length ? (
            <>
              <span className="flex -space-x-[0.1em] border-b-[0.06em] border-dotted border-primary pb-[0.08em]">
                {chosenTiers.map((tier) => (
                  <TierBadge
                    key={tier}
                    tier={tier}
                    locale={locale}
                    className="size-[1.7em] font-sans text-[0.5em] ring-[0.15em] ring-background"
                  />
                ))}
              </span>
            </>
          ) : (
            t.anyTier
          )}
          <ChevronDown data-icon="inline-end" aria-hidden="true" />
        </FilterMenu>
      </p>
      <span
        className="flex h-8 items-center gap-1 text-sm text-muted-foreground"
        aria-live="polite"
      >
        {count !== undefined &&
          format(count === 1 ? t.matchOne : t.matchCount, { count })}
        {!isDefault && (
          <Button
            variant="ghost"
            size="icon-sm"
            title={t.resetFilters}
            onClick={() => update(defaultFilters)}
          >
            <RotateCcw aria-hidden="true" />
            <span className="sr-only">{t.resetFilters}</span>
          </Button>
        )}
      </span>
    </section>
  )
}
