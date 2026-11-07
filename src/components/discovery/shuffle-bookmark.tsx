import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { translations, type Locale } from "@/i18n/ui"
import { shufflePath } from "@/lib/discovery"
import { cn } from "@/lib/utils"

export function ShuffleBookmark({
  locale,
  ready,
}: {
  locale: Locale
  ready: boolean
}) {
  const t = translations[locale]
  const [copyResult, setCopyResult] = useState<"copied" | "failed">()
  const bookmarkUrl = ready ? location.origin + shufflePath : shufflePath

  async function copyBookmark() {
    try {
      await navigator.clipboard.writeText(bookmarkUrl)
      setCopyResult("copied")
    } catch {
      setCopyResult("failed")
    }
  }

  return (
    <section
      className="discovery-section-grid items-start border-t border-border pt-8 pb-2"
      aria-labelledby="bookmark-title"
    >
      <div className="space-y-1">
        <h2
          id="bookmark-title"
          className="text-xl font-bold tracking-tight text-foreground"
        >
          {t.bookmark}
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          {t.bookmarkHint}
        </p>
      </div>
      <div className="grid gap-4 text-center sm:grid-cols-2 sm:gap-0">
        <div className="min-w-0 space-y-2 sm:px-5">
          <div className="mx-auto flex max-w-xs items-center gap-2">
            <a
              href={shufflePath}
              title={bookmarkUrl}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 min-w-0 flex-1 justify-start border-border bg-card px-3.5 text-left font-mono text-xs text-foreground hover:bg-muted"
              )}
            >
              <span className="truncate">{bookmarkUrl}</span>
            </a>
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label={t.copyBookmark}
              title={t.copyBookmark}
              disabled={!ready}
              onClick={copyBookmark}
              className="group size-11 shrink-0 border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {copyResult === "copied" ? (
                <Check className="size-4 text-primary" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
          <p
            role="status"
            className={
              copyResult === "failed"
                ? "text-xs font-medium text-muted-foreground"
                : "sr-only"
            }
          >
            {copyResult === "failed" && t.copyBookmarkError}
            {copyResult === "copied" && t.bookmarkCopied}
          </p>
        </div>
        <div className="space-y-2 border-t border-border/60 pt-4 sm:border-t-0 sm:px-5 sm:pt-0">
          <a
            href={shufflePath}
            draggable="true"
            aria-describedby="bookmark-drag-hint"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 cursor-grab gap-2 px-3 active:cursor-grabbing"
            )}
          >
            <img
              src="/favicon.svg"
              alt=""
              draggable="false"
              className="pointer-events-none size-5 grayscale"
            />
            News Shuffle
          </a>
          <p id="bookmark-drag-hint" className="text-xs text-muted-foreground">
            {t.dragBookmark}
          </p>
        </div>
      </div>
    </section>
  )
}
