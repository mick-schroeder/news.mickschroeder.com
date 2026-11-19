import { useRef, useState, useSyncExternalStore, type ReactNode } from "react"
import { ChevronDown, Shuffle, X } from "lucide-react"
import { TagIcon } from "@/components/tag-icon"
import { TierBadge } from "@/components/tier-badge"
import { AvatarGroup } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { Facet, Filters, Tag, TierInfo } from "@/lib/shuffle"
import { cn } from "@/lib/utils"

type Part = "topic" | "region" | "tier"

const ANY = "*"

const parts = {
  topic: { label: "Topics", any: "everything", chip: "Everything" },
  region: { label: "Regions", any: "anywhere", chip: "Anywhere" },
  tier: { label: "Tiers", any: "", chip: "" },
} satisfies Record<Part, { label: string; any: string; chip: string }>

// A word in the sentence that opens a picker; the dotted underline marks it.
const word =
  "h-auto gap-[0.15em] px-[0.15em] py-0 font-heading text-[length:inherit] leading-[inherit] font-semibold text-foreground decoration-primary decoration-dotted decoration-[0.06em] underline-offset-[0.16em] aria-expanded:bg-primary/10 aria-expanded:decoration-solid [&_svg:not([class*='size-'])]:size-[0.45em]"

const chevron = (
  <ChevronDown
    data-icon="inline-end"
    aria-hidden="true"
    className="transition-transform in-aria-expanded:rotate-180"
  />
)

const phoneQuery = "(max-width: 39.99rem)"

/** True below the sm breakpoint; client only, no server snapshot. */
function usePhone() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(phoneQuery)
      query.addEventListener("change", onChange)
      return () => query.removeEventListener("change", onChange)
    },
    () => window.matchMedia(phoneQuery).matches
  )
}

/** "news", "news and tech", "news +2"; the any label when empty. */
function summary(tags: Tag[], ids: string[], any: string, lower = false) {
  const names = tags
    .filter((tag) => ids.includes(tag.id))
    .map((tag) => (lower ? tag.title.toLowerCase() : tag.title))
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  if (names.length > 2) return `${names[0]} +${names.length - 1}`
  return names[0] ?? any
}

