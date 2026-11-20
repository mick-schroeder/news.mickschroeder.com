import type { ReactNode } from "react"
import { ExternalLink } from "@/components/external-link"
import { SourceIcon } from "@/components/source-icon"
import { TagBadge } from "@/components/tag-badge"
import { TierBadge } from "@/components/tier-badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Source, Tag, TierInfo } from "@/lib/shuffle"
import { hostOf } from "@/lib/utils"

/** A source's card. While loading, a skeleton fills it and the footer stays put. */
export function SourceCard({
  source,
  tier,
  tags,
  loading = false,
  children,
}: {
  source?: Omit<Source, "similar">
  tier?: TierInfo
  /** The source's tags. */
  tags?: Tag[]
  loading?: boolean
  /** Actions, in the footer. */
  children?: ReactNode
}) {
  return (
    <Card>
      {loading || !source || !tier ? (
        <BodySkeleton />
      ) : (
        <Body source={source} tier={tier} tags={tags ?? []} />
      )}
      {children && <CardFooter className="gap-2">{children}</CardFooter>}
    </Card>
  )
}

function Body({
  source,
  tier,
  tags,
}: {
  source: Omit<Source, "similar">
  tier: TierInfo
  tags: Tag[]
}) {
  return (
    <>
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
                {hostOf(source.url)}
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
              <TagBadge tag={tag} />
            </li>
          ))}
        </ul>
      </CardContent>
    </>
  )
}

function BodySkeleton() {
  return (
    <>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 shrink-0 rounded-[22%]" />
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-8 items-center">
              <Skeleton className="h-6 w-48 max-w-full" />
            </div>
            <div className="flex h-5 items-center">
              <Skeleton className="h-3.5 w-28" />
            </div>
          </div>
        </div>
        <CardAction>
          <Skeleton className="size-9 rounded-full" />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 py-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-16 rounded-4xl" />
          <Skeleton className="h-5 w-20 rounded-4xl" />
          <Skeleton className="h-5 w-14 rounded-4xl" />
        </div>
      </CardContent>
    </>
  )
}
