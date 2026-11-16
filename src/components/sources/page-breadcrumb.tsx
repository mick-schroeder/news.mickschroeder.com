import { Fragment } from "react"
import { getRelativeLocaleUrl } from "astro:i18n"
import type { Locale } from "@/i18n/locales"
import { site } from "@/lib/site"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export type Crumb = { label: string; href?: string }

/** Trail from the homepage; the last crumb is the current page. */
export function PageBreadcrumb({
  locale,
  crumbs,
}: {
  locale: Locale
  crumbs: Crumb[]
}) {
  const trail = [
    { label: site.name, href: getRelativeLocaleUrl(locale) },
    ...crumbs,
  ]
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {trail.map((crumb, index) => (
          <Fragment key={crumb.label}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem className="min-w-0">
              {crumb.href ? (
                <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="truncate">
                  {crumb.label}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
