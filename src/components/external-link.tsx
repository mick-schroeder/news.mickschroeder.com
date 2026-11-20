import type { ComponentProps } from "react"
import type { VariantProps } from "class-variance-authority"
import { ExternalLink as ExternalLinkIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** A link to another site: opens in a new tab, with the external icon. Styled as a button when `button` is set. */
export function ExternalLink({
  children,
  className,
  button,
  ...props
}: ComponentProps<"a"> & { button?: VariantProps<typeof buttonVariants> }) {
  return (
    <a
      target="_blank"
      rel="noopener"
      className={button ? cn(buttonVariants(button), className) : className}
      {...props}
    >
      {children}
      {button ? (
        <ExternalLinkIcon data-icon="inline-end" aria-hidden="true" />
      ) : (
        <ExternalLinkIcon
          className="ml-0.5 inline size-[0.8em] align-[-0.05em] opacity-70"
          aria-hidden="true"
        />
      )}
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}
