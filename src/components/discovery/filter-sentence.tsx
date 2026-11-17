import { ChevronDown, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TagIcon } from "@/components/tag-icon"
import { tierColors } from "@/components/tier-badge"
import { format, translations, type Locale } from "@/i18n/ui"
import {
  defaultFilters,
  filterSources,
  tagLabel,
  tagsByFacet,
  tiers,
  type Tag,
  type Tier,
} from "@/lib/sources"
import { cn } from "@/lib/utils"
import { FilterMenu, summary } from "./filter-menu"
import { useFilters, useSources } from "./use-filters"

const menuButton = (
  <Button variant="outline" size="sm" className="font-medium" />
)

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

function TierChip({ tier, className }: { tier: Tier; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-5 shrink-0 place-items-center rounded-md text-xs font-black",
        tierColors[tier],
        className
      )}
    >
      {tier}
    </span>
  )
}

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
    label: (
      <>
        <TierChip tier={tier} />
        {format(t.tierLabel, { tier })}
      </>
    ),
  }))

  return (
    <section
      aria-label={t.yourShuffle}
      className="mb-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 border-b border-border pb-4 text-base text-muted-foreground sm:mb-6"
    >
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
        trigger={menuButton}
        label={t.tiers}
        anyLabel={t.anyTier}
        items={tierItems}
        selected={filters?.tier}
        onChange={(ids) => update({ tier: ids })}
      >
        {chosenTiers.length ? (
          <>
            <span className="flex -space-x-1.5">
              {chosenTiers.map((tier) => (
                <TierChip
                  key={tier}
                  tier={tier}
                  className="ring-2 ring-background"
                />
              ))}
            </span>
            <span className="sr-only">
              {`${t.tiers}: ${chosenTiers.join(", ")}`}
            </span>
          </>
        ) : (
          t.anyTier
        )}
        <ChevronDown data-icon="inline-end" aria-hidden="true" />
      </FilterMenu>
      <span className="flex items-center gap-1 text-sm" aria-live="polite">
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
