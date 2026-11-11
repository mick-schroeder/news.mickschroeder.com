import { ExternalLink, Globe, Tags } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Locale } from "@/i18n/locales"
import { translations } from "@/i18n/ui"
import type { Source } from "@/lib/source-pages"
import { cn } from "@/lib/utils"
import { InterestBadges } from "./interest-badges"
import { hostOf, SiteIcon } from "./source-tables"

const external = { target: "_blank", rel: "noopener noreferrer" } as const

/** A source's details: identity and Visit up top, facts below. */
export function SourceDetails({
  source,
  locale,
}: {
  source: Source
  locale: Locale
}) {
  const t = translations[locale]
  return (
    <Card className="min-w-0">
      <CardHeader className="items-center">
        <div className="flex min-w-0 items-center gap-4">
          <SiteIcon url={source.url} size="lg" />
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-xl leading-tight font-bold tracking-tight break-words sm:text-2xl">
              <h1>{source.name}</h1>
            </CardTitle>
            <CardDescription className="truncate">
              {hostOf(source.url)}
            </CardDescription>
          </div>
        </div>
        <CardAction className="self-center">
          <a
            href={source.url}
            {...external}
            data-slot="button"
            className={cn(buttonVariants({ size: "lg" }), "font-bold")}
          >
            {t.visit}
            <span className="sr-only">({t.opensInNewTab})</span>
            <ExternalLink data-icon="inline-end" aria-hidden="true" />
          </a>
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-4">
          <dt className="pt-0.5 text-muted-foreground">
            <Globe className="size-4" aria-hidden="true" />
            <span className="sr-only">URL</span>
          </dt>
          <dd className="min-w-0">
            <a
              href={source.url}
              {...external}
              className="break-all underline-offset-4 hover:underline"
            >
              {source.url}
              <ExternalLink
                className="ml-1 inline size-3 align-[-0.05em] text-muted-foreground"
                aria-hidden="true"
              />
              <span className="sr-only"> ({t.opensInNewTab})</span>
            </a>
          </dd>
          <dt className="pt-1.5 text-muted-foreground">
            <Tags className="size-4" aria-hidden="true" />
            <span className="sr-only">{t.allInterests}</span>
          </dt>
          <dd className="min-w-0">
            <InterestBadges locale={locale} tags={source.tags} />
          </dd>
        </dl>
      </CardContent>
    </Card>
  )
}
