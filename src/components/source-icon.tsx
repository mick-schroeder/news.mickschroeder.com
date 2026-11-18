import type { Source } from "@/lib/shuffle"
import { cn } from "@/lib/utils"

/** The white rounded tile every favicon sits on. */
export const iconTile =
  "shrink-0 rounded-[22%] bg-white object-contain ring-1 ring-black/10"

/** A source's favicon on the tile; set the size with className. */
export function SourceIcon({
  source,
  className,
}: {
  source: Pick<Source, "icon">
  className?: string
}) {
  return (
    <img
      src={source.icon}
      alt=""
      loading="lazy"
      className={cn("size-10", iconTile, className)}
    />
  )
}