/** Multi-select tag menu; nothing selected means any. */
export function TagMenu({
  label,
  any,
  tags,
  selected,
  onChange,
  trigger,
  children,
}: {
  label: string
  any: string
  tags: Tag[]
  selected: string[]
  onChange: (ids: string[]) => void
  trigger: React.ReactElement
  children: ReactNode
}) {
  // Keep menu order, so saved ids stay sorted.
  const toggle = (id: string, on: boolean) =>
    onChange(
      tags
        .map((tag) => tag.id)
        .filter((other) => (other === id ? on : selected.includes(other)))
    )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger}>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={!selected.length}
            onCheckedChange={() => onChange([])}
          >
            {any}
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {tags.map((tag) => (
            <DropdownMenuCheckboxItem
              key={tag.id}
              checked={selected.includes(tag.id)}
              onCheckedChange={(on) => toggle(tag.id, on)}
            >
              <TagIcon tag={tag} />
              {tag.title}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const chip =
  "h-11 justify-start gap-2 px-3 text-base font-normal aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-foreground [&_svg:not([class*='size-'])]:size-4.5"

/** Chip grid of tags; the any chip clears the rest. */
function TagChips({
  label,
  any,
  tags,
  selected,
  onChange,
}: {
  label: string
  any: string
  tags: Tag[]
  selected: string[]
  onChange: (ids: string[]) => void
}) {
  const value = selected.length ? selected : [ANY]
  return (
    <ToggleGroup
      multiple
      variant="outline"
      aria-label={label}
      className="grid w-full grid-cols-2 sm:grid-cols-4"
      value={value}
      onValueChange={(next: string[]) => {
        // Keep tag order, so saved ids stay sorted.
        const picked = next.includes(ANY) && !value.includes(ANY)
        onChange(
          picked
            ? []
            : tags.map((tag) => tag.id).filter((id) => next.includes(id))
        )
      }}
    >
      <ToggleGroupItem value={ANY} className={chip}>
        <Shuffle aria-hidden="true" />
        {any}
      </ToggleGroupItem>
      {tags.map((tag) => (
        <ToggleGroupItem key={tag.id} value={tag.id} className={chip}>
          <TagIcon tag={tag} />
          {tag.title}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

/** Picks a run of tiers, best to worst; none chosen means all of them. */
function TierRange({
  tiers,
  range,
  onChange,
}: {
  tiers: TierInfo[]
  range: number[]
  onChange: (ids: string[]) => void
}) {
  const ids = tiers.map((tier) => tier.id)
  return (
    <div className="mx-auto grid w-full max-w-md gap-3 py-1">
      {/* Inset half a column each side, so stops sit over the badges. */}
      <Slider
        aria-label="Tiers"
        className="mx-[calc(100%/14)] w-auto!"
        min={0}
        max={ids.length - 1}
        step={1}
        minStepsBetweenValues={0}
        thumbAlignment="center"
        value={range}
        onValueChange={(value) => {
          const [from, to] = value as number[]
          onChange(ids.slice(from, to + 1))
        }}
      />
      <ol className="grid grid-cols-7 justify-items-center">
        {tiers.map((tier, rank) => (
          <li key={tier.id}>
            <TierBadge
              tier={tier}
              className={cn(
                "size-8 text-sm transition-opacity",
                (rank < range[0] || rank > range[1]) && "opacity-30"
              )}
            />
          </li>
        ))}
      </ol>
    </div>
  )
}

/** "Show me news from anywhere ranked S A B": the shuffle's filters as a sentence. */
export function FilterSentence({
  tags,
  tiers,
  filters,
  onChange,
}: {
  tags: Tag[]
  tiers: TierInfo[]
  filters: Filters
  onChange: (filters: Filters) => void
}) {
  // The part outlives closing, so the sheet keeps its picker while it slides away.
  const [part, setPart] = useState<Part>("topic")
  const [isOpen, setIsOpen] = useState(false)
  const open = isOpen ? part : null
  const words = useRef<Partial<Record<Part, HTMLButtonElement | null>>>({})
  const phone = usePhone()

  function close() {
    setIsOpen(false)
    if (!phone) words.current[part]?.focus()
  }
  const ofKind = (kind: Facet) => tags.filter((tag) => tag.kind === kind)

  const ranks = filters.tier.map((id) => tiers.findIndex((t) => t.id === id))
  const range = ranks.length
    ? [Math.min(...ranks), Math.max(...ranks)]
    : [0, tiers.length - 1]
  const shown = tiers.slice(range[0], range[1] + 1)

  const label = (which: Part) =>
    which === "tier" ? (
      <AvatarGroup className="-space-x-[0.2em] border-b-[0.06em] border-dotted border-primary pb-[0.08em]">
        {shown.map((tier) => (
          <TierBadge
            key={tier.id}
            tier={tier}
            className="size-[1.7em] font-sans text-[0.5em]"
          />
        ))}
      </AvatarGroup>
    ) : (
      summary(
        ofKind(which),
        filters[which],
        parts[which].any,
        which === "topic"
      )
    )

  /** The sentence; in the sheet, words switch the picker instead of closing it. */
  const sentence = (inSheet: boolean) => {
    const pick = (which: Part) => (
      <Button
        ref={
          inSheet
            ? undefined
            : (node: HTMLButtonElement | null) => {
                words.current[which] = node
              }
        }
        variant="ghost"
        className={cn(word, which !== "tier" && "underline")}
        aria-expanded={open === which}
        aria-controls={open === which ? "filter-picker" : undefined}
        aria-label={
          which === "tier"
            ? `Tiers ${shown.map((tier) => tier.id).join(", ")}`
            : undefined
        }
        onClick={() => {
          if (!inSheet && open === which) return close()
          setPart(which)
          setIsOpen(true)
        }}
      >
        {label(which)}
        {chevron}
      </Button>
    )
    return (
      <>
        Show me {pick("topic")} from {pick("region")} ranked {pick("tier")}
      </>
    )
  }

  const picker = (which: Part) =>
    which === "tier" ? (
      <TierRange
        tiers={tiers}
        range={range}
        onChange={(tier) => onChange({ ...filters, tier })}
      />
    ) : (
      <TagChips
        label={parts[which].label}
        any={parts[which].chip}
        tags={ofKind(which)}
        selected={filters[which]}
        onChange={(ids) => onChange({ ...filters, [which]: ids })}
      />
    )

  return (
    <div
      className="flex flex-col gap-4"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open && !phone) close()
      }}
    >
      {/* While the tray is open, hold two lines so a rewrap doesn't move it. */}
      <div
        className={cn(
          "font-heading text-3xl leading-snug sm:text-4xl sm:leading-tight",
          open && !phone && "min-h-[2lh]"
        )}
      >
        <p className="text-center font-medium tracking-tight text-balance text-muted-foreground">
          {sentence(false)}
        </p>
      </div>

      {open && !phone && (
        <section
          id="filter-picker"
          aria-label={parts[open].label}
          className="mx-auto w-full max-w-2xl animate-in rounded-xl border bg-card p-4 duration-200 fade-in-0 slide-in-from-top-2"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              {parts[open].label}
            </h2>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close"
              onClick={close}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
          {picker(open)}
        </section>
      )}

      <Drawer
        open={phone && open !== null}
        onOpenChange={(next) => !next && setIsOpen(false)}
        showSwipeHandle
      >
        <DrawerContent
          className="rounded-t-2xl bg-popover"
          finalFocus={() => words.current[part] ?? true}
        >
          <DrawerHeader>
            <DrawerTitle className="text-center text-xl leading-snug font-medium tracking-tight text-balance text-muted-foreground">
              {sentence(true)}
            </DrawerTitle>
          </DrawerHeader>
          <div id="filter-picker" className="p-4">
            {picker(part)}
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button size="xl" />}>Done</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
