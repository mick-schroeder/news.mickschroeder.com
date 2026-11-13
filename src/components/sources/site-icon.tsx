import { favicon } from "@/lib/sites"
import { cn } from "@/lib/utils"

const sizes = {
  sm: { box: "size-6 rounded-md p-0.5", px: 24 },
  md: { box: "size-12 rounded-xl p-2", px: 32 },
  lg: { box: "size-16 rounded-2xl p-2.5", px: 48 },
}

/**
 * A site's favicon on a white tile, so dark logos show in dark mode too.
 * A plain <img>, since static pages render without React on the client.
 */
export function SiteIcon({
  url,
  size = "sm",
  className,
}: {
  url: string
  size?: keyof typeof sizes
  className?: string
}) {
  const { box, px } = sizes[size]
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden bg-white ring-1 ring-black/10",
        box,
        className
      )}
    >
      <img
        src={favicon(url)}
        alt=""
        width={px}
        height={px}
        loading={size === "lg" ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
        className="size-full object-contain"
      />
    </span>
  )
}
