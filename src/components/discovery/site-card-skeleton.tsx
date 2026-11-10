import { historyDepth } from "./history-card-style"
import { Skeleton } from "@/components/ui/skeleton"
import { Item, ItemActions, ItemContent, ItemMedia } from "@/components/ui/item"
import {
  HistoryCardFrame,
  historyCardRow,
  siteCardClassName,
} from "./site-card-frame"

export function SiteCardSkeleton({ showPeeks }: { showPeeks: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="motion-reduce:[&_[data-slot=skeleton]]:animate-none"
    >
      {showPeeks &&
        Array.from({ length: historyDepth }, (_, index) => (
          <HistoryCardFrame key={index} index={index} loading>
            <div className={historyCardRow}>
              <Skeleton className="size-4.5 rounded-xs" />
              <Skeleton className="h-3" style={{ width: 128 - index * 16 }} />
            </div>
          </HistoryCardFrame>
        ))}
      <Item variant="outline" className={siteCardClassName}>
        <ItemMedia>
          <Skeleton className="size-10 rounded-full" />
        </ItemMedia>
        <ItemContent className="min-w-0">
          <Skeleton className="h-4 w-36 max-w-full" />
          <Skeleton className="h-3 w-24 max-w-full" />
        </ItemContent>
        <ItemActions>
          <Skeleton className="size-4" />
        </ItemActions>
      </Item>
    </div>
  )
}
