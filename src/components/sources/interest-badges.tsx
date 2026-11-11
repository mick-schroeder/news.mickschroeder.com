import {
  interestIcon,
  interestLabel,
  type Interest,
} from "@/components/interest-icons"
import { Badge } from "@/components/ui/badge"
import { tags as allTags } from "@/data/interest-tags"
import type { Locale } from "@/i18n/locales"
import { localePath } from "@/lib/paths"
import { tagSlug } from "@/lib/source-pages"

/** Interests as badge links, in the interest picker's order. */
export function InterestBadges({
  locale,
  tags,
  current,
  label,
}: {
  locale: Locale
  tags: readonly string[]
  current?: string
  label?: string
}) {
  const shown = allTags.filter((tag) => tags.includes(tag))
  return (
    <ul className="flex min-w-0 flex-wrap gap-1.5" aria-label={label}>
      {shown.map((tag: Interest) => {
        const Icon = interestIcon(tag)
        const active = tag === current
        return (
          <li key={tag}>
            <Badge
              variant={active ? "default" : "outline"}
              className="h-7 gap-1.5 px-2.5"
              render={
                <a
                  href={localePath(locale, `tags/${tagSlug(tag)}/`)}
                  aria-current={active ? "page" : undefined}
                />
              }
            >
              <Icon data-icon="inline-start" aria-hidden="true" />
              {interestLabel(tag, locale)}
            </Badge>
          </li>
        )
      })}
    </ul>
  )
}
