import type { ComponentProps } from "react"
import { ExternalLink as ExternalLinkIcon } from "lucide-react"

/** A link to another site: opens in a new tab, with the external icon. */
export function ExternalLink({
  children,
  className,
  ...props
}: ComponentProps<"a">) {
  return (
    <a target="_blank" rel="noopener" className={className} {...props}>
      {children}
      <ExternalLinkIcon
        className="ml-0.5 inline size-[0.8em] align-[-0.05em] opacity-70"
        aria-hidden="true"
      />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}
