import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { historyCardStyle } from "./history-card-style"

export const siteCardHeight = 172

export const siteCardClassName =
  "relative z-40 h-[172px] flex-col flex-nowrap items-start gap-3 bg-card text-card-foreground"

export const historyCardRow =
  "flex h-8 min-w-0 shrink-0 items-center gap-2 px-3.5"

export function HistoryCardFrame({
  index,
  depth,
  loading = false,
  children,
}: {
  index: number
  depth?: number
  loading?: boolean
  children: ReactNode
}) {
  return (
    <Card
      style={historyCardStyle(index, depth)}
      className={cn(
        "absolute inset-x-0 bottom-0 origin-top rounded-2xl border-border/80 bg-muted py-0",
        loading
          ? "pointer-events-none"
          : "group text-muted-foreground transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:border-foreground/30 hover:text-foreground motion-safe:hover:-translate-y-1 motion-reduce:transition-none"
      )}
    >
      {children}
    </Card>
  )
}
