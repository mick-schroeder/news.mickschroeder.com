import { cn } from "@/lib/utils"
import { tagLabel, type Source, type Tag } from "@/lib/sources"
import { translations, type Locale } from "@/i18n/ui"
import { TagIcon } from "@/components/tag-icon"
import { TierBadge } from "@/components/tier-badge"
import {
  labelBody,
  labelHost,
  labelTitle,
} from "@/components/sources/label-type"
import { HostLink } from "@/components/sources/host-link"
import {
  cardIconClass,
  cardIconMotion,
  cardMotion,
  SourceIcon,
} from "@/components/sources/source-icon"
import {
  TextureCard,
  TextureCardFooter,
  TextureCardHeader,
  TextureSeparator,
} from "@/components/ui/texture-card"

export const sourceCardHeight = 252

export const sourceCardFrame = "h-[252px]"

export function SourceCard({
  source,
  tags,
  locale,
  detailsHref,
  top = true,
}: {
  source: Source
  tags: Tag[]
  locale: Locale
  detailsHref: string
  /** Only the top card morphs into the details page. */
  top?: boolean
}) {
  const t = translations[locale]

  // The whole card opens the source; the title opens its details page instead.
  // Set like a printed label: heavy title, tracked host, a rule, then the seal.
  return (
    <TextureCard
      className={cn(sourceCardFrame, "select-none", !top && "shadow-xs")}
      // Every card shows its face, so a throw reveals the next one ready.
      faceClassName="has-[a[data-source]:hover]:to-muted"
      style={top ? cardMotion(source.id) : undefined}
      // Dragging the card throws it; links inside never drag on their own.
      onDragStart={(event) => event.preventDefault()}
    >
      <TextureCardHeader className="flex min-w-0 items-center gap-3.5 px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
        <SourceIcon
          source={source}
          size="md"
          className={cn(
            "size-11 shrink-0 rounded-xl p-1.5 text-xl sm:size-12",
            top && cardIconClass
          )}
          style={top ? cardIconMotion(source.id) : undefined}
        />
        <div className="flex min-w-0 flex-col gap-1.5">
          <h3
            className={cn(
              labelTitle,
              "truncate text-[1.375rem] sm:text-[1.625rem]"
            )}
          >
            <a
              href={detailsHref}
              className="relative z-10 rounded-sm outline-none hover:underline hover:decoration-1 hover:underline-offset-[0.18em] focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {source.title}
            </a>
          </h3>
          <p className={cn(labelHost, "truncate text-muted-foreground")}>
            <HostLink
              url={source.url}
              locale={locale}
              className="relative z-10 [&_svg]:size-3"
            />
          </p>
        </div>
      </TextureCardHeader>
      <TextureSeparator className="mx-5 sm:mx-6" />

      <p
        lang="en"
        className={cn(
          labelBody,
          "line-clamp-3 px-5 pt-4 text-[0.9375rem] sm:px-6"
        )}
      >
        {source.description}
      </p>

      <TextureCardFooter className="mt-auto min-w-0 items-end gap-3 px-5 pb-5 sm:px-6 sm:pb-6">
        <ul className="flex min-w-0 flex-1 gap-x-3.5 overflow-hidden mask-r-from-85% pb-1 text-[0.8125rem] font-medium text-muted-foreground">
          {tags.map((tag) => (
            <li key={tag.id} className="flex shrink-0 items-center gap-1.5">
              <TagIcon tag={tag} className="size-3.5" aria-hidden="true" />
              {tagLabel(tag)}
            </li>
          ))}
        </ul>
        <TierBadge tier={source.tier} locale={locale} size="lg" />
      </TextureCardFooter>

      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        data-source
        className="rounded-[inherit] outline-none after:absolute after:inset-0 after:rounded-[inherit] focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50"
      >
        <span className="sr-only">{`${source.title} (${t.opensInNewTab})`}</span>
      </a>
    </TextureCard>
  )
}
