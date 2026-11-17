import { iconPath, monogram, type Source } from "@/lib/sources"
import { cn } from "@/lib/utils"

const sizes = {
  xs: { box: "size-4.5 rounded-xs p-0.5", text: "text-[9px]", px: 16 },
  sm: { box: "size-6 rounded-md p-0.5", text: "text-xs", px: 24 },
  md: { box: "size-12 rounded-xl p-2", text: "text-xl", px: 32 },
  lg: { box: "size-16 rounded-2xl p-2.5", text: "text-3xl", px: 48 },
}

/**
 * A source's cached favicon on a white tile, so dark logos show in dark mode.
 * Sources without one get a colored letter tile instead.
 * A plain <img>, since static pages render without React on the client.
 */
export function SourceIcon({
  source,
  size = "sm",
  className,
}: {
  source: Pick<Source, "id" | "title" | "icon">
  size?: keyof typeof sizes
  className?: string
}) {
  const { box, text, px } = sizes[size]

  if (!source.icon) {
    const { letter, color } = monogram(source)
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
        "grid shrink-0 place-items-center overflow-hidden bg-white ring-1 ring-black/10 dark:bg-stone-200 dark:brightness-90",
        box,
        className
      )}
    >
      <img
        src={iconPath(source.id)}
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
