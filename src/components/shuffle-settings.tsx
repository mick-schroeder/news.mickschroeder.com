import { useEffect, useState } from "react"
import { Settings } from "lucide-react"
import { FilterPanel } from "@/components/discovery/filter-panel"
import { Button } from "@/components/ui/button"
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
import type { Filters, Tag } from "@/lib/sources"

/** Gear in the masthead that opens the Your shuffle filters. */
export function ShuffleSettings({
  locale,
  tags,
}: {
  locale: Locale
  tags: Tag[]
}) {
  const t = translations[locale]
  const [filters, setFilters] = useState<Filters>()
  const [open, setOpen] = useState(false)

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
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setFilters(readFilters(tags))
        setOpen(next)
      }}
    >
      <PopoverTrigger
        render={<Button variant="secondary" size="icon" />}
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
  )
}
