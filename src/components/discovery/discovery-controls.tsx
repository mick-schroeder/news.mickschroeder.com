import { ShuffleBookmark } from "./shuffle-bookmark"
import { SourcesShelf } from "./sources-shelf"
import { UpNextCard, deckId } from "./up-next-card"
import { useDiscovery } from "./use-discovery"
import type { Locale } from "@/i18n/ui"
import type { Source, Tag } from "@/lib/sources"

export function DiscoveryControls({
  locale,
  tags,
  headliners,
}: {
  locale: Locale
  tags: Tag[]
  /** Shown under the deck until there are enough recent sources. */
  headliners: Source[]
}) {
  const discovery = useDiscovery(tags)

  // A recent source goes back on top of the deck, which scrolls into view.
  function bringBack(source: Source) {
    if (!discovery.showHistorySource(source)) return
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
    document.getElementById(deckId)?.scrollIntoView({
      block: "nearest",
      behavior: reduce ? "auto" : "smooth",
    })
  }

  return (
    <>
      <UpNextCard locale={locale} tags={tags} discovery={discovery} />
      <SourcesShelf
        locale={locale}
        headliners={headliners}
        recent={discovery.historySources}
        onSelect={bringBack}
      />
      <ShuffleBookmark
        locale={locale}
        ready={!discovery.loading && !discovery.loadFailed}
      />
    </>
  )
}
