import { historyDepth, historyCardStyle } from "./history-card-style"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function SiteCardSkeleton({ showPeeks }: { showPeeks: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="motion-reduce:[&_[data-slot=skeleton]]:animate-none"
    >
      {showPeeks &&
        Array.from({ length: historyDepth }, (_, index) => (
          <Card
            key={index}
            className="pointer-events-none absolute inset-x-0 bottom-0 origin-top rounded-2xl border-border/80 bg-muted p-0"
            style={historyCardStyle(index)}
          >
            <div className="flex h-8 items-center gap-2 px-3.5">
              <Skeleton className="size-4.5 rounded-xs" />
              <Skeleton className="h-3" style={{ width: 128 - index * 16 }} />
            </div>
          </Card>
        ))}
      <Card className="pointer-events-none relative z-40 h-[90px] rounded-2xl border border-border bg-card p-5 shadow-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3.5">
            <Skeleton className="size-12 shrink-0 rounded-xl" />
            <div className="flex min-w-0 flex-col gap-2">
              <Skeleton className="h-5 w-36 max-w-full" />
              <Skeleton className="h-3 w-24 max-w-full" />
            </div>
          </div>
          <Skeleton className="size-8 shrink-0 rounded-lg" />
        </div>
      </Card>
    </div>
  )
}
