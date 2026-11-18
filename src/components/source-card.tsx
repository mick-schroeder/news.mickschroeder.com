import type { ReactNode } from "react"
import { ExternalLink } from "@/components/external-link"
import { SourceIcon } from "@/components/source-icon"
import { TagIcon } from "@/components/tag-icon"
import { TierBadge } from "@/components/tier-badge"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Source, Tag, TierInfo } from "@/lib/shuffle"

export function SourceCard({
  source,
  tier,
  tags,
  children,
}: {
  source: Omit<Source, "similar">
  tier: TierInfo
  /** The source's tags. */
  tags: Tag[]
  /** Actions, in the footer. */
  children?: ReactNode
}) {
  const host = new URL(source.url).hostname.replace(/^www\./, "")
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <SourceIcon source={source} className="size-12" />
          <div className="min-w-0">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              <h2>
                <a href={`/sources/${source.id}/`} className="hover:underline">
                  {source.title}
                </a>
              </h2>
            </CardTitle>
            <CardDescription>
              <ExternalLink
                href={source.url}
                className="hover:text-foreground hover:underline"
              >
                {host}
              </ExternalLink>
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <TierBadge tier={tier} className="size-9" />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base text-pretty text-foreground/80">
          {source.description}
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <li key={tag.id}>
              <Badge
                variant="secondary"
                render={<a href={`/tags/${tag.id}/`} />}
              >
                <TagIcon tag={tag} data-icon="inline-start" />
                {tag.title}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
      {children && <CardFooter className="gap-2">{children}</CardFooter>}
    </Card>
  )
}
