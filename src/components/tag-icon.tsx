import { Icon, type LucideProps } from "lucide-react"
import type { Tag } from "@/lib/shuffle"

export function TagIcon({
  tag,
  ...props
}: { tag: Pick<Tag, "iconNode"> } & Omit<LucideProps, "ref">) {
  if (!tag.iconNode) return null
  return <Icon iconNode={tag.iconNode} aria-hidden="true" {...props} />
}
