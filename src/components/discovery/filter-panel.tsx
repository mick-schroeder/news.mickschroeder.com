import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TagIcon } from "@/components/tag-icon"
import { tierColors } from "@/components/tier-badge"
import { format, translations, type Locale } from "@/i18n/ui"
import { localePath } from "@/lib/paths"
import {
  defaultFilters,
  facets,
  tierRank,
  tiers,
  type Filters,
  type Tag,
  type Tier,
} from "@/lib/sites"
import { tagLabel } from "@/lib/tag-display"
import { cn } from "@/lib/utils"

const rowLabel = "text-xs font-semibold text-muted-foreground"

function FacetRow({
  id,
  label,
  locale,
  tags,
  selected,
  onChange,
  icons = true,
}: {
  id: string
  label: string
  locale: Locale
  tags: Tag[]
  selected: string[] | undefined
  onChange: (ids: string[]) => void
  icons?: boolean
}) {
  return (
    <div className="space-y-2">
      <h3 id={id} className={rowLabel}>
        {label}
      </h3>
      <ToggleGroup
        aria-labelledby={id}
        className="w-full flex-wrap"
        variant="outline"
        size="sm"
        spacing={2}
        multiple
        disabled={!selected}
        value={selected ?? []}
        onValueChange={onChange}
      >
        {tags.map((tag) => (
          <ToggleGroupItem
            key={tag.id}
            value={tag.id}
            title={tag.description}
            className="text-xs aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
          >
            {icons && (
              <TagIcon tag={tag} data-icon="inline-start" aria-hidden="true" />
            )}
            <span>{tagLabel(tag, locale)}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

/** One thumb over the tier list: everything from S down to it is in. */
function TierSlider({
  locale,
  lowestTier,
  disabled,
  onChange,
}: {
  locale: Locale
  lowestTier: Tier
  disabled: boolean
  onChange: (tier: Tier) => void
}) {
  const t = translations[locale]
  const rank = tierRank(lowestTier)
  const valueText = format(t.tiersHint, { tier: lowestTier })
  return (
    <div className="max-w-sm space-y-2">
      <h3 id="filter-tiers" className={rowLabel}>
        {t.tiers}
      </h3>
      <Slider
        min={0}
        max={tiers.length - 1}
        step={1}
        value={rank}
        disabled={disabled}
        thumbProps={{
          getAriaLabel: () => t.tiers,
          getAriaValueText: () => valueText,
        }}
        onValueChange={(value) => onChange(tiers[value as number])}
      />
      {/* Letters sit under the thumb's stops (thumb is 24px, edge-aligned). */}
      <ol className="flex justify-between" aria-hidden="true">
        {tiers.map((tier, index) => (
          <li key={tier} className="w-6">
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              onClick={() => onChange(tier)}
              className={cn(
                "grid size-6 place-items-center rounded-md text-xs font-black transition-opacity",
                tierColors[tier],
                index > rank && "opacity-25"
              )}
            >
              {tier}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function FilterPanel({
  locale,
  tags,
  filters,
  onChange,
}: {
  locale: Locale
  tags: Tag[]
  filters: Filters | undefined
  onChange: (filters: Filters) => void
}) {
  const t = translations[locale]
  const groups = facets(tags)
  const set = (patch: Partial<Filters>) =>
    filters && onChange({ ...filters, ...patch })
  const isDefault = JSON.stringify(filters) === JSON.stringify(defaultFilters)

  return (
    <section className="discovery-section-grid" aria-labelledby="filters-title">
      <div className="space-y-1">
        <h2 id="filters-title" className="discovery-section-title">
          {t.filters}
        </h2>
        <p className="discovery-section-subtitle">{t.filtersHint}</p>
        <p className="pt-2 text-sm">
          <a
            href={localePath(locale, "tags/")}
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            {t.browseTags}
          </a>
        </p>
      </div>
      <div className="min-w-0 space-y-5">
        <FacetRow
          id="filter-topics"
          label={t.topics}
          locale={locale}
          tags={groups.topics}
          selected={filters?.topics}
          onChange={(topics) => set({ topics })}
        />
        <FacetRow
          id="filter-where"
          label={t.where}
          locale={locale}
          tags={groups.regions}
          selected={filters?.regions}
          onChange={(regions) => set({ regions })}
        />
        <FacetRow
          id="filter-seen-on"
          label={t.seenOn}
          locale={locale}
          tags={groups.seenOn}
          selected={filters?.seenOn}
          onChange={(seenOn) => set({ seenOn })}
          icons={false}
        />
        <TierSlider
          locale={locale}
          lowestTier={filters?.lowestTier ?? defaultFilters.lowestTier}
          disabled={!filters}
          onChange={(lowestTier) => set({ lowestTier })}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-ml-2.5 text-muted-foreground"
          disabled={!filters || isDefault}
          onClick={() => onChange(defaultFilters)}
        >
          {t.resetFilters}
        </Button>
      </div>
    </section>
  )
}
