import { FilterPanel } from "./filter-panel"
import { ShuffleBookmark } from "./shuffle-bookmark"
import { UpNextCard } from "./up-next-card"
import { useDiscovery } from "./use-discovery"
import type { Locale } from "@/i18n/ui"
import type { Tag } from "@/lib/sites"

export function DiscoveryControls({
  locale,
  tags,
}: {
  locale: Locale
  tags: Tag[]
}) {
  const discovery = useDiscovery(tags)

  return (
    <div id="discovery-controls" className="contents">
      <UpNextCard locale={locale} tags={tags} discovery={discovery} />
      <FilterPanel
        locale={locale}
        tags={tags}
        filters={discovery.filters}
        onChange={discovery.changeFilters}
      />
      <ShuffleBookmark locale={locale} ready={Boolean(discovery.filters)} />
    </div>
  )
}
