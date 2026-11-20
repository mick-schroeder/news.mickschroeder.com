import { TagIcon } from "@/components/tag-icon"
import { Badge } from "@/components/ui/badge"
import type { Tag } from "@/lib/shuffle"
import { tagFill } from "@/lib/tag-colors"

/** Links to the tag's page, filled in its colour when it has one. */
export function TagBadge({ tag }: { tag: Tag }) {
  return (
    <Badge
      variant="secondary"
      data-tag-color={tag.color}
      className={tag.color && tagFill}
      render={<a href={`/tags/${tag.id}/`} />}
    >
      <TagIcon tag={tag} data-icon="inline-start" />
      {tag.title}
    </Badge>
  )
}
