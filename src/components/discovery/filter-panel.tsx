import { getRelativeLocaleUrl } from "astro:i18n"
import { Button } from "@/components/ui/button"
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TagIcon } from "@/components/tag-icon"
import { tierColors } from "@/components/tier-badge"
import { format, translations, type Locale } from "@/i18n/ui"
import {
  defaultFilters,
  facets,
  tagLabel,
  tagsByFacet,
  tierRank,
  tiers,
  type Filters,
  type Tag,
  type Tier,
} from "@/lib/sources"
import { cn } from "@/lib/utils"

function FacetRow({
  id,
  label,
  tags,
  selected,
  onChange,
  icons = true,
}: {
  id: string
  label: string
  tags: Tag[]
  selected: string[] | undefined
  onChange: (ids: string[]) => void
  icons?: boolean
}) {
  return (
    <FieldSet>
      <FieldLegend id={id} variant="label" className="mb-2">
        {label}
      </FieldLegend>
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
            <span>{tagLabel(tag)}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </FieldSet>
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
    <FieldSet className="max-w-sm">
      <FieldLegend id="filter-tiers" variant="label" className="mb-2">
        {t.tiers}
      </FieldLegend>
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
    </FieldSet>
  )
}

/** Topics, regions, feeds and lowest tier for the shuffle. */
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
  const groups = tagsByFacet(tags)
  const set = (patch: Partial<Filters>) =>
    filters && onChange({ ...filters, ...patch })
  const isDefault = JSON.stringify(filters) === JSON.stringify(defaultFilters)

  return (
    <FieldGroup className="min-w-0 gap-5">
      {facets.map((facet) => (
        <FacetRow
          key={facet}
          id={`filter-${facet}`}
          label={t[facet]}
          tags={groups[facet]}
          selected={filters?.[facet]}
          onChange={(ids) => set({ [facet]: ids })}
          icons={facet !== "feed"}
        />
      ))}
      <TierSlider
        locale={locale}
        lowestTier={filters?.lowestTier ?? defaultFilters.lowestTier}
        disabled={!filters}
        onChange={(lowestTier) => set({ lowestTier })}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
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
        <a
          href={getRelativeLocaleUrl(locale, "tags/")}
          className="text-sm link"
        >
          {t.browseTags}
        </a>
      </div>
    </FieldGroup>
  )
}
