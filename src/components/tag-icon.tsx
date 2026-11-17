import { Icon, type LucideProps } from "lucide-react"
import type { Tag } from "@/lib/sources"

export function TagIcon({ tag, ...props }: { tag: Tag } & LucideProps) {
  if (!tag.iconNode) return null
  return <Icon iconNode={tag.iconNode} {...props} />
}
