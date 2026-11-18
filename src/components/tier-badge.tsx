import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { TierInfo } from "@/lib/shuffle"
import { cn } from "@/lib/utils"

export const tierColors: Record<string, string> = {
  S: "bg-tier-s",
  A: "bg-tier-a",
  B: "bg-tier-b",
  C: "bg-tier-c",
  D: "bg-tier-d",
  E: "bg-tier-e",
  F: "bg-tier-f",
}

export function TierBadge({
  tier,
  className,
}: {
  tier: TierInfo
  className?: string
}) {
  const label = `Tier ${tier.id}: ${tier.title}`
  return (
    <Avatar className={className} title={`${label}. ${tier.description}`}>
      <AvatarFallback
        className={cn("font-sans font-bold text-black", tierColors[tier.id])}
      >
        <span aria-hidden="true">{tier.id}</span>
        <span className="sr-only">{label}</span>
      </AvatarFallback>
    </Avatar>
  )
}
