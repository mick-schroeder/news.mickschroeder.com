import { getRelativeLocaleUrl } from "astro:i18n"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import type { Locale } from "@/i18n/locales"
import { translations } from "@/i18n/ui"
import { cn } from "@/lib/utils"

const pages = ["", "sources/", "about/"] as const

/** The main links, centred under the masthead. */
export function SiteNav({
  locale,
  path,
}: {
  locale: Locale
  /** Current path, to mark the active link. */
  path: string
}) {
  const t = translations[locale]
  const labels = {
    "": t.navHome,
    "sources/": t.sources,
    "about/": t.about,
  }
  return (
    <NavigationMenu aria-label={t.navMain} className="mx-auto">
      <NavigationMenuList className="gap-0 sm:gap-1">
        {pages.map((page) => {
          const href = getRelativeLocaleUrl(locale, page)
          return (
            <NavigationMenuItem key={page}>
              <NavigationMenuLink
                href={href}
                active={page ? path.startsWith(href) : path === href}
                className={cn(
                  navigationMenuTriggerStyle(),
                  "px-3 text-muted-foreground data-[active=true]:text-foreground sm:px-4"
                )}
              >
                {labels[page]}
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
