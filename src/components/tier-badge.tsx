import { format, translations, type Locale } from "@/i18n/ui"
import type { Tier } from "@/lib/sources"
import { cn } from "@/lib/utils"

export const tierColors: Record<Tier, string> = {
  S: "bg-tier-s text-tier-s-foreground",
  A: "bg-tier-a text-tier-a-foreground",
  B: "bg-tier-b text-tier-b-foreground",
  C: "bg-tier-c text-tier-c-foreground",
  D: "bg-tier-d text-tier-d-foreground",
  E: "bg-tier-e text-tier-e-foreground",
  F: "bg-tier-f text-tier-f-foreground",
}

const sizes = {
  // Inline with text, e.g. in menus and the filter sentence.
  sm: "size-5 text-[0.6875rem]",
  // In lists.
  md: "size-7 text-sm",
  // On a source's card.
  lg: "size-12 text-xl ring-offset-2 ring-offset-card",
}

/** A tier letter on its tier-list colour, in a round seal. One look everywhere. */
export function TierBadge({
  tier,
  locale,
  size = "md",
  className,
}: {
  tier: Tier
  locale: Locale
  size?: keyof typeof sizes
  className?: string
}) {
  const label = format(translations[locale].tierLabel, { tier })
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full leading-none font-black ring-1 ring-black/10",
        sizes[size],
        tierColors[tier],
        className
      )}
      title={label}
    >
      <span aria-hidden="true">{tier}</span>
      <span className="sr-only">{label}</span>
    </span>
  )
}
