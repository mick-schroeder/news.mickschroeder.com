// Adapted from cult-ui's TextureCard (https://cult-ui.com, MIT): theme tokens,
// React 19 refs, and a face that fills the card's height.
import * as React from "react"
import { cn } from "@/lib/utils"

// Each bevel ring sits 1px inside the last, so its radius drops by 1px.
const ring = [
  "h-full border rounded-[calc(var(--texture-radius)-1px)]",
  "h-full border rounded-[calc(var(--texture-radius)-2px)]",
  "h-full border rounded-[calc(var(--texture-radius)-3px)]",
  "h-full border rounded-[calc(var(--texture-radius)-4px)]",
]

function TextureCard({
  className,
  faceClassName,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  /** Classes for the inner face that holds the content. */
  faceClassName?: string
}) {
  return (
    <div
      data-slot="texture-card"
      className={cn(
        "rounded-(--texture-radius) border border-white/70 bg-card text-card-foreground shadow-[0_1px_2px_rgb(0_0_0/0.06),0_8px_24px_-12px_rgb(0_0_0/0.18)] [--texture-radius:var(--radius-3xl)] dark:border-white/10 dark:shadow-[0_1px_2px_rgb(0_0_0/0.4),0_12px_32px_-12px_rgb(0_0_0/0.6)]",
        className
      )}
      {...props}
    >
      <div className={cn(ring[0], "border-black/10 dark:border-black/70")}>
        <div className={cn(ring[1], "border-white/60 dark:border-white/5")}>
          <div className={cn(ring[2], "border-black/15 dark:border-black/60")}>
            <div
              data-slot="texture-card-face"
              className={cn(
                ring[3],
                "relative flex flex-col border-white/60 bg-linear-to-b from-card to-muted/60 dark:border-white/8 dark:from-muted/40 dark:to-card",
                faceClassName
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TextureCardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="texture-card-header"
      className={cn("px-6 pt-6", className)}
      {...props}
    />
  )
}

function TextureCardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="texture-card-content"
      className={cn("px-6 py-4", className)}
      {...props}
    />
  )
}

function TextureCardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="texture-card-footer"
      className={cn("flex items-center gap-2 px-6 pb-6", className)}
      {...props}
    />
  )
}

/** An engraved rule: a dark line over a light one. */
function TextureSeparator({ className }: { className?: string }) {
  return (
    <div
      data-slot="texture-separator"
      role="none"
      className={cn(
        "shrink-0 border-t border-b border-t-border border-b-white/80 dark:border-b-black/60",
        className
      )}
    />
  )
}

export {
  TextureCard,
  TextureCardHeader,
  TextureCardContent,
  TextureCardFooter,
  TextureSeparator,
}
