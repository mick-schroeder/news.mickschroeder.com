import { ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { TagIcon } from "@/components/tag-icon"
import type { Site, Tag } from "@/lib/sites"
import { tagLabel } from "@/lib/tag-display"
import { SiteIcon } from "./site-icon"

// Line the table up with the card's padding.
const tableEdges = "[&_td:first-child]:pl-6 [&_td:last-child]:pr-6"

const rowLink =
  "font-medium text-foreground outline-none after:absolute after:inset-0 focus-visible:after:rounded-md focus-visible:after:ring-2 focus-visible:after:ring-ring"

/** Tags as table rows, each with a few of its sites' icons. */
export function TagTable({
  rows,
}: {
  rows: {
    tag: Tag
    href: string
    locale: "en" | "ga"
    examples: Site[]
  }[]
}) {
  return (
    <Card className="py-2">
      <Table className={tableEdges}>
        <TableBody>
          {rows.map(({ tag, href, locale, examples }) => {
            return (
              <TableRow key={tag.id} className="relative">
                <TableCell className="py-3">
                  <span className="flex items-center gap-3">
                    <TagIcon
                      tag={tag}
                      className="size-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <a href={href} className={rowLink}>
                      {tagLabel(tag, locale)}
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
                        site={source}
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
