import { Icon, type LucideProps } from "lucide-react"
import type { Tag } from "@/lib/shuffle"
import { cn } from "@/lib/utils"

/** The tag's flag if it has one, else its Lucide icon. */
export function TagIcon({
  tag,
  className,
  ...props
}: { tag: Pick<Tag, "iconNode" | "flag"> } & Omit<LucideProps, "ref">) {
  if (tag.flag) {
    // Flags keep their own colours, so only data attributes carry over.
    const data = Object.fromEntries(
      Object.entries(props).filter(([key]) => key.startsWith("data-"))
    )
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox={tag.flag.viewBox}
        aria-hidden="true"
        className={cn("[clip-path:inset(17%_0_round_2px)]", className)}
        {...data}
        dangerouslySetInnerHTML={{ __html: tag.flag.body }}
      />
    )
  }
  if (!tag.iconNode) return null
  return (
    <Icon
      iconNode={tag.iconNode}
      aria-hidden="true"
      className={className}
      {...props}
    />
  )
}
