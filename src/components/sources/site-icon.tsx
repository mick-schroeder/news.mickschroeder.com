import { iconPath, monogram, type Site } from "@/lib/sites"
import { cn } from "@/lib/utils"

const sizes = {
  xs: { box: "size-4.5 rounded-xs p-0.5", text: "text-[9px]", px: 16 },
  sm: { box: "size-6 rounded-md p-0.5", text: "text-xs", px: 24 },
  md: { box: "size-12 rounded-xl p-2", text: "text-xl", px: 32 },
  lg: { box: "size-16 rounded-2xl p-2.5", text: "text-3xl", px: 48 },
}

/**
 * A site's cached favicon on a white tile, so dark logos show in dark mode.
 * Sites without one get a colored letter tile instead.
 * A plain <img>, since static pages render without React on the client.
 */
export function SiteIcon({
  site,
  size = "sm",
  className,
}: {
  site: Pick<Site, "id" | "title" | "icon">
  size?: keyof typeof sizes
  className?: string
}) {
  const { box, text, px } = sizes[size]

  if (!site.icon) {
    const { letter, color } = monogram(site)
    return (
      <span
        className={cn(
          "grid shrink-0 place-items-center font-bold text-white select-none",
          box,
          text,
          color,
          className
        )}
        aria-hidden="true"
      >
        {letter}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden bg-white ring-1 ring-black/10",
        box,
        className
      )}
    >
      <img
        src={iconPath(site.id)}
        alt=""
        width={px}
        height={px}
        loading={size === "lg" ? "eager" : "lazy"}
        decoding="async"
        className="size-full object-contain"
      />
    </span>
  )
}
