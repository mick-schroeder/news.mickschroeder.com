import { ChevronDown, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FilterMenu } from "@/components/discovery/filter-menu"
import { useFilters } from "@/components/discovery/use-filters"
import { format, translations, type Locale } from "@/i18n/ui"
import { tagLabel, tagsByFacet, type Tag } from "@/lib/sources"

/** Masthead menu for the feeds the shuffle draws from. */
export function FeedPicker({ locale, tags }: { locale: Locale; tags: Tag[] }) {
  const t = translations[locale]
  const { filters, update } = useFilters(tags)
  const { feed } = tagsByFacet(tags)
  const chosen = filters?.feed ?? []
  const first = feed.find((tag) => tag.id === chosen[0])
  const label =
    chosen.length > 1
      ? format(t.feedCount, { count: chosen.length })
      : first
        ? tagLabel(first)
        : t.anyFeed

  return (
    <FilterMenu
      trigger={<Button variant="secondary" size="sm" />}
      label={t.feed}
      anyLabel={t.anyFeed}
      items={feed.map((tag) => ({ id: tag.id, label: tagLabel(tag) }))}
      selected={filters?.feed}
      onChange={(ids) => update({ feed: ids })}
      align="end"
    >
      <Layers data-icon="inline-start" aria-hidden="true" />
      {label}
      <ChevronDown data-icon="inline-end" aria-hidden="true" />
    </FilterMenu>
  )
}
