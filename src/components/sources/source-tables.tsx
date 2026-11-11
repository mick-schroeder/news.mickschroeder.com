import { ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import {
  interestIcon,
  interestLabel,
  type Interest,
} from "@/components/interest-icons"
import { favicon } from "@/lib/discovery"
import type { Source } from "@/lib/source-pages"
import { cn } from "@/lib/utils"

export const hostOf = (url: string) =>
  new URL(url).hostname.replace(/^www\./, "")

// Static pages render without React on the client, so a plain <img> stands in
// for the Avatar component, which only shows its image after hydration.
export function SiteIcon({
  url,
  size = "sm",
  className,
}: {
  url: string
  size?: "sm" | "lg"
  className?: string
}) {
  const px = size === "lg" ? 64 : 24
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden border border-border bg-muted",
        size === "lg" ? "size-16 rounded-2xl p-2.5" : "size-6 rounded-full",
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
        className="size-full rounded-[inherit] object-contain"
      />
    </span>
  )
}

// Line the table up with the card's padding.
const tableEdges = "[&_td:first-child]:pl-6 [&_td:last-child]:pr-6"

const rowLink =
  "font-medium text-foreground outline-none after:absolute after:inset-0 focus-visible:after:rounded-md focus-visible:after:ring-2 focus-visible:after:ring-ring"

/** Sources as table rows; each row opens the source's page. */
export function SourceTable({
  sources,
  hrefFor,
}: {
  sources: Source[]
  hrefFor: (source: Source) => string
}) {
  return (
    <Card className="py-2">
      <Table className={tableEdges}>
        <TableBody>
          {sources.map((source) => (
            <TableRow key={source.id} className="relative">
              <TableCell className="w-full max-w-0 py-2.5">
                <span className="flex min-w-0 items-center gap-3">
                  <SiteIcon url={source.url} />
                  <a href={hrefFor(source)} className={cn(rowLink, "truncate")}>
                    {source.name}
                  </a>
                </span>
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {hostOf(source.url)}
              </TableCell>
              <TableCell className="w-8 text-muted-foreground">
                <ChevronRight className="size-4" aria-hidden="true" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

/** Interests as table rows, each with a few of its sites' icons. */
export function InterestTable({
  rows,
}: {
  rows: {
    tag: Interest
    href: string
    locale: "en" | "ga"
    examples: Source[]
  }[]
}) {
  return (
    <Card className="py-2">
      <Table className={tableEdges}>
        <TableBody>
          {rows.map(({ tag, href, locale, examples }) => {
            const Icon = interestIcon(tag)
            return (
              <TableRow key={tag} className="relative">
                <TableCell className="py-3">
                  <span className="flex items-center gap-3">
                    <Icon
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <a href={href} className={rowLink}>
                      {interestLabel(tag, locale)}
                    </a>
                  </span>
                </TableCell>
                <TableCell className="w-full">
                  <span
                    className="flex justify-end -space-x-1.5"
                    aria-hidden="true"
                  >
                    {examples.map((source) => (
                      <SiteIcon
                        key={source.id}
                        url={source.url}
                        className="ring-2 ring-background"
                      />
                    ))}
                  </span>
                </TableCell>
                <TableCell className="w-8 text-muted-foreground">
                  <ChevronRight className="size-4" aria-hidden="true" />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
