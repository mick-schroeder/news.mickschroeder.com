import { getRelativeLocaleUrl } from "astro:i18n"
import { Badge } from "@/components/ui/badge"
import { TagIcon } from "@/components/tag-icon"
import type { Locale } from "@/i18n/locales"
import { tagLabel, type Tag } from "@/lib/sites"

/** Tags as links to their pages. */
export function TagChips({
  locale,
  tags,
  current,
  label,
}: {
  locale: Locale
  tags: Tag[]
  current?: string
  label?: string
}) {
  return (
    <ul className="flex min-w-0 flex-wrap gap-1.5" aria-label={label}>
      {tags.map((tag) => {
        const active = tag.id === current
        return (
          <li key={tag.id}>
            <Badge
              variant={active ? "default" : "outline"}
              className="h-7 gap-1.5 px-2.5"
              render={
                <a
                  href={getRelativeLocaleUrl(locale, `tags/${tag.id}/`)}
                  aria-current={active ? "page" : undefined}
                />
              }
            >
              <TagIcon tag={tag} data-icon="inline-start" aria-hidden="true" />
              {tagLabel(tag, locale)}
            </Badge>
          </li>
        )
      })}
    </ul>
  )
}
