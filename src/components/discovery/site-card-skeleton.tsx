import { historyDepth } from "./history-card-style"
import { Skeleton } from "@/components/ui/skeleton"
import {
  HistoryCardFrame,
  historyCardRow,
  SiteCardFrame,
  siteCardBody,
  SiteCardRow,
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
      <SiteCardFrame loading>
        <div className={siteCardBody}>
          <SiteCardRow
            icon={<Skeleton className="size-12 shrink-0 rounded-xl" />}
            label={
              <div className="flex min-w-0 flex-col gap-2">
                <Skeleton className="h-5 w-36 max-w-full" />
                <Skeleton className="h-3 w-24 max-w-full" />
              </div>
            }
            action={<Skeleton className="size-8 shrink-0 rounded-lg" />}
          />
        </div>
      </SiteCardFrame>
    </div>
  )
}
