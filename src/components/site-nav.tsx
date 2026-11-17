import { useEffect, useState } from "react"
import { getRelativeLocaleUrl } from "astro:i18n"
import { Settings } from "lucide-react"
import { FilterPanel } from "@/components/discovery/filter-panel"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Locale } from "@/i18n/locales"
import { translations } from "@/i18n/ui"
import {
  filtersEvent,
  openFiltersEvent,
  readFilters,
  writeFilters,
} from "@/lib/browser-storage"
import type { Filters, Tag } from "@/lib/sites"
import { cn } from "@/lib/utils"

const pages = ["", "sources/", "tags/", "about/"] as const

/** Main links in the middle; a gear on the right opens the shuffle filters. */
export function SiteNav({
  locale,
  tags,
  path,
}: {
  locale: Locale
  tags: Tag[]
  /** Current path, to mark the active link. */
  path: string
}) {
  const t = translations[locale]
  const [filters, setFilters] = useState<Filters>()
  const [open, setOpen] = useState(false)
  const labels = {
    "": t.navShuffle,
    "sources/": t.sources,
    "tags/": t.tags,
    "about/": t.about,
  }

  useEffect(() => {
    const onChange = (event: Event) =>
      setFilters((event as CustomEvent<Filters>).detail)
    const onOpen = () => {
      // The menu hangs off the gear, so bring the header into view.
      window.scrollTo({ top: 0 })
      setFilters(readFilters(tags))
      setOpen(true)
    }
    window.addEventListener(filtersEvent, onChange)
    window.addEventListener(openFiltersEvent, onOpen)
    return () => {
      window.removeEventListener(filtersEvent, onChange)
      window.removeEventListener(openFiltersEvent, onOpen)
    }
  }, [tags])

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center">
      <NavigationMenu aria-label={t.navMain} className="col-start-2">
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
                    "px-2.5 text-muted-foreground data-[active=true]:text-foreground sm:px-4"
                  )}
                >
                  {labels[page]}
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          })}
        </NavigationMenuList>
      </NavigationMenu>
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (next) setFilters(readFilters(tags))
          setOpen(next)
        }}
      >
        <PopoverTrigger
          render={<Button variant="ghost" size="icon" />}
          className="justify-self-end text-muted-foreground"
          title={t.filters}
        >
          <Settings aria-hidden="true" />
          <span className="sr-only">{t.filters}</span>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          className="max-h-[min(36rem,calc(100svh-6rem))] w-[min(30rem,calc(100vw-2rem))] gap-5 overflow-y-auto p-5"
        >
          <PopoverHeader>
            <PopoverTitle>{t.filters}</PopoverTitle>
            <PopoverDescription>{t.filtersHint}</PopoverDescription>
          </PopoverHeader>
          <FilterPanel
            locale={locale}
            tags={tags}
            filters={filters}
            onChange={writeFilters}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
