import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { translations, type Locale } from "@/i18n/ui"
import { brand } from "@/lib/brand"
import { shufflePath } from "@/lib/sources"
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
      className="discovery-section-grid"
      aria-labelledby="bookmark-title"
      data-needs-js
    >
      <div className="space-y-1">
        <h2 id="bookmark-title" className="heading-section">
          {t.bookmark}
        </h2>
        <p className="discovery-section-subtitle">{t.bookmarkHint}</p>
      </div>
      <div className="grid gap-4 text-center sm:grid-cols-2 sm:gap-0">
        <div className="min-w-0 space-y-2 sm:px-5">
          <InputGroup className="mx-auto max-w-xs">
            <InputGroupInput
              readOnly
              value={bookmarkUrl}
              aria-label={t.bookmark}
              aria-describedby="bookmark-copy-hint"
              className="font-mono text-xs"
              onFocus={(event) => event.currentTarget.select()}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label={t.copyBookmark}
                title={t.copyBookmark}
                disabled={!ready}
                onClick={copyBookmark}
              >
                {copyResult === "copied" ? (
                  <Check className="text-primary" aria-hidden="true" />
                ) : (
                  <Copy aria-hidden="true" />
                )}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <p id="bookmark-copy-hint" className="text-xs text-muted-foreground">
            {t.copyBookmarkHint}
          </p>
          <p
            role="status"
            className={
              copyResult === "failed"
                ? "text-xs font-medium text-muted-foreground"
                : "sr-only mt-0"
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
              "cursor-grab active:cursor-grabbing"
            )}
          >
            <img
              data-icon="inline-start"
              src="/favicon.svg"
              alt=""
              draggable="false"
              className="pointer-events-none size-5 grayscale"
            />
            {brand.name}
          </a>
          <p id="bookmark-drag-hint" className="text-xs text-muted-foreground">
            {t.dragBookmark}
          </p>
        </div>
      </div>
    </section>
  )
}
