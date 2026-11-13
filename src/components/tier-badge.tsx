import { format, translations, type Locale } from "@/i18n/ui"
import type { Tier } from "@/lib/sites"
import { cn } from "@/lib/utils"

export const tierColors: Record<Tier, string> = {
  S: "bg-tier-s text-tier-s-foreground",
  A: "bg-tier-a text-tier-a-foreground",
  B: "bg-tier-b text-tier-b-foreground",
  C: "bg-tier-c text-tier-c-foreground",
  D: "bg-tier-d text-tier-d-foreground",
  E: "bg-tier-e text-tier-e-foreground",
}

/** A tier letter on its tier-list colour. */
export function TierBadge({
  tier,
  locale,
  className,
}: {
  tier: Tier
  locale: Locale
  className?: string
}) {
  const label = format(translations[locale].tierLabel, { tier })
  return (
    <span
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-md text-sm font-black",
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
